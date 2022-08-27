/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject.service.lists;

import static org.comixedproject.state.comicbooks.ComicStateHandler.HEADER_COMIC;
import static org.comixedproject.state.lists.ReadingListStateHandler.HEADER_READING_LIST;

import java.io.IOException;
import java.io.InputStream;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.csv.CsvAdaptor;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.lists.PublishReadingListDeletedAction;
import org.comixedproject.messaging.lists.PublishReadingListUpdateAction;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.library.SmartListMatcher;
import org.comixedproject.model.library.SmartReadingList;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.model.lists.ReadingListState;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.library.SmartReadingListRepository;
import org.comixedproject.repositories.lists.ReadingListRepository;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.comixedproject.state.lists.ReadingListEvent;
import org.comixedproject.state.lists.ReadingListStateChangeListener;
import org.comixedproject.state.lists.ReadingListStateHandler;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.statemachine.state.State;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>ReadingListService</code> handles the business logic for working with {@link ReadingList}
 * instances.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class ReadingListService implements ReadingListStateChangeListener, InitializingBean {
  static final String POSITION_HEADER = "";
  static final String PUBLISHER_HEADER = "Publisher";
  static final String SERIES_HEADER = "Series";
  static final String VOLUME_HEADER = "Volume";
  static final String ISSUE_NUMBER_HEADER = "Issue Number";

  @Autowired private ReadingListStateHandler readingListStateHandler;
  @Autowired private ReadingListRepository readingListRepository;
  @Autowired private SmartReadingListRepository smartReadingListRepository;
  @Autowired private UserService userService;
  @Autowired private ComicBookService comicBookService;
  @Autowired private CsvAdaptor csvAdaptor;
  @Autowired private PublishReadingListUpdateAction publishReadingListUpdateAction;
  @Autowired private PublishReadingListDeletedAction publishReadingListDeletedAction;

  /**
   * Returns all reading lists for the user with the given email.
   *
   * @param email the user's email
   * @return the reading lists
   * @throws ReadingListException if the email is invalid
   */
  public List<ReadingList> loadReadingListsForUser(final String email) throws ReadingListException {
    log.debug("Getting user: {}", email);
    final ComiXedUser owner = this.doLoadUser(email);
    log.trace("Getting reading lists for user");
    return this.readingListRepository.getAllReadingListsForOwner(owner);
  }

  /**
   * Creates a new reading list.
   *
   * @param email the owner's email
   * @param name the reading list name
   * @param summary the reading list summary
   * @return the reading list
   * @throws ReadingListException if the name is already used
   */
  @Transactional
  public ReadingList createReadingList(final String email, final String name, final String summary)
      throws ReadingListException {
    log.trace("Loading owner");
    final ComiXedUser owner = this.doLoadUser(email);
    ensureReadingListIsUnique(name, owner);
    log.trace("Creating reading list");
    final ReadingList readingList = new ReadingList();
    log.trace("Setting owner");
    readingList.setOwner(owner);
    log.trace("Setting name");
    readingList.setName(name);
    log.trace("Setting summary");
    readingList.setSummary(summary);
    log.trace("Saving reading list");
    final ReadingList result = this.readingListRepository.save(readingList);
    log.trace("Firing new reading list event");
    this.readingListStateHandler.fireEvent(result, ReadingListEvent.created);
    return this.readingListRepository.getById(result.getId());
  }

  /**
   * Updates an existing reading list.
   *
   * @param email the owner's email
   * @param id the reading list record id
   * @param name the reading list name
   * @param summary the reading list summary
   * @return the updated reading list
   * @throws ReadingListException if the record id is invalid
   */
  @Transactional
  public ReadingList updateReadingList(
      final String email, final long id, final String name, final String summary)
      throws ReadingListException {
    log.trace("Loading reading list");
    final ReadingList readingList = this.doLoadReadingListForOwner(id, email);
    log.trace("Updating name");
    readingList.setName(name);
    log.trace("Updating summary");
    readingList.setSummary(summary);
    log.trace("Firing event: updated");
    this.readingListStateHandler.fireEvent(readingList, ReadingListEvent.updated);
    log.trace("Returning reading list");
    return this.doLoadReadingList(id);
  }

  private ReadingList doLoadReadingListForOwner(final long id, final String email)
      throws ReadingListException {
    final ReadingList result = this.doLoadReadingList(id);
    if (!result.getOwner().getEmail().equals(email))
      throw new ReadingListException("User is not owner: " + email);
    return result;
  }

  private ComiXedUser doLoadUser(final String email) throws ReadingListException {
    try {
      return this.userService.findByEmail(email);
    } catch (ComiXedUserException error) {
      throw new ReadingListException("No such user:" + email, error);
    }
  }

  /**
   * Returns a single reading list for the given user
   *
   * @param email the user's email
   * @param id the reading list record i
   * @return the reading list
   * @throws ReadingListException if the reading list is invalid
   */
  public ReadingList loadReadingListForUser(final String email, final long id)
      throws ReadingListException {
    log.trace("Loading reading list: email={} and id={}", email, id);
    return this.doLoadReadingListForOwner(id, email);
  }

  /**
   * Saves a reading list.
   *
   * @param readingList the reading list
   * @return the updated reading list
   */
  @Transactional
  public ReadingList saveReadingList(final ReadingList readingList) {
    log.debug("Saving reading list: {}", readingList.getName());
    this.readingListStateHandler.fireEvent(readingList, ReadingListEvent.updated);
    return this.readingListRepository.getById(readingList.getId());
  }

  /**
   * Adds comics to the specified reading list.
   *
   * @param email the owner's email address
   * @param id the reading list id
   * @param comicIds the list of comic ids
   * @return the updated reading lis
   * @throws ReadingListException if the reading list id is invalid or the list is not owned by the
   *     given user
   */
  @Transactional
  public ReadingList addComicsToList(String email, long id, List<Long> comicIds)
      throws ReadingListException {
    log.trace("Loading reading list: id={}", id);
    final ReadingList readingList = this.doLoadReadingList(id);
    log.trace("Verifying owner: {}", email);
    if (!readingList.getOwner().getEmail().equals(email)) {
      throw new ReadingListException(
          "User is not owner: " + email + " != " + readingList.getOwner().getEmail());
    }
    comicIds.forEach(
        comicId -> {
          try {
            log.trace("Loading comicBook: id={}", comicId);
            final ComicBook comicBook = this.comicBookService.getComic(comicId);
            log.trace("Adding comicBook to reading list");
            Map<String, Object> headers = new HashMap<>();
            headers.put(HEADER_COMIC, comicBook);
            this.readingListStateHandler.fireEvent(
                readingList, ReadingListEvent.comicAdded, headers);
          } catch (ComicBookException error) {
            log.error("Failed to add comic to reading list", error);
          }
        });
    log.trace("Returning reading list");
    return this.doLoadReadingList(id);
  }

  /**
   * Removes comics from the specified reading list.
   *
   * @param email the owner's email
   * @param id the reading list record id
   * @param comicIds the comic ids
   * @return the updated reading list
   * @throws ReadingListException if the reading list id is invalid or the list is not owned by the
   *     given user
   */
  @Transactional
  public ReadingList removeComicsFromList(String email, long id, List<Long> comicIds)
      throws ReadingListException {
    log.trace("Loading reading list: id={}", id);
    final ReadingList readingList = this.doLoadReadingList(id);
    log.trace("Verifying owner: {}", email);
    if (!readingList.getOwner().getEmail().equals(email)) {
      throw new ReadingListException(
          "User is not owner: " + email + " != " + readingList.getOwner().getEmail());
    }

    comicIds.forEach(
        comicId -> {
          try {
            log.trace("Loading comicBook: id={}", comicId);
            final ComicBook comicBook = this.comicBookService.getComic(comicId);
            log.trace("Removing comicBook from reading list");
            Map<String, Object> headers = new HashMap<>();
            headers.put(HEADER_COMIC, comicBook);
            this.readingListStateHandler.fireEvent(
                readingList, ReadingListEvent.comicRemoved, headers);
          } catch (ComicBookException error) {
            log.error("Failed to remove comic from reading list", error);
          }
        });

    log.trace("Returning reading list");
    return this.doLoadReadingList(id);
  }

  private ReadingList doLoadReadingList(final long id) throws ReadingListException {
    final ReadingList result = this.readingListRepository.getById(id);
    if (result == null) throw new ReadingListException("No such reading list: id=" + id);
    return result;
  }

  public SmartListMatcher createMatcher(
      final String type,
      final boolean not,
      final String mode,
      final List<SmartListMatcher> smartListMatchers) {
    log.debug("Creating Group matcher: type={} not={} mode={}", type, not, mode);

    SmartListMatcher smartListMatcher = new SmartListMatcher();
    smartListMatcher.setType(type);
    smartListMatcher.setNot(not);
    smartListMatcher.setMode(mode);
    for (SmartListMatcher matcherSmartListMatcher : smartListMatchers) {
      matcherSmartListMatcher.setNextMatcher(smartListMatcher);
      smartListMatcher.getSmartListMatchers().add(matcherSmartListMatcher);
    }

    return smartListMatcher;
  }

  @Transactional
  public SmartReadingList createSmartReadingList(
      final String email,
      final String name,
      final String summary,
      final boolean not,
      final String mode,
      final List<SmartListMatcher> smartListMatchers)
      throws ReadingListException {
    log.debug("Creating smart reading list: email={} name={}", email, name);

    log.debug("Getting owner");
    final ComiXedUser owner = this.doLoadUser(email);
    SmartReadingList smartReadingList =
        this.smartReadingListRepository.findSmartReadingListForUser(owner, name);

    if (smartReadingList != null) {
      throw new ReadingListException("Name already used: " + name);
    }
    log.debug("Creating reading list object");
    smartReadingList = new SmartReadingList();
    smartReadingList.setOwner(owner);
    smartReadingList.setName(name);
    smartReadingList.setSummary(summary);
    smartReadingList.setNot(not);
    smartReadingList.setMatcherMode(mode);
    for (SmartListMatcher smartListMatcher : smartListMatchers) {
      smartListMatcher.setSmartList(smartReadingList);
      smartReadingList.getSmartListMatchers().add(smartListMatcher);
    }

    log.debug("Saving smart reading list");
    return this.smartReadingListRepository.save(smartReadingList);
  }

  @Override
  @Transactional
  public void onReadingListStateChange(
      final State<ReadingListState, ReadingListEvent> state,
      final Message<ReadingListEvent> message) {
    log.trace("Fetching reading list from message headers");
    final var readingList = message.getHeaders().get(HEADER_READING_LIST, ReadingList.class);
    if (readingList == null) {
      return;
    }
    log.trace("Updating reading list state: [{}] =>  {}", readingList.getId(), state.getId());
    readingList.setReadingListState(state.getId());
    log.trace("Updating last modified date");
    readingList.setLastModifiedOn(new Date());
    log.trace("Saving updated reading list");
    final ReadingList savedReadingList = this.readingListRepository.save(readingList);
    try {
      log.trace("Publishing changes");
      this.publishReadingListUpdateAction.publish(savedReadingList);
    } catch (PublishingException error) {
      log.error("Failed to publish update", error);
    }
  }

  @Override
  public void afterPropertiesSet() throws Exception {
    log.trace("Subscribing to reading list state changes");
    this.readingListStateHandler.addListener(this);
  }

  /**
   * Returns a reading list encoded for download.
   *
   * @param email the user's email
   * @param readingListId the reading list id
   * @return the encoded reading list
   * @throws ReadingListException if the user is not the owner, or the id is invalid
   */
  public DownloadDocument encodeReadingList(final String email, final long readingListId)
      throws ReadingListException {
    log.trace("Loading reading list");
    final ReadingList readingList = this.doLoadReadingListForOwner(readingListId, email);
    try {
      log.trace("Encoding reading list");
      final byte[] content =
          this.csvAdaptor.encodeRecords(
              readingList.getComicBooks(),
              (index, model) -> {
                if (index == 0) {
                  return new String[] {
                    POSITION_HEADER,
                    PUBLISHER_HEADER,
                    SERIES_HEADER,
                    VOLUME_HEADER,
                    ISSUE_NUMBER_HEADER
                  };
                } else {
                  return new String[] {
                    String.valueOf(index),
                    model.getPublisher(),
                    model.getSeries(),
                    model.getVolume(),
                    model.getIssueNumber()
                  };
                }
              });
      log.trace("Returning encoded reading list");
      return new DownloadDocument(
          String.format("%s.csv", readingList.getName()), "text/csv", content);
    } catch (IOException error) {
      throw new ReadingListException("Error encoding reading list", error);
    }
  }

  /**
   * Decodes an uploaded file and creates a reading list based on its contents.
   *
   * @param email the owner's email
   * @param name the reading list name
   * @param input the content stream
   * @throws ReadingListException if an error occurs
   * @throws IOException if an error occurs
   */
  @Transactional
  public void decodeAndCreateReadingList(
      final String email, final String name, final InputStream input)
      throws ReadingListException, IOException {
    final ReadingList readingList = this.createReadingList(email, name, "");
    final Long readingListId = readingList.getId();
    this.csvAdaptor.decodeRecords(
        input,
        new String[] {
          POSITION_HEADER, PUBLISHER_HEADER, SERIES_HEADER, VOLUME_HEADER, ISSUE_NUMBER_HEADER
        },
        (index, row) -> {
          if (index > 0) {
            log.trace("Looking for comicBook");
            final ComicBook comicBook =
                this.comicBookService.findComic(row.get(1), row.get(2), row.get(3), row.get(4));
            if (comicBook != null) {
              final ReadingList list = this.readingListRepository.getById(readingListId);
              log.trace("Adding comicBook to reading list");
              Map<String, Object> headers = new HashMap<>();
              headers.put(HEADER_COMIC, comicBook);
              this.readingListStateHandler.fireEvent(list, ReadingListEvent.comicAdded, headers);
            }
          }
        });
  }

  private void ensureReadingListIsUnique(final String name, final ComiXedUser owner)
      throws ReadingListException {
    log.trace("Looking for existing reading list: name={}", name);
    if (this.readingListRepository.checkForExistingReadingList(owner, name)) {
      throw new ReadingListException("Name already used: " + name);
    }
  }

  /**
   * Deletes reading lists.
   *
   * @param email the requesting user email
   * @param ids the reading list ids
   * @throws ReadingListException if the user is not the owner of a list or the id is invalid
   */
  public void deleteReadingLists(final String email, final List<Long> ids)
      throws ReadingListException {
    ids.forEach(
        id -> {
          try {
            log.trace("Loading reading list: id={}", id);
            final ReadingList readingList = this.doLoadReadingListForOwner(id, email);
            log.trace("Deleting reading list");
            this.readingListRepository.delete(readingList);
            log.trace("Publishing deletion");
            this.publishReadingListDeletedAction.publish(readingList);
          } catch (ReadingListException error) {
            log.error("Failed to delete reading list", error);
          } catch (PublishingException error) {
            log.error("Failed to publish reading list deletion", error);
          }
        });
  }
}

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

import static org.comixedproject.state.lists.ReadingListStateHandler.HEADER_READING_LIST;

import java.util.Date;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.library.SmartListMatcher;
import org.comixedproject.model.library.SmartReadingList;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.model.lists.ReadingListState;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.library.SmartReadingListRepository;
import org.comixedproject.repositories.lists.ReadingListRepository;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.comic.ComicService;
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
  @Autowired private ReadingListStateHandler readingListStateHandler;
  @Autowired ReadingListRepository readingListRepository;
  @Autowired SmartReadingListRepository smartReadingListRepository;
  @Autowired UserService userService;
  @Autowired ComicService comicService;

  /**
   * Returns all reading lists for the user with the given email.
   *
   * @param email the user's email
   * @return the reading lists
   * @throws ReadingListException if the email is invalid
   */
  public List<ReadingList> getReadingListsForUser(final String email) throws ReadingListException {
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
    log.trace("Looking for existing reading list: name={}", name);
    if (this.readingListRepository.findReadingListForUser(owner, name) != null) {
      throw new ReadingListException("Name already used: " + name);
    }
    log.trace("Creating reading list");
    final ReadingList readingList = new ReadingList();
    log.trace("Setting owner");
    readingList.setOwner(owner);
    log.trace("Setting name");
    readingList.setName(name);
    log.trace("Setting summary");
    readingList.setSummary(summary);
    log.trace("Saving reading list");
    return this.readingListRepository.save(readingList);
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
  public ReadingList getReadingListForUser(final String email, final long id)
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
          log.trace("Checking if comic is already in list");
          if (readingList.getComics().stream().noneMatch(entry -> entry.getId().equals(comicId))) {
            try {
              log.trace("Loading comic: id={}", comicId);
              final Comic comic = this.comicService.getComic(comicId);
              log.trace("Adding comic to reading list");
              readingList.getComics().add(comic);
            } catch (ComicException error) {
              log.error("Failed to add comic to reading list", error);
            }
          }
        });

    log.trace("Firing action: comics added to reading list");
    this.readingListStateHandler.fireEvent(readingList, ReadingListEvent.comicAdded);
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
          if (readingList.getComics().stream().anyMatch(comic -> comic.getId().equals(comicId))) {
            try {
              log.trace("Loading comic: id={}", comicId);
              final Comic comic = this.comicService.getComic(comicId);
              log.trace("Removing comic from reading list");
              readingList.getComics().remove(comic);
            } catch (ComicException error) {
              log.error("Failed to remove comic from reading list", error);
            }
          }
        });

    log.trace("Firing action: comics removed from reading list");
    this.readingListStateHandler.fireEvent(readingList, ReadingListEvent.comicRemoved);
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
    log.trace("Fetching reading list frmo message headers");
    final var readingList = message.getHeaders().get(HEADER_READING_LIST, ReadingList.class);
    if (readingList == null) {
      return;
    }
    log.trace("Updating reading list state: [{}] =>  {}", readingList.getId(), state.getId());
    readingList.setReadingListState(state.getId());
    log.trace("Updating last modified date");
    readingList.setLastModifiedOn(new Date());
    log.trace("Saving updated reading list");
    this.readingListRepository.save(readingList);
  }

  @Override
  public void afterPropertiesSet() throws Exception {
    log.trace("Subscribing to reading list state changes");
    this.readingListStateHandler.addListener(this);
  }
}
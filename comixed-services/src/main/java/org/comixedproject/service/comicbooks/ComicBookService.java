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

package org.comixedproject.service.comicbooks;

import static org.comixedproject.state.comicbooks.ComicStateHandler.HEADER_COMIC;

import java.io.File;
import java.io.IOException;
import java.util.Calendar;
import java.util.Comparator;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.TimeZone;
import java.util.stream.Collectors;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FileUtils;
import org.comixedproject.adaptors.comicbooks.ComicBookMetadataAdaptor;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.comicbooks.PublishComicRemovalAction;
import org.comixedproject.messaging.comicbooks.PublishComicUpdateAction;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.comicpages.Page;
import org.comixedproject.model.net.comicbooks.PageOrderEntry;
import org.comixedproject.model.net.library.PublisherAndYearSegment;
import org.comixedproject.model.net.library.RemoteLibrarySegmentState;
import org.comixedproject.repositories.comicbooks.ComicBookRepository;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateChangeListener;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.Message;
import org.springframework.statemachine.state.State;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>ComicBookService</code> provides business rules for instances of {@link ComicBook}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class ComicBookService implements InitializingBean, ComicStateChangeListener {
  @Autowired private ComicStateHandler comicStateHandler;
  @Autowired private ComicBookRepository comicBookRepository;
  @Autowired private ComicBookMetadataAdaptor comicBookMetadataAdaptor;
  @Autowired private PublishComicUpdateAction publishComicUpdateAction;
  @Autowired private PublishComicRemovalAction publishComicRemovalAction;
  @Autowired private ImprintService imprintService;

  /**
   * Retrieves a single comic by id. It is expected that this comic exists.
   *
   * @param id the comic id
   * @return the comic
   * @throws ComicBookException if the comic does not exist
   */
  public ComicBook getComic(final long id) throws ComicBookException {
    log.debug("Getting comic: id={}", id);

    final var result = this.doGetComic(id);
    final Optional<ComicBook> nextComic =
        this.comicBookRepository
            .findIssuesAfterComic(
                result.getSeries(),
                result.getVolume(),
                result.getIssueNumber(),
                result.getCoverDate())
            .stream()
            .filter(comic -> comic.getCoverDate().compareTo(result.getCoverDate()) >= 0)
            .sorted((o1, o2) -> o1.getCoverDate().compareTo(o2.getCoverDate()))
            .findFirst();
    if (nextComic.isPresent()) result.setNextIssueId(nextComic.get().getId());

    final Optional<ComicBook> prevComic =
        this.comicBookRepository
            .findIssuesBeforeComic(
                result.getSeries(),
                result.getVolume(),
                result.getIssueNumber(),
                result.getCoverDate())
            .stream()
            .filter(comic -> comic.getCoverDate().compareTo(result.getCoverDate()) <= 0)
            .sorted((o1, o2) -> o2.getCoverDate().compareTo(o1.getCoverDate()))
            .findFirst();
    if (prevComic.isPresent()) result.setPreviousIssueId(prevComic.get().getId());

    log.debug("Returning comic: id={}", result.getId());
    return result;
  }

  private ComicBook doGetComic(final long id) throws ComicBookException {
    return this.doGetComic(id, true);
  }

  private ComicBook doGetComic(final long id, final boolean throwIfMissing)
      throws ComicBookException {
    final ComicBook result = this.comicBookRepository.getById(id);
    if (result == null && throwIfMissing) throw new ComicBookException("No such comic: id=" + id);
    return result;
  }

  /**
   * Marks a comic for deletion but does not actually delete the comic.
   *
   * @param id the comic id
   * @return the updated comic
   * @throws ComicBookException if the comic id is invalid
   */
  @Transactional
  public ComicBook deleteComic(final long id) throws ComicBookException {
    log.debug("Marking comic for deletion: id={}", id);
    final var comic = this.comicBookRepository.getByIdWithReadingLists(id);
    this.comicStateHandler.fireEvent(comic, ComicEvent.deleteComic);
    return this.doGetComic(id);
  }

  /**
   * Updates a comic record.
   *
   * @param id the comic id
   * @param update the updated comic data
   * @return the updated comic
   * @throws ComicBookException if the id is invalid
   */
  @Transactional
  public ComicBook updateComic(final long id, final ComicBook update) throws ComicBookException {
    log.debug("Updating comic: id={}", id);
    final var comic = this.doGetComic(id);

    log.trace("Updating the comic fields");

    comic.setPublisher(update.getPublisher());
    comic.setSeries(update.getSeries());
    comic.setVolume(update.getVolume());
    comic.setIssueNumber(update.getIssueNumber());
    comic.setImprint(update.getImprint());
    comic.setSortName(update.getSortName());
    comic.setTitle(update.getTitle());
    comic.setDescription(update.getDescription());

    this.imprintService.update(comic);

    this.comicStateHandler.fireEvent(comic, ComicEvent.detailsUpdated);
    return this.doGetComic(id);
  }

  /**
   * Saves a new comicBook.
   *
   * @param comicBook the comicBook
   * @return the saved comicBook
   */
  @Transactional
  public ComicBook save(final ComicBook comicBook) {
    log.debug("Saving comicBook: filename={}", comicBook.getFilename());

    this.imprintService.update(comicBook);

    final ComicBook result = this.comicBookRepository.save(comicBook);

    this.comicBookRepository.flush();

    return result;
  }

  /**
   * Retrieves the full content of the comicBook file.
   *
   * @param comicBook the comicBook
   * @return the comicBook content
   */
  @Transactional
  public byte[] getComicContent(final ComicBook comicBook) {
    log.debug("Getting file content: filename={}", comicBook.getFilename());

    try {
      return FileUtils.readFileToByteArray(new File(comicBook.getFilename()));
    } catch (IOException error) {
      log.error("Failed to read comicBook file content", error);
      return null;
    }
  }

  /**
   * Unmarks a comic for deletion.
   *
   * @param id the comic id
   * @return the updated comic
   * @throws ComicBookException if the comic id is invalid
   */
  @Transactional
  public ComicBook undeleteComic(final long id) throws ComicBookException {
    log.debug("Restoring comic: id={}", id);
    final var comic = this.doGetComic(id);
    this.comicStateHandler.fireEvent(comic, ComicEvent.undeleteComic);
    return this.doGetComic(id);
  }

  /**
   * Deletes the specified comicBook from the library.
   *
   * @param comicBook the comicBook
   */
  @Transactional
  public void deleteComic(final ComicBook comicBook) {
    log.debug("Deleting comicBook: id={}", comicBook.getId());
    this.comicBookRepository.delete(comicBook);
  }

  /**
   * Retrieves a page of comics to be moved.
   *
   * @param page the page
   * @param max the maximum number of comics to return
   * @return the list of comics
   */
  public List<ComicBook> findComicsToMove(final int page, final int max) {
    return this.comicBookRepository.findComicsToMove(PageRequest.of(page, max));
  }

  /**
   * Returns a comic with the given absolute filename.
   *
   * @param filename the filename
   * @return the comic
   */
  public ComicBook findByFilename(final String filename) {
    return this.comicBookRepository.findByFilename(filename);
  }

  /**
   * Returns a list of comics with ids greater than the threshold specified.
   *
   * @param threshold the id threshold
   * @param max the maximum number of records
   * @return the list of comics
   */
  public List<ComicBook> getComicsById(final long threshold, final int max) {
    log.debug("Finding {} comic{} with id greater than {}", max, max == 1 ? "" : "s", threshold);
    return this.comicBookRepository.findComicsWithIdGreaterThan(threshold, PageRequest.of(0, max));
  }

  @Override
  @Transactional
  public void onComicStateChange(
      final State<ComicState, ComicEvent> state, final Message<ComicEvent> message) {
    final var comic = message.getHeaders().get(HEADER_COMIC, ComicBook.class);
    if (comic == null) return;
    log.debug("Processing comic state change: [{}] =>  {}", comic.getId(), state.getId());
    if (state.getId() == ComicState.REMOVED) {
      log.trace("Publishing comic removal");
      try {
        this.publishComicRemovalAction.publish(comic);
      } catch (PublishingException error) {
        log.error("Failed to publish comic removal", error);
      }
    } else {
      comic.setComicState(state.getId());
      comic.setLastModifiedOn(new Date());
      final ComicBook updated = this.comicBookRepository.save(comic);
      log.trace("Publishing comic  update");
      try {
        this.publishComicUpdateAction.publish(updated);
      } catch (PublishingException error) {
        log.error("Failed to publish comic update", error);
      }
    }
  }

  @Override
  public void afterPropertiesSet() throws Exception {
    log.trace("Subscribing to comic state changes");
    this.comicStateHandler.addListener(this);
  }

  /**
   * Clears all metadata from the given comic.
   *
   * @param comicId the comic id
   * @return the updated comic
   * @throws ComicBookException if the comic id is invalid
   */
  @Transactional
  public ComicBook deleteMetadata(final long comicId) throws ComicBookException {
    log.debug("Loading comic: id={}", comicId);
    final var comic = this.doGetComic(comicId);
    log.trace("Clearing comic metadata");
    this.comicBookMetadataAdaptor.clear(comic);
    log.trace("Firing comic state event");
    this.comicStateHandler.fireEvent(comic, ComicEvent.metadataCleared);
    log.trace("Retrieving upated comic");
    return this.doGetComic(comicId);
  }

  /**
   * Retrieves inserted comics that have not been processed.
   *
   * @param count the number of comics to return
   * @return the comics
   */
  public List<ComicBook> findInsertedComics(final int count) {
    log.trace("Loading newly inserted comics");
    return this.comicBookRepository.findForState(ComicState.ADDED, PageRequest.of(0, count));
  }

  /**
   * Retrieves the number of unprocessed comics that are waiting to have their contents loaded.
   *
   * @return the count
   */
  public long getUnprocessedComicsWithoutContentCount() {
    log.trace("Getting the number of unprocessed comics without content");
    return this.comicBookRepository.findUnprocessedComicsWithoutContentCount();
  }

  /**
   * Returns the number of comic books with the create metadata source flag set.
   *
   * @return the comic book count
   */
  public long getWithCreateMetadataSourceFlagCount() {
    log.trace("Getting comics with the create metadata source flag set");
    return this.comicBookRepository.findComicsWithCreateMeatadataSourceFlag();
  }

  /**
   * Retrieves unprocessed comics that have the create metadata flag set.
   *
   * @param count the number of comics to return
   * @return the comics
   */
  public List<ComicBook> findComicsWithCreateMetadataFlagSet(int count) {
    log.trace("Loading unprocessed comics that need to have their contents loaded");
    return this.comicBookRepository.findUnprocessedComicsWithCreateMetadataFlagSet(
        PageRequest.of(0, count));
  }

  /**
   * Retrieves unprocessed comics that are waiting to have their contents loaded.
   *
   * @param count the number of comics to return
   * @return the comics
   */
  public List<ComicBook> findUnprocessedComicsWithoutContent(int count) {
    log.trace("Loading unprocessed comics that need to have their contents loaded");
    return this.comicBookRepository.findUnprocessedComicsWithoutContent(PageRequest.of(0, count));
  }

  /**
   * Returns the number of unprocessed comics that are waiting to have the blocked pages marked.
   *
   * @return the count
   */
  public long getUnprocessedComicsForMarkedPageBlockingCount() {
    log.trace("Getting unprocessed comics that need page blocking count");
    return this.comicBookRepository.findUnprocessedComicsForMarkedPageBlockingCount();
  }

  /**
   * Retrieves unprocessed comics that are waiting to have the blocked pages marked.
   *
   * @param count the number of comics to return
   * @return the comics
   */
  public List<ComicBook> findUnprocessedComicsForMarkedPageBlocking(final int count) {
    log.trace("Loading unprocessed comics that need page blocking");
    return this.comicBookRepository.findUnprocessedComicsForMarkedPageBlocking(
        PageRequest.of(0, count));
  }

  /**
   * Returns the number of unprocessed comics that don't have file details loaded.
   *
   * @return the count
   */
  public long getUnprocessedComicsWithoutFileDetailsCount() {
    log.trace("Getting unprocessed comics without file details loaded count");
    return this.comicBookRepository.findUnprocessedComicsWithoutFileDetailsCount();
  }

  /**
   * Retrieves unprocessed comics that don't have file details.
   *
   * @param count the number of comics to return
   * @return the comics
   */
  public List<ComicBook> findUnprocessedComicsWithoutFileDetails(final int count) {
    log.trace("Loading unprocessed comics without file details loaded");
    return this.comicBookRepository.findUnprocessedComicsWithoutFileDetails(
        PageRequest.of(0, count));
  }

  /**
   * Returns the number of unprocessed comics that have had their contents processed.
   *
   * @return the count
   */
  public long getProcessedComicsCount() {
    log.trace("Getting count of unprocessed comics that are fully processed");
    return this.comicBookRepository.findProcessedComicsCount();
  }

  /**
   * Retrieves unprocessed comics that have had their contents processed.
   *
   * @param count the number of comics to return
   * @return the comics
   */
  public List<ComicBook> findProcessedComics(final int count) {
    log.trace("Loading unprocessed comics that are fully processed");
    return this.comicBookRepository.findProcessedComics(PageRequest.of(0, count));
  }

  /**
   * Marks a set of comics for rescanning.
   *
   * @param ids the comic ids
   */
  public void rescanComics(final List<Long> ids) {
    ids.forEach(
        id -> {
          try {
            log.trace("Loading comicBook: id={}", id);
            final ComicBook comicBook = this.doGetComic(id);
            log.trace("Firing event: rescan comicBook");
            this.comicStateHandler.fireEvent(comicBook, ComicEvent.rescanComic);
          } catch (ComicBookException error) {
            log.error("Error preparing comic for rescan", error);
          }
        });
  }

  /**
   * Returns comics that are waiting to have their metadata updated.
   *
   * @param count the number of comics to return
   * @return the list of comics
   */
  public List<ComicBook> findComicsWithMetadataToUpdate(final int count) {
    log.trace("Getting comics that are ready to have their metadata updated");
    return this.comicBookRepository.findComicsWithMetadataToUpdate(PageRequest.of(0, count));
  }

  public List<ComicBook> findComicsForBatchMetadataUpdate(final int count) {
    log.trace("Getting comics that are flagged for batch metadata update");
    return this.comicBookRepository.findComicsForBatchMetadataUpdate(PageRequest.of(0, count));
  }

  /**
   * Returns the number of comics enqueued for batch metadata update.
   *
   * @return the comic count
   */
  public long findComicsForBatchMetadataUpdateCount() {
    log.trace("Getting number of comics that are flagged for batch metadata update");
    return this.comicBookRepository.findComicsForBatchMetadataUpdateCount();
  }

  /**
   * Finds all comics marked for deletion.
   *
   * @param count the number of comics to return
   * @return the list of comics
   */
  public List<ComicBook> findComicsMarkedForDeletion(final int count) {
    log.trace("Finding all comics marked for deletion");
    return this.comicBookRepository.findComicsMarkedForDeletion(PageRequest.of(0, count));
  }

  /**
   * Finds all comics that are to be moved.
   *
   * @param count the numer of comics to return
   * @return the list of comics
   */
  public List<ComicBook> findComicsToBeMoved(final int count) {
    log.trace("Finding all comics to be moved");
    return this.comicBookRepository.findComicsToBeMoved(PageRequest.of(0, count));
  }

  /**
   * Returns all comics.
   *
   * @return the list of comics
   */
  public List<ComicBook> findAll() {
    log.trace("Finding all comics");
    return this.comicBookRepository.findAll();
  }

  /**
   * Marks comics for deletion.
   *
   * @param ids the comic ids
   */
  public void deleteComics(final List<Long> ids) {
    ids.forEach(
        id -> {
          final ComicBook comicBook = this.comicBookRepository.getByIdWithReadingLists(id);
          if (comicBook != null) {
            log.trace("Marking comicBook for deletion: id={}", comicBook.getId());
            this.comicStateHandler.fireEvent(comicBook, ComicEvent.deleteComic);
          }
        });
  }

  /**
   * Unmarks comics for deletion.
   *
   * @param ids the comic ids
   */
  public void undeleteComics(final List<Long> ids) {
    ids.forEach(
        id -> {
          final ComicBook comicBook = this.comicBookRepository.getById(id.longValue());
          if (comicBook != null) {
            log.trace("Unmarking comicBook for deletion: id={}", comicBook.getId());
            this.comicStateHandler.fireEvent(comicBook, ComicEvent.undeleteComic);
          }
        });
  }

  /**
   * Finds all comics to be recreated.
   *
   * @param count the number of comics to return
   * @return the list of comics
   */
  public List<ComicBook> findComicsToRecreate(final int count) {
    log.trace("Finding all comics to be recreated");
    return this.comicBookRepository.findComicsToRecreate(PageRequest.of(0, count));
  }

  /**
   * Looks for the first existing comic that matches the given criteria.
   *
   * @param publisher the publisher
   * @param series the series
   * @param volume the volume
   * @param issueNumber the issue number
   * @return the comic
   */
  public ComicBook findComic(
      final String publisher, final String series, final String volume, final String issueNumber) {
    log.trace(
        "Finding comic: publisher={} series={} volume={} issue #={}",
        publisher,
        series,
        volume,
        issueNumber);
    return this.comicBookRepository.findComic(publisher, series, volume, issueNumber);
  }

  /**
   * Returns the list of all publisher names.
   *
   * @return the list of names.
   */
  public List<String> getAllPublishers() {
    log.trace("Loading all publisher names");
    return this.comicBookRepository.findDistinctPublishers();
  }

  /**
   * Returns the list of all series names.
   *
   * @return the list of names.
   */
  public List<String> getAllSeries() {
    log.trace("Loading all series names");
    return this.comicBookRepository.findDistinctSeries();
  }

  /**
   * Returns all comics for a single series by name. If the unread flag is set to true, then only
   * comics unread by the given user are returned.
   *
   * @param name the series name
   * @param email the users email
   * @param unread the unread flag
   * @return the comics
   */
  public List<ComicBook> getAllForSeries(
      final String name, final String email, final boolean unread) {
    log.trace("Loading all comics for one series: unread={}", unread);
    return this.filterReadComics(email, unread, this.comicBookRepository.findAllBySeries(name));
  }

  private List<ComicBook> filterReadComics(
      final String email, final boolean unread, List<ComicBook> result) {
    if (unread) {
      log.trace("Filtering out read comics: name={}", email);
      result =
          result.stream()
              .filter(
                  comicBook ->
                      comicBook.getLastReads().stream()
                          .noneMatch(lastRead -> lastRead.getUser().getEmail().equals(email)))
              .collect(Collectors.toList());
    }
    return result;
  }

  /**
   * Returns the list of all character names.
   *
   * @return the list of names.
   */
  public List<String> getAllCharacters() {
    log.trace("Loading all character names");
    return this.comicBookRepository.findDistinctCharacters();
  }

  /**
   * Returns all comics for a single character by name. If the unread flag is set to true, then only
   * comics unread by the given user are returned.
   *
   * @param name the character name
   * @param email the users email
   * @param unread the unread flag
   * @return the comics
   */
  public List<ComicBook> getAllForCharacter(
      final String name, final String email, final boolean unread) {
    log.trace("Loading all comics for one character: unread={}", unread);
    return this.filterReadComics(email, unread, this.comicBookRepository.findAllByCharacters(name));
  }

  /**
   * Returns the list of all team names.
   *
   * @return the list of names.
   */
  public List<String> getAllTeams() {
    log.trace("Loading all team names");
    return this.comicBookRepository.findDistinctTeams();
  }

  /**
   * Returns all comics for a single team by name. If the unread flag is set to true, then only
   * comics unread by the given user are returned.
   *
   * @param name the team name
   * @param email the users email
   * @param unread the unread flag
   * @return the comics
   */
  public List<ComicBook> getAllForTeam(
      final String name, final String email, final boolean unread) {
    log.trace("Loading all comics for one team: unread={}", unread);
    return this.filterReadComics(email, unread, this.comicBookRepository.findAllByTeams(name));
  }

  /**
   * Returns the list of all location names.
   *
   * @return the list of names.
   */
  public List<String> getAllLocations() {
    log.trace("Loading all location names");
    return this.comicBookRepository.findDistinctLocations();
  }

  /**
   * Returns all comics for a single location by name. If the unread flag is set to true, then only
   * comics unread by the given user are returned.
   *
   * @param name the location name
   * @param email the users email
   * @param unread the unread flag
   * @return the comics
   */
  public List<ComicBook> getAllForLocation(
      final String name, final String email, final boolean unread) {
    log.trace("Loading all comics for one location: unread={}", unread);
    return this.filterReadComics(email, unread, this.comicBookRepository.findAllByLocations(name));
  }

  /**
   * Returns the list of all stories.
   *
   * @return the list of names.
   */
  public List<String> getAllStories() {
    log.trace("Loading all story names");
    return this.comicBookRepository.findDistinctStories();
  }

  /**
   * Returns all comics for a single story by name. If the unread flag is set to true, then only
   * comics unread by the given user are returned.
   *
   * @param name the story name
   * @param email the users email
   * @param unread the unread flag
   * @return the comics
   */
  public List<ComicBook> getAllForStory(
      final String name, final String email, final boolean unread) {
    log.trace("Loading all comics in one story: unread={}", unread);
    return this.filterReadComics(email, unread, this.comicBookRepository.findAllByStories(name));
  }

  public List<String> getAllPublishersForStory(final String name) {
    log.trace("Returning all publishers for a given story");
    return this.comicBookRepository.findDistinctPublishersForStory(name);
  }

  /**
   * Returns comics marked for purging.
   *
   * @param count the number of comics to return
   * @return the comics
   */
  public List<ComicBook> findComicsMarkedForPurging(final int count) {
    log.trace("Loading comics marked for purging");
    return this.comicBookRepository.findComicsMarkedForPurging(PageRequest.of(0, count));
  }

  /**
   * Saves the new order for the pages of a comic. If the unread flag is set to true, then only
   * comics unread by the given user are returned.
   *
   * @param comicId the comic id
   * @param entryList the page order entries
   * @throws ComicBookException if the id is invalid, or there is a problem with the entry list
   */
  public void savePageOrder(final long comicId, final List<PageOrderEntry> entryList)
      throws ComicBookException {
    log.trace("Loading comicBook");
    final ComicBook comicBook = this.doGetComic(comicId);
    log.trace("Sorting new page list");
    entryList.sort(Comparator.comparingInt(PageOrderEntry::getPosition));
    log.trace("Checking for holes in order");
    for (int index = 0; index < entryList.size(); index++) {
      final PageOrderEntry entry = entryList.get(index);
      if (entry.getPosition() != index)
        throw new ComicBookException(
            "Invalid page order list: " + index + " != " + entry.getPosition());
    }

    log.trace("Applying order");
    for (int index = 0; index < comicBook.getPages().size(); index++) {
      final Page page = comicBook.getPages().get(index);
      final Optional<PageOrderEntry> position =
          entryList.stream()
              .filter(pageOrderEntry -> pageOrderEntry.getFilename().equals(page.getFilename()))
              .findFirst();
      if (position.isEmpty())
        throw new ComicBookException("No such order entry: filename=" + page.getFilename());
      log.trace("Applying position");
      page.setPageNumber(position.get().getPosition());
    }

    log.trace("Firing event: details updated");
    this.comicStateHandler.fireEvent(comicBook, ComicEvent.detailsUpdated);
  }

  /**
   * Prepares to update the details for a set of comics.
   *
   * @param comicIds the comics' ids
   * @throws ComicBookException if comic id is invalid
   */
  public void updateMultipleComics(final List<Long> comicIds) throws ComicBookException {
    log.debug("Updating details for {} comic{}", comicIds.size(), comicIds.size() == 1 ? "" : "s");
    for (long id : comicIds) {
      log.trace("Loading comicBook: id={}", id);
      final ComicBook comicBook = this.doGetComic(id);
      this.comicStateHandler.fireEvent(comicBook, ComicEvent.updateDetails);
    }
  }

  /**
   * Returns the set of years for comics in the library.
   *
   * @return the list of years
   */
  public List<Integer> getYearsForComics() {
    final GregorianCalendar calendar = new GregorianCalendar();
    calendar.setTimeZone(TimeZone.getTimeZone("UTC"));
    return this.comicBookRepository.loadYearsWithComics();
  }

  /**
   * Returns the weeks for the given year for which the library contains comics.
   *
   * @param year the year
   * @return the list of weeks
   */
  public List<Integer> getWeeksForYear(final Integer year) {
    final GregorianCalendar calendar = new GregorianCalendar();
    calendar.setTimeZone(TimeZone.getTimeZone("UTC"));
    return this.comicBookRepository.loadWeeksForYear(year).stream()
        .map(
            coverDate -> {
              calendar.setTime(coverDate);
              return calendar.get(Calendar.WEEK_OF_YEAR);
            })
        .collect(Collectors.toList());
  }

  public List<ComicBook> getComicsForYearAndWeek(
      final Integer year, final Integer week, final String email, final boolean unread) {
    final GregorianCalendar calendar = new GregorianCalendar();
    calendar.setTimeZone(TimeZone.getTimeZone("UTC"));
    calendar.set(Calendar.YEAR, year);
    calendar.set(Calendar.WEEK_OF_YEAR, week);
    log.trace("Getting first day of requested week");
    calendar.set(Calendar.DAY_OF_WEEK, Calendar.SUNDAY);
    final Date startDate = calendar.getTime();
    log.trace("Getting last day of requested week");
    calendar.set(Calendar.DAY_OF_WEEK, Calendar.SATURDAY);
    final Date endDate = calendar.getTime();
    List<ComicBook> result =
        this.comicBookRepository.findWithCoverDateRange(startDate, endDate).stream()
            .collect(Collectors.toList());
    result = filterReadComics(email, unread, result);
    return result;
  }

  /**
   * Returns the list of series names for a given publisher.
   *
   * @param publisher the publisher name
   * @return the series names
   */
  public Set<String> getAllSeriesForPublisher(final String publisher) {
    log.debug("Loading series for publisher: publisher={}", publisher);
    return this.comicBookRepository.getAllSeriesForPublisher(publisher);
  }

  public Set<String> getAllVolumesForPublisherAndSeries(
      final String publisher, final String series) {
    log.debug("Loading volumes for series: publisher={} series={}", publisher, series);
    return this.comicBookRepository.getAllVolumesForPublisherAndSeries(publisher, series);
  }

  /**
   * Returns the lkist of all comics for a given publisher, series and volume.
   *
   * @param publisher the publisher
   * @param series the series
   * @param volume the volume
   * @param email the reader's email address
   * @param unread the unread flag
   * @return the list of comics
   */
  public List<ComicBook> getAllComicBooksForPublisherAndSeriesAndVolume(
      final String publisher,
      final String series,
      final String volume,
      final String email,
      final boolean unread) {
    log.debug(
        "Loading comics for volume: publisher={} series={} volume={}", publisher, series, volume);
    return this.filterReadComics(
        email,
        unread,
        this.comicBookRepository.getAllComicBooksForPublisherAndSeriesAndVolume(
            publisher, series, volume));
  }

  /**
   * Returns the list of all volumes for a given series.
   *
   * @param series the series name
   * @return the volumes
   */
  public Set<String> getAllVolumesForSeries(final String series) {
    log.debug("Loading all volumes for series: {}", series);
    return this.comicBookRepository.findDistinctVolumesForSeries(series);
  }

  /**
   * Returns the list of all comics for the given series and volume.
   *
   * @param series the series name
   * @param volume the volume
   * @param email the reader's email address
   * @param unread the unread flag
   * @return the list of comics
   */
  public List<ComicBook> getAllComicBooksForSeriesAndVolume(
      final String series, final String volume, final String email, final boolean unread) {
    log.debug("Loading all comics for series and volume: {} v{}", series, volume);
    return this.filterReadComics(
        email, unread, this.comicBookRepository.getAllComicBooksForSeriesAndVolume(series, volume));
  }

  /**
   * Returns the total number of comics in the library.
   *
   * @return the comic count
   */
  public long getComicBookCount() {
    log.trace("Getting total comics count");
    return this.comicBookRepository.count();
  }

  public long getUnscrapedComicBookCount() {
    log.trace("Getting unscraped comics count");
    return this.comicBookRepository.countByMetadataIsNull();
  }

  /**
   * Returns the total number of comics marked for deletion.
   *
   * @return the deleted comic count
   */
  public long getDeletedComicCount() {
    log.trace("Getting the deleted comic count count");
    return this.getCountForState(ComicState.DELETED);
  }

  /**
   * Returns the number of records with the specified state.
   *
   * @param state the target state
   * @return the number of records
   */
  public long getCountForState(final ComicState state) {
    log.trace("Getting record count for state: {}", state);
    return this.comicBookRepository.findForStateCount(state);
  }

  /**
   * Returns the library state for publishers.
   *
   * @return the publishers state
   */
  public List<RemoteLibrarySegmentState> getPublishersState() {
    log.trace("Getting the publishers state");
    return this.comicBookRepository.getPublishersState();
  }

  /**
   * Returns the library state for series.
   *
   * @return the series state
   */
  public List<RemoteLibrarySegmentState> getSeriesState() {
    log.trace("Getting the series state");
    return this.comicBookRepository.getSeriesState();
  }

  /**
   * Returns the library state for characters.
   *
   * @return the characters state
   */
  public List<RemoteLibrarySegmentState> getCharactersState() {
    log.trace("Getting the characters state");
    return this.comicBookRepository.getCharactersState();
  }

  /**
   * Returns the library state for teams.
   *
   * @return the teams state
   */
  public List<RemoteLibrarySegmentState> getTeamsState() {
    log.trace("Getting the teams state");
    return this.comicBookRepository.getTeamsState();
  }

  /**
   * Returns the library state for locations.
   *
   * @return the locations state
   */
  public List<RemoteLibrarySegmentState> getLocationsState() {
    log.trace("Getting the locations state");
    return this.comicBookRepository.getLocationsState();
  }

  /**
   * Returns the library state for stories.
   *
   * @return the stories state
   */
  public List<RemoteLibrarySegmentState> getStoriesState() {
    log.trace("Getting the stories state");
    return this.comicBookRepository.getStoriesState();
  }

  /**
   * Returns the library state for comic book states.
   *
   * @return the comic book states
   */
  public List<RemoteLibrarySegmentState> getComicBooksState() {
    log.trace("Getting the comics state");
    return this.comicBookRepository.getComicBooksState();
  }

  /**
   * Returns the number of comics per publisher and year.
   *
   * @return the statistics
   */
  public List<PublisherAndYearSegment> getByPublisherAndYear() {
    log.trace("Getting counts by publisher and year");
    return this.comicBookRepository.getByPublisherAndYear();
  }

  /**
   * Marks comics for batch metadata update processing.
   *
   * @param ids the comic book ids
   * @throws ComicBookException if an id is invalid
   */
  @Transactional
  public void markComicBooksForBatchMetadataUpdate(final List<Long> ids) throws ComicBookException {
    for (final Long id : ids) {
      log.trace("Loading comic book: id={}", id);
      final ComicBook comicBook = this.doGetComic(id);
      log.trace("Setting batch metadata update flag");
      comicBook.setBatchMetadataUpdate(true);
      this.comicBookRepository.save(comicBook);
    }
  }

  /**
   * Returns the list of comics whose title or description include the provided search term.
   *
   * @param term the search time
   * @return the list of comics
   */
  public List<ComicBook> getComicBooksForSearchTerms(final String term) {
    log.info("Searching comic books: term={}", term);
    return this.comicBookRepository.findForSearchTerms(term);
  }

  /**
   * Retrieves comic books that have their edit details flag set.
   *
   * @param count the maximum records
   * @return the comic books
   */
  public List<ComicBook> findComicsWithEditDetails(final int count) {
    log.debug("Loading up to {} comics with edit flag set", count);
    return this.comicBookRepository.findComicsWithEditDetails(PageRequest.of(0, count));
  }
}

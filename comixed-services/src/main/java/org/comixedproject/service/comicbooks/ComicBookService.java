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
import java.util.*;
import java.util.stream.Collectors;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FileUtils;
import org.comixedproject.adaptors.comicbooks.ComicDataAdaptor;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.comicbooks.PublishComicRemovalAction;
import org.comixedproject.messaging.comicbooks.PublishComicUpdateAction;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.comicpages.Page;
import org.comixedproject.model.net.comicbooks.PageOrderEntry;
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
import org.springframework.util.StringUtils;

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
  @Autowired private ComicDataAdaptor comicDataAdaptor;
  @Autowired private PublishComicUpdateAction publishComicUpdateAction;
  @Autowired private PublishComicRemovalAction publishComicRemovalAction;
  @Autowired private ImprintService imprintService;

  /**
   * Retrieves a single comic by id. It is expected that this comic exists.
   *
   * @param id the comic id
   * @return the comic
   * @throws ComicException if the comic does not exist
   */
  public ComicBook getComic(final long id) throws ComicException {
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

  private ComicBook doGetComic(final long id, final boolean throwIfMissing) throws ComicException {
    final ComicBook result = this.comicBookRepository.getById(id);
    if (result == null && throwIfMissing) throw new ComicException("No such comic: id=" + id);
    return result;
  }

  private ComicBook doGetComic(final long id) throws ComicException {
    return this.doGetComic(id, true);
  }

  /**
   * Marks a comic for deletion but does not actually delete the comic.
   *
   * @param id the comic id
   * @return the updated comic
   * @throws ComicException if the comic id is invalid
   */
  @Transactional
  public ComicBook deleteComic(final long id) throws ComicException {
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
   * @throws ComicException if the id is invalid
   */
  @Transactional
  public ComicBook updateComic(final long id, final ComicBook update) throws ComicException {
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
   * @throws ComicException if the comic id is invalid
   */
  @Transactional
  public ComicBook undeleteComic(final long id) throws ComicException {
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
   * @throws ComicException if the comic id is invalid
   */
  @Transactional
  public ComicBook deleteMetadata(final long comicId) throws ComicException {
    log.debug("Loading comic: id={}", comicId);
    final var comic = this.doGetComic(comicId);
    log.trace("Clearing comic metadata");
    this.comicDataAdaptor.clear(comic);
    log.trace("Firing comic state event");
    this.comicStateHandler.fireEvent(comic, ComicEvent.metadataCleared);
    log.trace("Retrieving upated comic");
    return this.doGetComic(comicId);
  }

  /**
   * Retrieves inserted comics that have not been processed.
   *
   * @return the comics
   */
  public List<ComicBook> findInsertedComics() {
    log.trace("Loading newly inserted comics");
    return this.comicBookRepository.findForState(ComicState.ADDED);
  }

  /**
   * Retrieves the number of unprocessed comics that are waiting to have their contents loaded.
   *
   * @return the count
   */
  public long getUnprocessedComicsWithoutContentCount() {
    log.trace("Getting the number of unprocessed comics without content");
    return this.comicBookRepository.findUnprocessedComicsWithoutContent().size();
  }

  /**
   * Retrieves unprocessed comics that are waiting to have their contents loaded.
   *
   * @return the comics
   */
  public List<ComicBook> findUnprocessedComicsWithoutContent() {
    log.trace("Loading unprocessed comics that need to have their contents loaded");
    return this.comicBookRepository.findUnprocessedComicsWithoutContent();
  }

  /**
   * Returns the number of unprocessed comics that are waiting to have the blocked pages marked.
   *
   * @return the count
   */
  public long getUnprocessedComicsForMarkedPageBlockingCount() {
    log.trace("Getting unprocessed comics that need page blocking count");
    return this.comicBookRepository.findUnprocessedComicsForMarkedPageBlocking().size();
  }

  /**
   * Retrieves unprocessed comics that are waiting to have the blocked pages marked.
   *
   * @return the comics
   */
  public List<ComicBook> findUnprocessedComicsForMarkedPageBlocking() {
    log.trace("Loading unprocessed comics that need page blocking");
    return this.comicBookRepository.findUnprocessedComicsForMarkedPageBlocking();
  }

  /**
   * Returns the number of unprocessed comics that don't have file details loaded.
   *
   * @return the count
   */
  public long getUnprocessedComicsWithoutFileDetailsCount() {
    log.trace("Getting unprocessed comics without file details loaded count");
    return this.comicBookRepository.findUnprocessedComicsWithoutFileDetails().size();
  }

  /**
   * Retrieves unprocessed comics that don't have file details.
   *
   * @return the comics
   */
  public List<ComicBook> findUnprocessedComicsWithoutFileDetails() {
    log.trace("Loading unprocessed comics without file details loaded");
    return this.comicBookRepository.findUnprocessedComicsWithoutFileDetails();
  }

  /**
   * Returns the number of unprocessed comics that have had their contents processed.
   *
   * @return the count
   */
  public long getProcessedComicsCount() {
    log.trace("Getting count of unprocessed comics that are fully processed");
    return this.comicBookRepository.findProcessedComics().size();
  }

  /**
   * Retrieves unprocessed comics that have had their contents processed.
   *
   * @return the comics
   */
  public List<ComicBook> findProcessedComics() {
    log.trace("Loading unprocessed comics that are fully processed");
    return this.comicBookRepository.findProcessedComics();
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
          } catch (ComicException error) {
            log.error("Error preparing comic for rescan", error);
          }
        });
  }

  /**
   * Returns the number of records with the specified state.
   *
   * @param state the target state
   * @return the number of records
   */
  public int getCountForState(final ComicState state) {
    log.trace("Getting record count for state: {}", state);
    return this.comicBookRepository.findForState(state).size();
  }

  /**
   * Returns comics that are waiting to have their metadata updated.
   *
   * @return the list of comics
   */
  public List<ComicBook> findComicsWithMetadataToUpdate() {
    log.trace("Getting comics that are ready to have their metadata updated");
    return this.comicBookRepository.findComicsWithMetadataToUpdate();
  }

  /**
   * Finds all comics marked for deletion.
   *
   * @return the list of comics
   */
  public List<ComicBook> findComicsMarkedForDeletion() {
    log.trace("Finding all comics marked for deletion");
    return this.comicBookRepository.findComicsMarkedForDeletion();
  }

  /**
   * Finds all comics that are to be moved.
   *
   * @return the list of comics
   */
  public List<ComicBook> findComicsToBeMoved() {
    log.trace("Finding all comics to be moved");
    return this.comicBookRepository.findComicsToBeMoved();
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
   * @return the list of comics
   */
  public List<ComicBook> findComicsToRecreate() {
    log.trace("Finding all comics to be recreated");
    return this.comicBookRepository.findComicsToRecreate();
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
   * Returns all comics for a single publisher by name.
   *
   * @param name the publisher's name
   * @return the comics
   */
  public List<ComicBook> getAllForPublisher(final String name) {
    log.trace("Loading all comics for one publisher");
    return this.comicBookRepository.findAllByPublisher(name);
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
   * Returns all comics for a single series by name.
   *
   * @param name the series's name
   * @return the comics
   */
  public List<ComicBook> getAllForSeries(final String name) {
    log.trace("Loading all comics for one series");
    return this.comicBookRepository.findAllBySeries(name);
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
   * Returns all comics for a single character by name.
   *
   * @param name the character's name
   * @return the comics
   */
  public List<ComicBook> getAllForCharacter(final String name) {
    log.trace("Loading all comics for one character");
    return this.comicBookRepository.findAllByCharacters(name);
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
   * Returns all comics for a single team by name.
   *
   * @param name the team's name
   * @return the comics
   */
  public List<ComicBook> getAllForTeam(final String name) {
    log.trace("Loading all comics for one team");
    return this.comicBookRepository.findAllByTeams(name);
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
   * Returns all comics for a single location by name.
   *
   * @param name the location's name
   * @return the comics
   */
  public List<ComicBook> getAllForLocation(final String name) {
    log.trace("Loading all comics for one location");
    return this.comicBookRepository.findAllByLocations(name);
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
   * Returns all comics for a single publisher by name.
   *
   * @param name the publisher's name
   * @return the comics
   */
  public List<ComicBook> getAllForStory(final String name) {
    log.trace("Loading all comics in one story");
    return this.comicBookRepository.findAllByStories(name);
  }

  public List<String> getAllPublishersForStory(final String name) {
    log.trace("Returning all publishers for a given story");
    return this.comicBookRepository.findDistinctPublishersForStory(name);
  }

  /**
   * Returns comics marked for purging.
   *
   * @return the comicms
   */
  public List<ComicBook> findComicsMarkedForPurging() {
    log.trace("Loading comics marked for purging");
    return this.comicBookRepository.findComicsMarkedForPurging();
  }

  /**
   * Saves the new order for the pages of a comic.
   *
   * @param comicId the comic id
   * @param entryList the page order entries
   * @throws ComicException if the id is invalid, or there is a problem with the entry list
   */
  public void savePageOrder(final long comicId, final List<PageOrderEntry> entryList)
      throws ComicException {
    log.trace("Loading comicBook");
    final ComicBook comicBook = this.doGetComic(comicId);
    log.trace("Sorting new page list");
    entryList.sort(Comparator.comparingInt(PageOrderEntry::getPosition));
    log.trace("Checking for holes in order");
    for (int index = 0; index < entryList.size(); index++) {
      final PageOrderEntry entry = entryList.get(index);
      if (entry.getPosition() != index)
        throw new ComicException(
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
        throw new ComicException("No such order entry: filename=" + page.getFilename());
      log.trace("Applying position");
      page.setPageNumber(position.get().getPosition());
    }

    log.trace("Firing event: details updated");
    this.comicStateHandler.fireEvent(comicBook, ComicEvent.detailsUpdated);
  }

  /**
   * Updates the details for a set of comics. If any value is null then it is not updated.
   *
   * @param comicIds the comics' ids
   * @param publisher the publisher
   * @param series the series
   * @param issueNumber the issue number
   * @param imprint the imprint
   * @throws ComicException if comic id is invalid
   */
  public void updateMultipleComics(
      final List<Long> comicIds,
      final String publisher,
      final String series,
      final String volume,
      final String issueNumber,
      final String imprint)
      throws ComicException {
    for (long id : comicIds) {
      log.trace(
          "Updating multiple comics: publisher={} series={} volume={} issue number={} imprint={}",
          publisher,
          series,
          issueNumber,
          imprint);
      log.trace("Loading comicBook: id={}", id);
      final ComicBook comicBook = this.doGetComic(id);

      if (StringUtils.hasLength(publisher)) {
        comicBook.setPublisher(publisher);
      }
      if (StringUtils.hasLength(series)) {
        comicBook.setSeries(series);
      }
      if (StringUtils.hasLength(volume)) {
        comicBook.setVolume(volume);
      }
      if (StringUtils.hasLength(issueNumber)) {
        comicBook.setIssueNumber(issueNumber);
      }
      if (StringUtils.hasLength(imprint)) {
        comicBook.setImprint(imprint);
      }

      log.trace("Firing event: comicBook details changed");
      this.comicStateHandler.fireEvent(comicBook, ComicEvent.detailsUpdated);
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
    return this.comicBookRepository.findAll().stream()
        .filter(comic -> comic.getStoreDate() != null)
        .map(
            comic -> {
              calendar.setTime(comic.getStoreDate());
              return calendar.get(Calendar.YEAR);
            })
        .distinct()
        .collect(Collectors.toList());
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
    return this.comicBookRepository.findAll().stream()
        .filter(comic -> comic.getStoreDate() != null)
        .map(
            comic -> {
              calendar.setTime(comic.getStoreDate());
              return calendar.get(Calendar.WEEK_OF_YEAR);
            })
        .distinct()
        .collect(Collectors.toList());
  }

  public List<ComicBook> getComicsForYearAndWeek(final Integer year, final Integer week) {
    final GregorianCalendar calendar = new GregorianCalendar();
    calendar.setTimeZone(TimeZone.getTimeZone("UTC"));
    return this.comicBookRepository.findAll().stream()
        .filter(comic -> comic.getStoreDate() != null)
        .filter(
            comic -> {
              calendar.setTime(comic.getStoreDate());
              return calendar.get(Calendar.YEAR) == year
                  && calendar.get(Calendar.WEEK_OF_YEAR) == week;
            })
        .collect(Collectors.toList());
  }
}

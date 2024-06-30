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

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.comixedproject.adaptors.comicbooks.ComicBookMetadataAdaptor;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.model.collections.Publisher;
import org.comixedproject.model.collections.Series;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.model.net.comicbooks.PageOrderEntry;
import org.comixedproject.model.net.library.PublisherAndYearSegment;
import org.comixedproject.model.net.library.RemoteLibrarySegmentState;
import org.comixedproject.repositories.comicbooks.ComicBookRepository;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Limit;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>ComicBookService</code> provides business rules for instances of {@link ComicBook}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
@CacheConfig(cacheNames = {ComicBookService.COMICBOOK_CACHE})
public class ComicBookService {
  public static final String COMICBOOK_CACHE = "comicBooks";

  @Autowired private ComicStateHandler comicStateHandler;
  @Autowired private ComicBookRepository comicBookRepository;
  @Autowired private ComicBookMetadataAdaptor comicBookMetadataAdaptor;
  @Autowired private ImprintService imprintService;
  @Autowired private FileTypeAdaptor fileTypeAdaptor;

  /**
   * Retrieves a single comic by id. It is expected that this comic exists.
   *
   * @param id the comic id
   * @return the comic
   * @throws ComicBookException if the comic does not exist
   */
  @Transactional
  @Cacheable(key = "#id")
  public ComicBook getComic(final long id) throws ComicBookException {
    log.debug("Getting comic: id={}", id);

    final var result = this.doGetComic(id);
    result.setNextIssueId(
        this.comicBookRepository.findNextComicBookIdInSeries(
            result.getComicDetail().getSeries(),
            result.getComicDetail().getVolume(),
            result.getComicDetail().getIssueNumber(),
            result.getComicDetail().getCoverDate(),
            Limit.of(1)));
    result.setPreviousIssueId(
        this.comicBookRepository.findPreviousComicBookIdInSeries(
            result.getComicDetail().getSeries(),
            result.getComicDetail().getVolume(),
            result.getComicDetail().getIssueNumber(),
            result.getComicDetail().getCoverDate(),
            Limit.of(1)));

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
  @CacheEvict(key = "#result.id")
  public ComicBook deleteComicBook(final long id) throws ComicBookException {
    log.debug("Marking comic for deletion: id={}", id);
    final var comic = this.doGetComic(id);
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
  @CachePut(key = "#result.id")
  public ComicBook updateComic(final long id, final ComicBook update) throws ComicBookException {
    log.debug("Updating comic: id={}", id);
    final var comic = this.doGetComic(id);

    log.trace("Updating the comic fields");

    comic.getComicDetail().setComicType(update.getComicDetail().getComicType());
    comic.getComicDetail().setPublisher(update.getComicDetail().getPublisher());
    comic.getComicDetail().setSeries(update.getComicDetail().getSeries());
    comic.getComicDetail().setVolume(update.getComicDetail().getVolume());
    comic.getComicDetail().setIssueNumber(update.getComicDetail().getIssueNumber());
    comic.getComicDetail().setImprint(update.getComicDetail().getImprint());
    comic.getComicDetail().setSortName(update.getComicDetail().getSortName());
    comic.getComicDetail().setTitle(update.getComicDetail().getTitle());
    comic.getComicDetail().setDescription(update.getComicDetail().getDescription());
    comic.getComicDetail().setCoverDate(update.getComicDetail().getCoverDate());
    comic.getComicDetail().setStoreDate(update.getComicDetail().getStoreDate());
    comic.getComicDetail().setNotes(update.getComicDetail().getNotes());

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
  @CachePut(key = "#result.id")
  public ComicBook save(final ComicBook comicBook) {
    log.debug("Saving comicBook: filename={}", comicBook.getComicDetail().getFilename());

    this.imprintService.update(comicBook);

    return this.comicBookRepository.saveAndFlush(comicBook);
  }

  /**
   * Retrieves the full content of the comicBook file.
   *
   * @param comicBookId the comicBook
   * @return the comicBook content
   */
  @Transactional
  public DownloadDocument getComicContent(final long comicBookId) throws ComicBookException {
    final ComicBook comicBook = this.doGetComic(comicBookId);
    final String filename = comicBook.getComicDetail().getFilename();
    final String baseFilenaem = FilenameUtils.getName(filename);

    try {
      final byte[] content = FileUtils.readFileToByteArray(new File(filename));
      return new DownloadDocument(
          baseFilenaem,
          this.fileTypeAdaptor.getMimeTypeFor(new ByteArrayInputStream(content)),
          content);
    } catch (IOException error) {
      throw new ComicBookException("Failed to load comic book file", error);
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
  @CachePut(key = "#result.id")
  public ComicBook undeleteComicBook(final long id) throws ComicBookException {
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
  public void deleteComicBook(final ComicBook comicBook) {
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
  @Transactional
  @CachePut(key = "#result.id")
  public ComicBook findByFilename(final String filename) {
    return this.comicBookRepository.findByFilename(filename);
  }

  /**
   * Clears all metadata from the given comic.
   *
   * @param comicId the comic id
   * @return the updated comic
   * @throws ComicBookException if the comic id is invalid
   */
  @Transactional
  @CachePut(key = "#result.id")
  public ComicBook deleteMetadata(final long comicId) throws ComicBookException {
    log.debug("Loading comic: id={}", comicId);
    final var comic = this.doGetComic(comicId);
    log.trace("Clearing comic metadata");
    this.comicBookMetadataAdaptor.clear(comic);
    log.trace("Firing comic state event");
    this.comicStateHandler.fireEvent(comic, ComicEvent.metadataCleared);
    log.trace("Retrieving updated comic");
    return this.doGetComic(comicId);
  }

  /**
   * Retrieves the number of unprocessed comics that are waiting to have their contents loaded.
   *
   * @return the count
   */
  @Transactional
  public long getComicsWithoutContentCount() {
    log.trace("Getting the number of unprocessed comics without content");
    return this.comicBookRepository.findUnprocessedComicsWithoutContentCount();
  }

  /**
   * Retrieves unprocessed comics that have the create metadata flag set.
   *
   * @param chunkSize the number of comics to return
   * @return the comics
   */
  public List<ComicBook> findComicsWithCreateMetadataFlagSet(final int chunkSize) {
    log.trace("Loading unprocessed comics that need to have their contents loaded");
    return this.comicBookRepository.findUnprocessedComicsWithCreateMetadataFlagSet(
        PageRequest.of(0, chunkSize));
  }

  /**
   * Retrieves unprocessed comics that are waiting to have their contents loaded.
   *
   * @return the comics
   */
  public List<ComicBook> findComicsWithContentToLoad(final int batchSize) {
    return this.comicBookRepository.findComicsWithContentToLoad(PageRequest.of(0, batchSize));
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
   * Prepares a set of comic books for rescanning.
   *
   * @param ids the comic ids
   */
  public void prepareForRescan(final List<Long> ids) {
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
    return this.comicBookRepository.findForState(ComicState.DELETED, PageRequest.of(0, count));
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
   * Finds the number of comics that are to be moved.
   *
   * @return the record count
   */
  public long findComicsToBeMovedCount() {
    log.trace("Finding all comics to be moved");
    return this.comicBookRepository.findComicsToBeMovedCount();
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
  public void deleteComicBooksById(final List<Long> ids) {
    ids.forEach(
        id -> {
          final ComicBook comicBook;
          try {
            comicBook = this.doGetComic(id);
            if (comicBook != null) {
              log.trace("Marking comicBook for deletion: id={}", comicBook.getId());
              this.comicStateHandler.fireEvent(comicBook, ComicEvent.deleteComic);
            }
          } catch (ComicBookException error) {
            log.error("Failed to load comic", error);
          }
        });
  }

  /**
   * Unmarks comics for deletion.
   *
   * @param ids the comic ids
   */
  public void undeleteComicBooksById(final List<Long> ids) {
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
  @CachePut(key = "#result.id")
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
   * Returns the list of all series names.
   *
   * @return the list of names.
   */
  public List<String> getAllSeries() {
    log.trace("Loading all series names");
    return this.comicBookRepository.findDistinctSeries();
  }

  public List<Series> getAllSeriesAndVolumes() {
    log.trace("Loading all series and volumes");
    return this.comicBookRepository.getAllSeriesAndVolumes();
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
      final ComicPage page = comicBook.getPages().get(index);
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
   * Returns the total number of comics in the library.
   *
   * @return the comic count
   */
  @Transactional
  public long getComicBookCount() {
    log.trace("Getting total comics count");
    return this.comicBookRepository.count();
  }

  /**
   * Returns the total number of comics marked for deletion.
   *
   * @return the deleted comic count
   */
  @Transactional
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
  @Transactional
  public List<RemoteLibrarySegmentState> getPublishersState() {
    log.trace("Getting the publishers state");
    return this.comicBookRepository.getPublishersState();
  }

  /**
   * Returns the library state for series.
   *
   * @return the series state
   */
  @Transactional
  public List<RemoteLibrarySegmentState> getSeriesState() {
    log.trace("Getting the series state");
    return this.comicBookRepository.getSeriesState();
  }

  /**
   * Returns the library state for characters.
   *
   * @return the characters state
   */
  @Transactional
  public List<RemoteLibrarySegmentState> getCharactersState() {
    log.trace("Getting the characters state");
    return this.comicBookRepository.getCharactersState();
  }

  /**
   * Returns the library state for teams.
   *
   * @return the teams state
   */
  @Transactional
  public List<RemoteLibrarySegmentState> getTeamsState() {
    log.trace("Getting the teams state");
    return this.comicBookRepository.getTeamsState();
  }

  /**
   * Returns the library state for locations.
   *
   * @return the locations state
   */
  @Transactional
  public List<RemoteLibrarySegmentState> getLocationsState() {
    log.trace("Getting the locations state");
    return this.comicBookRepository.getLocationsState();
  }

  /**
   * Returns the library state for stories.
   *
   * @return the stories state
   */
  @Transactional
  public List<RemoteLibrarySegmentState> getStoriesState() {
    log.trace("Getting the stories state");
    return this.comicBookRepository.getStoriesState();
  }

  /**
   * Returns the library state for comic book states.
   *
   * @return the comic book states
   */
  @Transactional
  public List<RemoteLibrarySegmentState> getComicBooksState() {
    log.trace("Getting the comics state");
    return this.comicBookRepository.getComicBooksState();
  }

  /**
   * Returns the number of comics per publisher and year.
   *
   * @return the statistics
   */
  @Transactional
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
  public List<ComicDetail> getComicBooksForSearchTerms(final String term) {
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

  /**
   * Returns the list of all publishers in the library, along with the count of series for each.
   *
   * @return the publisher list
   */
  public List<Publisher> getAllPublishersWithSeries() {
    log.debug("Getting all publishers with their series counts");
    return this.comicBookRepository.getAllPublishersWithSeriesCount();
  }

  public List<Series> getPublisherDetail(final String name) {
    log.debug("Getting detail for one publisher: name={}", name);
    return this.comicBookRepository.getAllSeriesAndVolumesForPublisher(name);
  }

  /**
   * Returns the list of all comics with duplicate pages.
   *
   * @return the list of comics
   */
  @Transactional
  public List<ComicDetail> findDuplicateComics() {
    log.debug("Finding all comics with duplicate pages");
    return this.comicBookRepository.getAllWithDuplicatePages();
  }

  /**
   * Returns the number of unscraped comics.
   *
   * @return the count
   */
  @Transactional
  public long getUnscrapedComicCount() {
    log.debug("Getting the count of unprocessed comics");
    return this.comicBookRepository.getUnscrapedComicCount();
  }

  /**
   * Returns a set of records without an associated {@link ComicDetail} record.
   *
   * @param chunkSize the batch chunk size
   * @return the records
   */
  public List<ComicBook> getComicBooksWithoutDetails(final int chunkSize) {
    log.debug("Loading ComicBook records without a ComicDetail: chunk size={}", chunkSize);
    return this.comicBookRepository.getComicBooksWithoutDetails(chunkSize);
  }

  /**
   * Marks comics for organization. Uses a set of ids to determine which comics to mark.
   *
   * @param ids the comic ids
   */
  @Transactional
  public void prepareForOrganization(final List<Long> ids) {
    this.comicBookRepository.markForOrganizationById(ids);
  }

  @Transactional
  public void prepareAllForOrganization() {
    this.comicBookRepository.markAllForOrganization();
  }

  /**
   * Marks the specified comics for recreation.
   *
   * @param ids the comic ids
   */
  @Transactional
  public void prepareForRecreation(final List<Long> ids) {
    this.comicBookRepository.markForRecreationById(ids);
  }

  /**
   * Marks a set of comic books for metadata updating.
   *
   * @param ids the comic book ids
   */
  @Transactional
  public void prepareForMetadataUpdate(final List<Long> ids) {
    this.comicBookRepository.prepareForMetadataUpdate(ids);
  }

  @Transactional
  public List<ComicBook> loadByComicDetailId(final List comicDetailIds) {
    return this.comicBookRepository.loadByComicDetailId(comicDetailIds);
  }

  /**
   * Returns the number of unprocessed comic books.
   *
   * @return the comic books
   */
  @Transactional
  public long getUnprocessedComicBookCount() {
    log.debug("Loading unprocessed comic books");
    return this.comicBookRepository.getUnprocessedComicBookCount();
  }

  /**
   * Returns all ids from the database.
   *
   * @return the ids
   */
  @Transactional
  public List<Long> getAllIds() {
    log.debug("Getting the list of all comic book ids");
    return this.comicBookRepository.findAll().stream()
        .map(ComicBook::getId)
        .collect(Collectors.toList());
  }

  /**
   * Returns the number of comic books to have their metadata updated.
   *
   * @return the count
   */
  @Transactional
  public long getUpdateMetadataCount() {
    log.debug("Getting the update metadata count");
    return this.comicBookRepository.getUpdateMetadataCount();
  }

  @Transactional
  public long getRecreatingCount() {
    log.debug("Getting the recreating count");
    return this.comicBookRepository.getRecreatingCount();
  }

  @Transactional
  public boolean filenameFound(final String filename) {
    return this.comicBookRepository.filenameFound(filename);
  }
}

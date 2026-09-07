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

import java.util.*;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.comicbooks.ComicFileAdaptor;
import org.comixedproject.model.batch.OrganizingLibraryEvent;
import org.comixedproject.model.batch.UpdateMetadataEvent;
import org.comixedproject.model.collections.SeriesDetail;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.net.library.PublisherAndYearSegment;
import org.comixedproject.model.net.library.RemoteLibrarySegmentState;
import org.comixedproject.repositories.comicbooks.ComicBookRepository;
import org.comixedproject.repositories.comicbooks.ComicDetailRepository;
import org.comixedproject.repositories.comicbooks.ComicTagRepository;
import org.comixedproject.state.comicbooks.ComicStateAdaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Limit;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * <code>ComicBookService</code> provides business rules for instances of {@link ComicBook}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class ComicBookService {
  @Autowired private ComicStateAdaptor comicStateAdaptor;
  @Autowired private ComicBookRepository comicBookRepository;
  @Autowired private ComicDetailRepository comicDetailRepository;
  @Autowired private ComicFileAdaptor comicFileAdaptor;
  @Autowired private ImprintService imprintService;
  @Autowired private ApplicationEventPublisher applicationEventPublisher;
  @Autowired private ComicTagRepository comicTagRepository;

  /**
   * Looks for the all comics that matches the given criteria.
   *
   * @param publisher the publisher
   * @param series the series
   * @param volume the volume
   * @param issueNumber the issue number
   * @return the list of comics
   */
  @Transactional
  public List<ComicBook> findComic(
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
   * Saves a new comicBook.
   *
   * @param comicBook the comicBook
   * @return the saved comicBook
   */
  @Transactional
  public ComicBook save(final ComicBook comicBook) {
    log.debug("Saving comicBook: filename={}", comicBook.getComicDetail().getFilename());

    log.trace("Updating the imprint");
    this.imprintService.update(comicBook);

    final ComicDetail detail = comicBook.getComicDetail();

    log.trace("Standardizing the comic filename");
    detail.setFilename(comicFileAdaptor.standardizeFilename(detail.getFilename()));

    log.trace("Updating the page numbers");
    comicBook.updatePageNumbers();

    log.trace("Setting last modified date");
    detail.setLastModifiedDate(new Date());

    return this.comicBookRepository.saveAndFlush(comicBook);
  }

  /**
   * Retrieves a single comic by id. It is expected that this comic exists.
   *
   * @param id the comic id
   * @return the comic
   * @throws ComicBookException if the comic does not exist
   */
  @Transactional
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

    log.debug("Returning comic: id={}", result.getComicBookId());
    return result;
  }

  /**
   * Retrieves the number of unprocessed comics that are waiting to have their contents loaded.
   *
   * @return the count
   */
  @Transactional
  public long getComicsWithoutContentCount() {
    log.trace("Getting the number of unprocessed comics without content");
    return this.comicDetailRepository.findUnprocessedComicsWithoutContentCount();
  }

  /**
   * Retrieves unprocessed comics that have the create metadata flag set.
   *
   * @param chunkSize the number of comics to return
   * @return the comics
   */
  public List<ComicBook> findComicsWithCreateMetadataFlagSet(final int chunkSize) {
    log.trace("Loading unprocessed comics that need to have their contents loaded");
    return this.comicDetailRepository.findUnprocessedComicsWithCreateMetadataFlagSet(
        PageRequest.of(0, chunkSize));
  }

  /**
   * Retrieves unprocessed comics that are waiting to have their contents loaded.
   *
   * @return the comics
   */
  public List<ComicBook> findComicsWithContentToLoad(final int batchSize) {
    return this.comicDetailRepository.findComicsWithContentToLoad(PageRequest.of(0, batchSize));
  }

  /**
   * Returns comics that are waiting to have their metadata updated.
   *
   * @param count the number of comics to return
   * @return the list of comics
   */
  public List<ComicBook> findComicsWithMetadataToUpdate(final int count) {
    log.trace("Getting comics that are ready to have their metadata updated");
    return this.comicDetailRepository.findComicsWithMetadataToUpdate(PageRequest.of(0, count));
  }

  public List<ComicBook> findComicsForBatchMetadataUpdate(final int count) {
    log.trace("Getting comics that are flagged for batch metadata update");
    return this.comicDetailRepository.findComicsForBatchMetadataUpdate(PageRequest.of(0, count));
  }

  /**
   * Returns the number of comics enqueued for batch metadata update.
   *
   * @return the comic count
   */
  public long findComicsForBatchMetadataUpdateCount() {
    log.trace("Getting number of comics that are flagged for batch metadata update");
    return this.comicDetailRepository.findComicsForBatchMetadataUpdateCount();
  }

  /**
   * Returns comic books marked for purging that are in the deleted state.
   *
   * @param count the number of comics to return
   * @return the comic book list
   */
  @Transactional
  public List<ComicBook> findComicBooksToBePurged(final int count) {
    return this.comicDetailRepository.findComicsMarkedForPurging(PageRequest.of(0, count));
  }

  /**
   * Returns the number of comics that are marked for recreation.
   *
   * @return the comic book count
   */
  @Transactional
  public long findComicsToRecreateCount() {
    log.trace("Finding the count of comics to be recreated");
    return this.comicBookRepository.findComicsToBeRecreatedCount();
  }

  /**
   * Returns the number of comics that are marked for recreation.
   *
   * @return the comic book count
   */
  @Transactional
  public long findComicsToPurgeCount() {
    log.trace("Finding the count of comics to be recreated");
    return this.comicDetailRepository.findComicsToPurgeCount();
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
   * Returns comics marked for purging.
   *
   * @param count the number of comics to return
   * @return the comics
   */
  public List<ComicBook> findComicsMarkedForPurging(final int count) {
    log.trace("Loading comics marked for purging");
    return this.comicDetailRepository.findComicsMarkedForPurging(PageRequest.of(0, count));
  }

  public List<String> getAllPublishersForStory(final String name) {
    log.trace("Returning all publishers for a given story");
    return this.comicBookRepository.findDistinctPublishersForStory(name);
  }

  /**
   * Returns the total number of comics in the library.
   *
   * @return the comic count
   */
  @Transactional(isolation = Isolation.READ_UNCOMMITTED)
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
   * Returns the library state for archive types.
   *
   * @return the comic book states
   */
  @Transactional
  public List<RemoteLibrarySegmentState> getComicBookArchiveTypes() {
    log.trace("Getting the archive types state");
    return this.comicBookRepository.getComicBookArchiveTypes();
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
    this.applicationEventPublisher.publishEvent(UpdateMetadataEvent.instance);
  }

  /**
   * Marks comics for organization. Uses a set of ids to determine which comics to mark.
   *
   * @param ids the comic ids
   */
  @Transactional
  public void prepareForOrganization(final List<Long> ids) {
    log.trace("Marking comics for organization");
    this.comicDetailRepository.markForOrganizationById(ids);
    this.applicationEventPublisher.publishEvent(OrganizingLibraryEvent.instance);
  }

  @Transactional
  public void prepareAllForOrganization() {
    log.trace("Marking all comics for organization");
    this.comicDetailRepository.markAllForOrganization();
    this.applicationEventPublisher.publishEvent(OrganizingLibraryEvent.instance);
  }

  /** Marks all comics in the deleted state for purging. */
  @Transactional
  public void prepareComicBooksForDeleting() {
    log.trace("Marking all deleted comics for purging");
    this.comicDetailRepository.prepareComicBooksForDeleting();
  }

  /**
   * Deletes the specified comicBook from the library.
   *
   * @param comicBook the comicBook
   */
  @Transactional
  public void deleteComicBook(final ComicBook comicBook) {
    log.trace("Removing read references");
    comicBook.getComicDetail().getReadByUserIds().clear();
    this.comicTagRepository.deleteAllByComicDetail(comicBook.getComicDetail());
    log.debug("Deleting comicBook: id={}", comicBook.getComicBookId());
    this.comicBookRepository.delete(comicBook);
  }

  private ComicBook doGetComic(final long comicBookId) throws ComicBookException {
    return this.doGetComic(comicBookId, true);
  }

  private ComicBook doGetComic(final long id, final boolean throwIfMissing)
      throws ComicBookException {
    final ComicBook result = this.comicBookRepository.getReferenceById(id);
    if (Objects.isNull(result) && throwIfMissing)
      throw new ComicBookException("No such comic: id=" + id);
    return result;
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

  private Sort doCreatePublisherSort(final String sortBy, final String sortDirection) {
    if (!StringUtils.hasLength(sortBy) || !StringUtils.hasLength(sortDirection)) {
      return Sort.unsorted();
    }

    String fieldName;
    switch (sortBy) {
      case "series-name" -> fieldName = "id.series";
      case "series-volume" -> fieldName = "id.volume";
      case "in-library" -> fieldName = "inLibrary";
      case "total-issues" -> fieldName = "totalIssues";
      default -> fieldName = "comicDetail.series";
    }

    Sort.Direction direction = Sort.Direction.DESC;
    if (sortDirection.equals("asc")) {
      direction = Sort.Direction.ASC;
    }
    return Sort.by(direction, fieldName);
  }

  /**
   * Returns a set of series details for the given publisher.
   *
   * @param name the publisher
   * @param pageIndex the page index
   * @param pageSize the page size
   * @param sortBy the sort field
   * @param sortDirection the sort direction
   * @return the series details
   */
  @Transactional(readOnly = true)
  public List<SeriesDetail> getPublisherDetail(
      final String name,
      final int pageIndex,
      final int pageSize,
      final String sortBy,
      final String sortDirection) {
    log.debug("Getting detail for one publisher: name={}", name);
    return this.comicBookRepository.getAllSeriesAndVolumesForPublisher(
        name, PageRequest.of(pageIndex, pageSize, doCreatePublisherSort(sortBy, sortDirection)));
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
   * Returns the number of unprocessed comic books.
   *
   * @return the comic books
   */
  @Transactional
  public long getUnprocessedComicBookCount() {
    log.debug("Loading unprocessed comic books");
    return this.comicDetailRepository.getUnprocessedComicBookCount();
  }

  /**
   * Returns the number of comic books to have their metadata updated.
   *
   * @return the count
   */
  @Transactional
  public long getUpdateMetadataCount() {
    log.debug("Getting the update metadata count");
    return this.comicDetailRepository.getUpdateMetadataCount();
  }

  /**
   * Returns a subset of comic filenames based on whether they were previously marked as missing.
   *
   * @param missing the missing flag
   * @return the filenames
   */
  @Transactional
  public Set<String> getAllComicDetails(final boolean missing) {
    return this.comicBookRepository.getComicFilenames(missing);
  }

  /**
   * Returns the number of comic series for a publisher.
   *
   * @param name the publisher's name
   * @return the number of series
   */
  @Transactional
  public long getSeriesCountForPublisher(final String name) {
    log.debug("Loading the number of series for publisher={}", name);
    return this.comicDetailRepository.getSeriesCountForPublisher(name);
  }

  /**
   * Loads a set of comic books containing pages that do not have a page hash.
   *
   * @param size the record count
   * @return the records
   */
  @Transactional
  public List<ComicBook> findComicsWithUnhashedPages(final int size) {
    log.debug("Loading pages without a hash");
    return this.comicBookRepository.findComicsWithUnhashedPages(PageRequest.of(0, size));
  }

  /**
   * Returns the number of comic books with unhashed pages.
   *
   * @return the comic count
   */
  @Transactional
  public long findComicsWithUnhashedPagesCount() {
    return this.comicBookRepository.findComicsWithUnhashedPagesCount();
  }

  /**
   * Returns if there are any comic books with unhashed pages.
   *
   * @return true if there are comic books with unhashed pages
   */
  @Transactional
  public boolean hasComicsWithUnhashedPages() {
    return this.comicBookRepository.findComicsWithUnhashedPagesCount() > 0L;
  }

  @Transactional(readOnly = true)
  public long getComicDetailIdForComicBook(final long comicBookId) {
    return this.comicDetailRepository.getComicDetailIdForComicBook(comicBookId);
  }
}

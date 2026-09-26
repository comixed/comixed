/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project.
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

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.comicbooks.ComicFileAdaptor;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.batch.OrganizingLibraryEvent;
import org.comixedproject.model.batch.RecreateComicFilesEvent;
import org.comixedproject.model.batch.UpdateMetadataEvent;
import org.comixedproject.model.collections.CollectionEntry;
import org.comixedproject.model.collections.SeriesDetail;
import org.comixedproject.model.comicbooks.*;
import org.comixedproject.model.net.library.PublisherAndYearSegment;
import org.comixedproject.model.net.library.RemoteLibrarySegmentState;
import org.comixedproject.repositories.comicbooks.ComicRepository;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateAdaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Limit;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * <code>ComicService</code> provides methods for working with instances of {@link Comic}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class ComicService {
  @Autowired private ComicRepository comicRepository;
  @Autowired private ComicStateAdaptor comicStateAdaptor;
  @Autowired private ComicFileAdaptor comicFileAdaptor;
  @Autowired private ApplicationEventPublisher applicationEventPublisher;

  SimpleDateFormat coverDateFormat = new SimpleDateFormat("yyyy-MM-dd");

  // create

  @Transactional
  public Comic save(final Comic comic) {
    if (Objects.nonNull(comic.getComicId())) {
      log.debug("Saving comic: filename={}", comic.getFilename());
    } else {
      log.debug("Updating comic: id={}", comic.getComicId());
    }
    return this.comicRepository.saveAndFlush(comic);
  }

  // read

  /**
   * Retrieves a single comic by id. It is expected that this comic exists.
   *
   * @param id the comic id
   * @return the comic
   * @throws ComicException if the comic does not exist
   */
  @Transactional(readOnly = true)
  public Comic getComic(final long id) throws ComicException {
    log.debug("Getting comic: id={}", id);

    final var result = this.comicRepository.getReferenceById(id);
    result.setNextIssueId(
        this.comicRepository.findNextComicBookIdInSeries(
            result.getSeries(),
            result.getVolume(),
            result.getIssueNumber(),
            result.getCoverDate(),
            Limit.of(1)));
    result.setPreviousIssueId(
        this.comicRepository.findPreviousComicBookIdInSeries(
            result.getSeries(),
            result.getVolume(),
            result.getIssueNumber(),
            result.getCoverDate(),
            Limit.of(1)));

    log.debug("Returning comic: id={}", result.getComicId());
    return result;
  }

  @Transactional
  public boolean filenameFound(final String filename) {
    final String standardizedFilename = this.comicFileAdaptor.standardizeFilename(filename);
    if (this.comicFileAdaptor.isCaseSensitiveFilenames()) {
      return this.comicRepository.existsByFilename(standardizedFilename);
    } else {
      return this.comicRepository.existsByFilenameIgnoreCase(standardizedFilename);
    }
  }

  /**
   * Returns the set of all cover dates. Filters out comics read by the user if the flag is set.
   *
   * @param email the user's email
   * @param unread the unread flag
   * @return the entries
   */
  @Transactional
  public Set<String> getAllCoverDates(final String email, final boolean unread) {
    if (unread) {
      log.debug("Loading all cover dates with unread comics: email={}", email);
      return this.comicRepository.getAllUnreadCoverDates(email).stream()
          .map(entry -> this.coverDateFormat.format(entry))
          .collect(Collectors.toSet());
    } else {
      log.debug("Loading all cover dates");
      return this.comicRepository.getAllCoverDates().stream()
          .map(entry -> this.coverDateFormat.format(entry))
          .collect(Collectors.toSet());
    }
  }

  /**
   * Returns the set of all cover dates. Filters out comics read by the user if the flag is set.
   *
   * @param coverDate the cover date
   * @param email the user's email
   * @param unread the unread flag
   * @return the entries
   */
  @Transactional
  public List<Comic> getAllComicsForCoverDate(
      final String coverDate, final String email, final boolean unread) {
    try {
      if (unread) {
        log.debug("Loading all cover dates with unread comics: email={}", email);
        return this.comicRepository.getAllUnreadComicsForCoverDate(
            this.coverDateFormat.parse(coverDate), email);
      } else {
        log.debug("Loading all cover dates");
        return this.comicRepository.getAllComicsForCoverDate(this.coverDateFormat.parse(coverDate));
      }
    } catch (ParseException error) {
      log.error("Failed to parse cover date", error);
      return Collections.emptyList();
    }
  }

  /**
   * Returns the set of all publishers. Filters out comics read by the user if the flag is set.
   *
   * @param email the user's email
   * @param unread the unread flag
   * @return the entries
   */
  @Transactional
  public Set<String> getAllPublishers(final String email, final boolean unread) {
    if (unread) {
      log.debug("Loading all publishers with unread comics: email={}", email);
      return this.comicRepository.getAllUnreadPublishers(email);
    } else {
      log.debug("Loading all publishers");
      return this.comicRepository.getAllPublishers();
    }
  }

  /**
   * Returns the set of series for the given publisher. Filters out comics read by the user if the
   * flag is set.
   *
   * @param publisher the publisher
   * @param email the user's email
   * @param unread the unread flag
   * @return the entries
   */
  @Transactional
  public Set<String> getAllSeriesForPublisher(
      final String publisher, final String email, final boolean unread) {
    if (unread) {
      log.debug(
          "Loading all series for publisher with unread comics: publisher={} email={}",
          publisher,
          email);
      return this.comicRepository.getAllUnreadSeriesForPublisher(publisher, email);
    } else {
      log.debug("Loading all series for publisher: publisher={}", publisher);
      return this.comicRepository.getAllSeriesForPublisher(publisher);
    }
  }

  /**
   * Returns the set of volumes for the given publisher and series. Filters out comics read by the
   * user if the flag is set.
   *
   * @param publisher the publisher
   * @param series the series
   * @param email the user's email
   * @param unread the unread flag
   * @return the entries
   */
  @Transactional
  public Set<String> getAllVolumesForPublisherAndSeries(
      final String publisher, final String series, final String email, final boolean unread) {
    if (unread) {
      log.debug(
          "Loading all volumes for publisher and series with unread comics: publisher={} series={} email={}",
          publisher,
          series,
          email);
      return this.comicRepository.getAllUnreadVolumesForPublisherAndSeries(
          publisher, series, email);
    } else {
      log.debug(
          "LOading all volumes for publisher and series: publisher={} series={} email={}",
          publisher,
          series);
      return this.comicRepository.getAllVolumesForPublisherAndSeries(publisher, series);
    }
  }

  /**
   * Returns the list of all series.
   *
   * @return the entries
   */
  @Transactional
  public Set<String> getAllSeries() {
    log.debug("Loading all series");
    return this.comicRepository.getAllSeries();
  }

  /**
   * Returns the set of series names. Filters out comics read by the user if the flag is set.
   *
   * @param email the user's email
   * @param unread the unread flag
   * @return the entries
   */
  @Transactional
  public Set<String> getAllSeries(final String email, final boolean unread) {
    if (unread) {
      log.debug("Loading all series with unread comics: email={}", email);
      return this.comicRepository.getAllUnreadSeries(email);
    } else {
      log.debug("Loading all series");
      return this.comicRepository.getAllSeries();
    }
  }

  /**
   * Returns the set of publishers for the given series. Filters out comics read by the user if the
   * flag is set.
   *
   * @param series the series name
   * @param email the user's email
   * @param unread the unread flag
   * @return the entries
   */
  @Transactional
  public Set<String> getAllPublishersForSeries(
      final String series, final String email, final boolean unread) {
    if (unread) {
      log.debug(
          "Loading all publishers for series with unread comics: series={} email={}",
          series,
          email);
      return this.comicRepository.getAllUnreadPublishersForSeries(series, email);
    } else {
      log.debug("Loading all publishers for series: {}", series);
      return this.comicRepository.getAllPublishersForSeries(series);
    }
  }

  /**
   * Returns the list of entries for the given publisher, series, and volume. Optionally filters by
   * the unread status for the given user.
   *
   * @param publisher the publisher
   * @param series the series
   * @param volume the volume
   * @param email the user email
   * @param unread the unread flag
   * @return the entries
   */
  @Transactional
  public List<Comic> getAllComicBooksForPublisherAndSeriesAndVolume(
      final String publisher,
      final String series,
      final String volume,
      final String email,
      final boolean unread) {
    if (unread) {
      log.debug(
          "Loading unread comics: publisher={} series={} volume={} email={}",
          publisher,
          series,
          volume,
          email);
      return this.comicRepository.getAllUnreadForPublisherAndSeriesAndVolume(
          publisher, series, volume, email);
    }

    log.debug(
        "Loading comics: publisher={} series={} volume={} email={}",
        publisher,
        series,
        volume,
        email);
    return this.comicRepository.getAllForPublisherAndSeriesAndVolume(publisher, series, volume);
  }

  /**
   * Returns the set of all comics with a given tag type. Optionally filters by the unread state for
   * the given user.
   *
   * @param tagType the tag type
   * @param email the user's email
   * @param unread the unread flag
   * @return the entries
   */
  public Set<String> getAllValuesForTag(
      final ComicTagType tagType, final String email, final boolean unread) {
    if (unread) {
      log.debug("Loading all unread comics: tag type={} email={}", tagType, email);
      return this.comicRepository.getAllUnreadValuesForTagType(tagType, email);
    } else {
      log.debug("Lading all comics: tag type={}", tagType);
      return this.comicRepository.getAllValuesForTagType(tagType);
    }
  }

  /**
   * Returns the list of all cover date years. Optionally filters by the unread state for the given
   * user.
   *
   * @param email the user's email
   * @param unread the unread flag
   * @return the entries
   */
  public Set<Integer> getAllYears(final String email, final boolean unread) {
    if (unread) {
      log.debug("Loading all years with unread comics: email={}", email);
      return this.comicRepository.getAllUnreadYears(email);
    } else {
      log.debug("Loading all years");
      return this.comicRepository.getAllYears();
    }
  }

  /**
   * Returns the list of all weeks for a given year. Optionally filters by the unread state for the
   * given user.
   *
   * @param year the year
   * @param email the user's email
   * @param unread the unread flag
   * @return the entries
   */
  public Set<Integer> getAllWeeksForYear(final int year, final String email, final boolean unread) {
    final GregorianCalendar calendar = new GregorianCalendar();
    calendar.setTimeZone(TimeZone.getTimeZone("UTC"));
    if (unread) {
      log.debug("Loading all weeks with unread comics for year: year={} email={}", year, email);
      return this.comicRepository.getAllUnreadWeeksForYear(year, email).stream()
          .map(
              coverDate -> {
                calendar.setTime(coverDate);
                return calendar.get(Calendar.WEEK_OF_YEAR);
              })
          .collect(Collectors.toSet());
    } else {
      log.debug("Loading all weeks for year: year={}", year);
      return this.comicRepository.getAllWeeksForYear(year).stream()
          .map(
              coverDate -> {
                calendar.setTime(coverDate);
                return calendar.get(Calendar.WEEK_OF_YEAR);
              })
          .collect(Collectors.toSet());
    }
  }

  /**
   * Returns the list of comics for the given year and week. Optionally filters by the unread state
   * for the given user.
   *
   * @param year the year
   * @param week the week
   * @param email the user's email
   * @param unread the unread flag
   * @return the entries
   */
  public List<Comic> getComicsForYearAndWeek(
      final int year, final int week, final String email, final boolean unread) {
    WeekFields weekFields = WeekFields.SUNDAY_START;
    var localStartDate =
        LocalDate.now(ZoneId.of("UTC"))
            .withYear(year)
            .with(weekFields.weekOfYear(), week)
            .with(weekFields.dayOfWeek(), 1);

    final Date startDate =
        Date.from(localStartDate.atStartOfDay(ZoneId.systemDefault()).toInstant());

    log.trace("Getting last day of requested week");
    var localEndDate = localStartDate.plusDays(6);
    final Date endDate = Date.from(localEndDate.atStartOfDay(ZoneId.systemDefault()).toInstant());

    if (unread) {
      log.debug(
          "Loading unread comics for given year and week: year={} week={} email={}",
          year,
          week,
          email);
      return this.comicRepository.getAllUnreadForYearAndWeek(startDate, endDate, email);
    } else {
      log.debug("Loading all comics for year and week: year={} week={}", year, week);
      return this.comicRepository.getAllForYearAndWeek(startDate, endDate);
    }
  }

  /**
   * Returns all comics that match the given search term.
   *
   * @param term the search term
   * @return the entries
   */
  public List<Comic> getComicForSearchTerm(final String term) {
    log.debug("Loading all comics for search term: \"{}\"", term);
    return this.comicRepository.getForSearchTerm(term);
  }

  /**
   * Returns all comics with the given tag type and value. Optionally filters by the unread state
   * for the given user.
   *
   * @param tagType the tag type
   * @param tagValue the tag value
   * @param email the use's email
   * @param unread the unread flag
   * @return the entries
   * @deprecated See {@link
   *     org.comixedproject.service.library.DisplayableComicService#loadComicsByTagTypeAndValue(int,
   *     int, ComicTagType, String, String, String)}
   */
  @Transactional
  @Deprecated(since = "3.0")
  public List<Comic> getAllComicsForTag(
      final ComicTagType tagType, final String tagValue, final String email, final boolean unread) {
    if (unread) {
      log.debug("Loading all unread comics for tag type: tag type={} email={}", tagType, email);
      return this.comicRepository.getAllUnreadComicsForTagType(tagType, tagValue, email);
    } else {
      log.debug("Loading all comics for tag type: tag type={}", tagType);
      return this.comicRepository.getAllComicsForTagType(tagType, tagValue);
    }
  }

  /**
   * Loads a set of records by their id.
   *
   * @param ids the record ids
   * @return the entries
   */
  public List<Comic> loadComicDetailListById(final Set<Long> ids) {
    log.debug("Loading comic details by id: {}", ids);
    return this.comicRepository.findAllById(ids);
  }

  /**
   * Returns all records that match the provided example.
   *
   * @param example the example
   * @return the entries
   */
  public List<Comic> findAllByExample(final Example<Comic> example) {
    log.debug("Finding all comic details by example: {}", example);
    return this.comicRepository.findAll(example);
  }

  /**
   * Loads a page of tag values for a given tag type.
   *
   * @param tagType the tag type
   * @param pageSize the number of records to return
   * @param pageIndex the page number
   * @param sortBy the sort field
   * @param sortDirection the sort direction
   * @return the entries
   */
  @Transactional
  public List<CollectionEntry> loadCollectionEntries(
      final ComicTagType tagType,
      final String filterText,
      final int pageSize,
      final int pageIndex,
      final String sortBy,
      final String sortDirection) {
    if (StringUtils.hasLength(filterText)) {
      return this.comicRepository.loadCollectionEntriesWithFiltering(
          tagType,
          "%" + filterText + "%",
          PageRequest.of(pageIndex, pageSize, this.doCreateCollectionSort(sortBy, sortDirection)));
    } else {
      return this.comicRepository.loadCollectionEntries(
          tagType,
          PageRequest.of(pageIndex, pageSize, this.doCreateCollectionSort(sortBy, sortDirection)));
    }
  }

  /**
   * Returns the number of comic books with a given tag type.
   *
   * @param tagType the tag type
   * @return the number of comics
   */
  public long loadCollectionTotalEntries(final ComicTagType tagType, final String filterText) {
    if (StringUtils.hasLength(filterText)) {
      return this.comicRepository.getFilterCountWithFiltering(tagType, "%" + filterText + "%");
    } else {
      return this.comicRepository.getFilterCount(tagType);
    }
  }

  private Sort doCreateCollectionSort(final String sortBy, final String sortDirection) {
    if (!StringUtils.hasLength(sortBy) || !StringUtils.hasLength(sortDirection)) {
      return Sort.unsorted();
    }

    String fieldName;
    switch (sortBy) {
      case "tag-value" -> fieldName = "id.tagValue";
      case "comic-count" -> fieldName = "comicCount";
      default -> fieldName = "id.tagValue";
    }

    Sort.Direction direction = Sort.Direction.DESC;
    if (sortDirection.equals("asc")) {
      direction = Sort.Direction.ASC;
    }

    return Sort.by(direction, fieldName);
  }

  @Transactional(readOnly = true)
  public Comic getByComicBookId(final Long comicId) throws ComicException {
    final Comic result = this.comicRepository.findByComicBookId(comicId);
    if (result == null)
      throw new ComicException("Comic detail not found for comic book id: " + comicId);
    return result;
  }

  @Transactional
  public List<Comic> getAllComicsForReadingList(final String email, final Long readingListId) {
    return this.comicRepository.getAllComicsForReadingList(email, readingListId);
  }

  /**
   * Returns all ids from the database.
   *
   * @return the ids
   */
  @Transactional
  public List<Long> getAllIds() {
    log.debug("Getting the list of all comic detail ids");
    return this.comicRepository.getAllIds();
  }

  /**
   * Marks entries with the given ids for metadata updating.
   *
   * @param ids the record ids
   */
  @Transactional
  public void prepareForMetadataUpdate(final List<Long> ids) {
    this.comicRepository.prepareForMetadataUpdate(ids);
  }

  /**
   * Returns the number of comic books that are being batch scraped.
   *
   * @return the count
   */
  @Transactional
  public long getBatchScrapingCount() {
    return this.comicRepository.getBatchScrapingCount();
  }

  /**
   * Returns a set of comic books marked for batch scraping.
   *
   * @param chunkSize the chunk size
   * @return the comic book
   */
  @Transactional
  public List<Comic> findBatchScrapingComics(final int chunkSize) {
    return this.comicRepository.findBatchScrapingComics(PageRequest.of(0, chunkSize));
  }

  /**
   * Retrieves unprocessed comics that have the create metadata flag set.
   *
   * @param chunkSize the number of comics to return
   * @return the comics
   */
  public List<Comic> findComicsWithCreateMetadataFlagSet(final int chunkSize) {
    log.trace("Loading unprocessed comics that need to have their contents loaded");
    return this.comicRepository.findUnprocessedComicsWithCreateMetadataFlagSet(
        PageRequest.of(0, chunkSize));
  }

  /**
   * Returns comics that are waiting to have their metadata updated.
   *
   * @param count the number of comics to return
   * @return the list of comics
   */
  public List<Comic> findComicsWithMetadataToUpdate(final int count) {
    log.trace("Getting comics that are ready to have their metadata updated");
    return this.comicRepository.findComicsWithMetadataToUpdate(PageRequest.of(0, count));
  }

  /**
   * Loads a set of comic books containing pages that do not have a page hash.
   *
   * @param size the record count
   * @return the records
   */
  @Transactional
  public List<Comic> findComicsWithUnhashedPages(final int size) {
    log.debug("Loading pages without a hash");
    return this.comicRepository.findComicsWithUnhashedPages(PageRequest.of(0, size));
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
    return this.comicRepository.getSeriesCountForPublisher(name);
  }

  /**
   * Finds all comics to be recreated.
   *
   * @param count the number of comics to return
   * @return the list of comics
   */
  public List<Comic> getComicsToBeRecreated(final int count) {
    log.trace("Finding all comics to be recreated");
    return this.comicRepository.getComicsToBeRecreated(PageRequest.of(0, count));
  }

  public List<Comic> findComicsForBatchMetadataUpdate(final int count) {
    log.trace("Getting comics that are flagged for batch metadata update");
    return this.comicRepository.findComicsForBatchMetadataUpdate(PageRequest.of(0, count));
  }

  /**
   * Retrieves unprocessed comics that are waiting to have their contents loaded.
   *
   * @return the comics
   */
  public List<Comic> findComicsWithContentToLoad(final int batchSize) {
    return this.comicRepository.findComicsWithContentToLoad(PageRequest.of(0, batchSize));
  }

  /**
   * Retrieves comic books that have their edit details flag set.
   *
   * @param count the maximum records
   * @return the comic books
   */
  public List<Comic> findComicsWithEditDetails(final int count) {
    log.debug("Loading up to {} comics with edit flag set", count);
    return this.comicRepository.findComicsWithEditDetails(PageRequest.of(0, count));
  }

  /**
   * Returns comic books marked for purging that are in the deleted state.
   *
   * @param count the number of comics to return
   * @return the comic book list
   */
  @Transactional
  public List<Comic> findComicBooksToBePurged(final int count) {
    return this.comicRepository.findComicsMarkedForPurging(PageRequest.of(0, count));
  }

  public Set<String> getAllPublishersForStory(final String name) {
    log.trace("Returning all publishers for a given story");
    return this.comicRepository.findDistinctPublishersForStory(name);
  }

  /**
   * Returns the library state for publishers.
   *
   * @return the publishers state
   */
  @Transactional
  public List<RemoteLibrarySegmentState> getPublishersState() {
    log.trace("Getting the publishers state");
    return this.comicRepository.getPublishersState();
  }

  /**
   * Returns the library state for series.
   *
   * @return the series state
   */
  @Transactional
  public List<RemoteLibrarySegmentState> getSeriesState() {
    log.trace("Getting the series state");
    return this.comicRepository.getSeriesState();
  }

  /**
   * Returns the library state for characters.
   *
   * @return the characters state
   */
  @Transactional
  public List<RemoteLibrarySegmentState> getCharactersState() {
    log.trace("Getting the characters state");
    return this.comicRepository.getCharactersState();
  }

  /**
   * Returns the library state for teams.
   *
   * @return the teams state
   */
  @Transactional
  public List<RemoteLibrarySegmentState> getTeamsState() {
    log.trace("Getting the teams state");
    return this.comicRepository.getTeamsState();
  }

  /**
   * Returns the library state for locations.
   *
   * @return the locations state
   */
  @Transactional
  public List<RemoteLibrarySegmentState> getLocationsState() {
    log.trace("Getting the locations state");
    return this.comicRepository.getLocationsState();
  }

  /**
   * Returns the library state for stories.
   *
   * @return the stories state
   */
  @Transactional
  public List<RemoteLibrarySegmentState> getStoriesState() {
    log.trace("Getting the stories state");
    return this.comicRepository.getStoriesState();
  }

  /**
   * Returns the library state for comic book states.
   *
   * @return the comic book states
   */
  @Transactional
  public List<RemoteLibrarySegmentState> getComicBooksState() {
    log.trace("Getting the comics state");
    return this.comicRepository.getComicBooksState();
  }

  /**
   * Returns the library state for archive types.
   *
   * @return the comic book states
   */
  @Transactional
  public List<RemoteLibrarySegmentState> getComicBookArchiveTypes() {
    log.trace("Getting the archive types state");
    return this.comicRepository.getComicBookArchiveTypes();
  }

  /**
   * Returns the number of comics per publisher and year.
   *
   * @return the statistics
   */
  @Transactional
  public List<PublisherAndYearSegment> getByPublisherAndYear() {
    log.trace("Getting counts by publisher and year");
    return this.comicRepository.getByPublisherAndYear();
  }

  /**
   * Returns the total number of comics marked for deletion.
   *
   * @return the deleted comic count
   */
  @Transactional
  public long getDeletedComicCount() {
    log.trace("Getting the deleted comic count count");
    return this.comicRepository.findForStateCount(ComicState.DELETED);
  }

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
  public List<Comic> getForPublisherAndSeriesAndVolumeAndIssueNumber(
      final String publisher, final String series, final String volume, final String issueNumber) {
    log.trace(
        "Finding comic: publisher={} series={} volume={} issue #={}",
        publisher,
        series,
        volume,
        issueNumber);
    return this.comicRepository.getForPublisherAndSeriesAndVolumeAndIssueNumber(
        publisher, series, volume, issueNumber);
  }

  /**
   * Retrieves the number of unprocessed comics that are waiting to have their contents loaded.
   *
   * @return the count
   */
  @Transactional
  public long getComicsWithoutContentCount() {
    log.trace("Getting the number of unprocessed comics without content");
    return this.comicRepository.findUnprocessedComicsWithoutContentCount();
  }

  /**
   * Returns the total number of comics in the library.
   *
   * @return the comic count
   */
  @Transactional(isolation = Isolation.READ_UNCOMMITTED)
  public long getComicCount() {
    log.trace("Getting total comics count");
    return this.comicRepository.count();
  }

  /**
   * Returns the number of comics enqueued for batch metadata update.
   *
   * @return the comic count
   */
  public long findComicsForBatchMetadataUpdateCount() {
    log.trace("Getting number of comics that are flagged for batch metadata update");
    return this.comicRepository.findComicsForBatchMetadataUpdateCount();
  }

  // update

  @Transactional
  public void markComicBooksForBatchScraping(final List<Long> ids) {
    this.comicRepository.prepareForBatchScraping(ids);
  }

  /**
   * Marks the specified comics for recreation, optionally renaming pages.
   *
   * @param ids the comic ids
   * @param archiveType the targe archive type
   */
  @Transactional
  public void prepareForRecreation(final List<Long> ids, final ArchiveType archiveType) {
    log.trace("Marking comics for recreation");
    this.comicRepository.markForRecreationById(ids, archiveType);
    this.applicationEventPublisher.publishEvent(RecreateComicFilesEvent.instance);
  }

  @Transactional
  public long getRecreatingCount() {
    log.debug("Getting the recreating count");
    return this.comicRepository.getRecreatingCount();
  }

  /**
   * Returns the number of comics that are marked for recreation.
   *
   * @return the comic book count
   */
  @Transactional
  public long findComicsToPurgeCount() {
    log.trace("Finding the count of comics to be recreated");
    return this.comicRepository.findComicsToPurgeCount();
  }

  /**
   * Prepares to update the details for a set of comics.
   *
   * @param comicIds the comics' ids
   * @throws ComicException if comic id is invalid
   */
  public void updateMultipleComics(final List<Long> comicIds) throws ComicException {
    log.debug("Updating details for {} comic{}", comicIds.size(), comicIds.size() == 1 ? "" : "s");
    for (long comicId : comicIds) {
      log.trace("Loading comic: id={}", comicId);
      final Comic comic = this.comicRepository.findByComicBookId(comicId);
      if (Objects.isNull(comic))
        throw new ComicException(String.format("No such comic book to update: id=%d", comicId));
      this.comicStateAdaptor.fireEvent(comic, ComicEvent.prepareComicsForBatchEditing);
    }
  }

  /**
   * Prepares a set of comic books for rescanning.
   *
   * @param comicIdList the comic ids
   */
  public void prepareForRescan(final List<Long> comicIdList) {
    comicIdList.forEach(
        comicId -> {
          log.trace("Loading comic: id={}", comicId);
          final Comic comic = this.comicRepository.findByComicBookId(comicId);
          log.trace("Firing event: rescan comic");
          this.comicStateAdaptor.fireEvent(comic, ComicEvent.rescanComicBookFile);
        });
  }

  /**
   * Marks a comic book as found.
   *
   * @param filename the comic filename
   */
  @Transactional
  public void markComicAsFound(final String filename) {
    final String standardizeFilename = this.comicFileAdaptor.standardizeFilename(filename);
    final var comic =
        this.comicFileAdaptor.isCaseSensitiveFilenames()
            ? this.comicRepository.findByFilename(standardizeFilename)
            : this.comicRepository.findByFilenameCaseInsensitive(standardizeFilename);
    if (Objects.nonNull(comic)) {
      log.debug("Marking comic book as found: id={}", comic.getComicId());
      this.comicStateAdaptor.fireEvent(comic, ComicEvent.comicFileFound);
    }
  }

  /**
   * Marks a comic book as missing.
   *
   * @param filename the filename
   */
  @Transactional
  public void markComicAsMissing(String filename) {
    final String standardizeFilename = this.comicFileAdaptor.standardizeFilename(filename);
    final var comic =
        this.comicFileAdaptor.isCaseSensitiveFilenames()
            ? this.comicRepository.findByFilename(standardizeFilename)
            : this.comicRepository.findByFilenameCaseInsensitive(standardizeFilename);
    if (Objects.nonNull(comic)) {
      log.debug("Marking comic book as found: id={}", comic.getComicId());
      this.comicStateAdaptor.fireEvent(comic, ComicEvent.comicFileMissing);
    }
  }

  /**
   * Marks comics for batch metadata update processing.
   *
   * @param ids the comic book ids
   * @throws ComicException if an id is invalid
   */
  @Transactional(rollbackFor = Throwable.class)
  public void markComicBooksForBatchMetadataUpdate(final List<Long> ids) throws ComicException {
    for (final Long id : ids) {
      log.trace("Loading comic book: id={}", id);
      final var comic = this.doLoadComic(id);
      log.trace("Setting batch metadata update flag");
      comic.setBatchUpdatingMetadata(true);
      this.comicRepository.save(comic);
    }
    this.applicationEventPublisher.publishEvent(UpdateMetadataEvent.instance);
  }

  private Comic doLoadComic(final Long comicId) throws ComicException {
    final Comic result = this.comicRepository.getReferenceById(comicId);
    if (Objects.isNull(result)) {
      throw new ComicException(String.format("No such comic: id=%d", comicId));
    }
    return result;
  }

  /**
   * Marks comics for organization. Uses a set of ids to determine which comics to mark.
   *
   * @param ids the comic ids
   */
  @Transactional
  public void prepareForOrganization(final List<Long> ids) {
    log.trace("Marking comics for organization");
    this.comicRepository.markForOrganizationById(ids);
    this.applicationEventPublisher.publishEvent(OrganizingLibraryEvent.instance);
  }

  @Transactional
  public void prepareAllForOrganization() {
    log.trace("Marking all comics for organization");
    this.comicRepository.markAllForOrganization();
    this.applicationEventPublisher.publishEvent(OrganizingLibraryEvent.instance);
  }

  /** Marks all comics in the deleted state for purging. */
  @Transactional
  public void prepareComicBooksForDeleting() {
    log.trace("Marking all deleted comics for purging");
    this.comicRepository.prepareComicBooksForDeleting();
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
    return this.comicRepository.getAllSeriesAndVolumesForPublisher(
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
    return this.comicRepository.getUnscrapedComicCount();
  }

  /**
   * Returns the number of unprocessed comic books.
   *
   * @return the comic books
   */
  @Transactional
  public long getUnprocessedComicBookCount() {
    log.debug("Loading unprocessed comic books");
    return this.comicRepository.getUnprocessedComicBookCount();
  }

  /**
   * Returns the number of comic books to have their metadata updated.
   *
   * @return the count
   */
  @Transactional
  public long getUpdateMetadataCount() {
    log.debug("Getting the update metadata count");
    return this.comicRepository.getUpdateMetadataCount();
  }

  /**
   * Returns a subset of comic filenames based on whether they were previously marked as missing.
   *
   * @param missing the missing flag
   * @return the filenames
   */
  @Transactional
  public Set<String> getAllComicDetailsByMissingFlag(final boolean missing) {
    return this.comicRepository.getAllComicDetailsByMissingFlag(missing);
  }

  /**
   * Returns if there are any comic books with unhashed pages.
   *
   * @return true if there are comic books with unhashed pages
   */
  @Transactional
  public boolean hasComicsWithUnhashedPages() {
    return this.comicRepository.findComicsWithUnhashedPagesCount() > 0L;
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
      default -> fieldName = "comic.series";
    }

    Sort.Direction direction = Sort.Direction.DESC;
    if (sortDirection.equals("asc")) {
      direction = Sort.Direction.ASC;
    }
    return Sort.by(direction, fieldName);
  }

  /**
   * Returns the number of comic books with unhashed pages.
   *
   * @return the comic count
   */
  @Transactional
  public long findComicsWithUnhashedPagesCount() {
    return this.comicRepository.findComicsWithUnhashedPagesCount();
  }

  // delete

  @Transactional
  public void deleteComic(final Comic comic) {
    log.debug("Deleting comic: id={}", comic.getComicId());
    this.comicRepository.delete(comic);
  }
}

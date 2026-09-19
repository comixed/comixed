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

package org.comixedproject.repositories.comicbooks;

import java.util.Date;
import java.util.List;
import java.util.Set;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.collections.CollectionEntry;
import org.comixedproject.model.collections.SeriesDetail;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.net.library.PublisherAndYearSegment;
import org.comixedproject.model.net.library.RemoteLibrarySegmentState;
import org.springframework.data.domain.Limit;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * <code>ComicRepository</code> works directly with persisted instances of {@link Comic}.
 *
 * @author Darryl L. Pierce
 */
@Repository
public interface ComicRepository extends JpaRepository<Comic, Long> {
  /**
   * Returns all comic book record ids.
   *
   * @return the id list
   */
  @Query("SELECT c.comicId FROM Comic c")
  List<Long> getAllIds();

  /**
   * Returns the set of all cover dates for comics that have not been read by the specified user.
   *
   * @param email the user's email
   * @return the cover dates
   */
  @Query(
      "SELECT DISTINCT d.coverDate FROM Comic d WHERE d.coverDate IS NOT NULL AND d.comicId NOT IN (SELECT rcb FROM ComiXedUser u INNER JOIN u.readComicBooks rcb WHERE u.email = :email)")
  Set<Date> getAllUnreadCoverDates(@Param("email") String email);

  /**
   * Returns the set of all cover dates.
   *
   * @return the cover dates
   */
  @Query("SELECT DISTINCT d.coverDate FROM Comic d WHERE d.coverDate IS NOT NULL")
  Set<Date> getAllCoverDates();

  @Query(
      "SELECT d FROM Comic d WHERE d.coverDate IS NOT NULL AND d.coverDate = :coverDate AND d.comicId NOT IN (SELECT rcb FROM ComiXedUser u INNER JOIN u.readComicBooks rcb WHERE u.email = :email)")
  List<Comic> getAllUnreadComicsForCoverDate(
      @Param("coverDate") Date coverDate, @Param("email") String email);

  @Query("SELECT d FROM Comic d WHERE d.coverDate IS NOT NULL AND d.coverDate = :coverDate")
  List<Comic> getAllComicsForCoverDate(@Param("coverDate") Date coverDate);

  /**
   * Returns the set of all publishers with comics that have not been read by the specified user.
   *
   * @param email the user's email
   * @return the publishers
   */
  @Query(
      "SELECT DISTINCT d.publisher FROM Comic d WHERE d.publisher IS NOT NULL AND LENGTH(d.publisher) > 0 AND d.comicId NOT IN (SELECT rcb FROM ComiXedUser u INNER JOIN u.readComicBooks rcb WHERE u.email = :email)")
  Set<String> getAllUnreadPublishers(@Param("email") String email);

  /**
   * Returns the set of all publishers.
   *
   * @return the publishers
   */
  @Query(
      "SELECT DISTINCT d.publisher FROM Comic d WHERE d.publisher IS NOT NULL AND LENGTH(d.publisher) > 0")
  Set<String> getAllPublishers();

  /**
   * Returns the set of all series for the given publisher with comics that have not been read by
   * the specified user.
   *
   * @param publisher the publisher
   * @param email the user's email
   * @return the series
   */
  @Query(
      "SELECT DISTINCT d.series FROM Comic d WHERE d.publisher = :publisher AND d.series IS NOT NULL AND d.comicId NOT IN (SELECT rcb FROM ComiXedUser u INNER JOIN u.readComicBooks rcb WHERE u.email = :email)")
  Set<String> getAllUnreadSeriesForPublisher(
      @Param("publisher") String publisher, @Param("email") String email);

  /**
   * Returns the set of all series for the given publisher.
   *
   * @param publisher the publisher
   * @return the series
   */
  @Query(
      "SELECT DISTINCT d.series FROM Comic d WHERE d.publisher = :publisher AND d.series IS NOT NULL")
  Set<String> getAllSeriesForPublisher(@Param("publisher") String publisher);

  /**
   * Returns the set of all volumes for the given series and volume with comics that have not been
   * read by the specified user.
   *
   * @param publisher the publisher
   * @param series the series
   * @param email the user's email
   * @return the volumes
   */
  @Query(
      "SELECT DISTINCT d.volume FROM Comic d WHERE d.publisher = :publisher AND d.series = :series AND d.series IS NOT NULL AND d.comicId NOT IN (SELECT rcb FROM ComiXedUser u INNER JOIN u.readComicBooks rcb WHERE u.email = :email)")
  Set<String> getAllUnreadVolumesForPublisherAndSeries(
      @Param("publisher") String publisher,
      @Param("series") String series,
      @Param("email") String email);

  /**
   * Returns the set of all volumes for the given series and volume.
   *
   * @param publisher the publisher
   * @param series the series
   * @return the volumes
   */
  @Query(
      "SELECT DISTINCT d.volume FROM Comic d WHERE d.publisher = :publisher AND d.series = :series AND d.volume IS NOT NULL")
  Set<String> getAllVolumesForPublisherAndSeries(
      @Param("publisher") String publisher, @Param("series") String series);

  /**
   * Returns the set of all series with comics that have not been read by the specified user.
   *
   * @param email the user's email
   * @return the series
   */
  @Query(
      "SELECT DISTINCT d.series FROM Comic d WHERE d.series IS NOT NULL AND LENGTH(d.series) > 0 AND d.comicId NOT IN (SELECT rcb FROM ComiXedUser u INNER JOIN u.readComicBooks rcb WHERE u.email = :email)")
  Set<String> getAllUnreadSeries(@Param("email") String email);

  /**
   * Returns the set of all series.
   *
   * @return the series
   */
  @Query(
      "SELECT DISTINCT d.series FROM Comic d WHERE d.series IS NOT NULL AND LENGTH(d.series) > 0")
  Set<String> getAllSeries();

  /**
   * Returns the set of publishers for the given series with comics that have not been read by the
   * specified user.
   *
   * @param series the series
   * @param email the user's email
   * @return the volumes
   */
  @Query(
      "SELECT DISTINCT d.publisher FROM Comic d WHERE d.series = :series AND d.publisher IS NOT NULL AND d.comicId NOT IN (SELECT rcb FROM ComiXedUser u INNER JOIN u.readComicBooks rcb WHERE u.email = :email)")
  Set<String> getAllUnreadPublishersForSeries(
      @Param("series") String series, @Param("email") String email);

  /**
   * Returns the set of publishers for the given series.
   *
   * @param series the series
   * @return the volumes
   */
  @Query(
      "SELECT DISTINCT d.publisher FROM Comic d WHERE d.series = :series AND d.publisher IS NOT NULL")
  Set<String> getAllPublishersForSeries(@Param("series") String series);

  /**
   * Returns all records for the given publisher, series, and volume that do not have a read entry
   * for the given user.
   *
   * @param publisher the publisher
   * @param series the series
   * @param volume the volume
   * @param email the user's email
   * @return the matching records
   */
  @Query(
      "SELECT d FROM Comic d WHERE d.publisher = :publisher AND d.series = :series AND d.volume = :volume AND d.comicId NOT IN (SELECT rcb FROM ComiXedUser u INNER JOIN u.readComicBooks rcb WHERE u.email = :email) ORDER BY d.coverDate")
  List<Comic> getAllUnreadForPublisherAndSeriesAndVolume(
      @Param("publisher") String publisher,
      @Param("series") String series,
      @Param("volume") String volume,
      @Param("email") String email);

  /**
   * Returns all records for the given publisher, series, and volume.
   *
   * @param publisher the publisher
   * @param series the series
   * @param volume the volume
   * @return the matching records
   */
  @Query(
      "SELECT d FROM Comic d WHERE d.publisher = :publisher AND d.series = :series AND d.volume = :volume ORDER BY d.coverDate")
  List<Comic> getAllForPublisherAndSeriesAndVolume(
      @Param("publisher") String publisher,
      @Param("series") String series,
      @Param("volume") String volume);

  /**
   * Returns all comics with the given tag type that do not have a read entry for the given user.
   *
   * @param tagType the tag type
   * @param email the user's email
   * @return the matching records
   */
  @Query(
      "SELECT DISTINCT t.value FROM ComicTag t WHERE t.type = :tagType AND t.comic.comicId NOT IN (SELECT rcb FROM ComiXedUser u INNER JOIN u.readComicBooks rcb WHERE u.email = :email)")
  Set<String> getAllUnreadValuesForTagType(
      @Param("tagType") ComicTagType tagType, @Param("email") String email);

  /**
   * Returns all comics with the given tag type.
   *
   * @param tagType the tag type
   * @return the matching records
   */
  @Query("SELECT DISTINCT t.value FROM ComicTag t WHERE t.type = :tagType")
  Set<String> getAllValuesForTagType(@Param("tagType") ComicTagType tagType);

  /**
   * Returns all years with comics that do not have a read entry for the given user.
   *
   * @param email the user's email
   * @return the matching years
   */
  @Query(
      "SELECT DISTINCT YEAR(d.coverDate) FROM Comic d WHERE d.coverDate IS NOT NULL AND d.comicId NOT IN (SELECT rcb FROM ComiXedUser u INNER JOIN u.readComicBooks rcb WHERE u.email = :email)")
  Set<Integer> getAllUnreadYears(@Param("email") String email);

  /**
   * Returns all years.
   *
   * @return the years
   */
  @Query("SELECT DISTINCT YEAR(d.coverDate) FROM Comic d WHERE d.coverDate IS NOT NULL")
  Set<Integer> getAllYears();

  /**
   * Returns all weeks for the given year that do not have a read entry for the given user.
   *
   * @param year the year
   * @param email the user's email
   * @return the matching weeks
   */
  @Query(
      "SELECT DISTINCT d.coverDate FROM Comic d WHERE d.coverDate IS NOT NULL AND year(d.coverDate) = :year AND d.comicId NOT IN (SELECT rcb FROM ComiXedUser u INNER JOIN u.readComicBooks rcb WHERE u.email = :email)")
  Set<Date> getAllUnreadWeeksForYear(@Param("year") int year, @Param("email") String email);

  /**
   * Returns all weeks for the given year
   *
   * @param year the year
   * @return the matching weeks
   */
  @Query(
      "SELECT DISTINCT d.coverDate FROM Comic d WHERE d.coverDate IS NOT NULL AND year(d.coverDate) = :year")
  Set<Date> getAllWeeksForYear(@Param("year") int year);

  /**
   * Returns all unread records with a cover date between the given start and end dates, inclusive.
   *
   * @param startDate the start date
   * @param endDate the end date
   * @param email the user's email
   * @return the matching records
   */
  @Query(
      "SELECT d FROM Comic d WHERE d.coverDate IS NOT NULL AND d.coverDate IS NOT NULL AND d.coverDate >= :startDate AND d.coverDate <= :endDate AND d.comicId NOT IN (SELECT rcb FROM ComiXedUser u INNER JOIN u.readComicBooks rcb WHERE u.email = :email)")
  List<Comic> getAllUnreadForYearAndWeek(
      @Param("startDate") Date startDate,
      @Param("endDate") Date endDate,
      @Param("email") String email);

  @Query(
      "SELECT d FROM Comic d WHERE d.coverDate IS NOT NULL AND d.coverDate IS NOT NULL AND d.coverDate >= :startDate AND d.coverDate <= :endDate")
  List<Comic> getAllForYearAndWeek(
      @Param("startDate") Date startDate, @Param("endDate") Date endDate);

  /**
   * Returns all comics that match the given search term.
   *
   * @param term the search term
   * @return the matching records
   */
  @Query(
      "SELECT d FROM Comic d WHERE LOWER(CAST(d.title AS STRING)) LIKE LOWER(concat('%', :term, '%')) OR LOWER(CAST(d.description AS STRING)) LIKE LOWER(concat('%', :term, '%'))")
  List<Comic> getForSearchTerm(@Param("term") String term);

  /**
   * Returns all unread comics with the given tag type that do not have a read entry for the given
   * user.
   *
   * @param tagType the tag type
   * @param tagValue the tag value
   * @param email the user's email
   * @return the matching comics
   */
  @Query(
      "SELECT d FROM Comic d WHERE d IN (SELECT t.comic FROM ComicTag t WHERE t.type = :tagType AND t.value = :tagValue) AND d.comicId NOT IN (SELECT rcb FROM ComiXedUser u INNER JOIN u.readComicBooks rcb WHERE u.email = :email)")
  List<Comic> getAllUnreadComicsForTagType(
      @Param("tagType") ComicTagType tagType,
      @Param("tagValue") String tagValue,
      @Param("email") String email);

  /**
   * Returns all comics with the given tag type.
   *
   * @param tagType the tag type
   * @param tagValue the tag value
   * @return the matching comics
   */
  @Query(
      "SELECT d FROM Comic d WHERE d IN (SELECT t.comic FROM ComicTag t WHERE t.type = :tagType AND t.value = :tagValue)")
  List<Comic> getAllComicsForTagType(
      @Param("tagType") ComicTagType tagType, @Param("tagValue") String tagValue);

  /**
   * Returns a display page of {@link CollectionEntry} values.
   *
   * @param tagType the tag type
   * @param pageable the page request
   * @return the values
   */
  @Query("SELECT DISTINCT c FROM CollectionEntry c WHERE c.id.tagType = :tagType")
  List<CollectionEntry> loadCollectionEntries(
      @Param("tagType") ComicTagType tagType, Pageable pageable);

  /**
   * Returns a display page of {@link CollectionEntry} values using filter text.
   *
   * @param tagType the tag type
   * @param filterText the filter text
   * @param pageable the page request
   * @return the values
   */
  @Query(
      "SELECT c FROM CollectionEntry c WHERE c.id.tagType = :tagType AND c.id.tagValue ILIKE :filterText")
  List<CollectionEntry> loadCollectionEntriesWithFiltering(
      @Param("tagType") ComicTagType tagType,
      @Param("filterText") String filterText,
      Pageable pageable);

  @Query("SELECT COUNT(DISTINCT t.value) FROM ComicTag t WHERE t.type = :tagType")
  long getFilterCount(@Param("tagType") ComicTagType tag);

  @Query(
      "SELECT COUNT(DISTINCT t.value) FROM ComicTag t WHERE t.type = :tagType AND t.value ILIKE :filterText")
  long getFilterCountWithFiltering(
      @Param("tagType") ComicTagType tag, @Param("filterText") String filterText);

  @Query("SELECT d FROM Comic d WHERE d.comicId = :comicId")
  Comic findByComicBookId(@Param("comicId") Long comicId);

  /**
   * Checks if an existing entry has the provided filename.
   *
   * @param filename the filename
   * @return true if an entry exists
   * @see #existsByFilenameIgnoreCase(String)
   */
  boolean existsByFilename(@Param("filename") String filename);

  /**
   * Checks if an existing entry has the provided filename, ignorase casing.
   *
   * @param filename the filename
   * @return true if an entry exists
   * @see #existsByFilename(String)
   */
  boolean existsByFilenameIgnoreCase(@Param("filename") String filename);

  @Query(
      "SELECT COUNT(DISTINCT t.comic.comicId) FROM ComicTag t WHERE t.type = :tagType AND t.value = :tagValue")
  long getComicCountForTagTypeAndValue(
      @Param("tagType") ComicTagType tagType, @Param("tagValue") String tagValue);

  /**
   * Returns the number of distinct series for a publisher.
   *
   * @param name the publisher
   * @return the count
   */
  @Query(
      "SELECT COUNT(DISTINCT d.series, d.volume) FROM Comic d WHERE LENGTH(d.publisher) > 0 AND d.publisher = :name")
  long getSeriesCountForPublisher(@Param("name") String name);

  /**
   * Updates the filename for the given comic detail.
   *
   * @param comicId the comic detail id.
   * @param updatedFilename the updated filename
   */
  @Modifying
  @Query("UPDATE Comic d SET d.filename = :updatedFilename WHERE d.comicId = :comicId")
  void updateFilename(
      @Param("comicId") Long comicId, @Param("updatedFilename") String updatedFilename);

  @Query(
      "SELECT d FROM Comic d WHERE d.comicId IN (SELECT l.entryIds FROM ReadingList l WHERE l.readingListId = :readingListId)")
  List<Comic> getAllComicsForReadingList(
      @Param("email") String email, @Param("readingListId") Long readingListId);

  /**
   * Marks entries with the given ids for batch scraping.
   *
   * @param ids the record ids
   */
  @Modifying
  @Query(
      "UPDATE Comic c SET c.batchScraping = TRUE WHERE c.comicId IN (:ids) AND c.batchScraping IS FALSE AND c.metadata IS NOT NULL")
  void prepareForBatchScraping(@Param("ids") List<Long> ids);

  /**
   * Returns the number of comic books that are marked for an can be batch scraped.
   *
   * @return the count
   */
  @Query("SELECT COUNT(c) FROM Comic c WHERE c.batchScraping IS TRUE AND c.metadata IS NOT NULL")
  long getBatchScrapingCount();

  /**
   * Returns a subset of comic books marked for batch scraping. Only comic books with the batch
   * scraping flag set and which have a metadata source are returned.
   *
   * @param pageable the page request
   * @return the comic books
   */
  @Query("SELECT c FROM Comic c WHERE c.batchScraping IS TRUE AND c.metadata IS NOT NULL")
  List<Comic> findBatchScrapingComics(Pageable pageable);

  /**
   * Marks entries with the given ids for metadata updating.
   *
   * @param ids the record ids
   */
  @Modifying
  @Query(
      "UPDATE Comic d SET d.updatingMetadata = TRUE WHERE d.comicId IN (:ids) AND d.updatingMetadata IS FALSE")
  void prepareForMetadataUpdate(@Param("ids") List<Long> ids);

  /**
   * Returns unprocessed comics that have their file loaded flag turned off.
   *
   * @param pageable the page request
   * @return the list of comics
   */
  @Query("SELECT c FROM Comic c WHERE c.state = 'UNPROCESSED'")
  List<Comic> findUnprocessedComicsWithCreateMetadataFlagSet(Pageable pageable);

  /**
   * Returns comics that have not had their file contents loaded.
   *
   * @param pageable the page request
   * @return the list of comics
   */
  @Query("SELECT c FROM Comic c WHERE c.loadingFileContents IS TRUE")
  List<Comic> findComicsWithContentToLoad(Pageable pageable);

  /**
   * Returns the number of unprocessed comics without file contents loaded.
   *
   * @return the count
   */
  @Query(
      "SELECT COUNT(c) FROM Comic c WHERE c.state = 'UNPROCESSED' OR c.loadingFileContents IS TRUE")
  int findUnprocessedComicsWithoutContentCount();

  /**
   * Returns unprocessed comics that have been fully processed.
   *
   * @return the list of comics
   */
  @Query("SELECT c FROM Comic c WHERE c.state = 'UNPROCESSED' AND c.loadingFileContents = FALSE")
  List<Comic> findProcessedComics();

  /**
   * Returns comics that are waiting to have their metadata update flag set.
   *
   * @param pageable the page request
   * @return the list of comics
   */
  @Query("SELECT c FROM Comic c WHERE c.updatingMetadata = true")
  List<Comic> findComicsWithMetadataToUpdate(Pageable pageable);

  /**
   * Returns comics that are marked to have their metadata batch processed.
   *
   * @param pageable the page request
   * @return the list of comics
   */
  @Query("SELECT c FROM Comic c WHERE c.batchUpdatingMetadata = true")
  List<Comic> findComicsForBatchMetadataUpdate(Pageable pageable);

  /**
   * Returns the number of comics with the organizing flag set.
   *
   * @return the record count
   */
  @Query("SELECT count(c) FROM Comic c WHERE c.organizing = true AND c.state != 'DELETED'")
  long findComicsToBeMovedCount();

  /**
   * Returns all comics that are marked for purging.
   *
   * @param pageable the page request
   * @return the comics
   */
  @Query("SELECT c FROM Comic c WHERE c.purging IS TRUE")
  List<Comic> findComicsMarkedForPurging(Pageable pageable);

  @Query("SELECT COUNT(c) FROM Comic c WHERE c.purging IS TRUE")
  long findComicsToPurgeCount();

  /**
   * Returns the number of comics enqueued for metadata batch update
   *
   * @return the comic count
   */
  @Query("SELECT COUNT(c) FROM Comic c WHERE c.batchUpdatingMetadata = true")
  long findComicsForBatchMetadataUpdateCount();

  @Modifying
  @Query(
      "UPDATE Comic c SET c.organizing = true WHERE c.comicId IN (:ids) AND c.organizing IS FALSE")
  void markForOrganizationById(@Param("ids") List<Long> ids);

  @Modifying
  @Query("UPDATE Comic c SET c.organizing = true")
  void markAllForOrganization();

  /**
   * Returns the number of unprocessed comic books.
   *
   * @return the list of comic books
   */
  @Query("SELECT COUNT(b) FROM Comic b WHERE b.loadingFileContents IS TRUE")
  long getUnprocessedComicBookCount();

  @Query("SELECT COUNT(c) FROM Comic c WHERE c.updatingMetadata IS TRUE")
  long getUpdateMetadataCount();

  /** Sets the purging flag for all comics int he DELETED state. */
  @Modifying
  @Query("UPDATE Comic c SET c.purging = true WHERE c.state = 'DELETED'")
  void prepareComicBooksForDeleting();

  /**
   * Clears the organizing flag for the specified comic book.
   *
   * @param comicId the comic book id
   */
  @Modifying
  @Query("UPDATE Comic c SET c.organizing = false WHERE c.comicId = :comicId")
  void clearOrganizingFlag(@Param("comicId") Long comicId);

  @Modifying
  @Query("UPDATE Comic c SET c.targetArchiveType = :archiveType WHERE c.comicId IN (:ids)")
  void markForRecreationById(
      @Param("ids") List<Long> ids, @Param("archiveType") final ArchiveType archiveType);

  @Query("SELECT COUNT(c) FROM Comic c WHERE c.targetArchiveType IS NOT NULL")
  long getRecreatingCount();

  @Query("SELECT c FROM Comic c WHERE c.targetArchiveType IS NOT NULL")
  List<Comic> getComicsToBeRecreated(final Pageable pageRequest);

  /**
   * Returns the record that has the given filename.
   *
   * @param filename the filename
   * @return the record
   */
  @Query("SELECT c FROM Comic c WHERE c.filename = :filename")
  Comic findByFilename(@Param("filename") String filename);

  /**
   * Returns the record that has the given filename, ignoring the case.
   *
   * @param filename the filename
   * @return the record
   */
  @Query("SELECT c FROM Comic c WHERE c.filename ILIKE :filename")
  Comic findByFilenameCaseInsensitive(@Param("filename") String filename);

  @Query(
      "SELECT c FROM Comic c WHERE c.publisher = :publisher AND c.series = :series AND c.volume = :volume AND c.issueNumber = :issueNumber ORDER BY c.coverDate, c.issueNumber ASC")
  List<Comic> getForPublisherAndSeriesAndVolumeAndIssueNumber(
      @Param("publisher") String publisher,
      @Param("series") String series,
      @Param("volume") String volume,
      @Param("issueNumber") String issueNumber);

  @Query(
      "SELECT c.comicId FROM Comic c WHERE c.series = :series AND c.volume = :volume AND c.issueNumber <> :issueNumber AND c.coverDate > :coverDate ORDER BY c.coverDate, c.issueNumber ASC")
  Long findNextComicBookIdInSeries(
      String series, String volume, String issueNumber, Date coverDate, Limit of);

  @Query(
      "SELECT c.comicId FROM Comic c WHERE c.series = :series AND c.volume = :volume AND c.issueNumber <> :issueNumber AND c.coverDate < :coverDate ORDER BY c.coverDate, c.issueNumber ASC")
  Long findPreviousComicBookIdInSeries(
      String series, String volume, String issueNumber, Date coverDate, Limit of);

  @Query(
      "SELECT DISTINCT d.publisher FROM Comic d WHERE d.comicId IN (SELECT t.comic.comicId FROM ComicTag t WHERE t.type = 'STORY' AND t.value = :name)")
  Set<String> findDistinctPublishersForStory(@Param("name") String name);

  @Query("SELECT COUNT(c) FROM Comic c WHERE c.state = :state")
  long findForStateCount(@Param("state") ComicState state);

  @Query(
      "SELECT new org.comixedproject.model.net.library.RemoteLibrarySegmentState(d.publisher, COUNT(d)) FROM Comic d WHERE d.publisher IS NOT NULL GROUP BY d.publisher")
  List<RemoteLibrarySegmentState> getPublishersState();

  @Query(
      "SELECT new org.comixedproject.model.net.library.RemoteLibrarySegmentState(d.series, COUNT(d)) FROM Comic d WHERE d.series IS NOT NULL GROUP BY d.series")
  List<RemoteLibrarySegmentState> getSeriesState();

  @Query(
      "SELECT new org.comixedproject.model.net.library.RemoteLibrarySegmentState(t.value, COUNT(t)) FROM ComicTag t WHERE t.type = 'CHARACTER' GROUP BY t.value")
  List<RemoteLibrarySegmentState> getCharactersState();

  @Query(
      "SELECT new org.comixedproject.model.net.library.RemoteLibrarySegmentState(t.value, COUNT(t)) FROM ComicTag t WHERE t.type = 'TEAM' GROUP BY t.value")
  List<RemoteLibrarySegmentState> getTeamsState();

  @Query(
      "SELECT new org.comixedproject.model.net.library.RemoteLibrarySegmentState(t.value, COUNT(t)) FROM ComicTag t WHERE t.type = 'LOCATION' GROUP BY t.value")
  List<RemoteLibrarySegmentState> getLocationsState();

  @Query(
      "SELECT new org.comixedproject.model.net.library.RemoteLibrarySegmentState(t.value, COUNT(t)) FROM ComicTag t WHERE t.type = 'STORY' GROUP BY t.value")
  List<RemoteLibrarySegmentState> getStoriesState();

  @Query(
      "SELECT new org.comixedproject.model.net.library.RemoteLibrarySegmentState(TRIM(CAST(d.state AS string)), COUNT(d)) FROM Comic d GROUP BY d.state")
  List<RemoteLibrarySegmentState> getComicBooksState();

  @Query(
      "SELECT new org.comixedproject.model.net.library.RemoteLibrarySegmentState(TRIM(CAST(d.archiveType AS string)), COUNT(d)) FROM Comic d GROUP BY d.archiveType")
  List<RemoteLibrarySegmentState> getComicBookArchiveTypes();

  @Query(
      "SELECT new org.comixedproject.model.net.library.PublisherAndYearSegment(d.publisher, YEAR(d.coverDate), COUNT(d)) FROM Comic d WHERE d.publisher IS NOT NULL AND d.coverDate IS NOT NULL GROUP BY d.publisher, YEAR(d.coverDate)")
  List<PublisherAndYearSegment> getByPublisherAndYear();

  @Query(
      "SELECT d FROM Comic d WHERE LOWER(CAST(d.title AS STRING)) LIKE LOWER(concat('%', :term, '%')) OR LOWER(CAST(d.description AS STRING)) LIKE LOWER(concat('%', :term, '%'))")
  List<Comic> findForSearchTerms(String term);

  @Query("SELECT c FROM Comic c WHERE c.editingMetadata = true")
  List<Comic> findComicsWithEditDetails(Pageable pageable);

  @Query(
      "SELECT s FROM SeriesDetail s WHERE s.id.publisher = :name AND LENGTH(s.id.series) > 0 and s.id.volume IS NOT NULL GROUP BY s.id.publisher, s.id.series, s.id.volume, s.inLibrary, s.totalIssues")
  List<SeriesDetail> getAllSeriesAndVolumesForPublisher(
      @Param("name") String name, Pageable pageable);

  @Query(
      "SELECT COUNT(c) FROM Comic c WHERE c.comicId NOT IN (SELECT s.comic.comicId FROM ComicMetadataSource s)")
  long getUnscrapedComicCount();

  @Query("SELECT d.filename FROM Comic d WHERE d.missing = :missing")
  Set<String> getAllComicDetailsByMissingFlag(@Param("missing") boolean missing);

  @Query(
      "SELECT COUNT(c) FROM Comic c WHERE c.comicId IN (SELECT p.comic.comicId FROM ComicPage p WHERE p.hash IS NULL OR LENGTH(p.hash) = 0)")
  List<Comic> findComicsWithUnhashedPages(Pageable of);

  @Query(
      "SELECT COUNT(c) FROM Comic c WHERE c.comicId IN (SELECT p.comic.comicId FROM ComicPage p WHERE p.hash IS NULL OR LENGTH(p.hash) = 0)")
  long findComicsWithUnhashedPagesCount();
}

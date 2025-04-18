/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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
import org.comixedproject.model.collections.SeriesDetail;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.net.library.PublisherAndYearSegment;
import org.comixedproject.model.net.library.RemoteLibrarySegmentState;
import org.springframework.data.domain.Limit;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ComicBookRepository extends JpaRepository<ComicBook, Long> {
  /**
   * Returns all comics not read by the specified user.
   *
   * @param userId the user's id
   * @return the list of comics
   */
  @Query(
      "SELECT d FROM ComicDetail d WHERE d.comicDetailId NOT IN (SELECT rcb FROM ComiXedUser u INNER JOIN u.readComicBooks rcb)")
  List<ComicDetail> findAllUnreadByUser(@Param("userId") long userId);

  /**
   * Finds a comic based on filename.
   *
   * @param filename the filename
   * @return the comic
   */
  @Query("SELECT c FROM ComicBook c WHERE c.comicDetail.filename = :filename")
  ComicBook findByFilename(@Param("filename") String filename);

  /**
   * Returns all comic entries for the given series name.
   *
   * @param series the series name
   * @return the list of comics
   */
  @Query("SELECT c FROM ComicBook c WHERE c.comicDetail.series = :series")
  List<ComicBook> findBySeries(@Param("series") String series);

  @Query(
      "SELECT c FROM ComicBook c LEFT JOIN FETCH c.comicDetail LEFT JOIN FETCH c.metadata mds LEFT JOIN FETCH c.pages WHERE c.comicBookId = :id")
  ComicBook getById(@Param("id") long id);

  @Query(
      "SELECT c.comicBookId FROM ComicBook c WHERE c.comicDetail.series = :series AND c.comicDetail.volume = :volume AND c.comicDetail.issueNumber <> :issueNumber AND c.comicDetail.coverDate <= :coverDate ORDER BY c.comicDetail.coverDate, c.comicDetail.issueNumber DESC")
  Long findPreviousComicBookIdInSeries(
      @Param("series") final String series,
      @Param("volume") final String volume,
      @Param("issueNumber") final String issueNumber,
      @Param("coverDate") final Date coverDate,
      final Limit limit);

  @Query(
      "SELECT c.comicBookId FROM ComicBook c WHERE c.comicDetail.series = :series AND c.comicDetail.volume = :volume AND c.comicDetail.issueNumber <> :issueNumber AND c.comicDetail.coverDate >= :coverDate ORDER BY c.comicDetail.coverDate, c.comicDetail.issueNumber ASC")
  Long findNextComicBookIdInSeries(
      @Param("series") String series,
      @Param("volume") String volume,
      @Param("issueNumber") String issueNumber,
      @Param("coverDate") Date coverDate,
      final Limit limit);

  @Query("SELECT c FROM ComicBook c ORDER BY c.comicBookId")
  List<ComicBook> findComicsToMove(Pageable pageable);

  /**
   * Returns all comics containing a page with the given hash.
   *
   * @param hash the page hash
   * @return the comic list
   */
  @Query(
      "SELECT c FROM ComicBook c WHERE c IN (SELECT p.comicBook FROM ComicPage p WHERE p.hash = :hash)")
  List<ComicBook> findComicsForPageHash(@Param("hash") String hash);

  /**
   * Loads all comics with the given state, ordered by last modified date.
   *
   * @param state the state
   * @param pageable the page request
   * @return the comics
   */
  @Query("SELECT c FROM ComicBook c WHERE c.comicDetail.comicState = :state")
  List<ComicBook> findForState(@Param("state") ComicState state, Pageable pageable);

  /**
   * Returns the number of comics with the given state value.
   *
   * @param state the state
   * @return the count
   */
  @Query("SELECT COUNT(c) FROM ComicBook c WHERE c.comicDetail.comicState = :state")
  long findForStateCount(@Param("state") ComicState state);

  /**
   * Returns unprocessed comics that have their file loaded flag turned off.
   *
   * @param pageable the page request
   * @return the list of comics
   */
  @Query("SELECT c FROM ComicBook c WHERE c.comicDetail.comicState = 'UNPROCESSED'")
  List<ComicBook> findUnprocessedComicsWithCreateMetadataFlagSet(Pageable pageable);

  /**
   * Returns comics that have not had their file contents loaded.
   *
   * @param pageable the page request
   * @return the list of comics
   */
  @Query("SELECT c FROM ComicBook c WHERE c.fileContentsLoaded IS FALSE")
  List<ComicBook> findComicsWithContentToLoad(Pageable pageable);

  /**
   * Returns the number of unprocessed comics without file contents loaded.
   *
   * @return the count
   */
  @Query(
      "SELECT COUNT(c) FROM ComicBook c WHERE c.comicDetail.comicState = 'UNPROCESSED' OR c.fileContentsLoaded IS FALSE")
  int findUnprocessedComicsWithoutContentCount();

  /**
   * Returns unprocessed comics that have been fully processed.
   *
   * @return the list of comics
   */
  @Query(
      "SELECT c FROM ComicBook c WHERE c.comicDetail.comicState = 'UNPROCESSED' AND c.fileContentsLoaded = true")
  List<ComicBook> findProcessedComics();

  /**
   * Returns comics that are waiting to have their metadata update flag set.
   *
   * @param pageable the page request
   * @return the list of comics
   */
  @Query("SELECT c FROM ComicBook c WHERE c.updateMetadata = true")
  List<ComicBook> findComicsWithMetadataToUpdate(Pageable pageable);

  /**
   * Returns comics that are marked to have their metadata batch processed.
   *
   * @param pageable the page request
   * @return the list of comics
   */
  @Query("SELECT c FROM ComicBook c WHERE c.batchMetadataUpdate = true")
  List<ComicBook> findComicsForBatchMetadataUpdate(Pageable pageable);

  /**
   * Returns the number of comics with the organizing flag set.
   *
   * @return the record count
   */
  @Query(
      "SELECT count(c) FROM ComicBook c WHERE c.organizing = true AND c.comicDetail.comicState != 'DELETED'")
  long findComicsToBeMovedCount();

  /**
   * Returns the number of comics with the recreating flag set.
   *
   * @return the record count
   */
  @Query(
      "SELECT count(c) FROM ComicBook c WHERE c.targetArchiveType IS NOT NULL AND c.comicDetail.comicState != 'DELETED'")
  long findComicsToBeRecreatedCount();

  /**
   * Returns comics that are marked to be recreated.
   *
   * @param pageable the page request
   * @return the list of comics
   */
  @Query("SELECT c FROM ComicBook c WHERE c.targetArchiveType IS NOT NULL")
  List<ComicBook> findComicsToRecreate(Pageable pageable);

  /**
   * Returns a single comic that matches the given criteria.
   *
   * @param publisher the publisher
   * @param series the series
   * @param volume the volume
   * @param issuesNumber the issue number
   * @return the comic
   */
  @Query(
      "SELECT d.comicBook FROM ComicDetail d WHERE d.publisher = :publisher AND d.series = :series AND d.volume = :volume and d.issueNumber = :issueNumber")
  List<ComicBook> findComic(
      @Param("publisher") String publisher,
      @Param("series") String series,
      @Param("volume") String volume,
      @Param("issueNumber") String issuesNumber);

  /**
   * Returns the distinct list of publisher names.
   *
   * @return the publisher names
   */
  @Query("SELECT DISTINCT d.publisher FROM ComicDetail d WHERE d.publisher IS NOT NULL")
  List<String> findDistinctPublishers();

  /**
   * Returns all comics with a given publisher.
   *
   * @param name the publisher's name
   * @return the comics
   */
  @Query("SELECT d FROM ComicDetail d WHERE d.publisher = :publisher")
  List<ComicDetail> findAllByPublisher(@Param("publisher") String name);

  /**
   * Returns the distinct list of series names.
   *
   * @return the series names
   */
  @Query("SELECT DISTINCT c.series FROM ComicDetail c WHERE c.series IS NOT NULL")
  List<String> findDistinctSeries();

  /**
   * Returns the list of all series along with the count of comics, grouped by publisher, name, and
   * volume.
   *
   * @return the series list
   */
  @Query(
      "SELECT s FROM SeriesDetail s WHERE LENGTH(s.id.publisher) > 0 AND LENGTH(s.id.series) > 0 and s.id.volume IS NOT NULL GROUP BY s.id.publisher, s.id.series, s.id.volume")
  List<SeriesDetail> getAllSeriesAndVolumes();

  /**
   * Returns the list of all series along with thei count of comics for a single publisher.
   *
   * @param name the publisher name
   * @return the series list
   */
  @Query(
      "SELECT s FROM SeriesDetail s WHERE s.id.publisher = :name AND LENGTH(s.id.series) > 0 and s.id.volume IS NOT NULL GROUP BY s.id.publisher, s.id.series, s.id.volume, s.inLibrary, s.totalIssues")
  List<SeriesDetail> getAllSeriesAndVolumesForPublisher(
      @Param("name") String name, Pageable pageable);

  /**
   * Returns all comics with a given series.
   *
   * @param name the series's name
   * @return the comics
   */
  @Query("SELECT c FROM ComicBook c WHERE c.comicDetail.series = :name")
  List<ComicBook> findAllBySeries(@Param("name") String name);

  /**
   * Returns the distinct list of character names.
   *
   * @return the character names
   */
  @Query("SELECT DISTINCT(t.value) FROM ComicTag t WHERE t.type = 'CHARACTER'")
  List<String> findDistinctCharacters();

  /**
   * Returns all comics with a given character.
   *
   * @param name the character's name
   * @return the comics
   */
  @Query(
      "SELECT d FROM ComicDetail d WHERE d.comicDetailId IN (SELECT t.comicDetail.comicDetailId FROM ComicTag t WHERE t.type = 'CHARACTER' AND t.value = :name) ORDER BY d.coverDate")
  List<ComicDetail> findAllByCharacters(@Param("name") String name);

  /**
   * Returns the distinct list of team names.
   *
   * @return the team names
   */
  @Query("SELECT DISTINCT(t.value) FROM ComicTag t WHERE t.type = 'TEAM'")
  List<String> findDistinctTeams();

  /**
   * Returns all comics with a given team.
   *
   * @param name the team's name
   * @return the comics
   */
  @Query(
      "SELECT d FROM ComicDetail d WHERE d IN (SELECT t.comicDetail FROM ComicTag t WHERE t.type = 'TEAM' AND t.value = :name) ORDER BY d.coverDate")
  List<ComicDetail> findAllByTeams(String name);

  /**
   * Returns the distinct list of location names.
   *
   * @return the location names
   */
  @Query("SELECT DISTINCT(t.value) FROM ComicTag t WHERE t.type = 'LOCATION'")
  List<String> findDistinctLocations();

  /**
   * Returns all comics with a given location.
   *
   * @param name the location's name
   * @return the comics
   */
  @Query(
      "SELECT d FROM ComicDetail d WHERE d IN (SELECT t.comicDetail FROM ComicTag t WHERE t.type = 'LOCATION' AND t.value = :name) ORDER BY d.coverDate")
  List<ComicDetail> findAllByLocations(String name);

  /**
   * Returns the distinct list of story names.
   *
   * @return the story names
   */
  @Query("SELECT DISTINCT(t.value) FROM ComicTag t WHERE t.type = 'STORY'")
  List<String> findDistinctStories();

  /**
   * Returns all comics with a given story.
   *
   * @param name the story's name
   * @return the comics
   */
  @Query(
      "SELECT d FROM ComicDetail d WHERE d IN (SELECT t.comicDetail FROM ComicTag t WHERE t.type = 'STORY' AND t.value = :name) ORDER BY d.coverDate")
  List<ComicDetail> findAllByStories(String name);

  /**
   * Returns the distinct list of publishers who have a story with given name.
   *
   * @param name the story name
   * @return the publishers
   */
  @Query(
      "SELECT DISTINCT d.publisher FROM ComicDetail d WHERE d.comicDetailId IN (SELECT t.comicDetail.comicDetailId FROM ComicTag t WHERE t.type = 'STORY' AND t.value = :name)")
  List<String> findDistinctPublishersForStory(@Param("name") String name);

  /**
   * Returns all comics that are marked for purging.
   *
   * @param pageable the page request
   * @return the comics
   */
  @Query(
      "SELECT c FROM ComicBook c WHERE c.purging = true AND c.comicDetail.comicState = 'DELETED'")
  List<ComicBook> findComicsMarkedForPurging(Pageable pageable);

  @Query(
      "SELECT COUNT(c) FROM ComicBook c WHERE c.purging IS TRUE AND c.comicDetail.comicState = 'DELETED'")
  long findComicsToPurgeCount();

  /**
   * Returns the individual year values for comics in the library.
   *
   * @return the list of years
   */
  @Query("SELECT DISTINCT(YEAR(d.coverDate)) FROM ComicDetail d WHERE d.coverDate IS NOT NULL")
  List<Integer> loadYearsWithComics();

  /**
   * Returns the individual weeks for the given year in the library.
   *
   * @param year the year
   * @return the week numbers
   */
  @Query(
      "SELECT DISTINCT(d.coverDate) FROM ComicDetail d WHERE d.coverDate IS NOT NULL AND YEAR(d.coverDate) = :year")
  List<Date> loadWeeksForYear(@Param("year") Integer year);

  /**
   * Retrieves all comics with a cover date within the given range.
   *
   * @param startDate the start date
   * @param endDate the end date
   * @return the list of comics
   */
  @Query(
      "SELECT c FROM ComicDetail c WHERE c.coverDate IS NOT NULL AND (c.coverDate >= :startDate AND c.coverDate <= :endDate)")
  List<ComicDetail> findWithCoverDateRange(
      @Param("startDate") Date startDate, @Param("endDate") Date endDate);

  /**
   * Retrieves all series names for the given publisher.
   *
   * @param publisher the publisher name
   * @return the series names
   */
  @Query(
      "SELECT DISTINCT d.series FROM ComicDetail d WHERE d.publisher = :publisher AND d.series IS NOT NULL")
  Set<String> getAllSeriesForPublisher(@Param("publisher") String publisher);

  /**
   * Retrieves all volumes for the given publisher and series.
   *
   * @param publisher the publisher name
   * @param series the series name
   * @return the volumes
   */
  @Query(
      "SELECT DISTINCT d.volume FROM ComicDetail d WHERE d.publisher = :publisher AND d.series = :series AND d.volume IS NOT NULL")
  Set<String> getAllVolumesForPublisherAndSeries(
      @Param("publisher") String publisher, @Param("series") String series);

  /**
   * Returns all comics for the given publisher, series, and volume.
   *
   * @param publisher the publisher name
   * @param series the series name
   * @param volume the volume
   * @return the comics
   */
  @Query(
      "SELECT d FROM ComicDetail d WHERE d.publisher = :publisher AND d.series=:series AND d.volume = :volume")
  List<ComicDetail> getAllComicBooksForPublisherAndSeriesAndVolume(
      @Param("publisher") String publisher,
      @Param("series") String series,
      @Param("volume") String volume);

  /**
   * Returns the publishers state for the library.
   *
   * @return the publishers state
   */
  @Query(
      "SELECT new org.comixedproject.model.net.library.RemoteLibrarySegmentState(d.publisher, COUNT(d)) FROM ComicDetail d WHERE d.publisher IS NOT NULL GROUP BY d.publisher")
  List<RemoteLibrarySegmentState> getPublishersState();

  /**
   * Returns the publishers state for the library.
   *
   * @return the publishers state
   */
  @Query(
      "SELECT new org.comixedproject.model.net.library.RemoteLibrarySegmentState(d.series, COUNT(d)) FROM ComicDetail d WHERE d.series IS NOT NULL GROUP BY d.series")
  List<RemoteLibrarySegmentState> getSeriesState();

  /**
   * Returns the character state for the library.
   *
   * @return the character state
   */
  @Query(
      "SELECT new org.comixedproject.model.net.library.RemoteLibrarySegmentState(t.value, COUNT(t)) FROM ComicTag t WHERE t.type = 'CHARACTER' GROUP BY t.value")
  List<RemoteLibrarySegmentState> getCharactersState();

  /**
   * Returns the team state for the library.
   *
   * @return the state state
   */
  @Query(
      "SELECT new org.comixedproject.model.net.library.RemoteLibrarySegmentState(t.value, COUNT(t)) FROM ComicTag t WHERE t.type = 'TEAM' GROUP BY t.value")
  List<RemoteLibrarySegmentState> getTeamsState();

  /**
   * Returns the location state for the library.
   *
   * @return the location state
   */
  @Query(
      "SELECT new org.comixedproject.model.net.library.RemoteLibrarySegmentState(t.value, COUNT(t)) FROM ComicTag t WHERE t.type = 'LOCATION' GROUP BY t.value")
  List<RemoteLibrarySegmentState> getLocationsState();

  /**
   * Returns the story state for the library.
   *
   * @return the story state
   */
  @Query(
      "SELECT new org.comixedproject.model.net.library.RemoteLibrarySegmentState(t.value, COUNT(t)) FROM ComicTag t WHERE t.type = 'STORY' GROUP BY t.value")
  List<RemoteLibrarySegmentState> getStoriesState();

  /**
   * Returns the publishers state for the library.
   *
   * @return the publishers state
   */
  @Query(
      "SELECT new org.comixedproject.model.net.library.RemoteLibrarySegmentState(CAST(d.comicState AS string), COUNT(d)) FROM ComicDetail d GROUP BY d.comicState")
  List<RemoteLibrarySegmentState> getComicBooksState();

  /**
   * Retrieves the number of comics per year and publisher from the library.
   *
   * @return the statistics
   */
  @Query(
      "SELECT new org.comixedproject.model.net.library.PublisherAndYearSegment(d.publisher, YEAR(d.coverDate), COUNT(d)) FROM ComicDetail d WHERE d.publisher IS NOT NULL AND d.coverDate IS NOT NULL GROUP BY d.publisher, YEAR(d.coverDate)")
  List<PublisherAndYearSegment> getByPublisherAndYear();

  /**
   * Returns the number of comics enqueued for metadata batch update
   *
   * @return the comic count
   */
  @Query("SELECT COUNT(c) FROM ComicBook c WHERE c.batchMetadataUpdate = true")
  long findComicsForBatchMetadataUpdateCount();

  /**
   * Performs a case-insensitive search for comics whose title or description contain the given
   * term.
   *
   * @param term the search term
   * @return the list of comics
   */
  @Query(
      "SELECT d FROM ComicDetail d JOIN FETCH d.comicBook WHERE LOWER(CAST(d.title AS STRING)) LIKE LOWER(concat('%', :term, '%')) OR LOWER(CAST(d.description AS STRING)) LIKE LOWER(concat('%', :term, '%'))")
  List<ComicDetail> findForSearchTerms(@Param("term") String term);

  /**
   * Returns comics that have their edit details flag set.
   *
   * @param pageable the request size
   * @return the comic list
   */
  @Query("SELECT c FROM ComicBook c WHERE c.editDetails = true")
  List<ComicBook> findComicsWithEditDetails(Pageable pageable);

  /**
   * Returns the number of records that do not have an related {@link
   * org.comixedproject.model.comicbooks.ComicMetadataSource} record.
   *
   * @return the record count
   */
  @Query(
      "SELECT COUNT(c) FROM ComicBook c WHERE c.comicBookId NOT IN (SELECT s.comicBook.comicBookId FROM ComicMetadataSource s)")
  long getUnscrapedComicCount();

  /**
   * Returns a set of comic books without an associated comic detail record.
   *
   * @param chunkSize the batch chunk size
   * @return the list of comic books
   */
  @Query(
      "SELECT c FROM ComicBook c WHERE c.comicBookId NOT IN (SELECT d.comicBook.comicBookId FROM ComicDetail d)")
  List<ComicBook> getComicBooksWithoutDetails(int chunkSize);

  @Modifying
  @Query(
      "UPDATE ComicBook c SET c.organizing = true WHERE c.comicBookId IN (:ids) AND c.organizing IS FALSE")
  void markForOrganizationById(@Param("ids") List<Long> ids);

  @Modifying
  @Query("UPDATE ComicBook c SET c.organizing = true")
  void markAllForOrganization();

  @Modifying
  @Query(
      "UPDATE ComicBook c SET c.targetArchiveType = :archiveType, c.renamePages = :renamePages, c.deletePages = :deletePages WHERE c.comicBookId IN (:ids)")
  void markForRecreationById(
      @Param("ids") List<Long> ids,
      @Param("archiveType") final ArchiveType archiveType,
      @Param("renamePages") final boolean renamePages,
      @Param("deletePages") final boolean deletePages);

  @Query("SELECT b FROM ComicBook b WHERE  b.comicBookId IN :comicDetailIds")
  List<ComicBook> loadByComicDetailId(@Param("comicDetailIds") List<Long> comicDetailIds);

  /**
   * Returns the number of unprocessed comic books.
   *
   * @return the list of comic books
   */
  @Query(
      "SELECT COUNT(b) FROM ComicBook b WHERE b.comicBookId IN (select d.comicBook.comicBookId FROM ComicDetail d WHERE d.comicState = 'UNPROCESSED')")
  long getUnprocessedComicBookCount();

  @Modifying
  @Query(
      "UPDATE ComicBook c SET c.updateMetadata = true WHERE c.comicBookId IN (:ids) AND c.updateMetadata IS FALSE")
  void prepareForMetadataUpdate(@Param("ids") List<Long> ids);

  @Query("SELECT COUNT(c) FROM ComicBook c WHERE c.updateMetadata IS TRUE")
  long getUpdateMetadataCount();

  @Query("SELECT COUNT(c) FROM ComicBook c WHERE c.targetArchiveType IS NOT NULL")
  long getRecreatingCount();

  @Modifying
  @Query(
      "UPDATE ComicBook c SET c.batchScraping = true WHERE c.comicBookId IN (:ids) AND c.batchScraping IS FALSE AND c.metadata IS NOT NULL")
  void prepareForBatchScraping(@Param("ids") List<Long> ids);

  /**
   * Returns a subset of comic filenames based on the previously marked missing status.
   *
   * @param missing the missing flag
   * @return the filenames
   */
  @Query("SELECT d.filename FROM ComicDetail d WHERE d.missing = :missing")
  Set<String> getComicFilenames(@Param("missing") boolean missing);

  /**
   * Returns the number of comic books that are marked for an can be batch scraped.
   *
   * @return the count
   */
  @Query(
      "SELECT COUNT(c) FROM ComicBook c WHERE c.batchScraping IS TRUE AND c.metadata IS NOT NULL")
  long getBatchScrapingCount();

  /**
   * Returns a subset of comic books marked for batch scraping. Only comic books with the batch
   * scraping flag set and which have a metadata source are returned.
   *
   * @param pageable the page request
   * @return the comic books
   */
  @Query("SELECT c FROM ComicBook c WHERE c.batchScraping IS TRUE AND c.metadata IS NOT NULL")
  List<ComicBook> findBatchScrapingComics(Pageable pageable);

  /**
   * Returns all comic book record ids.
   *
   * @return the id list
   */
  @Query("SELECT c.comicBookId FROM ComicBook c")
  List<Long> getAllIds();

  /** Sets the purging flag for all comics int he DELETED state. */
  @Modifying
  @Query("UPDATE ComicBook c SET c.purging = true WHERE c.comicDetail.comicState = 'DELETED'")
  void prepareComicBooksForDeleting();

  /**
   * Clears the organizing flag for the specified comic book.
   *
   * @param comicBookId the comic book id
   */
  @Modifying
  @Query("UPDATE ComicBook c SET c.organizing = false WHERE c.comicBookId = :comicBookId")
  void clearOrganizingFlag(@Param("comicBookId") Long comicBookId);
}

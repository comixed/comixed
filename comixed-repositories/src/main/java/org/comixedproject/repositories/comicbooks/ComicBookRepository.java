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
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.net.library.PublisherAndYearSegment;
import org.comixedproject.model.net.library.RemoteLibrarySegmentState;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
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
      "SELECT c FROM ComicBook c WHERE c.id NOT IN (SELECT r.comicBook.id FROM LastRead r WHERE r.user.id = :userId)")
  List<ComicBook> findAllUnreadByUser(@Param("userId") long userId);

  /**
   * Finds a comic based on filename.
   *
   * @param filename the filename
   * @return the comic
   */
  ComicBook findByFilename(String filename);

  /**
   * Returns all comic entries for the given series name.
   *
   * @param series the series name
   * @return the list of comics
   */
  List<ComicBook> findBySeries(String series);

  @Query(
      "SELECT c FROM ComicBook c LEFT JOIN FETCH c.metadata mds LEFT JOIN FETCH c.pages WHERE c.id = :id")
  ComicBook getById(@Param("id") long id);

  @Query(
      "SELECT c FROM ComicBook c WHERE c.series = :series AND c.volume = :volume AND c.issueNumber <> :issueNumber AND c.coverDate <= :coverDate ORDER BY c.coverDate,c.issueNumber DESC")
  List<ComicBook> findIssuesBeforeComic(
      @Param("series") final String series,
      @Param("volume") final String volume,
      @Param("issueNumber") final String issueNumber,
      @Param("coverDate") final Date coverDate);

  @Query(
      "SELECT c FROM ComicBook c WHERE c.series = :series AND c.volume = :volume AND c.issueNumber <> :issueNumber AND c.coverDate >= :coverDate ORDER BY c.coverDate,c.issueNumber ASC")
  List<ComicBook> findIssuesAfterComic(
      @Param("series") String series,
      @Param("volume") String volume,
      @Param("issueNumber") String issueNumber,
      @Param("coverDate") Date coverDate);

  @Query("SELECT c FROM ComicBook c ORDER BY c.id")
  List<ComicBook> findComicsToMove(Pageable pageable);

  /**
   * Returns a page of {@link ComicBook} objects with an id greater than the supplied threshold.
   *
   * @param threshold the threshold id
   * @param page the page parameter
   * @return the list of comics
   */
  @Query("SELECT c FROM ComicBook c WHERE c.id > :threshold ORDER BY c.id")
  List<ComicBook> findComicsWithIdGreaterThan(@Param("threshold") Long threshold, Pageable page);

  /**
   * Returns all comics containing a page with the given hash.
   *
   * @param hash the page hash
   * @return the comic list
   */
  @Query(
      "SELECT c FROM ComicBook c WHERE c IN (SELECT p.comicBook FROM Page p WHERE p.hash = :hash)")
  List<ComicBook> findComicsForPageHash(@Param("hash") String hash);

  /**
   * Loads all comics, ordered by date added.
   *
   * @return the list of comics
   */
  @Query("SELECT c FROM ComicBook c ORDER BY c.dateAdded")
  List<ComicBook> loadComicList();

  /**
   * Loads all comics with the given state, ordered by last modified date.
   *
   * @param state the state
   * @param pageable the page request
   * @return the comics
   */
  @Query("SELECT c FROM ComicBook c WHERE c.comicState = :state")
  List<ComicBook> findForState(@Param("state") ComicState state, Pageable pageable);

  /**
   * Returns the number of comics with the given state value.
   *
   * @param state the state
   * @return the count
   */
  @Query("SELECT COUNT(c) FROM ComicBook c WHERE c.comicState = :state")
  long findForStateCount(@Param("state") ComicState state);

  /**
   * Returns unprocessed comics that have their file loaded flag turned off.
   *
   * @param pageable the page request
   * @return the list of comics
   */
  @Query(
      "SELECT c FROM ComicBook c WHERE c.comicState = 'UNPROCESSED' AND c.createMetadataSource = true")
  List<ComicBook> findUnprocessedComicsWithCreateMetadataFlagSet(Pageable pageable);

  /**
   * Returns unprocessed comics that have their file loaded flag turned off.
   *
   * @param pageable the page request
   * @return the list of comics
   */
  @Query(
      "SELECT c FROM ComicBook c WHERE c.comicState = 'UNPROCESSED' AND c.fileContentsLoaded = false")
  List<ComicBook> findUnprocessedComicsWithoutContent(Pageable pageable);

  /**
   * Returns the number of unprocessed comics without file contents loaded.
   *
   * @return the count
   */
  @Query(
      "SELECT COUNT(c) FROM ComicBook c WHERE c.comicState = 'UNPROCESSED' AND c.fileContentsLoaded = false")
  int findUnprocessedComicsWithoutContentCount();

  /**
   * Returns the number of comics with the create metadata source flag set.
   *
   * @return the count
   */
  @Query(
      "SELECT COUNT(c) FROM ComicBook c WHERE c.comicState = 'UNPROCESSED' AND c.createMetadataSource = true")
  int findComicsWithCreateMeatadataSourceFlag();

  /**
   * Returns unprocessed comics that have their blocked pages marked flag turned off.
   *
   * @param pageable the page request
   * @return the list of comics
   */
  @Query(
      "SELECT c FROM ComicBook c WHERE c.comicState = 'UNPROCESSED' AND c.fileContentsLoaded = true AND c.blockedPagesMarked = false")
  List<ComicBook> findUnprocessedComicsForMarkedPageBlocking(Pageable pageable);

  /**
   * Returns the number of unprocessed comics for page blocking.
   *
   * @return the count
   */
  @Query(
      "SELECT COUNT(c) FROM ComicBook c WHERE c.comicState = 'UNPROCESSED' AND c.fileContentsLoaded = true AND c.blockedPagesMarked = false")
  int findUnprocessedComicsForMarkedPageBlockingCount();

  /**
   * Returns unprocessed comics without file details.
   *
   * @param pageable the page request
   * @return the list of comics
   */
  @Query(
      "SELECT c FROM ComicBook c WHERE c.comicState = 'UNPROCESSED' AND c.fileContentsLoaded = true AND c.blockedPagesMarked = true AND c.id NOT IN (SELECT d.comicBook.id FROM ComicFileDetails d)")
  List<ComicBook> findUnprocessedComicsWithoutFileDetails(Pageable pageable);

  /**
   * Returns the number of comics without match file detail records.
   *
   * @return the count
   */
  @Query(
      "SELECT COUNT(c) FROM ComicBook c WHERE c.comicState = 'UNPROCESSED' AND c.fileContentsLoaded = true AND c.blockedPagesMarked = true AND c.id NOT IN (SELECT d.comicBook.id FROM ComicFileDetails d)")
  int findUnprocessedComicsWithoutFileDetailsCount();

  /**
   * Returns unprocessed comics that have been fully processed.
   *
   * @param pageable the page request
   * @return the list of comics
   */
  @Query(
      "SELECT c FROM ComicBook c LEFT JOIN FETCH c.fileDetails fd WHERE c.comicState = 'UNPROCESSED' AND c.fileContentsLoaded = true AND c.blockedPagesMarked = true")
  List<ComicBook> findProcessedComics(Pageable pageable);

  /**
   * Returns the numboer of unprocessed comics.
   *
   * @return the count
   */
  @Query(
      "SELECT COUNT(c) FROM ComicBook c WHERE c.comicState = 'UNPROCESSED' AND c.fileContentsLoaded = true AND c.blockedPagesMarked = true")
  int findProcessedComicsCount();

  /**
   * Returns comics that are waiting to have their metadata update flag set.
   *
   * @param pageable the page request
   * @return the list of comics
   */
  @Query("SELECT c FROM ComicBook c WHERE c.comicState = 'CHANGED' AND c.updateMetadata = true")
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
   * Returns comics that are in the deleted state.
   *
   * @param pageable the page request
   * @return the list of comics
   */
  @Query("SELECT c FROM ComicBook c WHERE c.comicState = 'DELETED'")
  List<ComicBook> findComicsMarkedForDeletion(Pageable pageable);

  /**
   * Returns all comics with the consolidating flag set.
   *
   * @param pageable the page request
   * @return the list of comics
   */
  @Query("SELECT c FROM ComicBook c WHERE c.consolidating = true AND c.comicState != 'DELETED'")
  List<ComicBook> findComicsToBeMoved(Pageable pageable);

  /**
   * Returns a single comic with all reading lists in which it is found.
   *
   * @param id the record id
   * @return the comic
   */
  @Query("SELECT c FROM ComicBook c LEFT JOIN FETCH c.readingLists l WHERE c.id = :id")
  ComicBook getByIdWithReadingLists(@Param("id") long id);

  /**
   * Returns comics that are marked to be recreated.
   *
   * @param pageable the page request
   * @return the list of comics
   */
  @Query("SELECT c FROM ComicBook c WHERE c.recreating = true")
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
      "SELECT c FROM ComicBook c WHERE c.publisher = :publisher AND c.series = :series AND c.volume = :volume and c.issueNumber = :issueNumber")
  ComicBook findComic(
      @Param("publisher") String publisher,
      @Param("series") String series,
      @Param("volume") String volume,
      @Param("issueNumber") String issuesNumber);

  /**
   * Returns the distinct list of publisher names.
   *
   * @return the publisher names
   */
  @Query("SELECT DISTINCT c.publisher FROM ComicBook c WHERE c.publisher IS NOT NULL")
  List<String> findDistinctPublishers();

  /**
   * Returns all comics with a given publisher.
   *
   * @param name the publisher's name
   * @return the comics
   */
  List<ComicBook> findAllByPublisher(String name);

  /**
   * Returns the distinct list of series names.
   *
   * @return the series names
   */
  @Query("SELECT DISTINCT c.series FROM ComicBook c WHERE c.series IS NOT NULL")
  List<String> findDistinctSeries();

  /**
   * Returns all comics with a given series.
   *
   * @param name the series's name
   * @return the comics
   */
  List<ComicBook> findAllBySeries(String name);

  /**
   * Returns the distinct list of character names.
   *
   * @return the character names
   */
  @Query("SELECT DISTINCT(ch) FROM ComicBook c JOIN c.characters ch")
  List<String> findDistinctCharacters();

  /**
   * Returns all comics with a given character.
   *
   * @param name the character's name
   * @return the comics
   */
  List<ComicBook> findAllByCharacters(String name);

  /**
   * Returns the distinct list of team names.
   *
   * @return the team names
   */
  @Query("SELECT DISTINCT(t) FROM ComicBook c JOIN c.teams t")
  List<String> findDistinctTeams();

  /**
   * Returns all comics with a given team.
   *
   * @param name the team's name
   * @return the comics
   */
  List<ComicBook> findAllByTeams(String name);

  /**
   * Returns the distinct list of location names.
   *
   * @return the location names
   */
  @Query("SELECT DISTINCT(l) FROM ComicBook c JOIN c.locations l")
  List<String> findDistinctLocations();

  /**
   * Returns all comics with a given location.
   *
   * @param name the location's name
   * @return the comics
   */
  List<ComicBook> findAllByLocations(String name);

  /**
   * Returns the distinct list of story names.
   *
   * @return the story names
   */
  @Query("SELECT DISTINCT(s) FROM ComicBook c JOIN c.stories s")
  List<String> findDistinctStories();

  /**
   * Returns all comics with a given story.
   *
   * @param name the story's name
   * @return the comics
   */
  List<ComicBook> findAllByStories(String name);

  /**
   * Returns the distinct list of publishers who have a story with given name.
   *
   * @param name the story name
   * @return the publishers
   */
  @Query(
      "SELECT DISTINCT c.publisher FROM ComicBook c JOIN c.stories WHERE :name MEMBER OF c.stories")
  List<String> findDistinctPublishersForStory(@Param("name") String name);

  /**
   * Returns all comics that are marked for purging.
   *
   * @param pageable the page request
   * @return the comics
   */
  @Query("SELECT c FROM ComicBook c WHERE c.purgeComic = true")
  List<ComicBook> findComicsMarkedForPurging(Pageable pageable);

  /**
   * Returns the individual year values for comics in the library.
   *
   * @return the list of years
   */
  @Query("SELECT DISTINCT(YEAR(c.coverDate)) FROM ComicBook c WHERE c.coverDate IS NOT NULL")
  List<Integer> loadYearsWithComics();

  /**
   * Returns the individual weeks for the given year in the library.
   *
   * @param year the year
   * @return the week numbers
   */
  @Query(
      "SELECT DISTINCT(c.coverDate) FROM ComicBook c WHERE c.coverDate IS NOT NULL AND YEAR(c.coverDate) = :year")
  List<Date> loadWeeksForYear(@Param("year") Integer year);

  /**
   * Retrieves all comics with a cover date within the given range.
   *
   * @param startDate the start date
   * @param endDate the end date
   * @return the list of comics
   */
  @Query(
      "SELECT c FROM ComicBook c WHERE c.coverDate IS NOT NULL AND (c.coverDate >= :startDate AND c.coverDate <= :endDate)")
  List<ComicBook> findWithCoverDateRange(
      @Param("startDate") Date startDate, @Param("endDate") Date endDate);

  /**
   * Retrieves all series names for the given publisher.
   *
   * @param publisher the publisher name
   * @return the series names
   */
  @Query(
      "SELECT DISTINCT c.series FROM ComicBook c WHERE c.publisher = :publisher AND c.series IS NOT NULL")
  Set<String> getAllSeriesForPublisher(@Param("publisher") String publisher);

  /**
   * Retrieves all volumes for the given publisher and series.
   *
   * @param publisher the publisher name
   * @param series the series name
   * @return the volumes
   */
  @Query(
      "SELECT DISTINCT c.volume FROM ComicBook c WHERE c.publisher = :publisher AND c.series = :series AND c.volume IS NOT NULL")
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
      "SELECT c FROM ComicBook c WHERE c.publisher = :publisher AND c.series=:series AND c.volume = :volume")
  List<ComicBook> getAllComicBooksForPublisherAndSeriesAndVolume(
      @Param("publisher") String publisher,
      @Param("series") String series,
      @Param("volume") String volume);

  /**
   * Returns all volumes for the given series name.
   *
   * @param series the series name
   * @return the volumes
   */
  @Query("SELECT DISTINCT c.volume FROM ComicBook c WHERE c.series = :series")
  Set<String> findDistinctVolumesForSeries(@Param("series") String series);

  /**
   * Returns all comics for the given series and volume.
   *
   * @param series the series name
   * @param volume the volume
   * @return the comics
   */
  @Query("SELECT c FROM ComicBook c WHERE c.series = :series AND c.volume = :volume")
  List<ComicBook> getAllComicBooksForSeriesAndVolume(
      @Param("series") String series, @Param("volume") String volume);

  /**
   * Returns the number of comics that are unscraped.
   *
   * @return the unscraped comic count
   */
  long countByMetadataIsNull();

  /**
   * Returns the publishers state for the library.
   *
   * @return the publishers state
   */
  @Query(
      "SELECT new org.comixedproject.model.net.library.RemoteLibrarySegmentState(c.publisher, COUNT(c)) FROM ComicBook c WHERE c.publisher IS NOT NULL GROUP BY c.publisher")
  List<RemoteLibrarySegmentState> getPublishersState();

  /**
   * Returns the publishers state for the library.
   *
   * @return the publishers state
   */
  @Query(
      "SELECT new org.comixedproject.model.net.library.RemoteLibrarySegmentState(c.series, COUNT(c)) FROM ComicBook c WHERE c.series IS NOT NULL GROUP BY c.series")
  List<RemoteLibrarySegmentState> getSeriesState();

  /**
   * Returns the publishers state for the library.
   *
   * @return the publishers state
   */
  @Query(
      "SELECT new org.comixedproject.model.net.library.RemoteLibrarySegmentState(cc, COUNT(c)) FROM ComicBook c JOIN c.characters cc GROUP BY cc")
  List<RemoteLibrarySegmentState> getCharactersState();

  /**
   * Returns the publishers state for the library.
   *
   * @return the publishers state
   */
  @Query(
      "SELECT new org.comixedproject.model.net.library.RemoteLibrarySegmentState(ct, COUNT(c)) FROM ComicBook c JOIN c.teams ct GROUP BY ct")
  List<RemoteLibrarySegmentState> getTeamsState();

  /**
   * Returns the publishers state for the library.
   *
   * @return the publishers state
   */
  @Query(
      "SELECT new org.comixedproject.model.net.library.RemoteLibrarySegmentState(cl, COUNT(c)) FROM ComicBook c JOIN c.locations cl GROUP BY cl")
  List<RemoteLibrarySegmentState> getLocationsState();

  /**
   * Returns the publishers state for the library.
   *
   * @return the publishers state
   */
  @Query(
      "SELECT new org.comixedproject.model.net.library.RemoteLibrarySegmentState(cs, COUNT(c)) FROM ComicBook c JOIN c.stories cs GROUP BY cs")
  List<RemoteLibrarySegmentState> getStoriesState();

  /**
   * Returns the publishers state for the library.
   *
   * @return the publishers state
   */
  @Query(
      "SELECT new org.comixedproject.model.net.library.RemoteLibrarySegmentState(CAST(c.comicState AS text), COUNT(c)) FROM ComicBook c GROUP BY c.comicState")
  List<RemoteLibrarySegmentState> getComicBooksState();

  /**
   * Retrieves the number of comics per year and publisher from the library.
   *
   * @return the statistics
   */
  @Query(
      "SELECT new org.comixedproject.model.net.library.PublisherAndYearSegment(c.publisher, YEAR(c.coverDate), COUNT(c)) FROM ComicBook c WHERE c.publisher IS NOT NULL AND c.coverDate IS NOT NULL GROUP BY c.publisher, YEAR(c.coverDate)")
  List<PublisherAndYearSegment> getByPublisherAndYear();

  /**
   * Returns the number of comics enqueued for metadata batch update
   *
   * @return the comic count
   */
  @Query("SELECT COUNT(c) FROM ComicBook c WHERE c.batchMetadataUpdate = true")
  long findComicsForBatchMetadataUpdateCount();
}

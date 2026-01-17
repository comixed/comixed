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
import org.comixedproject.model.collections.CollectionEntry;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * <code>ComicDetailRepository</code> works directly with persisted instances of {@link
 * ComicDetail}.
 *
 * @author Darryl L. Pierce
 */
@Repository
public interface ComicDetailRepository extends JpaRepository<ComicDetail, Long> {
  /**
   * Returns all comic book record ids.
   *
   * @return the id list
   */
  @Query("SELECT c.comicDetailId FROM ComicDetail c")
  List<Long> getAllIds();

  /**
   * Returns the set of all cover dates for comics that have not been read by the specified user.
   *
   * @param email the user's email
   * @return the cover dates
   */
  @Query(
      "SELECT DISTINCT d.coverDate FROM ComicDetail d WHERE d.coverDate IS NOT NULL AND d.comicDetailId NOT IN (SELECT rcb FROM ComiXedUser u INNER JOIN u.readComicBooks rcb WHERE u.email = :email)")
  Set<Date> getAllUnreadCoverDates(@Param("email") String email);

  /**
   * Returns the set of all cover dates.
   *
   * @return the cover dates
   */
  @Query("SELECT DISTINCT d.coverDate FROM ComicDetail d WHERE d.coverDate IS NOT NULL")
  Set<Date> getAllCoverDates();

  @Query(
      "SELECT d FROM ComicDetail d WHERE d.coverDate IS NOT NULL AND d.coverDate = :coverDate AND d.comicDetailId NOT IN (SELECT rcb FROM ComiXedUser u INNER JOIN u.readComicBooks rcb WHERE u.email = :email)")
  List<ComicDetail> getAllUnreadComicsForCoverDate(
      @Param("coverDate") Date coverDate, @Param("email") String email);

  @Query("SELECT d FROM ComicDetail d WHERE d.coverDate IS NOT NULL AND d.coverDate = :coverDate")
  List<ComicDetail> getAllComicsForCoverDate(@Param("coverDate") Date coverDate);

  /**
   * Returns the set of all publishers with comics that have not been read by the specified user.
   *
   * @param email the user's email
   * @return the publishers
   */
  @Query(
      "SELECT DISTINCT d.publisher FROM ComicDetail d WHERE d.publisher IS NOT NULL AND LENGTH(d.publisher) > 0 AND d.comicDetailId NOT IN (SELECT rcb FROM ComiXedUser u INNER JOIN u.readComicBooks rcb WHERE u.email = :email)")
  Set<String> getAllUnreadPublishers(@Param("email") String email);

  /**
   * Returns the set of all publishers.
   *
   * @return the publishers
   */
  @Query(
      "SELECT DISTINCT d.publisher FROM ComicDetail d WHERE d.publisher IS NOT NULL AND LENGTH(d.publisher) > 0")
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
      "SELECT DISTINCT d.series FROM ComicDetail d WHERE d.publisher = :publisher AND d.series IS NOT NULL AND d.comicDetailId NOT IN (SELECT rcb FROM ComiXedUser u INNER JOIN u.readComicBooks rcb WHERE u.email = :email)")
  Set<String> getAllUnreadSeriesForPublisher(
      @Param("publisher") String publisher, @Param("email") String email);

  /**
   * Returns the set of all series for the given publisher.
   *
   * @param publisher the publisher
   * @return the series
   */
  @Query(
      "SELECT DISTINCT d.series FROM ComicDetail d WHERE d.publisher = :publisher AND d.series IS NOT NULL")
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
      "SELECT DISTINCT d.volume FROM ComicDetail d WHERE d.publisher = :publisher AND d.series = :series AND d.series IS NOT NULL AND d.comicDetailId NOT IN (SELECT rcb FROM ComiXedUser u INNER JOIN u.readComicBooks rcb WHERE u.email = :email)")
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
      "SELECT DISTINCT d.volume FROM ComicDetail d WHERE d.publisher = :publisher AND d.series = :series AND d.volume IS NOT NULL")
  Set<String> getAllVolumesForPublisherAndSeries(
      @Param("publisher") String publisher, @Param("series") String series);

  /**
   * Returns the set of all series with comics that have not been read by the specified user.
   *
   * @param email the user's email
   * @return the series
   */
  @Query(
      "SELECT DISTINCT d.series FROM ComicDetail d WHERE d.series IS NOT NULL AND LENGTH(d.series) > 0 AND d.comicDetailId NOT IN (SELECT rcb FROM ComiXedUser u INNER JOIN u.readComicBooks rcb WHERE u.email = :email)")
  Set<String> getAllUnreadSeries(@Param("email") String email);

  /**
   * Returns the set of all series.
   *
   * @return the series
   */
  @Query(
      "SELECT DISTINCT d.series FROM ComicDetail d WHERE d.series IS NOT NULL AND LENGTH(d.series) > 0")
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
      "SELECT DISTINCT d.publisher FROM ComicDetail d WHERE d.series = :series AND d.publisher IS NOT NULL AND d.comicDetailId NOT IN (SELECT rcb FROM ComiXedUser u INNER JOIN u.readComicBooks rcb WHERE u.email = :email)")
  Set<String> getAllUnreadPublishersForSeries(
      @Param("series") String series, @Param("email") String email);

  /**
   * Returns the set of publishers for the given series.
   *
   * @param series the series
   * @return the volumes
   */
  @Query(
      "SELECT DISTINCT d.publisher FROM ComicDetail d WHERE d.series = :series AND d.publisher IS NOT NULL")
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
      "SELECT d FROM ComicDetail d WHERE d.publisher = :publisher AND d.series = :series AND d.volume = :volume AND d.comicDetailId NOT IN (SELECT rcb FROM ComiXedUser u INNER JOIN u.readComicBooks rcb WHERE u.email = :email) ORDER BY d.coverDate")
  List<ComicDetail> getAllUnreadForPublisherAndSeriesAndVolume(
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
      "SELECT d FROM ComicDetail d WHERE d.publisher = :publisher AND d.series = :series AND d.volume = :volume ORDER BY d.coverDate")
  List<ComicDetail> getAllForPublisherAndSeriesAndVolume(
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
      "SELECT DISTINCT t.value FROM ComicTag t WHERE t.type = :tagType AND t.comicDetail.comicDetailId NOT IN (SELECT rcb FROM ComiXedUser u INNER JOIN u.readComicBooks rcb WHERE u.email = :email)")
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
      "SELECT DISTINCT YEAR(d.coverDate) FROM ComicDetail d WHERE d.coverDate IS NOT NULL AND d.comicDetailId NOT IN (SELECT rcb FROM ComiXedUser u INNER JOIN u.readComicBooks rcb WHERE u.email = :email)")
  Set<Integer> getAllUnreadYears(@Param("email") String email);

  /**
   * Returns all years.
   *
   * @return the years
   */
  @Query("SELECT DISTINCT YEAR(d.coverDate) FROM ComicDetail d WHERE d.coverDate IS NOT NULL")
  Set<Integer> getAllYears();

  /**
   * Returns all weeks for the given year that do not have a read entry for the given user.
   *
   * @param year the year
   * @param email the user's email
   * @return the matching weeks
   */
  @Query(
      "SELECT DISTINCT d.coverDate FROM ComicDetail d WHERE d.coverDate IS NOT NULL AND year(d.coverDate) = :year AND d.comicDetailId NOT IN (SELECT rcb FROM ComiXedUser u INNER JOIN u.readComicBooks rcb WHERE u.email = :email)")
  Set<Date> getAllUnreadWeeksForYear(@Param("year") int year, @Param("email") String email);

  /**
   * Returns all weeks for the given year
   *
   * @param year the year
   * @return the matching weeks
   */
  @Query(
      "SELECT DISTINCT d.coverDate FROM ComicDetail d WHERE d.coverDate IS NOT NULL AND year(d.coverDate) = :year")
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
      "SELECT d FROM ComicDetail d WHERE d.coverDate IS NOT NULL AND d.coverDate IS NOT NULL AND d.coverDate >= :startDate AND d.coverDate <= :endDate AND d.comicBook.comicDetail.comicDetailId NOT IN (SELECT rcb FROM ComiXedUser u INNER JOIN u.readComicBooks rcb WHERE u.email = :email) ORDER BY d.comicBook")
  List<ComicDetail> getAllUnreadForYearAndWeek(
      @Param("startDate") Date startDate,
      @Param("endDate") Date endDate,
      @Param("email") String email);

  @Query(
      "SELECT d FROM ComicDetail d WHERE d.coverDate IS NOT NULL AND d.coverDate IS NOT NULL AND d.coverDate >= :startDate AND d.coverDate <= :endDate ORDER BY d.comicBook")
  List<ComicDetail> getAllForYearAndWeek(
      @Param("startDate") Date startDate, @Param("endDate") Date endDate);

  /**
   * Returns all comics that match the given search term.
   *
   * @param term the search term
   * @return the matching records
   */
  @Query(
      "SELECT d FROM ComicDetail d JOIN FETCH d.comicBook WHERE LOWER(CAST(d.title AS STRING)) LIKE LOWER(concat('%', :term, '%')) OR LOWER(CAST(d.description AS STRING)) LIKE LOWER(concat('%', :term, '%'))")
  List<ComicDetail> getForSearchTerm(@Param("term") String term);

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
      "SELECT d FROM ComicDetail d WHERE d IN (SELECT t.comicDetail FROM ComicTag t WHERE t.type = :tagType AND t.value = :tagValue) AND d.comicDetailId NOT IN (SELECT rcb FROM ComiXedUser u INNER JOIN u.readComicBooks rcb WHERE u.email = :email)")
  List<ComicDetail> getAllUnreadComicsForTagType(
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
      "SELECT d FROM ComicDetail d WHERE d IN (SELECT t.comicDetail FROM ComicTag t WHERE t.type = :tagType AND t.value = :tagValue)")
  List<ComicDetail> getAllComicsForTagType(
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

  @Query("SELECT d FROM ComicDetail d WHERE d.comicBook.comicBookId = :comicBookId")
  ComicDetail findByComicBookId(@Param("comicBookId") Long comicBookId);

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
      "SELECT COUNT(DISTINCT t.comicDetail.comicDetailId) FROM ComicTag t WHERE t.type = :tagType AND t.value = :tagValue")
  long getComicCountForTagTypeAndValue(
      @Param("tagType") ComicTagType tagType, @Param("tagValue") String tagValue);

  /**
   * Returns the number of distinct series for a publisher.
   *
   * @param name the publisher
   * @return the count
   */
  @Query(
      "SELECT COUNT(DISTINCT d.series, d.volume) FROM ComicDetail d WHERE LENGTH(d.publisher) > 0 AND d.publisher = :name")
  long getSeriesCountForPublisher(@Param("name") String name);

  /**
   * Updates the filename for the given comic detail.
   *
   * @param comicDetailId the comic detail id.
   * @param updatedFilename the updated filename
   */
  @Modifying
  @Query(
      "UPDATE ComicDetail d SET d.filename = :updatedFilename WHERE d.comicDetailId = :comicDetailId")
  void updateFilename(
      @Param("comicDetailId") Long comicDetailId, @Param("updatedFilename") String updatedFilename);

  @Query(
      "SELECT d FROM ComicDetail d WHERE d.comicBook.comicBookId IN (SELECT l.entryIds FROM ReadingList l WHERE l.readingListId = :readingListId)")
  List<ComicDetail> getAllComicsForReadingList(
      @Param("email") String email, @Param("readingListId") Long readingListId);
}

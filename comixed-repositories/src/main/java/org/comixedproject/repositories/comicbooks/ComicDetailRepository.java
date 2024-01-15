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
   * Returns a set of records with an id greater than the one provided.
   *
   * @param lastId the last id
   * @param pageRequest the page parameter
   * @return the records
   */
  @Query("SELECT d FROM ComicDetail d WHERE d.id > :lastId ORDER BY d.id")
  List<ComicDetail> getWithIdGreaterThan(@Param("lastId") Long lastId, Pageable pageRequest);

  /**
   * Returns the set of all publishers with comics that have not been read by the specified user.
   *
   * @param email the user's email
   * @return the publishers
   */
  @Query(
      "SELECT DISTINCT d.publisher FROM ComicDetail d WHERE d.publisher IS NOT NULL AND d NOT IN (SELECT r.comicDetail FROM LastRead r WHERE r.user.email = :email)")
  Set<String> getAllUnreadPublishers(@Param("email") String email);

  /**
   * Returns the set of all publishers.
   *
   * @return the publishers
   */
  @Query("SELECT DISTINCT d.publisher FROM ComicDetail d WHERE d.publisher IS NOT NULL")
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
      "SELECT DISTINCT d.series FROM ComicDetail d WHERE d.publisher = :publisher AND d.series IS NOT NULL AND d NOT IN (SELECT r.comicDetail FROM LastRead r WHERE r.user.email = :email)")
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
      "SELECT DISTINCT d.volume FROM ComicDetail d WHERE d.publisher = :publisher AND d.series = :series AND d.series IS NOT NULL AND d NOT IN (SELECT r.comicDetail FROM LastRead r WHERE r.user.email = :email)")
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
      "SELECT DISTINCT d.series FROM ComicDetail d WHERE d.series IS NOT NULL AND d NOT IN (SELECT r.comicDetail FROM LastRead r WHERE r.user.email = :email)")
  Set<String> getAllUnreadSeries(@Param("email") String email);

  /**
   * Returns the set of all series.
   *
   * @return the series
   */
  @Query("SELECT DISTINCT d.series FROM ComicDetail d WHERE d.series IS NOT NULL")
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
      "SELECT DISTINCT d.publisher FROM ComicDetail d WHERE d.series = :series AND d.publisher IS NOT NULL AND d NOT IN (SELECT r.comicDetail FROM LastRead r WHERE r.user.email = :email)")
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
      "SELECT d FROM ComicDetail d WHERE d.publisher = :publisher AND d.series = :series AND d.volume = :volume AND d NOT IN (SELECT r.comicDetail FROM LastRead r WHERE r.user.email = :email) ORDER BY d.coverDate")
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
      "SELECT DISTINCT t.value FROM ComicTag t WHERE t.type = :tagType AND t.comicDetail NOT IN (SELECT r.comicDetail FROM LastRead r WHERE r.user.email = :email)")
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
      "SELECT DISTINCT YEAR(d.coverDate) FROM ComicDetail d WHERE d.coverDate IS NOT NULL AND d NOT IN (SELECT r.comicDetail FROM LastRead r WHERE r.user.email = :email)")
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
      "SELECT DISTINCT d.coverDate FROM ComicDetail d WHERE d.coverDate IS NOT NULL AND year(d.coverDate) = :year AND d NOT IN (SELECT r.comicDetail from LastRead r WHERE r.user.email = :email)")
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
      "SELECT d FROM ComicDetail d WHERE d.coverDate IS NOT NULL AND d.coverDate IS NOT NULL AND d.coverDate >= :startDate AND d.coverDate <= :endDate AND d.comicBook.id NOT IN (SELECT r.comicDetail.id FROM LastRead r WHERE r.user.email = :email) ORDER BY d.comicBook")
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
      "SELECT d FROM ComicDetail d JOIN FETCH d.comicBook WHERE LOWER(d.title) LIKE LOWER(concat('%', :term, '%')) OR LOWER(d.description) LIKE LOWER(concat('%', :term, '%'))")
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
      "SELECT d FROM ComicDetail d WHERE d IN (SELECT t.comicDetail FROM ComicTag t WHERE t.type = :tagType AND t.value = :tagValue) AND d NOT IN (SELECT r.comicDetail from LastRead r WHERE r.user.email = :email)")
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
   * Loads comics with the given tag type and value
   *
   * @param tagType the tag type
   * @param tagValue the tag value
   * @param pageable the page request
   * @return the matching comics
   */
  @Query(
      "SELECT d FROM ComicDetail d WHERE d IN (SELECT t.comicDetail FROM ComicTag t WHERE t.type = :tagType AND t.value = :tagValue)")
  List<ComicDetail> loadForTagTypeAndValue(
      @Param("tagType") ComicTagType tagType,
      @Param("tagValue") String tagValue,
      Pageable pageable);

  /**
   * Returns the cover years for comics with a given tag type and value.
   *
   * @param tagType the tag type
   * @param tagValue the value
   * @return the years
   */
  @Query(
      "SELECT DISTINCT(d.yearPublished) FROM ComicDetail d WHERE d.yearPublished IS NOT NULL AND d IN (SELECT t.comicDetail FROM ComicTag t WHERE t.type = :tagType AND t.value = :tagValue)")
  List<Integer> getCoverYears(ComicTagType tagType, String tagValue);

  /**
   * Returns the cover months for comics with a given tag type and value.
   *
   * @param tagType the tag type
   * @param tagValue the value
   * @return the montsh
   */
  @Query(
      "SELECT DISTINCT(d.monthPublished) FROM ComicDetail d WHERE d.yearPublished IS NOT NULL AND d IN (SELECT t.comicDetail FROM ComicTag t WHERE t.type = :tagType AND t.value = :tagValue)")
  List<Integer> getCoverMonths(ComicTagType tagType, String tagValue);

  /**
   * Returns the total number of comics with a given tag type and value.
   *
   * @param tagType the tag type
   * @param tagValue the value
   * @return the comic count
   */
  @Query(
      "SELECT COUNT(d) FROM ComicDetail d WHERE d.yearPublished IS NOT NULL AND d IN (SELECT t.comicDetail FROM ComicTag t WHERE t.type = :tagType AND t.value = :tagValue)")
  long getFilterCount(ComicTagType tagType, String tagValue);

  /**
   * Returns a display page of {@link CollectionEntry} objects.
   *
   * @param tagType the tag type
   * @param pageable the page request
   * @return the entries
   */
  @Query(
      "SELECT new org.comixedproject.model.collections.CollectionEntry(t.value, COUNT(t)) FROM ComicTag t WHERE t.type = :tagType GROUP BY t.value")
  List<CollectionEntry> loadCollectionEntries(
      @Param("tagType") ComicTagType tagType, Pageable pageable);

  @Query("SELECT COUNT(DISTINCT t.value) FROM ComicTag t WHERE t.type = :tagType")
  long getFilterCount(@Param("tagType") ComicTagType tag);

  @Query(
      "SELECT d FROM ComicDetail d WHERE d.id NOT IN (SELECT r.comicDetail.id FROM LastRead r WHERE r.user.email = :email)")
  List<ComicDetail> loadUnreadComicDetails(@Param("email") String email, Pageable pageable);

  /**
   * Returns comic details for a given reading list.
   *
   * @param readingListId the reading list id
   * @param pageable the page request
   * @return the entries
   */
  @Query("SELECT r.entries FROM ReadingList r WHERE r.id = :readingListId")
  List<ComicDetail> loadComicDetailsForReadingList(
      @Param("readingListId") long readingListId, Pageable pageable);
}

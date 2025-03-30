/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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

package org.comixedproject.repositories.library;

import java.util.List;
import java.util.Set;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.library.DisplayableComic;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * <code>DisplayableComicRepository</code> provides methods for loading instances of {@link
 * DisplayableComic}.
 *
 * @author Darryl L. Pierce
 */
@Repository
public interface DisplayableComicRepository extends JpaRepository<DisplayableComic, Long> {
  /**
   * Retrieves a set of comics from a list of ids.
   *
   * @param ids the ids
   * @param pageable the pageable
   * @return the records
   */
  @Query("SELECT d FROM DisplayableComic d WHERE d.comicBookId IN :ids")
  List<DisplayableComic> loadComicsById(List<Long> ids, Pageable pageable);

  /**
   * Loads comics with the given tag type and value
   *
   * @param tagType the tag type
   * @param tagValue the tag value
   * @param pageable the page request
   * @return the matching comics
   */
  @Query(
      "SELECT c FROM DisplayableComic c WHERE c.comicDetailId IN (SELECT t.comicDetail.comicDetailId FROM ComicTag t WHERE t.type = :tagType AND t.value = :tagValue)")
  List<DisplayableComic> loadComicsByTagTypeAndValue(
      @Param("tagType") ComicTagType tagType,
      @Param("tagValue") String tagValue,
      Pageable pageable);

  /**
   * Returns the cover year values for comics with the given tag type and value.
   *
   * @param tagType the tag type
   * @param tagValue the tag value
   * @return the years
   */
  @Query(
      "SELECT DISTINCT(d.yearPublished) FROM DisplayableComic d WHERE d.yearPublished IS NOT NULL AND d.comicDetailId IN (SELECT t.comicDetail.comicDetailId FROM ComicTag t WHERE t.type = :tagType AND t.value = :tagValue)")
  List<Integer> getCoverYearsForTagTypeAndValue(
      @Param("tagType") ComicTagType tagType, @Param("tagValue") String tagValue);

  /**
   * Returns the cover month values for comics with the given tag type and value.
   *
   * @param tagType the tag type
   * @param tagValue the tag value
   * @return the years
   */
  @Query(
      "SELECT DISTINCT(d.monthPublished) FROM DisplayableComic d WHERE d.yearPublished IS NOT NULL AND d.comicDetailId IN (SELECT t.comicDetail.comicDetailId FROM ComicTag t WHERE t.type = :tagType AND t.value = :tagValue)")
  List<Integer> getCoverMonthsForTagTypeAndValue(
      @Param("tagType") ComicTagType tagType, @Param("tagValue") String tagValue);

  /**
   * Returns the cover month values for comics with the given tag type and value.
   *
   * @param tagType the tag type
   * @param tagValue the tag value
   * @return the years
   */
  @Query(
      "SELECT COUNT(d) FROM DisplayableComic d WHERE d.comicDetailId IN (SELECT t.comicDetail.comicDetailId FROM ComicTag t WHERE t.type = :tagType AND t.value = :tagValue)")
  long getComicCountForTagTypeAndValue(
      @Param("tagType") ComicTagType tagType, @Param("tagValue") String tagValue);

  /**
   * Returns comics that are not in the given list of read ids.
   *
   * @param ids the read ids
   * @param pageable the request
   * @return the comics
   */
  @Query("SELECT d FROM DisplayableComic d WHERE d.comicDetailId NOT IN :ids")
  List<DisplayableComic> loadUnreadComics(@Param("ids") Set<Long> ids, Pageable pageable);

  /**
   * Returns comics that are in the given list of read ids.
   *
   * @param ids the read ids
   * @param pageable the request
   * @return the comics
   */
  @Query("SELECT d FROM DisplayableComic d WHERE d.comicDetailId IN :ids")
  List<DisplayableComic> loadReadComics(@Param("ids") Set<Long> ids, Pageable pageable);

  /**
   * Retutnrs comics for the specified reading list.
   *
   * @param listId the reading list id
   * @param pageable the request
   * @return the comics
   */
  @Query(
      "SELECT d FROM DisplayableComic d WHERE d.comicDetailId IN (SELECT l.entryIds FROM ReadingList l WHERE l.readingListId = :listId)")
  List<DisplayableComic> loadComicsForList(@Param("listId") Long listId, Pageable pageable);

  /**
   * Returns comics that are duplicates.
   *
   * @param pageable the request
   * @return the comics
   */
  @Query(
      "SELECT d FROM DisplayableComic d JOIN (SELECT c.publisher AS publisher, c.series AS series, c.volume AS volume, c.issueNumber AS issueNumber, c.coverDate as coverDate FROM ComicDetail c WHERE c.publisher IS NOT NULL AND LENGTH(c.publisher) > 0 AND c.series IS NOT NULL AND LENGTH(c.series) > 0 AND c.volume IS NOT NULL AND LENGTH(c.volume) > 0 AND c.issueNumber IS NOT NULL AND LENGTH(c.issueNumber) > 0 AND c.coverDate IS NOT NULL GROUP BY c.publisher, c.series, c.volume, c.issueNumber, c.coverDate HAVING count(*) > 1) g ON g.publisher = d.publisher AND g.series = d.series AND g.volume = d.volume AND g.issueNumber = d.issueNumber AND g.coverDate = d.coverDate")
  List<DisplayableComic> loadDuplicateComics(Pageable pageable);

  /**
   * Returns the number of duplicate comics.
   *
   * @return the comics
   */
  @Query(
      "SELECT COALESCE(SUM(COALESCE(total, 0)), 0) FROM (SELECT count(*) AS total FROM DisplayableComic d WHERE d.publisher IS NOT NULL AND LENGTH(d.publisher) > 0 AND d.series IS NOT NULL AND LENGTH(d.series) > 0 AND d.volume IS NOT NULL AND LENGTH(d.volume) > 0 AND d.issueNumber IS NOT NULL AND LENGTH(d.issueNumber) > 0 AND d.coverDate IS NOT NULL GROUP BY d.publisher, d.series, d.volume, d.issueNumber, d.coverDate HAVING count(*) > 1)")
  long getDuplicateComicCount();

  /**
   * Returns the comic ids for all duplicate comics.
   *
   * @return the comic ids
   */
  @Query(
      "SELECT d.comicDetailId FROM DisplayableComic d JOIN (SELECT c.publisher AS publisher, c.series AS series, c.volume AS volume, c.issueNumber AS issueNumber, c.coverDate as coverDate FROM ComicDetail c WHERE c.publisher IS NOT NULL AND LENGTH(c.publisher) > 0 AND c.series IS NOT NULL AND LENGTH(c.series) > 0 AND c.volume IS NOT NULL AND LENGTH(c.volume) > 0 AND c.issueNumber IS NOT NULL AND LENGTH(c.issueNumber) > 0 AND c.coverDate IS NOT NULL GROUP BY c.publisher, c.series, c.volume, c.issueNumber, c.coverDate HAVING count(*) > 1) g ON g.publisher = d.publisher AND g.series = d.series AND g.volume = d.volume AND g.issueNumber = d.issueNumber AND g.coverDate = d.coverDate")
  List<Long> getDuplicateComicIds();

  /**
   * Returns all comic ids for a given publisher.
   *
   * @param publisher the publisher
   * @return the comic ids
   */
  @Query("SELECT d.comicDetailId from DisplayableComic d WHERE d.publisher = :publisher")
  List<Long> getIdsByPublisher(@Param("publisher") String publisher);

  /**
   * Returns all comic ids for a given publisher, series, and volume.
   *
   * @param publisher the publisher
   * @param series the series
   * @param volume the volume
   * @return the comic ids
   */
  @Query(
      "SELECT d.comicDetailId From DisplayableComic d WHERE d.publisher = :publisher AND d.series = :series AND d.volume = :volume")
  List<Long> getIdsByPublisherSeriesAndVolume(String publisher, String series, String volume);

  /**
   * Returns the list of comic ids for a given tag type and value.
   *
   * @param tagType the tag type
   * @param tagValue the tag value
   * @return the comic ids
   */
  @Query(
      "SELECT d.comicDetailId FROM DisplayableComic d WHERE d.comicDetailId IN (SELECT t.comicDetail.comicDetailId FROM ComicTag t WHERE t.type = :tagType AND t.value = :tagValue)")
  List<Long> getIdsByTagTypeAndValue(ComicTagType tagType, String tagValue);
}

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

package org.comixed.repositories.comic;

import java.util.Date;
import java.util.List;
import org.comixed.model.comic.Comic;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ComicRepository extends JpaRepository<Comic, Long> {
  /**
   * Returns all comics not read by the specified user.
   *
   * @param userId the user's id
   * @return the list of comics
   */
  @Query(
      "SELECT c FROM Comic c WHERE c.id NOT IN (SELECT r.comic.id FROM LastReadDate r WHERE r.user.id = :userId)")
  List<Comic> findAllUnreadByUser(@Param("userId") long userId);

  /**
   * Finds a comic based on filename.
   *
   * @param filename the filename
   * @return the comic
   */
  Comic findByFilename(String filename);

  /**
   * Returns all comic entries for the given series name.
   *
   * @param series the series name
   * @return the list of comics
   */
  List<Comic> findBySeries(String series);

  /**
   * Return all comic entries that have been updated after the specified timestamp.
   *
   * @param timestamp the timestamp
   * @param pageable the constraints
   * @return the list of comics
   */
  List<Comic> findAllByDateLastUpdatedGreaterThan(Date timestamp, Pageable pageable);

  /**
   * Returns the most recently updated comics.
   *
   * @param pageable the constraints
   * @return the list of comics
   */
  List<Comic> findTopByOrderByDateLastUpdatedDesc(Pageable pageable);

  /**
   * Returns comics updated on or since the specified latestUpdatedDate.
   *
   * @param latestUpdatedDate the latest updated latestUpdatedDate
   * @param paging the paging parameters
   * @return the list of comics
   */
  @Query(
      "SELECT c FROM Comic c WHERE c.dateLastUpdated >= :latestUpdatedDate ORDER BY c.dateLastUpdated ASC")
  List<Comic> getLibraryUpdates(
      @Param("latestUpdatedDate") Date latestUpdatedDate, final Pageable paging);

  @Query("SELECT c FROM Comic c JOIN FETCH c.pages WHERE c.id = :id")
  Comic getById(@Param("id") long id);

  @Query(
      "SELECT c FROM Comic c WHERE c.series = :series AND c.volume = :volume AND c.issueNumber <> :issueNumber AND c.coverDate <= (SELECT DISTINCT d.coverDate FROM Comic d WHERE d.series = :series AND d.volume = :volume AND d.issueNumber = :issueNumber) ORDER BY c.coverDate,c.issueNumber DESC")
  List<Comic> findIssuesBeforeComic(
      @Param("series") String series,
      @Param("volume") String volume,
      @Param("issueNumber") String issueNumber);

  @Query(
      "SELECT c FROM Comic c WHERE c.series = :series AND c.volume = :volume AND c.issueNumber <> :issueNumber AND c.coverDate >= (SELECT DISTINCT d.coverDate FROM Comic d WHERE d.series = :series AND d.volume = :volume AND d.issueNumber = :issueNumber) ORDER BY c.coverDate,c.issueNumber ASC")
  List<Comic> findIssuesAfterComic(
      @Param("series") String series,
      @Param("volume") String volume,
      @Param("issueNumber") String issueNumber);

  @Query("SELECT c FROM Comic c WHERE c.dateDeleted IS NOT NULL")
  List<Comic> findAllMarkedForDeletion();
}

/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

package org.comixedproject.repositories.collections;

import java.util.List;
import org.comixedproject.model.collections.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * <code>IssueRepository</code> defines a repository for working with persisted instances of {@link
 * Issue}.
 */
@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {
  /**
   * Gets the count of issues for the given series and volume.
   *
   * @param series the series name
   * @param volume the volume
   * @return the count
   */
  @Query("SELECT COUNT(i) FROM Issue i WHERE i.series = :series AND i.volume = :volume")
  long getCountForSeriesAndVolume(@Param("series") String series, @Param("volume") String volume);

  /**
   * Retrieves all records for the given publisher, series, and volume.
   *
   * @param publisher the publisher
   * @param series the series name
   * @param volume the volume
   * @return the issues
   */
  @Query(
      "SELECT i FROM Issue i WHERE i.publisher = :publisher AND i.series = :series AND i.volume = :volume")
  List<Issue> getAll(
      @Param("publisher") String publisher,
      @Param("series") String series,
      @Param("volume") String volume);

  /**
   * Deletes all records for the given series and volume.
   *
   * @param series the series name
   * @param volume the volume
   */
  @Modifying
  @Query("DELETE FROM Issue i WHERE i.series = :series AND i.volume = :volume")
  void deleteSeriesAndVolume(@Param("series") String series, @Param("volume") String volume);
}

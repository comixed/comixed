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

package org.comixedproject.repositories.collections;

import org.comixedproject.model.collections.SeriesDetail;
import org.comixedproject.model.collections.SeriesDetailId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

/**
 * <code>SeriesDetailsRepository</code> provides methods for working with persisted instances of
 * {@link SeriesDetail}.
 *
 * @author Darryl L. Pierce
 */
@Repository
public interface SeriesDetailsRepository extends JpaRepository<SeriesDetail, SeriesDetailId> {
  @Override
  @Query(
      "SELECT s FROM SeriesDetail s WHERE LENGTH(s.id.publisher) > 0 AND LENGTH(s.id.series) > 0 AND LENGTH(s.id.volume) > 0")
  Page<SeriesDetail> findAll(Pageable pageable);

  /**
   * Returns the number of unique series in the database.
   *
   * @return the series count
   */
  @Query(
      "SELECT COUNT(s) FROM SeriesDetail s WHERE LENGTH(s.id.publisher) > 0 AND LENGTH(s.id.series) > 0 AND LENGTH(s.id.volume) > 0")
  int getSeriesCount();
}

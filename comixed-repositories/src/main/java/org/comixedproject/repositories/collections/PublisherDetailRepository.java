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

import org.comixedproject.model.collections.PublisherDetail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PublisherDetailRepository extends JpaRepository<PublisherDetail, String> {

  /**
   * Returns the list of all publishers with the count of series for each.
   *
   * @param pageable the page request
   * @return the publisher list
   */
  @Query("SELECT p FROM PublisherDetail p WHERE p.name IS NOT NULL AND LENGTH(p.name) > 0")
  Page<PublisherDetail> findAll(Pageable pageable);

  /**
   * Returns the list of all publishers with the count of series for each, where the name matches
   * the filter.
   *
   * @param filterText the filter text
   * @param pageable the page request
   * @return the publisher list
   */
  @Query("SELECT p FROM PublisherDetail p WHERE p.name ILIKE :filterText")
  Page<PublisherDetail> findAllFiltered(@Param("filterText") String filterText, Pageable pageable);

  /**
   * Returns the number of publishers in the database.
   *
   * @return the publisher count
   */
  @Query("SELECT COUNT(p) FROM PublisherDetail p WHERE p.name IS NOT NULL AND LENGTH(p.name) > 0")
  long getPublisherCount();

  /**
   * Returns the number of publishers whose name matches the provided filter.
   *
   * @param filterText the filter text
   * @return the publisher count
   */
  @Query("SELECT COUNT(p) FROM PublisherDetail p WHERE p.name ILIKE :filterText")
  long getPublisherCountWithFilter(@Param("filterText") String filterText);
}

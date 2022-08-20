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

package org.comixedproject.repositories.metadata;

import java.util.List;
import org.comixedproject.model.metadata.MetadataSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * <code>MetadataSourceRepository</code> provides methods for working with persisted instances of
 * {@link MetadataSource}.
 *
 * @author Darryl L. Pierce
 */
@Repository
public interface MetadataSourceRepository extends JpaRepository<MetadataSource, Long> {
  /**
   * Returns all sources.
   *
   * @return the sources
   */
  @Query("SELECT s FROM MetadataSource s")
  List<MetadataSource> loadMetadataSources();

  /**
   * Returns a single source by record id.
   *
   * @param id the record id
   * @return the source
   */
  @Query("SELECT s FROM MetadataSource s WHERE s.id = :id")
  MetadataSource getById(@Param("id") final long id);

  /**
   * Returns a single record by bean name.
   *
   * @param name the bean name
   * @return the record
   */
  @Query("SELECT s FROM MetadataSource s WHERE s.beanName = :name")
  MetadataSource getByBeanName(@Param("name") String name);

  /**
   * Returns a single record by source name.
   *
   * @param name the source name
   * @return the record
   */
  @Query("SELECT s FROM MetadataSource s WHERE s.name = :name")
  MetadataSource getByName(@Param("name") String name);

  /** Clears any existing metadata source marked as preferred. */
  @Modifying
  @Query("UPDATE MetadataSource s SET s.preferred = false")
  void clearPreferredSource();
}

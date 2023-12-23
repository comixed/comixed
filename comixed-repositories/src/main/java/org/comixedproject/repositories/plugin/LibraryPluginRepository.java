/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

package org.comixedproject.repositories.plugin;

import java.util.List;
import org.comixedproject.model.plugin.LibraryPlugin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * <code>LibraryPluginRepository</code> provides a type for working with persisted instances of
 * {@link LibraryPlugin}.
 *
 * @author Darryl L. Pierce
 */
@Repository
public interface LibraryPluginRepository extends JpaRepository<LibraryPlugin, Long> {
  /**
   * Returns the list of plugin records.
   *
   * @return the plugins
   */
  @Query("SELECT p FROM LibraryPlugin p JOIN FETCH p.properties")
  List<LibraryPlugin> getAll();

  /**
   * Retrieves a single plugin by id.
   *
   * @param id the record id
   * @return the plugin
   */
  @Query("SELECT p FROM LibraryPlugin p JOIN FETCH p.properties WHERE p.id = :id")
  LibraryPlugin getById(@Param("id") Long id);
}

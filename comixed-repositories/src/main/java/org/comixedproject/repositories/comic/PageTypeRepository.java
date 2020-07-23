/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project.
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

package org.comixedproject.repositories.comic;

import java.util.List;
import org.comixedproject.model.comic.PageType;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * <code>PageTypeRepository</code> retrieves instances of {@link PageType} from the database.
 *
 * @author The ComiXed Project
 */
@Repository
public interface PageTypeRepository extends CrudRepository<PageType, Long> {
  /**
   * Returns the default offset type.
   *
   * @return the default offset type
   */
  @Query("SELECT pt FROM PageType pt WHERE pt.name = 'story'")
  PageType getDefaultPageType();

  @Query("SELECT pt FROM PageType pt")
  List<PageType> findPageTypes();

  @Query("SELECT t FROM PageType t WHERE t.name = :name")
  PageType findByName(@Param("name") String name);
}

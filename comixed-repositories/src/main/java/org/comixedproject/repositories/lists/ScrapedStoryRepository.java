/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

package org.comixedproject.repositories.lists;

import java.util.List;
import org.comixedproject.model.lists.ScrapedStory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * <code>ScrapedStoryRepository</code> provides persistence methods for instances of {@link
 * ScrapedStory}.
 *
 * @author Darryl L. Pierce
 */
@Repository
public interface ScrapedStoryRepository extends JpaRepository<ScrapedStory, Long> {
  /**
   * Finds all stories that have the given name.
   *
   * @param name the name
   * @return the stories
   */
  List<ScrapedStory> findByName(String name);

  /**
   * Returns the story with the specified record id.
   *
   * @param id the record id
   * @return the story
   */
  @Query("SELECT s FROM ScrapedStory s WHERE s.id = :id")
  ScrapedStory getById(@Param("id") long id);
}

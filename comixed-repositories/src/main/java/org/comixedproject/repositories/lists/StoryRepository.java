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
import org.comixedproject.model.lists.Story;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * <code>StoryRepository</code> provides persistence methods for instances of {@link Story}.
 *
 * @author Darryl L. Pierce
 */
@Repository
public interface StoryRepository extends JpaRepository<Story, Long> {
  /**
   * Finds all stories that have the given name.
   *
   * @param name the name
   * @return the stories
   */
  List<Story> findByName(String name);

  /**
   * Returns the story with the specified record id.
   *
   * @param id the record id
   * @return the story
   */
  @Query("SELECT s FROM Story s WHERE s.storyId = :id")
  Story getById(@Param("id") long id);
}

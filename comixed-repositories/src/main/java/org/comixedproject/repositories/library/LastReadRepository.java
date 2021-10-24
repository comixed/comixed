/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.library.LastRead;
import org.comixedproject.model.user.ComiXedUser;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

/**
 * <code>LastReadRepository</code> defines a type of {@link CrudRepository} for retrieving {@link
 * LastRead} instances.
 *
 * @author Darryl L. Pierce (mcpierce@gmail.com)
 */
public interface LastReadRepository extends CrudRepository<LastRead, Long> {
  /**
   * Loads a batch of last read entries.
   *
   * @param user the user
   * @param threshold the threshold id
   * @param pageRequest the request constraints
   * @return the entries
   */
  @Query("SELECT e FROM LastRead e WHERE e.id > :threshold AND e.user = :user ORDER BY e.id")
  List<LastRead> loadEntriesForUser(
      @Param("user") ComiXedUser user, @Param("threshold") long threshold, Pageable pageRequest);

  /**
   * Retrieves the last read entry for the given comic and user.
   *
   * @param comic the comic
   * @param user the user
   * @return the entry, or null if non exists
   */
  @Query("SELECT e FROM LastRead e WHERE e.comic = :comic AND e.user = :user")
  LastRead loadEntryForComicAndUser(@Param("comic") Comic comic, @Param("user") ComiXedUser user);
}

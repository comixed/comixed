/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project.
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

package org.comixedproject.repositories.comicbooks;

import java.util.List;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ComicTagRepository extends JpaRepository<ComicTag, Long> {
  /**
   * Deletes all tags for the given comic detail.
   *
   * @param comic the comic detail
   */
  @Query("DELETE FROM ComicTag t WHERE t.comic = :comic")
  void deleteAllForComic(@Param("comic") Comic comic);

  /**
   * Returns the comic tags for the given comic book.
   *
   * @param comicDetailId the comic book id
   * @return the comic tags
   */
  @Query(
      "SELECT t FROM ComicTag t WHERE t.comic.comicDetailId = :comicDetailId ORDER BY t.type, t.value")
  List<ComicTag> getForComicBook(@Param("comicDetailId") long comicDetailId);
}

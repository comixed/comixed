/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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
import org.comixedproject.model.comic.Page;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface PageRepository extends CrudRepository<Page, Long> {
  /**
   * Returns a list of Pages with duplicate hashes.
   *
   * @return a list of Page objects with duplicate hashes
   */
  @Query(
      "SELECT p FROM Page p JOIN p.comic WHERE p.hash IN (SELECT d.hash FROM Page d GROUP BY d.hash HAVING COUNT(*) > 1) GROUP BY p.id, p.hash")
  List<Page> getDuplicatePages();

  /**
   * Marks all pages with the given hash as deleted.
   *
   * @param hash the hash
   * @param deleted the deleted state
   * @return the number of pages marked
   */
  @Modifying
  @Transactional
  @Query("UPDATE Page p SET p.deleted = :deleted WHERE p.hash = :hash")
  int updateDeleteOnAllWithHash(@Param("hash") String hash, @Param("deleted") boolean deleted);

  @Query("SELECT p FROM Page p WHERE p.comic.id = :id")
  List<Page> findAllByComicId(@Param("id") long id);

  @Query("SELECT p FROM Page p WHERE p.hash = :hash")
  List<Page> getPagesWithHash(@Param("hash") String hash);
}

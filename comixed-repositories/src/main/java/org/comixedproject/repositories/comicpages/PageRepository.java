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

package org.comixedproject.repositories.comicpages;

import java.util.List;
import org.comixedproject.model.comicpages.Page;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * <code>PageRepository</code> provides persistence methods for instances of {@link Page}.
 *
 * @author Darryl L. Pierce
 */
@Repository
public interface PageRepository extends CrudRepository<Page, Long> {
  /**
   * Returns a list of Pages with duplicate hashes.
   *
   * @return a list of Page objects with duplicate hashes
   */
  @Query(
      "SELECT p FROM Page p JOIN FETCH p.comic WHERE p.hash IN (SELECT d.hash FROM Page d GROUP BY d.hash HAVING COUNT(*) > 1) GROUP BY p.id, p.hash")
  List<Page> getDuplicatePages();

  @Query("SELECT p FROM Page p WHERE p.comic.id = :id")
  List<Page> findAllByComicId(@Param("id") long id);

  /**
   * Returns the list of all pages with the given page hash.
   *
   * @param hash the hash value
   * @return the list of pages
   */
  @Query("SELECT p FROM Page p WHERE p.hash = :hash")
  List<Page> getPagesWithHash(@Param("hash") String hash);

  /**
   * Returns the list of pages that have the given hash and deleted flag value.
   *
   * @param hash the page hash
   * @param deleted the deleted flag
   * @return the pages
   */
  List<Page> findByHashAndDeleted(String hash, boolean deleted);
}

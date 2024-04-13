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
import java.util.Set;
import org.comixedproject.model.comicpages.DeletedPageAndComic;
import org.comixedproject.model.comicpages.Page;
import org.comixedproject.model.comicpages.PageState;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
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
   * Fetches a single page by record id.
   *
   * @param id the record id
   * @return the page
   */
  @Query("SELECT p FROM Page p WHERE p.id = :id")
  Page getById(@Param("id") long id);

  /**
   * Finds a single page with a given hash.
   *
   * @param hash the page hash
   * @return the page
   */
  List<Page> findByHash(String hash);

  /**
   * Returns a list of Pages with duplicate hashes.
   *
   * @return a list of Page objects with duplicate hashes
   */
  @Query(
      "SELECT p FROM Page p JOIN FETCH p.comicBook WHERE p.hash IN (SELECT d.hash FROM Page d GROUP BY d.hash HAVING COUNT(*) > 1)")
  List<Page> getDuplicatePages();

  /**
   * Returns the list of pages that have the given hash and state flag value.
   *
   * @param hash the page hash
   * @param state the state
   * @return the pages
   */
  List<Page> findByHashAndPageState(String hash, PageState state);

  /**
   * Loads all pages marked for deletion along with their owning comic.
   *
   * @return the page list
   */
  @Query(
      "SELECT new org.comixedproject.model.comicpages.DeletedPageAndComic(p.hash, p.comicBook) FROM Page p WHERE p.pageState = 'DELETED'")
  List<DeletedPageAndComic> loadAllDeletedPages();

  /**
   * Returns a page of records with the add to cache column set to true.
   *
   * @param pageable the page detail
   * @return the page list
   */
  @Query("SELECT p FROM Page p WHERE p.addingToCache = true")
  List<Page> findPagesNeedingCacheEntries(Pageable pageable);

  /**
   * Marks all pages with a given hash as being added to the image cache.
   *
   * @param hash the page hash
   */
  @Modifying
  @Query("UPDATE Page p SET p.addingToCache = false WHERE p.hash = :hash")
  void markPagesAsAddedToImageCache(@Param("hash") String hash);

  /**
   * Returns the list of unique page hashes.
   *
   * @return the hash list
   */
  @Query("SELECT DISTINCT p.hash FROM Page p WHERE p.pageNumber = 0")
  Set<String> findAllCoverPageHashes();

  /**
   * Marks all pages with a given hash to have an image cache entry created.
   *
   * @param hash the page hash
   */
  @Modifying
  @Query("UPDATE Page p SET p.addingToCache = true WHERE p.hash = :hash")
  void markCoverPagesToHaveCacheEntryCreated(@Param("hash") String hash);
}

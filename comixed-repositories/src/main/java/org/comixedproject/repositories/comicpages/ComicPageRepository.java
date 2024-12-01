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
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.comicpages.ComicPageState;
import org.comixedproject.model.comicpages.DeletedPageAndComic;
import org.comixedproject.model.library.DuplicatePage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * <code>ComicPageRepository</code> provides persistence methods for instances of {@link ComicPage}.
 *
 * @author Darryl L. Pierce
 */
@Repository
public interface ComicPageRepository extends JpaRepository<ComicPage, Long> {
  /**
   * Fetches a single page by record id.
   *
   * @param id the record id
   * @return the page
   */
  @Query("SELECT p FROM ComicPage p WHERE p.id = :id")
  ComicPage getById(@Param("id") long id);

  /**
   * Finds a single page with a given hash.
   *
   * @param hash the page hash
   * @return the page
   */
  List<ComicPage> findByHash(String hash);

  /**
   * Returns a list of Pages with duplicate hashes.
   *
   * @return a list of ComicPage objects with duplicate hashes
   */
  @Query(
      "SELECT DISTINCT new org.comixedproject.model.library.DuplicatePage(p.hash) FROM ComicPage p WHERE p.hash IN (SELECT d.hash FROM ComicPage d GROUP BY d.hash HAVING COUNT(*) > 1)")
  List<DuplicatePage> getDuplicatePages(Pageable pageable);

  @Query(
      "SELECT COUNT(DISTINCT p.hash) FROM ComicPage p WHERE p.hash in (SELECT d.hash FROM ComicPage d GROUP BY d.hash HAVING COUNT(*) > 1)")
  int getDuplicatePageCount();

  /**
   * Returns the list of pages that have the given hash and state flag value.
   *
   * @param hash the page hash
   * @param state the state
   * @return the pages
   */
  List<ComicPage> findByHashAndPageState(String hash, ComicPageState state);

  /**
   * Loads all pages marked for deletion along with their owning comic.
   *
   * @return the page list
   */
  @Query(
      "SELECT new org.comixedproject.model.comicpages.DeletedPageAndComic(p.hash, p.comicBook) FROM ComicPage p WHERE p.pageState = 'DELETED'")
  List<DeletedPageAndComic> loadAllDeletedPages();

  /**
   * Returns a page of records with the add to cache column set to true.
   *
   * @param pageable the page detail
   * @return the page list
   */
  @Query("SELECT p FROM ComicPage p WHERE p.addingToCache = true")
  List<ComicPage> findPagesNeedingCacheEntries(Pageable pageable);

  /**
   * Marks all pages with a given hash as being added to the image cache.
   *
   * @param hash the page hash
   */
  @Modifying
  @Query("UPDATE ComicPage p SET p.addingToCache = false WHERE p.hash = :hash")
  void markPagesAsAddedToImageCache(@Param("hash") String hash);

  /**
   * Returns the list of unique page hashes.
   *
   * @return the hash list
   */
  @Query(
      "SELECT DISTINCT p.hash FROM ComicPage p WHERE p.pageNumber = 0 AND p.hash IS NOT NULL AND length(p.hash) > 0")
  Set<String> findAllCoverPageHashes();

  /**
   * Marks all pages with a given hash to have an image cache entry created.
   *
   * @param hash the page hash
   */
  @Modifying
  @Query("UPDATE ComicPage p SET p.addingToCache = true WHERE p.hash = :hash")
  void markCoverPagesToHaveCacheEntryCreated(@Param("hash") String hash);

  /**
   * Returns the number of pages without a hash.
   *
   * @return the record count
   */
  @Query("SELECT COUNT(p) FROM ComicPage p WHERE p.hash IS NULL OR LENGTH(p.hash) = 0")
  long getPagesWithoutHashesCount();

  @Query("SELECT p FROM ComicPage p WHERE p.hash IS NULL OR LENGTH(p.hash) = 0")
  List<ComicPage> findPagesWithoutHash(Pageable pageable);

  @Query(
      "SELECT p FROM ComicPage p WHERE p.pageState != 'DELETED' AND p.hash IN (SELECT b.hash FROM BlockedHash b)")
  List<ComicPage> getUnmarkedWithBlockedHash(Pageable pageable);

  @Query(
      "SELECT count(p) FROM ComicPage p WHERE p.pageState != 'DELETED' AND p.hash IN (SELECT b.hash FROM BlockedHash b)")
  long getUnmarkedWithBlockedHashCount();

  @Query("SELECT p FROM ComicPage p WHERE p.hash ilike :hash")
  List<ComicPage> getPagesWithHash(@Param("hash") String hash);

  /**
   * Returns the record id for page number 0 for for the given comic book.
   *
   * @param comicBookId the comic book id
   * @return the page id
   */
  @Query("SELECT p.id FROM ComicPage p WHERE p.comicBook.id = :comicBookId AND p.pageNumber = 0")
  Long getPageIdForComicBookCover(@Param("comicBookId") long comicBookId);

  @Query("SELECT p.comicBook.comicDetail.filename FROM ComicPage p WHERE p.id = :pageId")
  String getComicFilenameForPage(@Param("pageId") Long pageId);

  @Query("SELECT p.filename FROM ComicPage p WHERE p.id = :pageId")
  String getPageFilename(@Param("pageId") long pageId);

  @Query("SELECT p.hash FROM ComicPage p WHERE p.id = :pageId")
  String getHashForPage(@Param("pageId") long pageId);
}

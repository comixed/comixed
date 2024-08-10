/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project.
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

package org.comixedproject.service.comicpages;

import static org.comixedproject.service.comicbooks.ComicBookService.COMICBOOK_CACHE;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import javax.imageio.ImageIO;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.GenericUtilitiesAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.comicpages.ComicPageState;
import org.comixedproject.repositories.comicpages.ComicPageRepository;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.state.comicpages.ComicPageEvent;
import org.comixedproject.state.comicpages.ComicPageStateHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>ComicPageService</code> provides business methods for instances of {@link ComicPage}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class ComicPageService {
  @Autowired private ComicPageRepository comicPageRepository;
  @Autowired private ComicPageStateHandler comicPageStateHandler;
  @Autowired private ComicBookService comicBookService;
  @Autowired private GenericUtilitiesAdaptor genericUtilitiesAdaptor;

  /**
   * Finds one page with the given hash
   *
   * @param hash the hash
   * @return the page
   */
  @Transactional
  public ComicPage getOneForHash(final String hash) {
    log.trace("Finding a page with hash: {}", hash);
    final List<ComicPage> results = this.comicPageRepository.findByHash(hash);
    return results.isEmpty() ? null : results.get(0);
  }

  /**
   * Retrieves the content for a comic page.
   *
   * @param comicId the comic record id
   * @param pageIndex the page index
   * @return the content
   * @throws ComicBookException if the comic does not exist
   */
  public ComicPage getPageInComicByIndex(final long comicId, final int pageIndex)
      throws ComicBookException {
    log.debug(
        "Getting page content for comicBook: comicBook id={} page index={}", comicId, pageIndex);

    log.debug("Fetching comicBook: id={}", comicId);
    final ComicBook comicBook = this.comicBookService.getComic(comicId);

    if (comicBook != null) {
      if (pageIndex < comicBook.getPageCount()) {
        log.debug("Returning page");
        return comicBook.getPages().get(pageIndex);
      } else {
        log.warn("Index out of range");
      }
    }

    return null;
  }

  private ComicPage doGetPage(final long id) throws ComicPageException {
    final Optional<ComicPage> result = this.comicPageRepository.findById(id);
    if (result.isEmpty()) throw new ComicPageException("No such page: id=" + id);
    return result.get();
  }

  /**
   * Retrieves a page by its record id.
   *
   * @param id the record id
   * @return the page
   * @throws ComicPageException if the id is invalid
   */
  public ComicPage getForId(final long id) throws ComicPageException {
    log.trace("Getting page: id={}", id);
    return this.doGetPage(id);
  }

  /**
   * Saves the specified page.
   *
   * @param page the page
   * @return the updated page
   * @throws ComicPageException if an error occurs
   */
  @Transactional
  @CacheEvict(
      cacheNames = {COMICBOOK_CACHE},
      key = "#page.comicBook.id")
  public ComicPage save(final ComicPage page) throws ComicPageException {
    log.trace("Saving page: id={}", page.getId());
    return this.comicPageRepository.saveAndFlush(page);
  }

  /**
   * Returns all pages with a given hash that are not marked for deletion.
   *
   * @param hash the page hash
   * @return the pages
   */
  public List<ComicPage> getUnmarkedWithHash(final String hash) {
    log.trace("Fetching unmarked pages with hash: {}", hash);
    return this.comicPageRepository.findByHashAndPageState(hash, ComicPageState.STABLE);
  }

  /**
   * Returns all pages with a given hash that are marked for deletion.
   *
   * @param hash the page hash
   * @return the pages
   */
  @Transactional
  public List<ComicPage> getMarkedWithHash(final String hash) {
    log.trace("Fetching marked pages with hash: {}", hash);
    return this.comicPageRepository.findByHashAndPageState(hash, ComicPageState.DELETED);
  }

  /**
   * Updates the deleted state for individual pages.
   *
   * @param idList the page id list
   * @param deleted the deleted state
   */
  public void updatePageDeletion(final List<Long> idList, final boolean deleted) {
    log.trace("Updating page deletion state");
    for (int index = 0; index < idList.size(); index++) {
      long id = idList.get(index);
      log.trace("Loading page: id={}", id);
      final ComicPage page = this.comicPageRepository.getById(id);
      if (page != null) {
        if (deleted) {
          log.trace("Marking page for deletion");
          this.comicPageStateHandler.fireEvent(page, ComicPageEvent.markForDeletion);
        } else {
          log.trace("Unmarking page for deletion");
          this.comicPageStateHandler.fireEvent(page, ComicPageEvent.unmarkForDeletion);
        }
      }
    }
  }

  /**
   * Returns up to a maximum number records for pages that need to have a cache entry generated.
   *
   * @param maxRecords the maximum records
   * @return the page list
   */
  @Transactional
  public List<ComicPage> loadPagesNeedingCacheEntries(final int maxRecords) {
    log.debug("Loading pages needing image cache entries");
    return this.comicPageRepository.findPagesNeedingCacheEntries(PageRequest.of(0, maxRecords));
  }

  /**
   * Marks all pages with a given hash as being in the image cache.
   *
   * @param hash the page hash
   */
  @Transactional
  public void markPagesAsHavingCacheEntry(final String hash) {
    log.debug("Marking pages as added to cache: hash={}", hash);
    this.comicPageRepository.markPagesAsAddedToImageCache(hash);
  }

  /**
   * Returns the list of all page hashes for all comic covers.
   *
   * @return the hash list
   */
  public Set<String> findAllCoverPageHashes() {
    log.debug("Getting all page hashes");
    return this.comicPageRepository.findAllCoverPageHashes();
  }

  /**
   * Marks only the cover pages for image cache entry generation.
   *
   * @param hash the page has
   */
  @Transactional
  public void markCoverPagesToHaveCacheEntryCreated(final String hash) {
    this.comicPageRepository.markCoverPagesToHaveCacheEntryCreated(hash);
  }

  /**
   * Updates a page's details based on content.
   *
   * @param page the page
   * @param content the content
   * @return the updated page
   */
  @Transactional
  public ComicPage updatePageContent(final ComicPage page, final byte[] content) {
    log.debug("Getting page hash");
    page.setHash(this.genericUtilitiesAdaptor.createHash(content));
    try {
      final BufferedImage image = ImageIO.read(new ByteArrayInputStream(content));
      if (image != null) {
        log.debug("Getting page dimensions ");
        page.setWidth(image.getWidth());
        page.setHeight(image.getHeight());
      }
    } catch (IOException error) {
      log.error("Failed to load image from content");
    }
    log.debug("Saving updated page");
    return this.comicPageRepository.save(page);
  }

  /*
   * Returns if there are any page records without a page hash.
   *
   * @return true if there are pages without hashes
   */
  @Transactional
  public boolean hasPagesWithoutHash() {
    return this.comicPageRepository.getPagesWithoutHashesCount() > 0L;
  }

  /**
   * Loads a set of pages that do not have a page hash.
   *
   * @param size the record count
   * @return the records
   */
  @Transactional
  public List<ComicPage> getPagesWithoutHash(final int size) {
    log.debug("Loading pages without a hash");
    return this.comicPageRepository.findPagesWithoutHash(PageRequest.of(0, size));
  }

  /**
   * Returns the number of pages without a hash.
   *
   * @return the record count
   */
  public long getPagesWithoutHashCount() {
    return this.comicPageRepository.getPagesWithoutHashesCount();
  }

  /**
   * Returns the total number of pages.
   *
   * @return the page count
   */
  public long getCount() {
    return this.comicPageRepository.count();
  }

  /**
   * Returns the list of comic pages that are not marked for deletion but which have a blocked has.
   *
   * @param maxRecords the maximum records to return
   * @return the list of pages
   */
  public List<ComicPage> getUnmarkedWithBlockedHash(final int maxRecords) {
    log.debug("Getting unmarked pages with blocked hash");
    return this.comicPageRepository.getUnmarkedWithBlockedHash(PageRequest.of(0, maxRecords));
  }

  public long getUnmarkedWithBlockedHashCount() {
    return this.comicPageRepository.getUnmarkedWithBlockedHashCount();
  }

  @Transactional
  @CacheEvict(cacheNames = COMICBOOK_CACHE, allEntries = true)
  public void markPagesWithHashForDeletion(final List<String> hashes) {
    log.debug("Deleting pages with hashes");
    hashes.forEach(
        hash -> {
          this.comicPageRepository
              .getPagesWithHash(hash)
              .forEach(
                  page ->
                      this.comicPageStateHandler.fireEvent(page, ComicPageEvent.markForDeletion));
        });
  }

  @Transactional
  @CacheEvict(cacheNames = COMICBOOK_CACHE, allEntries = true)
  public void unmarkPagesWithHashForDeletion(final List<String> hashes) {
    log.debug("Deleting pages with hashes");
    hashes.forEach(
        hash -> {
          this.comicPageRepository
              .getPagesWithHash(hash)
              .forEach(
                  page ->
                      this.comicPageStateHandler.fireEvent(page, ComicPageEvent.unmarkForDeletion));
        });
  }

  @Transactional
  public Long getPageIdForComicBookCover(final long comicBookId) throws ComicPageException {
    log.debug("Retrieving first page id for comic book: id={}", comicBookId);
    final Long result = this.comicPageRepository.getPageIdForComicBookCover(comicBookId);
    if (result == null) {
      throw new ComicPageException("Cannot find cover for comic: id=" + comicBookId);
    }
    return result;
  }

  /**
   * Retrieves the filename for the comic that contains the page.
   *
   * @param pageId the page id
   * @return the comic filename
   * @throws ComicPageException if the page id is invalid
   */
  @Transactional
  public String getComicFilenameForPage(final Long pageId) throws ComicPageException {
    final String result = this.comicPageRepository.getComicFilenameForPage(pageId);
    if (result == null) {
      throw new ComicPageException("No such page: id=" + pageId);
    }
    return result;
  }

  /**
   * Retrieves the filename for the given page within its parent comic.
   *
   * @param pageId the page id
   * @return the page filename
   * @throws ComicPageException if the page id is invalid
   */
  @Transactional
  public String getPageFilename(final long pageId) throws ComicPageException {
    final String result = this.comicPageRepository.getPageFilename(pageId);
    if (result == null) {
      throw new ComicPageException("No such page: id=" + pageId);
    }
    return result;
  }

  /**
   * Returns the has for the given page.
   *
   * @param pageId the page id
   * @return the hash
   * @throws ComicPageException if the page id is invalid
   */
  @Transactional
  public String getHashForPage(final long pageId) throws ComicPageException {
    final String result = this.comicPageRepository.getHashForPage(pageId);
    if (result == null) {
      throw new ComicPageException("No such page: id=" + pageId);
    }
    return result;
  }
}

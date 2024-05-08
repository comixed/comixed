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

import static org.comixedproject.state.comicpages.PageStateHandler.HEADER_PAGE;

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
import org.comixedproject.model.comicpages.Page;
import org.comixedproject.model.comicpages.PageState;
import org.comixedproject.repositories.comicpages.PageRepository;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.comixedproject.state.comicpages.PageEvent;
import org.comixedproject.state.comicpages.PageStateChangeListener;
import org.comixedproject.state.comicpages.PageStateHandler;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.Message;
import org.springframework.statemachine.state.State;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>PageService</code> provides business methods for instances of {@link Page}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class PageService implements InitializingBean, PageStateChangeListener {
  @Autowired private PageRepository pageRepository;
  @Autowired private PageStateHandler pageStateHandler;
  @Autowired private ComicBookService comicBookService;
  @Autowired private ComicStateHandler comicStateHandler;
  @Autowired private GenericUtilitiesAdaptor genericUtilitiesAdaptor;

  @Override
  public void afterPropertiesSet() throws Exception {
    log.trace("Subscribing to page state changes");
    this.pageStateHandler.addListener(this);
  }

  @Override
  public void onPageStateChange(
      final State<PageState, PageEvent> state, final Message<PageEvent> message) {
    final var page = message.getHeaders().get(HEADER_PAGE, Page.class);
    if (page == null) return;
    log.debug("Processing page state change: [{}] =>  {}", page.getId(), state.getId());
    page.setPageState(state.getId());
    final Page updated = this.pageRepository.save(page);
    log.trace("Firing comic event");
    this.comicStateHandler.fireEvent(updated.getComicBook(), ComicEvent.detailsUpdated);
  }

  /**
   * Finds one page with the given hash
   *
   * @param hash the hash
   * @return the page
   */
  @Transactional
  public Page getOneForHash(final String hash) {
    log.trace("Finding a page with hash: {}", hash);
    final List<Page> results = this.pageRepository.findByHash(hash);
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
  public Page getPageInComicByIndex(final long comicId, final int pageIndex)
      throws ComicBookException {
    log.debug(
        "Getting page content for comicBook: comicBook id={} page index={}", comicId, pageIndex);

    log.debug("Fetching comicBook: id={}", comicId);
    final ComicBook comicBook = this.comicBookService.getComic(comicId);

    if (comicBook != null) {
      if (pageIndex < comicBook.getPageCount()) {
        log.debug("Returning page");
        return comicBook.getPage(pageIndex);
      } else {
        log.warn("Index out of range");
      }
    }

    return null;
  }

  private Page doGetPage(final long id) throws PageException {
    final Optional<Page> result = this.pageRepository.findById(id);
    if (result.isEmpty()) throw new PageException("No such page: id=" + id);
    return result.get();
  }

  /**
   * Retrieves a page by its record id.
   *
   * @param id the record id
   * @return the page
   * @throws PageException if the id is invalid
   */
  public Page getForId(final long id) throws PageException {
    log.trace("Getting page: id={}", id);
    return this.doGetPage(id);
  }

  /**
   * Saves the specified page.
   *
   * @param page the page
   * @return the updated page
   * @throws PageException if an error occurs
   */
  @Transactional
  public Page save(final Page page) throws PageException {
    log.trace("Firing page event: save");
    this.pageStateHandler.fireEvent(page, PageEvent.savePage);
    log.trace("Returning updated page");
    return this.doGetPage(page.getId());
  }

  /**
   * Returns all pages with a given hash that are not marked for deletion.
   *
   * @param hash the page hash
   * @return the pages
   */
  public List<Page> getUnmarkedWithHash(final String hash) {
    log.trace("Fetching unmarked pages with hash: {}", hash);
    return this.pageRepository.findByHashAndPageState(hash, PageState.STABLE);
  }

  /**
   * Returns all pages with a given hash that are marked for deletion.
   *
   * @param hash the page hash
   * @return the pages
   */
  public List<Page> getMarkedWithHash(final String hash) {
    log.trace("Fetching marked pages with hash: {}", hash);
    return this.pageRepository.findByHashAndPageState(hash, PageState.DELETED);
  }

  /**
   * Updates the deleted state for individual pages.
   *
   * @param idList the page id list
   * @param deleted the deleted state
   */
  public void updatePageDeletion(final List<Long> idList, final boolean deleted) {
    log.trace("Updating page deletion state");
    idList.forEach(
        id -> {
          log.trace("Loading page: id={}", id);
          final Page page = this.pageRepository.getById(id);
          if (page != null) {
            if (deleted) {
              log.trace("Marking page for deletion");
              this.pageStateHandler.fireEvent(page, PageEvent.markForDeletion);
            } else {
              log.trace("Unmarking page for deletion");
              this.pageStateHandler.fireEvent(page, PageEvent.unmarkForDeletion);
            }
          }
        });
  }

  /**
   * Returns up to a maximum number records for pages that need to have a cache entry generated.
   *
   * @param maxRecords the maximum records
   * @return the page list
   */
  public List<Page> loadPagesNeedingCacheEntries(final int maxRecords) {
    log.debug("Loading pages needing image cache entries");
    return this.pageRepository.findPagesNeedingCacheEntries(PageRequest.of(0, maxRecords));
  }

  /**
   * Marks all pages with a given hash as being in the image cache.
   *
   * @param hash the page hash
   */
  public void markPagesAsHavingCacheEntry(final String hash) {
    log.debug("Marking pages as added to cache: hash={}", hash);
    this.pageRepository.markPagesAsAddedToImageCache(hash);
  }

  /**
   * Returns the list of all page hashes for all comic covers.
   *
   * @return the hash list
   */
  public Set<String> findAllCoverPageHashes() {
    log.debug("Getting all page hashes");
    return this.pageRepository.findAllCoverPageHashes();
  }

  /**
   * Marks only the cover pages for image cache entry generation.
   *
   * @param hash the page has
   */
  public void markCoverPagesToHaveCacheEntryCreated(final String hash) {
    this.pageRepository.markCoverPagesToHaveCacheEntryCreated(hash);
  }

  /**
   * Updates a page's details based on content.
   *
   * @param page the page
   * @param content the content
   * @return the updated page
   */
  @Transactional
  public Page updatePageContent(final Page page, final byte[] content) {
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
    return this.pageRepository.save(page);
  }
}

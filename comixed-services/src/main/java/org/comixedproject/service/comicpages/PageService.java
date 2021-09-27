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

import java.util.List;
import java.util.Optional;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicpages.Page;
import org.comixedproject.repositories.comicpages.PageRepository;
import org.comixedproject.service.comicbooks.ComicException;
import org.comixedproject.service.comicbooks.ComicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>PageService</code> provides business methods for instances of {@link Page}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class PageService {
  @Autowired private PageRepository pageRepository;
  @Autowired private ComicService comicService;

  /**
   * Retrieves the content for a comic page.
   *
   * @param comicId the comic record id
   * @param pageIndex the page index
   * @return the content
   * @throws ComicException if the comic does not exist
   */
  public Page getPageInComicByIndex(final long comicId, final int pageIndex) throws ComicException {
    log.debug("Getting page content for comic: comic id={} page index={}", comicId, pageIndex);

    log.debug("Fetching comic: id={}", comicId);
    final Comic comic = this.comicService.getComic(comicId);

    if (comic != null) {
      if (pageIndex < comic.getPageCount()) {
        log.debug("Returning page");
        return comic.getPage(pageIndex);
      } else {
        log.warn("Index out of range");
      }
    }

    return null;
  }

  /**
   * Marks a page for deletion.
   *
   * @param id the page id
   * @return the comic
   */
  @Transactional
  public Comic deletePage(final long id) {
    log.debug("Marking page as deleted: id={}", id);
    final Optional<Page> page = this.pageRepository.findById(id);

    if (page.isPresent()) {
      if (page.get().isDeleted()) {
        log.debug("Page was already marked as deleted");
        return page.get().getComic();
      } else {
        page.get().setDeleted(true);
        final Page result = this.pageRepository.save(page.get());
        log.debug("Page deleted");
        return result.getComic();
      }
    }

    log.warn("No such page");
    return null;
  }

  /**
   * Unmarks a page for deletion.
   *
   * @param id the page id
   * @return the comic
   */
  @Transactional
  public Comic undeletePage(final long id) {
    log.debug("Marking page as not deleted: id={}", id);
    final Optional<Page> page = this.pageRepository.findById(id);

    if (page.isPresent()) {
      if (page.get().isDeleted()) {
        page.get().setDeleted(false);
        log.debug("Page undeleted");
        return this.pageRepository.save(page.get()).getComic();

      } else {
        log.debug("Page was not marked as deleted");
        return page.get().getComic();
      }
    } else {
      log.warn("No such page");
    }
    return null;
  }

  /**
   * Retrieves a page by its record id.
   *
   * @param id the record id
   * @return the page
   */
  public Page getForId(final long id) {
    log.debug("Getting page by id: id={}", id);

    final Optional<Page> result = this.pageRepository.findById(id);

    if (!result.isPresent()) {
      log.warn("No such page");
      return null;
    }

    return result.get();
  }

  public List<Page> getAllPagesForComic(final long comicId) {
    log.debug("Getting all pages for comic: id={}", comicId);

    return this.pageRepository.findAllByComicId(comicId);
  }

  /**
   * Saves the specified page.
   *
   * @param page the page
   * @return the updated page
   */
  @Transactional
  public Page save(final Page page) {
    log.debug("Saving page: filename={} index={}", page.getFilename(), page.getIndex());
    return this.pageRepository.save(page);
  }

  /**
   * Finds one page with the given hash
   *
   * @param hash the hash
   * @return the page
   */
  public Page getOneForHash(final String hash) {
    log.debug("Finding pages with hash: {}", hash);
    final List<Page> pages = this.pageRepository.getPagesWithHash(hash);
    if (pages.isEmpty()) {
      log.debug("No pages found");
    }
    return pages.get(0);
  }

  /**
   * Returns all pages with a given hash that are not marked for deletion.
   *
   * @param hash the page hash
   * @return the pages
   */
  public List<Page> getUnmarkedWithHash(final String hash) {
    log.trace("Fetching unmarked pages with hash: {}", hash);
    return this.pageRepository.findByHashAndDeleted(hash, false);
  }

  /**
   * Returns all pages with a given hash that are marked for deletion.
   *
   * @param hash the page hash
   * @return the pages
   */
  public List<Page> getMarkedWithHash(final String hash) {
    log.trace("Fetching marked pages with hash: {}", hash);
    return this.pageRepository.findByHashAndDeleted(hash, true);
  }
}

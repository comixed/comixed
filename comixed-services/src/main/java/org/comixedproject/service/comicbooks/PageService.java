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

package org.comixedproject.service.comicbooks;

import java.util.*;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.Page;
import org.comixedproject.model.comicbooks.PageType;
import org.comixedproject.repositories.comicbooks.PageRepository;
import org.comixedproject.repositories.comicbooks.PageTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Log4j2
public class PageService {
  @Autowired private PageRepository pageRepository;
  @Autowired private PageTypeRepository pageTypeRepository;
  @Autowired private ComicService comicService;

  @Transactional
  public Page updateTypeForPage(final long id, final String typeName) throws PageException {
    log.debug("Setting page type for page: id={} page type={}", id, typeName);

    final Optional<Page> page = this.pageRepository.findById(id);
    final PageType pageType = this.pageTypeRepository.findByName(typeName);

    if (page.isPresent()) {
      if (pageType != null) {
        final Page pageRecord = page.get();

        pageRecord.setPageType(pageType);

        log.debug("Updating page with  new type");
        return this.pageRepository.save(pageRecord);
      } else {
        throw new PageException("Invalid page type: " + typeName);
      }
    } else {
      throw new PageException("No such page: id=" + id);
    }
  }

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
    } else {
      log.warn("No such comic");
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

  public List<PageType> getPageTypes() {
    log.debug("Getting all page types");

    return this.pageTypeRepository.findPageTypes();
  }

  /**
   * Marks all pages with a specific hash for deletion.
   *
   * @param hash the page hash
   * @return the number of pages affected
   */
  @Transactional
  public int deleteAllWithHash(final String hash) {
    log.debug("Deleting pages by hash: {}", hash);
    final int result = this.pageRepository.updateDeleteOnAllWithHash(hash, true);
    log.trace("Update affected {} record{}", result, result == 1 ? "" : "s");
    return result;
  }

  /**
   * Clears all pages with a specific hash for deletion.
   *
   * @param hash the page hash
   * @return the number of pages affected
   */
  @Transactional
  public int undeleteAllWithHash(final String hash) {
    log.debug("Undeleting pages by hash: {}", hash);
    final int result = this.pageRepository.updateDeleteOnAllWithHash(hash, false);
    log.debug("Update affected {} record{}", result, result == 1 ? "" : "s");
    return result;
  }

  @Transactional
  public void setDeletedState(final List<String> hashes, final boolean deleted) {
    for (int index = 0; index < hashes.size(); index++) {
      final String hash = hashes.get(index);
      log.debug("Loading pages with hash: {}", hash);
      final List<Page> pages = this.pageRepository.getPagesWithHash(hash);
      for (int pageIndex = 0; pageIndex < pages.size(); pageIndex++) {
        final Page page = pages.get(pageIndex);
        log.debug("Marking page deleted flag: id={} deleted={}", page.getId(), deleted);
        page.setDeleted(deleted);
        this.pageRepository.save(page);
      }
    }
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
}

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

package org.comixedproject.service.comic;

import java.util.*;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.Page;
import org.comixedproject.model.comic.PageType;
import org.comixedproject.model.library.BlockedPageHash;
import org.comixedproject.model.library.DuplicatePage;
import org.comixedproject.repositories.comic.ComicRepository;
import org.comixedproject.repositories.comic.PageRepository;
import org.comixedproject.repositories.comic.PageTypeRepository;
import org.comixedproject.repositories.library.BlockedPageHashRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Service
@Log4j2
public class PageService {
  @Autowired private PageRepository pageRepository;
  @Autowired private PageTypeRepository pageTypeRepository;
  @Autowired private BlockedPageHashRepository blockedPageHashRepository;
  @Autowired private ComicRepository comicRepository;

  @Transactional
  public Page updateTypeForPage(final long id, final String typeName) throws PageException {
    log.debug("Setting page type for page: id={} page type={}", id, typeName);

    final Optional<Page> page = this.pageRepository.findById(id);
    final PageType pageType = this.pageTypeRepository.findByName(typeName);

    if (page.isPresent()) {
      if (pageType != null) {
        final Page record = page.get();

        record.setPageType(pageType);

        log.debug("Updating page with  new type");
        return this.pageRepository.save(record);
      } else {
        throw new PageException("Invalid page type: " + typeName);
      }
    } else {
      throw new PageException("No such page: id=" + id);
    }
  }

  @Transactional
  public Comic addBlockedPageHash(final long pageId, final String hash) throws PageException {
    log.debug("Adding blocked page hash: {}", hash);
    BlockedPageHash existing = this.blockedPageHashRepository.findByHash(hash);

    if (existing != null) {
      log.debug("Blocked page hash already exists");
    } else {
      existing = new BlockedPageHash(hash);
      this.blockedPageHashRepository.save(existing);
    }

    final Optional<Page> page = this.pageRepository.findById(pageId);

    if (page.isPresent()) {
      return page.get().getComic();
    }

    throw new PageException("no such page: id=" + pageId);
  }

  @Transactional
  public Comic removeBlockedPageHash(final long pageId, final String hash) throws PageException {
    log.debug("Removing blocked page hash: {}", hash);
    final BlockedPageHash entry = this.blockedPageHashRepository.findByHash(hash);
    if (entry == null) {
      log.debug("No such hash");
    } else {
      this.blockedPageHashRepository.delete(entry);
    }

    final Optional<Page> page = this.pageRepository.findById(pageId);

    if (page.isPresent()) {
      return page.get().getComic();
    }

    throw new PageException("no such page: id=" + pageId);
  }

  public List<String> getAllBlockedPageHashes() {
    log.debug("Returning all blocked page hashes");

    return this.blockedPageHashRepository.getAllHashes();
  }

  public Page getPageInComicByIndex(final long comicId, final int pageIndex) {
    log.debug("Getting page content for comic: comic id={} page index={}", comicId, pageIndex);

    log.debug("Fetching comic: id={}", comicId);
    final Optional<Comic> comic = this.comicRepository.findById(comicId);

    if (comic.isPresent()) {
      if (pageIndex < comic.get().getPageCount()) {
        log.debug("Returning page");
        return comic.get().getPage(pageIndex);
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

  public Page findById(final long id) {
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

  @Transactional
  public int deleteAllWithHash(final String hash) {
    log.debug("Deleting pages by hash: {}", hash);

    final int result = this.pageRepository.updateDeleteOnAllWithHash(hash, true);

    log.debug("Update affected {} record{}", result, result == 1 ? "" : "s");

    return result;
  }

  @Transactional
  public int undeleteAllWithHash(final String hash) {
    log.debug("Undeleting pages by hash: {}", hash);

    final int result = this.pageRepository.updateDeleteOnAllWithHash(hash, false);

    log.debug("Update affected {} record{}", result, result == 1 ? "" : "s");

    return result;
  }

  @Transactional
  public List<DuplicatePage> setBlockingState(final List<String> hashes, final boolean blocked) {
    log.debug(
        "Updating {} hash{} to {}blocked",
        hashes.size(),
        hashes.size() == 1 ? "" : "es",
        blocked ? "" : "un");

    for (String hash : hashes) {
      BlockedPageHash entry = this.blockedPageHashRepository.findByHash(hash);

      if (blocked) {
        if (entry == null) {
          entry = new BlockedPageHash(hash);
          log.debug("Creating entry for hash: {}", hash);
          this.blockedPageHashRepository.save(entry);
        } else {
          log.debug("Hash already blocked: {}", hash);
        }
      } else {
        if (entry != null) {
          log.debug("Deleting entry for hash: {}", hash);
          this.blockedPageHashRepository.delete(entry);
        } else {
          log.debug("Hash not already blocked: {}", hash);
        }
      }
    }

    return this.getDuplicatePages();
  }

  @Transactional(isolation = Isolation.READ_UNCOMMITTED)
  public List<DuplicatePage> getDuplicatePages() {
    log.debug("Getting pages from repository");
    final List<Page> pages = this.pageRepository.getDuplicatePages();

    log.debug("Build duplicate page list");
    Map<String, DuplicatePage> mapped = new HashMap<>();
    for (Page page : pages) {
      DuplicatePage entry = mapped.get(page.getHash());

      if (entry == null) {
        entry = new DuplicatePage();

        entry.setHash(page.getHash());
        entry.setBlocked(page.isBlocked());
        mapped.put(entry.getHash(), entry);
      }
      entry.getPages().add(page);
    }

    return new ArrayList<>(mapped.values());
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
}

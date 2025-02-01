/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

package org.comixedproject.service.library;

import java.util.*;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.library.DuplicatePage;
import org.comixedproject.repositories.comicpages.ComicPageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * <code>DuplicatePageService</code> provides rules for working with instances of {@link
 * DuplicatePage}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class DuplicatePageService {
  @Autowired private ComicPageRepository comicPageRepository;

  /**
   * Retrieves the list of all duplicate pages in the library.
   *
   * @return the duplicate page list
   */
  @Transactional(isolation = Isolation.READ_UNCOMMITTED)
  public List<DuplicatePage> getDuplicatePages(
      final int page, final int size, final String sortBy, final String sortDirection) {
    log.trace("Getting pages from repository");
    return this.comicPageRepository.getDuplicatePages(
        PageRequest.of(page, size, this.doCreateSort(sortBy, sortDirection)));
  }

  /**
   * Retrieves the number of duplicate pages in the library.
   *
   * @return the page count
   */
  @Transactional
  public long getDuplicatePageCount() {
    log.debug("Loading duplicate page count");
    return this.comicPageRepository.getDuplicatePageCount();
  }

  private Sort doCreateSort(final String sortBy, final String sortDirection) {
    if (!StringUtils.hasLength(sortBy) || !StringUtils.hasLength(sortDirection)) {
      return Sort.unsorted();
    }

    String fieldName;
    switch (sortBy) {
      case "hash" -> fieldName = "hash";
      case "comic-count" -> fieldName = "comicCount";
      default -> fieldName = "hash";
    }

    Sort.Direction direction = Sort.Direction.DESC;
    if (sortDirection.equals("asc")) {
      direction = Sort.Direction.ASC;
    }
    return Sort.by(direction, fieldName);
  }

  /**
   * Retrieves the details for a single duplicate page.
   *
   * @param hash the page hash
   * @return the duplicate page detail
   * @throws DuplicatePageException if the hash was not found
   */
  @Transactional
  public DuplicatePage getForHash(final String hash) throws DuplicatePageException {
    log.trace("Loading all pages with a given hash");
    final List<ComicPage> pages = this.comicPageRepository.findByHash(hash);
    if (pages.isEmpty()) {
      log.trace("Hash not found: raising exception");
      throw new DuplicatePageException("Hash not found: " + hash);
    }
    log.trace("Converting to duplicate page object");
    final DuplicatePage result = new DuplicatePage(hash);
    pages.forEach(page -> result.getComics().add(page.getComicBook().getComicDetail()));
    log.trace("Returning duplicate page detail");
    return result;
  }
}

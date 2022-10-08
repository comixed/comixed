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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicpages.Page;
import org.comixedproject.model.library.DuplicatePage;
import org.comixedproject.repositories.comicpages.PageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>DuplicatePageService</code> provides rules for working with instances of {@link
 * DuplicatePage}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class DuplicatePageService {
  @Autowired private PageRepository pageRepository;

  /**
   * Retrieves the list of all duplicate pages in the library.
   *
   * @return the duplicate pages
   */
  @Transactional(isolation = Isolation.READ_UNCOMMITTED)
  public List<DuplicatePage> getDuplicatePages() {
    log.trace("Getting pages from repository");
    final List<Page> pages = this.pageRepository.getDuplicatePages();
    log.trace("Build duplicate page list");
    Map<String, DuplicatePage> mapped = new HashMap<>();
    for (Page page : pages) {
      log.trace("Looking for existing entry");
      DuplicatePage entry = mapped.get(page.getHash());
      if (entry == null) {
        log.trace("Creating new entry");
        entry = new DuplicatePage(page.getHash());
        mapped.put(entry.getHash(), entry);
      }
      log.trace("Loading comic into entry");
      entry.getIds().add(page.getComicBook().getId());
    }
    log.trace("Returning duplicate page list");
    return new ArrayList<>(mapped.values());
  }

  /**
   * Retrieves the details for a single duplicate page.
   *
   * @param hash the page hash
   * @return the duplicate page detail
   * @throws DuplicatePageException if the hash was not found
   */
  public DuplicatePage getForHash(final String hash) throws DuplicatePageException {
    log.trace("Loading all pages with a given hash");
    final List<Page> pages = this.pageRepository.findByHash(hash);
    if (pages.isEmpty()) {
      log.trace("Hash not found: raising exception");
      throw new DuplicatePageException("Hash not found: " + hash);
    }
    log.trace("Converting to duplicate page object");
    final DuplicatePage result = new DuplicatePage(hash);
    pages.forEach(page -> result.getIds().add(page.getComicBook().getId()));
    log.trace("Returning duplicate page detail");
    return result;
  }
}

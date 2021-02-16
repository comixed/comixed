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

package org.comixedproject.service.page;

import java.util.Date;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.net.library.LoadBlockedPageHashesResponse;
import org.comixedproject.model.page.BlockedPageHash;
import org.comixedproject.model.page.Page;
import org.comixedproject.repositories.page.BlockedPageHashRepository;
import org.comixedproject.service.comic.ComicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>BlockedPageHashService</code> provides business logic methods for instances of {@link
 * BlockedPageHash}.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class BlockedPageHashService {
  @Autowired private BlockedPageHashRepository blockedPageHashRepository;
  @Autowired private ComicService comicService;
  @Autowired private PageService pageService;

  /**
   * Removes the specified page hash from the blocked list.
   *
   * @param hash the hash
   */
  @Transactional
  public void deleteHash(final String hash) {
    final BlockedPageHash record = this.blockedPageHashRepository.findByHash(hash);
    if (record == null) {
      log.debug("Hash is not blocked: {}", hash);
      return;
    }

    log.debug("Deleting record for hash: {}", hash);
    this.blockedPageHashRepository.delete(record);
    log.debug("Updating affected comics");
    this.comicService.updateComicsWithPageHash(hash);
  }

  /**
   * Adds the given page hash to the blocked list.
   *
   * @param hash the hash
   */
  @Transactional
  public void addHash(final String hash) {
    BlockedPageHash record = this.blockedPageHashRepository.findByHash(hash);
    if (record != null) {
      log.debug("Hash already blocked");
      return;
    }
    log.debug("Blocking hash: {}", hash);
    this.blockedPageHashRepository.save(new BlockedPageHash(hash));
    log.debug("Updating affected comics");
    this.comicService.updateComicsWithPageHash(hash);
  }

  /**
   * Returns all blocked page hashes and since the given timestamp plus the latest update timestamp.
   *
   * @param timestamp the timestamp
   * @return the response
   */
  public LoadBlockedPageHashesResponse getAllHashesSince(final long timestamp) {
    log.debug("Getting all blocked page hashes since {}", new Date(timestamp));
    return new LoadBlockedPageHashesResponse(this.blockedPageHashRepository.getAllHashes(), 0L);
  }

  /**
   * Returns all blocked page hashes
   *
   * @return the list of hashes
   */
  public List<String> getAllHashes() {
    log.debug("Getting a blocked page hashes");
    return this.blockedPageHashRepository.getAllHashes();
  }

  /**
   * Returns a page with the given hash, if found.
   *
   * @param hash the page hash
   * @return the page, or <code>null</code>
   */
  public Page findPageForHash(final String hash) {
    log.debug("Finding a page with hash: {}", hash);
    final List<Page> pages = this.pageService.getAllWithHash(hash);
    if (pages.isEmpty()) {
      log.debug("No pages found");
      return null;
    }

    return pages.get(0);
  }
}

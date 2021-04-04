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

import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.library.BlockedPageHash;
import org.comixedproject.repositories.library.BlockedPageHashRepository;
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
  }

  /**
   * Returns all blocked page hashes.
   *
   * @return the hashes
   */
  public List<String> getAllHashes() {
    log.debug("Getting all blocked page hashes");
    return this.blockedPageHashRepository.getAllHashes();
  }
}

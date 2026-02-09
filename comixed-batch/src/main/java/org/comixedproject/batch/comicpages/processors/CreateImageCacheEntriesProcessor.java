/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

package org.comixedproject.batch.comicpages.processors;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.service.comicpages.PageCacheService;
import org.springframework.batch.infrastructure.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>CreateImageCacheEntriesProcessor</code> takes an incoming {@link ComicPage} object and
 * casues an image cache to be created. It then returns the hash that was updated.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class CreateImageCacheEntriesProcessor implements ItemProcessor<ComicPage, String> {
  @Autowired private PageCacheService pageCacheService;

  @Override
  public String process(final ComicPage page) {
    final String hash = page.getHash();
    if (this.pageCacheService.findByHash(hash) == null) {
      log.debug("Saving thumbnail for hash: {}", hash);
      this.pageCacheService.addPageToCache(page);
    }
    return hash;
  }
}

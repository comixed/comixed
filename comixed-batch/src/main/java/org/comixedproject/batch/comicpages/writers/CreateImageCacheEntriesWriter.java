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

package org.comixedproject.batch.comicpages.writers;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.service.comicpages.ComicPageService;
import org.springframework.batch.infrastructure.item.Chunk;
import org.springframework.batch.infrastructure.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>CreateImageCacheEntriesWriter</code> updates all {@link ComicPage} records with the given
 * hash value, marking them as having a cached entry.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class CreateImageCacheEntriesWriter implements ItemWriter<String> {
  @Autowired private ComicPageService comicPageService;

  @Override
  public void write(final Chunk<? extends String> hashList) {
    hashList.forEach(
        hash -> {
          log.debug("Updating all pages with hash: {}", hash);
          this.comicPageService.markPagesAsHavingCacheEntry(hash);
        });
  }
}

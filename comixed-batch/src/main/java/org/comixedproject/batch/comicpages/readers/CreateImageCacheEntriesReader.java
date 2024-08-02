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

package org.comixedproject.batch.comicpages.readers;

import java.util.List;
import lombok.Getter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.service.comicpages.ComicPageService;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.ItemReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * <code>CreateImageCacheEntriesReader</code> provides a reader that returns only instances of
 * {@link ComicPage} that do not have an existing thumbnail.
 *
 * @author Darryl L. Pierce
 */
@StepScope
@Component
@Log4j2
public class CreateImageCacheEntriesReader implements ItemReader<ComicPage> {
  @Autowired private ComicPageService comicPageService;

  @Value("${comixed.batch.add-cover-to-image-cache.chunk-size:1}")
  @Getter
  private int chunkSize;

  public List<ComicPage> pageList;

  @Override
  public ComicPage read() {
    if (this.pageList == null || this.pageList.isEmpty()) {
      log.debug("Loading pages without thumbnails");
      this.pageList = this.comicPageService.loadPagesNeedingCacheEntries(this.chunkSize);
    }

    if (this.pageList.isEmpty()) {
      log.debug("No pages need thumbnails currently");
      this.pageList = null;
      return null;
    }

    log.debug("Returning page: {}", this.pageList.get(0).getHash());
    return this.pageList.remove(0);
  }
}

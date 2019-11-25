/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

package org.comixed.loaders;

import org.comixed.model.library.Comic;
import org.comixed.model.library.Page;
import org.comixed.repositories.library.PageTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>ImageEntryLoader</code> loads an image and makes it a {@link Page} for a comic.
 *
 * @author Darryl L. Pierce
 */
@Component
public class ImageEntryLoader extends AbstractEntryLoader {
  @Autowired private PageTypeRepository pageTypeRepository;

  @Override
  public void loadContent(Comic comic, String filename, byte[] content) {
    this.logger.debug("Loading image into comic");
    // if the comic already has this offset then update the offset's content
    if (comic.hasPageWithFilename(filename)) {
      this.logger.debug("Ignore known file: {}", filename);
      //            comic.getPageWithFilename(filename)
      //                 .setContent(content);
    } else {
      Page page = new Page(filename, content, this.pageTypeRepository.getDefaultPageType());
      comic.addPage(comic.getPageCount(), page);
    }
  }
}

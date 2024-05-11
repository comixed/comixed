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

package org.comixedproject.adaptors.content;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicpages.Page;
import org.springframework.stereotype.Component;

/**
 * <code>ImageContentAdaptor</code> loads an image and makes it a {@link Page} for a comic.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ImageContentAdaptor extends AbstractContentAdaptor {
  @Override
  public void loadContent(
      final ComicBook comicBook,
      final String filename,
      final byte[] content,
      final ContentAdaptorRules rules) {
    log.trace("Loading image into comicBook");
    // if the comicBook already has this offset then update the offset's content
    if (comicBook.hasPageWithFilename(filename)) {
      log.trace("Ignore known file: {}", filename);
    } else {
      var page = new Page();
      page.setFilename(filename);
      page.setComicBook(comicBook);
      comicBook.getPages().add(page);
      page.setPageNumber(comicBook.getPages().size());
    }
  }
}

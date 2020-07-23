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

package org.comixedproject.loaders;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import javax.imageio.ImageIO;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.Page;
import org.comixedproject.repositories.comic.PageTypeRepository;
import org.comixedproject.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>ImageEntryLoader</code> loads an image and makes it a {@link Page} for a comic.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ImageEntryLoader extends AbstractEntryLoader {
  @Autowired private PageTypeRepository pageTypeRepository;
  @Autowired private Utils utils;

  @Override
  public void loadContent(Comic comic, String filename, byte[] content) {
    log.debug("Loading image into comic");
    // if the comic already has this offset then update the offset's content
    if (comic.hasPageWithFilename(filename)) {
      log.debug("Ignore known file: {}", filename);
    } else {
      final String hash = utils.createHash(content);

      try {
        final BufferedImage bimage = ImageIO.read(new ByteArrayInputStream(content));
        final int width = bimage.getWidth();
        final int height = bimage.getHeight();
        Page page =
            new Page(filename, this.pageTypeRepository.getDefaultPageType(), hash, width, height);
        page.setContent(content);
        page.setComic(comic);
        comic.getPages().add(page);
        page.setPageNumber(comic.getPages().size());
      } catch (IOException error) {
        log.error("Failed to load content: {}", filename, error);
      }
    }
  }
}

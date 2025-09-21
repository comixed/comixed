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

package org.comixedproject.batch.comicbooks.processors;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.util.Objects;
import javax.imageio.ImageIO;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.GenericUtilitiesAdaptor;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.batch.ComicCheckOutManager;
import org.comixedproject.model.comicbooks.ComicBook;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * <code>ProcessUnhashedComicsProcessor</code> loads the contents for the unhashed pages of a comic
 * book, then sets the page's hash.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ProcessUnhashedComicsProcessor implements ItemProcessor<ComicBook, ComicBook> {
  @Autowired private ComicBookAdaptor comicBookAdaptor;
  @Autowired private GenericUtilitiesAdaptor genericUtilitiesAdaptor;
  @Autowired private ComicCheckOutManager comicCheckOutManager;

  @Override
  public ComicBook process(final ComicBook comicBook) {
    this.comicCheckOutManager.checkOut(comicBook.getComicBookId());
    log.debug(
        "Loading page hashes for comic book: {}", comicBook.getComicDetail().getBaseFilename());
    comicBook.getPages().stream()
        .filter(page -> Objects.nonNull(page))
        .filter(page -> !StringUtils.hasLength(page.getHash()))
        .forEach(
            page -> {
              try {
                final byte[] content =
                    this.comicBookAdaptor.loadPageContent(comicBook, page.getPageNumber());
                log.trace("Setting page hash");
                page.setHash(this.genericUtilitiesAdaptor.createHash(content));
                log.trace("Setting page dimensions");
                final BufferedImage image = ImageIO.read(new ByteArrayInputStream(content));
                page.setWidth(image.getWidth());
                page.setHeight(image.getHeight());
              } catch (Exception error) {
                log.error("Failed to set page details", error);
              }
            });
    this.comicCheckOutManager.checkIn(comicBook.getComicBookId());

    return comicBook;
  }
}

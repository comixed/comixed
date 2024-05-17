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
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.GenericUtilitiesAdaptor;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.model.comicpages.ComicPage;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>LoadPageHashProcessor</code> loads the contents for a page, then sets the page's hash.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class LoadPageHashProcessor implements ItemProcessor<ComicPage, ComicPage> {
  @Autowired private ComicBookAdaptor comicBookAdaptor;
  @Autowired private GenericUtilitiesAdaptor genericUtilitiesAdaptor;

  @Override
  public ComicPage process(final ComicPage page) {
    log.trace("Loading page content");
    try {
      final byte[] content =
          this.comicBookAdaptor.loadPageContent(page.getComicBook(), page.getPageNumber());
      log.trace("Setting page hash");
      page.setHash(this.genericUtilitiesAdaptor.createHash(content));
    } catch (AdaptorException error) {
      log.error("Failed to set page hash", error);
    }

    return page;
  }
}

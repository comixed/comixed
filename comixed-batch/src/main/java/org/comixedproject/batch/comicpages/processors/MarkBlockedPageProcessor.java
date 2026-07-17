/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
import org.comixedproject.model.comicpages.ComicPageType;
import org.springframework.batch.infrastructure.item.ItemProcessor;
import org.springframework.stereotype.Component;

/**
 * <code>MarkBlockedPageProcessor</code> processes a blocked page, marking it for deletion.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class MarkBlockedPageProcessor implements ItemProcessor<ComicPage, ComicPage> {
  @Override
  public ComicPage process(final ComicPage page) {
    log.debug(
        "Marking page for deletion: comic book={} page index={}",
        page.getComicBook().getComicBookId(),
        page.getPageNumber());
    page.setPageType(ComicPageType.DELETED);
    return page;
  }
}

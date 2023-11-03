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

package org.comixedproject.batch.comicpages.writers;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicpages.Page;
import org.comixedproject.state.comicpages.PageEvent;
import org.comixedproject.state.comicpages.PageStateHandler;
import org.springframework.batch.item.Chunk;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>AbstractPageWriter</code> provides a foundation for building writers for instances of
 * {@link Page}.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
@RequiredArgsConstructor
public abstract class AbstractPageWriter implements ItemWriter<Page> {
  @Autowired private PageStateHandler pageStateHandler;

  @NonNull private PageEvent pageEvent;

  @Override
  public void write(final Chunk<? extends Page> pages) throws Exception {
    pages.forEach(
        page -> {
          log.trace("Publishing page event: {}", this.pageEvent);
          this.pageStateHandler.fireEvent(page, this.pageEvent);
        });
  }
}

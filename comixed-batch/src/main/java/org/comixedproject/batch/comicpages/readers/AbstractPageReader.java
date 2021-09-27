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

package org.comixedproject.batch.comicpages.readers;

import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicpages.Page;
import org.springframework.batch.item.ItemReader;

/**
 * <code>AbstractPageReader</code> provides a foundation for creating new readers for {@link Page}s.
 *
 * @author Darryl L. Pierce
 */
@Log4j2
public abstract class AbstractPageReader implements ItemReader<Page> {
  List<Page> pageList = null;

  @Override
  public Page read() {
    if (this.pageList == null) {
      log.trace("Load more pages to process");
      this.pageList = this.doLoadPages();
    }

    if (this.pageList.isEmpty()) {
      log.trace("No pages to process");
      this.pageList = null;
      return null;
    }

    log.trace("Returning next page to process");
    return this.pageList.remove(0);
  }

  /**
   * Called to load more pages to be processed.
   *
   * @return the comics
   */
  protected abstract List<Page> doLoadPages();
}

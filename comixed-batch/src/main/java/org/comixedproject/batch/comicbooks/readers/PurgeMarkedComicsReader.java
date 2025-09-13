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

package org.comixedproject.batch.comicbooks.readers;

import java.util.List;
import lombok.Getter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.ComicBook;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * <code>PurgeMarkedComicsReader</code> provides a reader that loads comics marked for purging.
 *
 * @author Darryl L. Pierce
 */
@Component
@StepScope
@Log4j2
public class PurgeMarkedComicsReader extends AbstractComicReader {
  @Value("${comixed.batch.purge-library.chunk-size:1}")
  @Getter
  private int chunkSize;

  @Override
  protected List<ComicBook> doLoadComics() {
    log.trace("Loading comics marked for purging");
    return this.comicBookService.findComicsMarkedForPurging(this.chunkSize);
  }
}

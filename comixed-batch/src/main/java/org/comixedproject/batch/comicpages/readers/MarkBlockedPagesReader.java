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

import groovy.util.logging.Log4j;
import java.util.List;
import org.comixedproject.model.comicpages.ComicPage;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * <code>MarkBlockedPagesReader</code> loads pages that have a blocked hash and are not currently
 * marked for deletion.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j
@StepScope
public class MarkBlockedPagesReader extends AbstractPageReader {
  @Value("${comixed.batch.mark-blocked-pages.chunk-size}")
  private int chunkSize;

  @Override
  protected List<ComicPage> doLoadPages() {
    return this.comicPageService.getUnmarkedWithBlockedHash(this.chunkSize);
  }
}

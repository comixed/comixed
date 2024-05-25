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

package org.comixedproject.batch.comicpages.listeners;

import static org.comixedproject.model.messaging.batch.ProcessComicBooksStatus.MARK_BLOCKED_PAGE_STEP;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.batch.comicbooks.listeners.AbstractBatchProcessChunkListener;
import org.springframework.stereotype.Component;

/**
 * <code>MarkBlockedPagesChunkListener</code> provides a listener that relays the chunk status for
 * the job as it runs.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class MarkBlockedPagesChunkListener extends AbstractBatchProcessChunkListener {
  @Override
  protected String getStepName() {
    return MARK_BLOCKED_PAGE_STEP;
  }

  @Override
  protected boolean isActive() {
    return this.comicPageService.getUnmarkedWithBlockedHashCount() > 0L;
  }

  @Override
  protected long getProcessedElements() {
    return this.comicPageService.getCount()
        - this.comicPageService.getUnmarkedWithBlockedHashCount();
  }

  @Override
  protected long getTotalElements() {
    return this.comicPageService.getCount();
  }
}

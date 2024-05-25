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

import static org.comixedproject.model.messaging.batch.ProcessComicBooksStatus.*;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.batch.comicbooks.listeners.AbstractBatchProcessChunkListener;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.stereotype.Component;

/**
 * <code>LoadPageHashChunkListener</code> sends notifications as the page hash job processes each
 * chunk of data.
 *
 * @author Darryl L. Pierce
 */
@Component
@StepScope
@Log4j2
public class LoadPageHashChunkListener extends AbstractBatchProcessChunkListener {
  @Override
  protected String getStepName() {
    return LOAD_PAGE_HASH_STEP;
  }

  @Override
  protected boolean isActive() {
    return this.comicPageService.getPagesWithoutHashCount() > 0;
  }

  @Override
  protected long getProcessedElements() {
    return this.comicPageService.getCount() - this.comicPageService.getPagesWithoutHashCount();
  }

  @Override
  protected long getTotalElements() {
    return this.comicPageService.getCount();
  }
}

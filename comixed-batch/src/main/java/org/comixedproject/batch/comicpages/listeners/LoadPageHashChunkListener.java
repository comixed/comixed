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
import org.comixedproject.batch.listeners.AbstractBatchProcessListener;
import org.comixedproject.model.batch.BatchProcessDetail;
import org.comixedproject.service.comicpages.PageService;
import org.springframework.batch.core.ChunkListener;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.beans.factory.annotation.Autowired;
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
public class LoadPageHashChunkListener extends AbstractBatchProcessListener
    implements ChunkListener {
  @Autowired private PageService pageService;

  @Override
  public void beforeChunk(final ChunkContext context) {
    this.doPublishChunkState(context);
  }

  @Override
  public void afterChunk(final ChunkContext context) {
    this.doPublishChunkState(context);
  }

  @Override
  public void afterChunkError(final ChunkContext context) {
    this.doPublishChunkState(context);
  }

  private void doPublishChunkState(ChunkContext chunkContext) {
    this.doPublishBatchProcessDetail(
        BatchProcessDetail.from(
            chunkContext.getStepContext().getStepExecution().getJobExecution()));
    final ExecutionContext context =
        chunkContext.getStepContext().getStepExecution().getExecutionContext();
    context.putString(PROCESS_COMIC_BOOKS_STATUS_BATCH_NAME, "");
    context.putString(
        PROCESS_COMIC_BOOKS_STATUS_STEP_NAME, PROCESS_COMIC_BOOKS_STEP_NAME_LOAD_PAGE_HASH);
    context.putLong(PROCESS_COMIC_BOOKS_STATUS_JOB_FINISHED, System.currentTimeMillis());
    final long total = this.pageService.getCount();
    final long unprocessed = this.pageService.getPagesWithoutHashCount();
    context.putLong(PROCESS_COMIC_BOOKS_STATUS_TOTAL_COMICS, total);
    context.putLong(PROCESS_COMIC_BOOKS_STATUS_PROCESSED_COMICS, total - unprocessed);
    this.doPublishProcessComicBookStatus(context, true);
  }
}

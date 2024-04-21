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

package org.comixedproject.batch.comicbooks.listeners;

import static org.comixedproject.model.messaging.batch.AddComicBooksStatus.*;

import lombok.extern.log4j.Log4j2;
import org.springframework.batch.core.ChunkListener;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.stereotype.Component;

/**
 * <code>AddedComicBookChunkListener</code> provides a chunk listener to relay the status of comics
 * processed.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class AddedComicBookChunkListener extends AbstractBatchProcessListener
    implements ChunkListener {

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

  private void doPublishChunkState(ChunkContext context) {
    this.doPublishBatchProcessDetail(
        this.getBatchDetails(context.getStepContext().getStepExecution().getJobExecution()));
    final ExecutionContext executionContext =
        context.getStepContext().getStepExecution().getJobExecution().getExecutionContext();
    log.trace("Publishing status after chunk");
    executionContext.putLong(
        ADD_COMIC_BOOKS_PROCESSED_COMICS,
        context.getStepContext().getStepExecution().getWriteCount());
    this.doPublishAddComicBookStatus(executionContext);
  }
}

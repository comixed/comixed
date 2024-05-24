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

package org.comixedproject.batch.comicbooks.listeners;

import static org.comixedproject.model.messaging.batch.ProcessComicBooksStatus.DELETE_DESCRIPTORS_STEP;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.batch.listeners.AbstractBatchProcessListener;
import org.springframework.batch.core.ChunkListener;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.stereotype.Component;

/**
 * <code>DeleteImportedDescriptorsListener</code> relays status while comic file descriptors that
 * have been imported are deleted.
 *
 * @author Darryl L. Pierce
 */
@Component
@StepScope
@Log4j2
public class DeleteImportedDescriptorsListener extends AbstractBatchProcessListener
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
    final long comicFiles = this.comicFileService.getUnimportedComicFileDescriptorCount();
    final long comicBooks = this.comicBookService.getComicBookCount();
    this.doPublishProcessComicBookStatus(
        comicFiles > 0, DELETE_DESCRIPTORS_STEP, comicBooks + comicFiles, comicBooks);
  }
}

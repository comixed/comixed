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

import static org.comixedproject.model.messaging.batch.ProcessComicBooksStatus.COMIC_MARKED_AS_ADDED_STEP;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.batch.listeners.AbstractBatchProcessListener;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.springframework.batch.core.ChunkListener;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>RecordInsertedChunkListener</code> relays status as imported comics are marked as reading
 * for processing.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class RecordInsertedChunkListener extends AbstractBatchProcessListener
    implements ChunkListener {
  @Autowired private ComicBookService comicBookService;

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
    final long unprocessed = this.comicBookService.getCountForState(ComicState.ADDED);
    final long comicBooks = this.comicBookService.getComicBookCount();
    this.doPublishProcessComicBookStatus(
        unprocessed > 0, COMIC_MARKED_AS_ADDED_STEP, "", comicBooks, comicBooks - unprocessed);
  }
}

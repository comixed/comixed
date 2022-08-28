/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

package org.comixedproject.batch.metadata.listeners;

import lombok.extern.log4j.Log4j2;
import org.springframework.batch.core.ChunkListener;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.stereotype.Component;

/**
 * <code>ScrapeComicBookChunkListener</code> is notified as each comic is processed during metadata
 * update.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ScrapeComicBookChunkListener extends AbstractMetadataUpdateProcessingListener
    implements ChunkListener {
  @Override
  public void beforeChunk(final ChunkContext chunkContext) {
    // nothing to do
  }

  @Override
  public void afterChunk(final ChunkContext chunkContext) {
    final ExecutionContext executionContext =
        chunkContext.getStepContext().getStepExecution().getJobExecution().getExecutionContext();
    this.doPublishState(executionContext);
  }

  @Override
  public void afterChunkError(final ChunkContext chunkContext) {
    // nothing to do
  }
}

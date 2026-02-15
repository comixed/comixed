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
import org.jspecify.annotations.Nullable;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.listener.ChunkListener;
import org.springframework.batch.core.listener.StepExecutionListener;
import org.springframework.batch.core.step.StepExecution;
import org.springframework.batch.infrastructure.item.Chunk;
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
    implements ChunkListener, StepExecutionListener {

  private StepExecution stepExecution;

  @Override
  public @Nullable ExitStatus afterStep(StepExecution stepExecution) {
    this.stepExecution = stepExecution;
    return StepExecutionListener.super.afterStep(stepExecution);
  }

  @Override
  public void beforeStep(StepExecution stepExecution) {
    this.stepExecution = stepExecution;
    StepExecutionListener.super.beforeStep(stepExecution);
  }

  @Override
  public void afterChunk(Chunk chunk) {
    this.doPublishState(this.stepExecution.getJobExecution().getExecutionContext());
  }

  @Override
  public void beforeChunk(Chunk chunk) {
    // noop
  }

  @Override
  public void onChunkError(Exception exception, Chunk chunk) {
    // noop
  }
}

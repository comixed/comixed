package org.comixedproject.batch.comicbooks.listeners;

import org.comixedproject.batch.listeners.AbstractBatchProcessListener;
import org.comixedproject.service.comicpages.ComicPageService;
import org.jspecify.annotations.Nullable;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.listener.ChunkListener;
import org.springframework.batch.core.listener.StepExecutionListener;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.StepExecution;
import org.springframework.batch.infrastructure.item.Chunk;
import org.springframework.beans.factory.annotation.Autowired;

public abstract class AbstractBatchProcessChunkListener extends AbstractBatchProcessListener
    implements ChunkListener, StepExecutionListener {
  @Autowired protected ComicPageService comicPageService;

  private StepExecution stepExecution;

//  @Override
//  public void beforeChunk(final ChunkContext context) {
//    this.doPublishChunkState(context);
//  }
//
//  @Override
//  public void afterChunk(final ChunkContext context) {
//    this.doPublishChunkState(context);
//  }
//
//  @Override
//  public void afterChunkError(final ChunkContext context) {
//    this.doPublishChunkState(context);
//  }


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
  public void beforeChunk(Chunk chunk) {
    this.doPublishStepExecution(stepExecution);
  }

  @Override
  public void afterChunk(Chunk chunk) {
    this.doPublishStepExecution(stepExecution);
  }

  @Override
  public void onChunkError(Exception exception, Chunk chunk) {
    this.doPublishStepExecution(stepExecution);
  }

  private void doPublishStepExecution(StepExecution execution) {
    this.doPublishBatchProcessDetail(
        this.getBatchDetails(execution.getJobExecution()));
    final long total = this.getTotalElements();
    final long processed = this.getProcessedElements();
    final boolean active = this.isActive();
    this.doPublishProcessComicBookStatus(active, this.getStepName(), total, processed);
  }


  protected abstract String getStepName();

  protected abstract boolean isActive();

  protected abstract long getProcessedElements();

  protected abstract long getTotalElements();
}

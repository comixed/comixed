package org.comixedproject.batch.comicbooks.listeners;

import org.comixedproject.batch.listeners.AbstractBatchProcessListener;
import org.comixedproject.service.comicpages.ComicPageService;
import org.springframework.batch.core.ChunkListener;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.beans.factory.annotation.Autowired;

public abstract class AbstractBatchProcessChunkListener extends AbstractBatchProcessListener
    implements ChunkListener {
  @Autowired protected ComicPageService comicPageService;

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

package org.comixedproject.batch.comicbooks.listeners;

import jakarta.annotation.Nonnull;
import java.util.Optional;
import org.comixedproject.batch.listeners.AbstractBatchProcessListener;
import org.comixedproject.service.comicpages.ComicPageService;
import org.jspecify.annotations.NonNull;
import org.springframework.batch.core.job.JobExecution;
import org.springframework.batch.core.listener.ChunkListener;
import org.springframework.batch.core.scope.context.StepContext;
import org.springframework.batch.core.scope.context.StepSynchronizationManager;
import org.springframework.batch.infrastructure.item.Chunk;
import org.springframework.beans.factory.annotation.Autowired;

public abstract class AbstractBatchProcessChunkListener<I, O> extends AbstractBatchProcessListener
    implements ChunkListener<I, O> {
  @Autowired protected ComicPageService comicPageService;

  @Override
  public void beforeChunk(@Nonnull final Chunk<I> chunk) {
    this.doPublishChunkState();
  }

  @Override
  public void afterChunk(@Nonnull final Chunk<O> chunk) {
    this.doPublishChunkState();
  }

  @Override
  public void onChunkError(@NonNull Exception exception, @NonNull Chunk<O> chunk) {
    this.doPublishChunkState();
  }

  private void doPublishChunkState() {

    JobExecution jobExecution =
        getStepContext().map(c -> c.getStepExecution().getJobExecution()).orElseThrow();

    this.doPublishBatchProcessDetail(this.getBatchDetails(jobExecution));
    final long total = this.getTotalElements();
    final long processed = this.getProcessedElements();
    final boolean active = this.isActive();
    this.doPublishProcessComicBookStatus(active, this.getStepName(), total, processed);
  }

  private Optional<StepContext> getStepContext() {
    return Optional.ofNullable(StepSynchronizationManager.getContext());
  }

  protected abstract String getStepName();

  protected abstract boolean isActive();

  protected abstract long getProcessedElements();

  protected abstract long getTotalElements();
}

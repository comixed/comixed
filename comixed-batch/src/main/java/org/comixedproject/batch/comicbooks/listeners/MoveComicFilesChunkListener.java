package org.comixedproject.batch.comicbooks.listeners;

import static org.comixedproject.model.messaging.batch.ProcessComicBooksStatus.MOVE_COMIC_FILES_STEP;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.batch.listeners.AbstractBatchProcessListener;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.springframework.batch.core.ChunkListener;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Log4j2
public class MoveComicFilesChunkListener extends AbstractBatchProcessListener
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
    final long unprocessed = this.comicBookService.findComicsToBeMovedCount();
    final long comicBooks = this.comicBookService.getComicBookCount();
    this.doPublishProcessComicBookStatus(
        unprocessed > 0, MOVE_COMIC_FILES_STEP, comicBooks, comicBooks - unprocessed);
  }
}

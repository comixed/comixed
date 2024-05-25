package org.comixedproject.batch.comicbooks.listeners;

import static org.comixedproject.model.messaging.batch.ProcessComicBooksStatus.MOVE_COMIC_FILES_STEP;

import lombok.extern.log4j.Log4j2;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.stereotype.Component;

@Component
@StepScope
@Log4j2
public class MoveComicFilesChunkListener extends AbstractBatchProcessChunkListener {
  @Override
  protected String getStepName() {
    return MOVE_COMIC_FILES_STEP;
  }

  @Override
  protected boolean isActive() {
    return this.comicBookService.findComicsToBeMovedCount() > 0L;
  }

  @Override
  protected long getProcessedElements() {
    return this.comicBookService.getComicBookCount()
        - this.comicBookService.findComicsToBeMovedCount();
  }

  @Override
  protected long getTotalElements() {
    return this.comicBookService.getComicBookCount();
  }
}

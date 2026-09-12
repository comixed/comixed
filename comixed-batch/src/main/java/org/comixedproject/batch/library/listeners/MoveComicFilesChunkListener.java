package org.comixedproject.batch.library.listeners;

import static org.comixedproject.model.messaging.batch.ProcessComicsStatus.MOVE_COMIC_FILES_STEP;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.batch.comicbooks.listeners.AbstractBatchProcessChunkListener;
import org.comixedproject.model.library.OrganizingComic;
import org.comixedproject.service.library.OrganizingComicService;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@StepScope
@Log4j2
public class MoveComicFilesChunkListener
    extends AbstractBatchProcessChunkListener<OrganizingComic, OrganizingComic> {
  @Autowired protected OrganizingComicService organizingComicService;

  @Override
  protected String getStepName() {
    return MOVE_COMIC_FILES_STEP;
  }

  @Override
  protected boolean isActive() {
    return this.organizingComicService.loadComicCount() > 0L;
  }

  @Override
  protected long getProcessedElements() {
    return this.comicService.getComicCount() - this.organizingComicService.loadComicCount();
  }

  @Override
  protected long getTotalElements() {
    return this.comicService.getComicCount();
  }
}

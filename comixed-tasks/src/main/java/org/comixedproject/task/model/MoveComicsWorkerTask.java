/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

package org.comixedproject.task.model;

import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.encoders.MoveComicWorkerTaskEncoder;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 * <code>MoveComicsWorkerTask</code> handles encoding instances of {@link MoveComicTask} to move
 * individual comics.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class MoveComicsWorkerTask extends AbstractWorkerTask {
  private static final int MAX_COMIC_PAGE = 50;

  @Autowired
  private ObjectFactory<MoveComicWorkerTaskEncoder> moveComicWorkerTaskEncoderObjectFactory;

  @Autowired private TaskService taskService;
  @Autowired private ComicService comicService;

  @Getter @Setter private String directory;
  @Getter @Setter private String renamingRule;

  @Override
  protected String createDescription() {
    return "Moving comics";
  }

  @Override
  public void startTask() throws WorkerTaskException {
    boolean done = false;
    int page = 0;
    while (!done) {
      log.debug("Preparing to page {} of {} comics", page, MAX_COMIC_PAGE);
      List<Comic> comics = this.comicService.findComicsToMove(MAX_COMIC_PAGE + 1);
      for (int index = 0; index < comics.size(); index++) {
        final Comic comic = comics.get(index);

        if (comic.getDateDeleted() == null) {
          MoveComicWorkerTaskEncoder encoder =
              this.moveComicWorkerTaskEncoderObjectFactory.getObject();

          encoder.setComic(comic);
          encoder.setTargetDirectory(this.directory);
          encoder.setRenamingRule(this.renamingRule);
          log.debug("Saving move comic task");
          this.taskService.save(encoder.encode());
        } else {
          log.debug("Removing comic: filename={}", comic.getFilename());
          this.comicService.delete(comic);
        }
      }
      // we're done when we've processed fewer comics than the page size
      done = comics.size() < (MAX_COMIC_PAGE + 1);
    }
  }
}

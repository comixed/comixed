/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project.
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

import java.text.MessageFormat;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.tasks.TaskType;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.TaskException;
import org.comixedproject.task.adaptors.WorkerTaskAdaptor;
import org.comixedproject.task.encoders.DeleteComicWorkerTaskEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 * <code>DeleteComicsWorkerTask</code> handles creating persisted instances of {@link
 * DeleteComicWorkerTask}.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class DeleteComicsWorkerTask extends AbstractWorkerTask {
  @Autowired private ComicService comicService;
  @Autowired private WorkerTaskAdaptor workerTaskAdaptor;
  @Autowired private TaskService taskService;
  private List<Long> comicIds;

  @Override
  protected String createDescription() {
    return MessageFormat.format(
        "Enqueuing {0} comic{1} for deletion",
        this.comicIds.size(), this.comicIds.size() == 1 ? "" : "s");
  }

  @Override
  public void startTask() throws WorkerTaskException {
    for (int index = 0; index < this.comicIds.size(); index++) {
      final Long id = this.comicIds.get(index);
      Comic comic;
      try {
        comic = this.comicService.getComic(id);
      } catch (ComicException error) {
        throw new WorkerTaskException("failed to load comic", error);
      }

      if (comic != null) {
        try {
          final DeleteComicWorkerTaskEncoder encoder;
          encoder = this.workerTaskAdaptor.getEncoder(TaskType.DELETE_COMIC);
          encoder.setComic(comic);
          encoder.setDeleteComicFile(false);
          this.taskService.save(encoder.encode());
        } catch (TaskException error) {
          log.error("Failed to encode delete comic task", error);
        }
      }
    }
  }

  public void setComicIds(final List<Long> comicIds) {
    this.comicIds = comicIds;
  }
}

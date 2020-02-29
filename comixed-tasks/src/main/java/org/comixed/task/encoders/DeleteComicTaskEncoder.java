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

package org.comixed.task.encoders;

import org.comixed.model.library.Comic;
import org.comixed.model.tasks.Task;
import org.comixed.model.tasks.TaskType;
import org.comixed.task.model.DeleteComicWorkerTask;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class DeleteComicTaskEncoder extends AbstractTaskEncoder<DeleteComicWorkerTask> {
  public static final String DELETE_COMIC = "delete-comic";

  @Autowired private ObjectFactory<DeleteComicWorkerTask> deleteComicWorkerTaskObjectFactory;

  private Comic comic;
  private boolean deleteComicFile;

  @Override
  public Task encode() {
    this.logger.debug("Encoding delete comic task: comic={}", this.comic.getId());

    final Task result = new Task();
    result.setTaskType(TaskType.DELETE_COMIC);
    result.setComic(comic);
    result.setProperty(DELETE_COMIC, String.valueOf(this.deleteComicFile));
    return result;
  }

  @Override
  public DeleteComicWorkerTask decode(final Task task) {
    this.logger.debug("Decoding delete comic task");
    this.deleteTask(task);

    final DeleteComicWorkerTask result = this.deleteComicWorkerTaskObjectFactory.getObject();
    result.setComic(task.getComic());
    result.setDeleteFile(Boolean.valueOf(task.getProperty(DELETE_COMIC)));
    return result;
  }

  public void setComic(final Comic comic) {
    this.comic = comic;
  }

  public void setDeleteComicFile(final boolean deleteComicFile) {
    this.deleteComicFile = deleteComicFile;
  }
}

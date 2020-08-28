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

package org.comixedproject.task.encoders;

import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.tasks.Task;
import org.comixedproject.model.tasks.TaskType;
import org.comixedproject.task.model.DeleteComicWorkerTask;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 * <code>DeleteComicWorkerTaskEncoder</code> handles encoding and decoding instances of {@link
 * DeleteComicWorkerTask}.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class DeleteComicWorkerTaskEncoder extends AbstractWorkerTaskEncoder<DeleteComicWorkerTask> {
  public static final String DELETE_COMIC = "delete-comic";

  @Autowired private ObjectFactory<DeleteComicWorkerTask> deleteComicWorkerTaskObjectFactory;

  @Setter private Comic comic;
  @Setter private boolean deleteComicFile;

  @Override
  public Task encode() {
    log.debug("Encoding delete comic task: comic={}", this.comic.getId());

    final Task result = new Task();
    result.setTaskType(TaskType.DELETE_COMIC);
    result.setComic(comic);
    result.setProperty(DELETE_COMIC, String.valueOf(this.deleteComicFile));
    return result;
  }

  @Override
  public DeleteComicWorkerTask decode(final Task task) {
    final DeleteComicWorkerTask result = this.deleteComicWorkerTaskObjectFactory.getObject();
    result.setComic(task.getComic());
    result.setDeleteFile(Boolean.valueOf(task.getProperty(DELETE_COMIC)));
    return result;
  }
}

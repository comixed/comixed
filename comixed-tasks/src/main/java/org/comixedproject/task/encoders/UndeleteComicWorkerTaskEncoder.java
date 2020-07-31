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

package org.comixedproject.task.encoders;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.tasks.Task;
import org.comixedproject.model.tasks.TaskType;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.model.UndeleteComicWorkerTask;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>UndeleteComicWorkerTaskEncoder</code> defines a type that can encode and decode instances
 * of {@link UndeleteComicTask}.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class UndeleteComicWorkerTaskEncoder
    extends AbstractWorkerTaskEncoder<UndeleteComicWorkerTask> {
  @Autowired private TaskService taskService;
  @Autowired private ObjectFactory<UndeleteComicWorkerTask> undeleteComicWorkerTaskObjectFactory;

  private Comic comic;

  @Override
  public Task encode() {
    log.debug("Encoding undelete task for comic: id={}", this.comic.getId());
    final Task result = new Task();
    result.setTaskType(TaskType.UNDELETE_COMIC);
    result.setComic(this.comic);
    result.setProperty("noop", "noo");
    return result;
  }

  @Override
  @Transactional(rollbackFor = Exception.class)
  public UndeleteComicWorkerTask decode(Task task) {
    this.taskService.delete(task);

    log.debug("Decoding undelete comic task: id={}", task.getId());

    final UndeleteComicWorkerTask result = this.undeleteComicWorkerTaskObjectFactory.getObject();
    result.setComic(task.getComic());

    return result;
  }

  public void setComic(Comic comic) {
    this.comic = comic;
  }
}

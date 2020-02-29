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
import org.comixed.repositories.tasks.TaskRepository;
import org.comixed.task.model.RescanComicWorkerTask;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class RescanComicTaskEncoder extends AbstractTaskEncoder<RescanComicWorkerTask> {
  private final Logger logger = LoggerFactory.getLogger(this.getClass());

  @Autowired private TaskRepository taskRepository;
  @Autowired private ObjectFactory<RescanComicWorkerTask> rescanComicWorkerTaskObjectFactory;

  private Comic comic;

  public void setComic(final Comic comic) {
    this.comic = comic;
  }

  @Override
  public Task encode() {
    this.logger.debug("Encoding rescan comic task: comic={}", this.comic.getId());

    final Task result = new Task();
    result.setTaskType(TaskType.RescanComic);
    result.setComic(this.comic);
    result.setProperty("DUMMY", "PROPERTY");

    return result;
  }

  @Override
  public RescanComicWorkerTask decode(final Task task) {
    this.taskRepository.delete(task);

    this.logger.debug("Decoding rescan comic worker task: comic={}", task.getId());
    final RescanComicWorkerTask result = this.rescanComicWorkerTaskObjectFactory.getObject();
    result.setComic(task.getComic());
    return result;
  }
}

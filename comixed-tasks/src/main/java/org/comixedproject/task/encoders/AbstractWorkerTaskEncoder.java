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

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.tasks.Task;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.model.AbstractWorkerTask;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>AbstractWorkerTaskEncoder</code> provides a foundation for building new {@link
 * WorkerTaskEncoder} types.
 *
 * @author Darryl L. Pierce
 */
@Log4j2
public abstract class AbstractWorkerTaskEncoder<T extends AbstractWorkerTask>
    implements WorkerTaskEncoder<T> {
  @Autowired private TaskService taskService;

  @Transactional
  public void deleteTask(final Task task) {
    log.debug("Deleting persisted task: id={} type={}", task.getId(), task.getTaskType());
    this.taskService.delete(task);
  }
}

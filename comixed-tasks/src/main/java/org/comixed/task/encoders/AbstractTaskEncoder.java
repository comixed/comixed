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

import org.comixed.model.tasks.Task;
import org.comixed.repositories.tasks.TaskRepository;
import org.comixed.task.model.AbstractWorkerTask;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>AbstractTaskEncoder</code> provides a foundation for building new {@link TaskEncoder}
 * types.
 *
 * @author Darryl L. Pierce
 */
public abstract class AbstractTaskEncoder<T extends AbstractWorkerTask> implements TaskEncoder {
  final Logger logger = LoggerFactory.getLogger(this.getClass());

  @Autowired private TaskRepository taskRepository;

  @Transactional
  public void deleteTask(final Task task) {
    this.logger.debug("Deleting persisted task: id={} type={}", task.getId(), task.getTaskType());
    this.taskRepository.delete(task);
  }
}

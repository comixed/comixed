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

package org.comixedproject.repositories.tasks;

import java.util.List;
import org.comixedproject.model.tasks.PersistedTask;
import org.comixedproject.model.tasks.PersistedTaskType;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * <code>TaskRepository</code> handles the management of persisted {@link PersistedTask} objects.
 *
 * @author Darryl L. Pierce
 */
@Repository
public interface TaskRepository extends CrudRepository<PersistedTask, Long> {
  /**
   * Returns the next set of tasks to be run.
   *
   * @param request the constraints
   * @return the tasks
   */
  @Query("SELECT t FROM PersistedTask t ORDER BY t.created ASC")
  List<PersistedTask> getTasksToRun(PageRequest request);

  /**
   * Returns the number of tasks of the given type that are current in the database.
   *
   * @param taskType the task type
   * @return the task count
   */
  @Query("SELECT COUNT(*) FROM PersistedTask t WHERE t.taskType = :taskType")
  int getTaskCount(@Param("taskType") PersistedTaskType taskType);
}

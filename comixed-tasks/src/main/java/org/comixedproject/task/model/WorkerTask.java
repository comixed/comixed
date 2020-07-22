/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

/**
 * <code>WorkerTask</code> defines a type that is executed by the
 * {@link Worker] class.
 *
 * @author Darryl L. Pierce
 */
public interface WorkerTask {
  /**
   * Invoked when the task can begin processing.
   *
   * @throws WorkerTaskException if an error occurs
   */
  void startTask() throws WorkerTaskException;

  /**
   * Return a description of the task for use in status and error messages.
   *
   * @return the description
   */
  String getDescription();

  /** Called after the task has completed execution. */
  void afterExecution();
}

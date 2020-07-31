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

import org.comixedproject.model.tasks.Task;
import org.comixedproject.task.model.WorkerTask;

/**
 * <code>WorkerTaskEncoder</code> defines a type that can encode and decode the details for a @{link
 * TaskType}.
 *
 * @author Darryl L. Pierce
 */
public interface WorkerTaskEncoder<T extends WorkerTask> {
  /**
   * Encodes and returns a {@link Task}.
   *
   * @return the persistable task
   */
  Task encode();

  /**
   * Decodes a {@link Task} and returns a {@link WorkTask}.
   *
   * @param task the saved task
   * @return the worker task
   */
  T decode(Task task);
}

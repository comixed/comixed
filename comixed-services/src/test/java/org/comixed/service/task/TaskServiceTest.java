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

package org.comixed.service.task;

import static junit.framework.TestCase.assertEquals;

import org.comixed.model.tasks.TaskType;
import org.comixed.repositories.tasks.TaskRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class TaskServiceTest {
  private static final int TEST_TASK_COUNT = 279;

  @InjectMocks private TaskService service;
  @Mock private TaskRepository taskRepository;

  @Test
  public void testGetTaskCount() {
    Mockito.when(taskRepository.getTaskCount(Mockito.any(TaskType.class)))
        .thenReturn(TEST_TASK_COUNT);

    final int result = service.getTaskCount(TaskType.AddComic);

    assertEquals(TEST_TASK_COUNT, result);
  }
}

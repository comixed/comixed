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

package org.comixedproject.task.adaptors;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.tasks.PersistedTask;
import org.comixedproject.model.tasks.PersistedTaskType;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.TaskException;
import org.comixedproject.task.encoders.TaskEncoder;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.context.ApplicationContext;

@RunWith(MockitoJUnitRunner.class)
public class TaskAdaptorTest {
  private static final String TEST_ADAPTOR_NAME = "adaptorBeanName";
  private static final int TEST_NEXT_TASK_COUNT = 5;

  @InjectMocks private TaskAdaptor adaptor;
  @Mock private ApplicationContext applicationContext;
  @Mock private TaskService taskService;
  @Mock private PersistedTask persistedTask;
  @Mock private TaskEncoder<?> taskEncoder;

  private List<PersistedTask> persistedTaskList = new ArrayList<>();

  @Test(expected = TaskException.class)
  public void testGetAdaptorForUnsupportedTask() throws TaskException {
    adaptor.adaptorMap.clear();

    adaptor.getEncoder(PersistedTaskType.ADD_COMIC);
  }

  @Test
  public void testGetAdaptor() throws TaskException {
    adaptor.adaptorMap.put(PersistedTaskType.ADD_COMIC, TEST_ADAPTOR_NAME);
    Mockito.when(applicationContext.getBean(Mockito.anyString())).thenReturn(taskEncoder);

    final TaskEncoder<?> result = adaptor.getEncoder(PersistedTaskType.ADD_COMIC);

    assertNotNull(result);
    assertSame(taskEncoder, result);
  }

  @Test
  public void testSave() {
    Mockito.when(taskService.save(Mockito.any(PersistedTask.class))).thenReturn(persistedTask);

    final PersistedTask result = taskService.save(persistedTask);

    assertNotNull(result);
    assertSame(persistedTask, result);

    Mockito.verify(taskService, Mockito.times(1)).save(persistedTask);
  }

  @Test
  public void testGetNextTask() {
    persistedTaskList.add(persistedTask);

    Mockito.when(taskService.getTasksToRun(Mockito.anyInt())).thenReturn(persistedTaskList);

    final List<PersistedTask> result = taskService.getTasksToRun(TEST_NEXT_TASK_COUNT);

    assertNotNull(result);
    assertSame(persistedTaskList, result);

    Mockito.verify(taskService, Mockito.times(1)).getTasksToRun(TEST_NEXT_TASK_COUNT);
  }
}

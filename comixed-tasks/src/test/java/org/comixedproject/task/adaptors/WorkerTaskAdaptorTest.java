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
import org.comixedproject.model.tasks.Task;
import org.comixedproject.model.tasks.TaskType;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.TaskException;
import org.comixedproject.task.encoders.WorkerTaskEncoder;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.context.ApplicationContext;
import org.springframework.data.domain.PageRequest;

@RunWith(MockitoJUnitRunner.class)
public class WorkerTaskAdaptorTest {
  private static final String TEST_ADAPTOR_NAME = "adaptorBeanName";
  private static final int TEST_NEXT_TASK_COUNT = 5;

  @InjectMocks private WorkerTaskAdaptor adaptor;
  @Mock private ApplicationContext applicationContext;
  @Mock private TaskService taskService;
  @Captor private ArgumentCaptor<PageRequest> pageRequestArgumentCaptor;
  @Mock private Task task;
  @Mock private WorkerTaskEncoder<?> workerTaskEncoder;

  private List<Task> taskList = new ArrayList<>();

  @Test(expected = TaskException.class)
  public void testGetAdaptorForUnsupportedTask() throws TaskException {
    adaptor.adaptorMap.clear();

    adaptor.getEncoder(TaskType.ADD_COMIC);
  }

  @Test
  public void testGetAdaptor() throws TaskException {
    adaptor.adaptorMap.put(TaskType.ADD_COMIC, TEST_ADAPTOR_NAME);
    Mockito.when(applicationContext.getBean(Mockito.anyString())).thenReturn(workerTaskEncoder);

    final WorkerTaskEncoder<?> result = adaptor.getEncoder(TaskType.ADD_COMIC);

    assertNotNull(result);
    assertSame(workerTaskEncoder, result);
  }

  @Test
  public void testSave() {
    Mockito.when(taskService.save(Mockito.any(Task.class))).thenReturn(task);

    final Task result = taskService.save(task);

    assertNotNull(result);
    assertSame(task, result);

    Mockito.verify(taskService, Mockito.times(1)).save(task);
  }

  @Test
  public void testGetNextTask() {
    taskList.add(task);

    Mockito.when(taskService.getTasksToRun(Mockito.anyInt())).thenReturn(taskList);

    final List<Task> result = taskService.getTasksToRun(TEST_NEXT_TASK_COUNT);

    assertNotNull(result);
    assertSame(taskList, result);

    Mockito.verify(taskService, Mockito.times(1)).getTasksToRun(TEST_NEXT_TASK_COUNT);
  }
}

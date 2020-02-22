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

package org.comixed.task.adaptors;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;

import java.util.ArrayList;
import java.util.List;
import org.comixed.model.tasks.Task;
import org.comixed.model.tasks.TaskType;
import org.comixed.repositories.tasks.TaskRepository;
import org.comixed.task.TaskException;
import org.comixed.task.encoders.TaskEncoder;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.context.ApplicationContext;
import org.springframework.data.domain.PageRequest;

@RunWith(MockitoJUnitRunner.class)
public class TaskAdaptorTest {
  private static final String TEST_ADAPTOR_NAME = "adaptorBeanName";

  @InjectMocks private TaskAdaptor adaptor;
  @Mock private ApplicationContext applicationContext;
  @Mock private TaskRepository taskRepository;
  @Captor private ArgumentCaptor<PageRequest> pageRequestArgumentCaptor;
  @Mock private Task task;
  @Mock private TaskEncoder<?> taskEncoder;

  private List<Task> taskList = new ArrayList<>();

  @Test(expected = TaskException.class)
  public void testGetAdaptorForUnsupportedTask() throws TaskException {
    adaptor.adaptorMap.clear();

    adaptor.getActionDecoder(TaskType.AddComic);
  }

  @Test
  public void testGetAdaptor() throws TaskException {
    adaptor.adaptorMap.put(TaskType.AddComic, TEST_ADAPTOR_NAME);
    Mockito.when(applicationContext.getBean(Mockito.anyString())).thenReturn(taskEncoder);

    final TaskEncoder<?> result = adaptor.getActionDecoder(TaskType.AddComic);

    assertNotNull(result);
    assertSame(taskEncoder, result);
  }

  @Test
  public void testSave() {
    Mockito.when(taskRepository.save(Mockito.any(Task.class))).thenReturn(task);

    final Task result = adaptor.save(task);

    assertNotNull(result);
    assertSame(task, result);

    Mockito.verify(taskRepository, Mockito.times(1)).save(task);
  }

  @Test
  public void testGetNextTask() {
    taskList.add(task);

    Mockito.when(taskRepository.getTasksToRun(pageRequestArgumentCaptor.capture()))
        .thenReturn(taskList);

    final List<Task> result = adaptor.getNextTask();

    assertNotNull(result);
    assertSame(taskList, result);
  }

  @Test
  public void testDeleteTask() {
    Mockito.doNothing().when(taskRepository).delete(Mockito.any(Task.class));

    adaptor.delete(task);

    Mockito.verify(taskRepository, Mockito.times(1)).delete(task);
  }
}

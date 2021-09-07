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

package org.comixedproject.task;

import static junit.framework.TestCase.*;
import static org.comixedproject.task.MonitorTaskQueueTask.TASK_UPDATE_TARGET;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.state.messaging.TaskCountMessage;
import org.comixedproject.model.tasks.PersistedTask;
import org.comixedproject.model.tasks.PersistedTaskType;
import org.comixedproject.task.adaptors.TaskAdaptor;
import org.comixedproject.task.encoders.TaskEncoder;
import org.comixedproject.task.runner.TaskManager;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@RunWith(MockitoJUnitRunner.class)
public class MonitorTaskQueueTaskTest {
  private static final PersistedTaskType TEST_TASK_TYPE = PersistedTaskType.RESCAN_COMIC;
  private static final long TEST_TASK_COUNT = 97;

  @InjectMocks private MonitorTaskQueueTask task;
  @Mock private TaskManager taskManager;
  @Mock private TaskAdaptor taskAdaptor;
  @Mock private TaskEncoder<?> taskEncoder;
  @Mock private PersistedTask persistedTask;
  @Mock private Task workerTask;
  @Mock private SimpMessagingTemplate messagingTemplate;

  @Captor private ArgumentCaptor<Object> messageCaptor;

  private List<PersistedTask> persistedTaskList = new ArrayList<>();

  @Test
  public void testCreateDescription() {
    assertNotNull(task.getDescription());
  }

  @Test
  public void testAfterPropertiesSet() {
    Mockito.doNothing().when(taskManager).runTask(Mockito.any(Task.class));

    task.afterExecution();

    Mockito.verify(taskManager, Mockito.times(1)).runTask(task);
  }

  @Test
  public void testStartTaskNothingQueued() throws TaskException {
    Mockito.when(taskAdaptor.getNextTask()).thenReturn(persistedTaskList);

    task.startTask();

    Mockito.verify(taskAdaptor, Mockito.times(1)).getNextTask();
  }

  @Test(expected = TaskException.class)
  public void testStartTaskNoEncoder() throws TaskException {
    persistedTaskList.add(persistedTask);

    Mockito.when(taskAdaptor.getNextTask()).thenReturn(persistedTaskList);
    Mockito.when(persistedTask.getTaskType()).thenReturn(TEST_TASK_TYPE);
    Mockito.when(taskAdaptor.getEncoder(Mockito.any(PersistedTaskType.class)))
        .thenThrow(TaskException.class);

    task.startTask();

    Mockito.verify(taskAdaptor, Mockito.times(1)).getNextTask();
    Mockito.verify(persistedTask, Mockito.times(1)).getTaskType();
    Mockito.verify(taskAdaptor, Mockito.times(1)).getEncoder(TEST_TASK_TYPE);
  }

  @Test
  public void testStartTask() throws TaskException, TaskException {
    for (int index = 0; index < 25; index++) persistedTaskList.add(persistedTask);

    Mockito.when(taskAdaptor.getNextTask()).thenReturn(persistedTaskList);
    Mockito.when(persistedTask.getTaskType()).thenReturn(TEST_TASK_TYPE);
    Mockito.when(taskAdaptor.getEncoder(Mockito.any(PersistedTaskType.class)))
        .thenReturn(taskEncoder);
    Mockito.when(taskEncoder.decode(Mockito.any(PersistedTask.class))).thenReturn(workerTask);
    Mockito.doNothing()
        .when(messagingTemplate)
        .convertAndSend(Mockito.anyString(), messageCaptor.capture());
    Mockito.when(taskAdaptor.getTaskCount()).thenReturn(TEST_TASK_COUNT);

    task.startTask();

    assertFalse(messageCaptor.getAllValues().isEmpty());
    assertTrue(messageCaptor.getAllValues().contains(new TaskCountMessage(TEST_TASK_COUNT)));

    Mockito.verify(taskAdaptor, Mockito.times(1)).getNextTask();
    Mockito.verify(persistedTask, Mockito.times(persistedTaskList.size())).getTaskType();
    Mockito.verify(taskAdaptor, Mockito.times(persistedTaskList.size())).getEncoder(TEST_TASK_TYPE);
    Mockito.verify(taskEncoder, Mockito.times(persistedTaskList.size())).decode(persistedTask);
    Mockito.verify(taskManager, Mockito.times(persistedTaskList.size()))
        .runTask(workerTask, persistedTask);
    Mockito.verify(messagingTemplate, Mockito.times(1))
        .convertAndSend(TASK_UPDATE_TARGET, new TaskCountMessage(TEST_TASK_COUNT));
  }

  @Test
  public void testAfterExecution() {
    Mockito.doNothing().when(taskManager).runTask(Mockito.any(Task.class));

    task.afterExecution();

    Mockito.verify(taskManager, Mockito.times(1)).runTask(task);
  }
}

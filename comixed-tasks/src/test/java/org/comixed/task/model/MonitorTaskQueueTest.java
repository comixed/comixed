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

package org.comixed.task.model;

import static junit.framework.TestCase.assertNotNull;

import java.util.ArrayList;
import java.util.List;
import org.comixed.model.tasks.Task;
import org.comixed.model.tasks.TaskType;
import org.comixed.task.TaskException;
import org.comixed.task.adaptors.TaskAdaptor;
import org.comixed.task.encoders.TaskEncoder;
import org.comixed.task.runner.TaskManager;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class MonitorTaskQueueTest {
  private static final TaskType TEST_TASK_TYPE = TaskType.RESCAN_COMIC;

  @InjectMocks private MonitorTaskQueue monitorTaskQueue;
  @Mock private TaskManager taskManager;
  @Mock private TaskAdaptor taskAdaptor;
  @Mock private TaskEncoder<?> taskEncoder;
  @Mock private Task task;
  @Mock private WorkerTask workerTask;

  private List<Task> taskList = new ArrayList<>();

  @Test
  public void testCreateDescription() {
    assertNotNull(monitorTaskQueue.getDescription());
  }

  @Test
  public void testAfterPropertiesSet() {
    Mockito.doNothing().when(taskManager).runTask(Mockito.any(WorkerTask.class));

    monitorTaskQueue.afterExecution();

    Mockito.verify(taskManager, Mockito.times(1)).runTask(monitorTaskQueue);
  }

  @Test
  public void testStartTaskNothingQueued() throws WorkerTaskException {
    Mockito.when(taskAdaptor.getNextTask()).thenReturn(taskList);

    monitorTaskQueue.startTask();

    Mockito.verify(taskAdaptor, Mockito.times(1)).getNextTask();
  }

  @Test(expected = WorkerTaskException.class)
  public void testStartTaskNoEncoder() throws WorkerTaskException, TaskException {
    taskList.add(task);

    Mockito.when(taskAdaptor.getNextTask()).thenReturn(taskList);
    Mockito.when(task.getTaskType()).thenReturn(TEST_TASK_TYPE);
    Mockito.when(taskAdaptor.getEncoder(Mockito.any(TaskType.class)))
        .thenThrow(TaskException.class);

    monitorTaskQueue.startTask();

    Mockito.verify(taskAdaptor, Mockito.times(1)).getNextTask();
    Mockito.verify(task, Mockito.times(1)).getTaskType();
    Mockito.verify(taskAdaptor, Mockito.times(1)).getEncoder(TEST_TASK_TYPE);
  }

  @Test
  public void testStartTask() throws WorkerTaskException, TaskException {
    for (int index = 0; index < 25; index++) taskList.add(task);

    Mockito.when(taskAdaptor.getNextTask()).thenReturn(taskList);
    Mockito.when(task.getTaskType()).thenReturn(TEST_TASK_TYPE);
    Mockito.when(taskAdaptor.getEncoder(Mockito.any(TaskType.class))).thenReturn(taskEncoder);
    Mockito.when(taskEncoder.decode(Mockito.any(Task.class))).thenReturn(workerTask);

    monitorTaskQueue.startTask();

    Mockito.verify(taskAdaptor, Mockito.times(1)).getNextTask();
    Mockito.verify(task, Mockito.times(taskList.size())).getTaskType();
    Mockito.verify(taskAdaptor, Mockito.times(taskList.size())).getEncoder(TEST_TASK_TYPE);
    Mockito.verify(taskEncoder, Mockito.times(taskList.size())).decode(task);
    Mockito.verify(taskManager, Mockito.times(taskList.size())).runTask(workerTask);
  }

  @Test
  public void testAfterExecution() {
    Mockito.doNothing().when(taskManager).runTask(Mockito.any(WorkerTask.class));

    monitorTaskQueue.afterExecution();

    Mockito.verify(taskManager, Mockito.times(1)).runTask(monitorTaskQueue);
  }
}

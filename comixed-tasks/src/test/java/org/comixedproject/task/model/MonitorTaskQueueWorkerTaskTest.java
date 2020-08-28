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

package org.comixedproject.task.model;

import static junit.framework.TestCase.assertNotNull;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.tasks.Task;
import org.comixedproject.model.tasks.TaskType;
import org.comixedproject.task.TaskException;
import org.comixedproject.task.adaptors.WorkerTaskAdaptor;
import org.comixedproject.task.encoders.WorkerTaskEncoder;
import org.comixedproject.task.runner.TaskManager;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class MonitorTaskQueueWorkerTaskTest {
  private static final TaskType TEST_TASK_TYPE = TaskType.RESCAN_COMIC;

  @InjectMocks private MonitorTaskQueueWorkerTask monitorTaskQueueWorkerTask;
  @Mock private TaskManager taskManager;
  @Mock private WorkerTaskAdaptor workerTaskAdaptor;
  @Mock private WorkerTaskEncoder<?> workerTaskEncoder;
  @Mock private Task task;
  @Mock private WorkerTask workerTask;

  private List<Task> taskList = new ArrayList<>();

  @Test
  public void testCreateDescription() {
    assertNotNull(monitorTaskQueueWorkerTask.getDescription());
  }

  @Test
  public void testAfterPropertiesSet() {
    Mockito.doNothing().when(taskManager).runTask(Mockito.any(WorkerTask.class));

    monitorTaskQueueWorkerTask.afterExecution();

    Mockito.verify(taskManager, Mockito.times(1)).runTask(monitorTaskQueueWorkerTask);
  }

  @Test
  public void testStartTaskNothingQueued() throws WorkerTaskException {
    Mockito.when(workerTaskAdaptor.getNextTask()).thenReturn(taskList);

    monitorTaskQueueWorkerTask.startTask();

    Mockito.verify(workerTaskAdaptor, Mockito.times(1)).getNextTask();
  }

  @Test(expected = WorkerTaskException.class)
  public void testStartTaskNoEncoder() throws WorkerTaskException, TaskException {
    taskList.add(task);

    Mockito.when(workerTaskAdaptor.getNextTask()).thenReturn(taskList);
    Mockito.when(task.getTaskType()).thenReturn(TEST_TASK_TYPE);
    Mockito.when(workerTaskAdaptor.getEncoder(Mockito.any(TaskType.class)))
        .thenThrow(TaskException.class);

    monitorTaskQueueWorkerTask.startTask();

    Mockito.verify(workerTaskAdaptor, Mockito.times(1)).getNextTask();
    Mockito.verify(task, Mockito.times(1)).getTaskType();
    Mockito.verify(workerTaskAdaptor, Mockito.times(1)).getEncoder(TEST_TASK_TYPE);
  }

  @Test
  public void testStartTask() throws WorkerTaskException, TaskException {
    for (int index = 0; index < 25; index++) taskList.add(task);

    Mockito.when(workerTaskAdaptor.getNextTask()).thenReturn(taskList);
    Mockito.when(task.getTaskType()).thenReturn(TEST_TASK_TYPE);
    Mockito.when(workerTaskAdaptor.getEncoder(Mockito.any(TaskType.class)))
        .thenReturn(workerTaskEncoder);
    Mockito.when(workerTaskEncoder.decode(Mockito.any(Task.class))).thenReturn(workerTask);

    monitorTaskQueueWorkerTask.startTask();

    Mockito.verify(workerTaskAdaptor, Mockito.times(1)).getNextTask();
    Mockito.verify(task, Mockito.times(taskList.size())).getTaskType();
    Mockito.verify(workerTaskAdaptor, Mockito.times(taskList.size())).getEncoder(TEST_TASK_TYPE);
    Mockito.verify(workerTaskEncoder, Mockito.times(taskList.size())).decode(task);
    Mockito.verify(taskManager, Mockito.times(taskList.size())).runTask(workerTask, task);
  }

  @Test
  public void testAfterExecution() {
    Mockito.doNothing().when(taskManager).runTask(Mockito.any(WorkerTask.class));

    monitorTaskQueueWorkerTask.afterExecution();

    Mockito.verify(taskManager, Mockito.times(1)).runTask(monitorTaskQueueWorkerTask);
  }
}

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

package org.comixedproject.task.runner;

import static junit.framework.TestCase.*;

import org.comixedproject.model.tasks.TaskAuditLogEntry;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.model.MonitorTaskQueue;
import org.comixedproject.task.model.WorkerTask;
import org.comixedproject.task.model.WorkerTaskException;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@RunWith(MockitoJUnitRunner.class)
public class TaskManagerTest {
  private static final String TEST_DESCRIPTION = "The task description";

  @InjectMocks private TaskManager taskManager;
  @Mock private ThreadPoolTaskExecutor taskExecutor;
  @Mock private WorkerTask workerTask;
  @Captor private ArgumentCaptor<Runnable> runnableArgumentCaptor;
  @Mock private TaskService taskService;
  @Captor private ArgumentCaptor<TaskAuditLogEntry> logEntryArgumentCaptor;
  @Mock private TaskAuditLogEntry logEntryRecord;
  @Mock private MonitorTaskQueue monitorTaskQueue;

  @Test
  public void testRunTask() throws WorkerTaskException {
    Mockito.when(workerTask.getDescription()).thenReturn(TEST_DESCRIPTION);
    Mockito.doNothing().when(taskExecutor).execute(runnableArgumentCaptor.capture());
    Mockito.doNothing().when(taskService).saveAuditLogEntry(logEntryArgumentCaptor.capture());

    taskManager.runTask(workerTask);

    assertNotNull(runnableArgumentCaptor.getValue());

    Mockito.verify(taskExecutor, Mockito.times(1)).execute(runnableArgumentCaptor.getValue());

    runnableArgumentCaptor.getValue().run();

    Mockito.verify(workerTask, Mockito.times(1)).getDescription();
    Mockito.verify(workerTask, Mockito.times(1)).startTask();
    Mockito.verify(workerTask, Mockito.times(1)).afterExecution();

    final TaskAuditLogEntry logEntry = logEntryArgumentCaptor.getValue();
    assertNotNull(logEntry);
    assertNotNull(logEntry.getStartTime());
    assertNotNull(logEntry.getEndTime());
    assertTrue(logEntry.getSuccessful());
    assertEquals(TEST_DESCRIPTION, logEntry.getDescription());

    Mockito.verify(taskService, Mockito.times(1)).saveAuditLogEntry(logEntry);
  }

  @Test
  public void testRunTaskDoNotAuditMonitorTaskQueue() throws WorkerTaskException {
    Mockito.doNothing().when(taskExecutor).execute(runnableArgumentCaptor.capture());

    taskManager.runTask(monitorTaskQueue);

    assertNotNull(runnableArgumentCaptor.getValue());

    Mockito.verify(taskExecutor, Mockito.times(1)).execute(runnableArgumentCaptor.getValue());

    runnableArgumentCaptor.getValue().run();

    Mockito.verify(monitorTaskQueue, Mockito.times(1)).getDescription();
    Mockito.verify(monitorTaskQueue, Mockito.times(1)).startTask();
    Mockito.verify(monitorTaskQueue, Mockito.times(1)).afterExecution();

    Mockito.verify(taskService, Mockito.never()).save(Mockito.any());
  }

  @Test
  public void testRunTaskThrowsException() throws WorkerTaskException {
    Mockito.when(workerTask.getDescription()).thenReturn(TEST_DESCRIPTION);
    Mockito.doThrow(WorkerTaskException.class).when(workerTask).startTask();
    Mockito.doNothing().when(taskExecutor).execute(runnableArgumentCaptor.capture());
    Mockito.doNothing().when(taskService).saveAuditLogEntry(logEntryArgumentCaptor.capture());

    taskManager.runTask(workerTask);

    assertNotNull(runnableArgumentCaptor.getValue());

    Mockito.verify(taskExecutor, Mockito.times(1)).execute(runnableArgumentCaptor.getValue());

    runnableArgumentCaptor.getValue().run();

    Mockito.verify(workerTask, Mockito.times(1)).getDescription();
    Mockito.verify(workerTask, Mockito.times(1)).startTask();
    Mockito.verify(workerTask, Mockito.times(1)).afterExecution();

    final TaskAuditLogEntry logEntry = logEntryArgumentCaptor.getValue();
    assertNotNull(logEntry);
    assertNotNull(logEntry.getStartTime());
    assertNotNull(logEntry.getEndTime());
    assertFalse(logEntry.getSuccessful());
    assertEquals(TEST_DESCRIPTION, logEntry.getDescription());

    Mockito.verify(taskService, Mockito.times(1)).saveAuditLogEntry(logEntry);
  }

  @Test
  public void testAfterPropertiesSet() throws Exception {
    taskManager.afterPropertiesSet();

    Mockito.verify(taskExecutor, Mockito.times(1)).setThreadNamePrefix(Mockito.anyString());
    Mockito.verify(taskExecutor, Mockito.times(1)).setCorePoolSize(5);
    Mockito.verify(taskExecutor, Mockito.times(1)).setMaxPoolSize(10);
    Mockito.verify(taskExecutor, Mockito.times(1)).setWaitForTasksToCompleteOnShutdown(false);
  }
}

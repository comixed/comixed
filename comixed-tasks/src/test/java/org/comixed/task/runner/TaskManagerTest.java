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

package org.comixed.task.runner;

import static junit.framework.TestCase.assertNotNull;

import org.comixed.task.model.WorkerTask;
import org.comixed.task.model.WorkerTaskException;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@RunWith(MockitoJUnitRunner.class)
public class TaskManagerTest {
  @InjectMocks private TaskManager taskManager;
  @Mock private ThreadPoolTaskExecutor taskExecutor;
  @Mock private WorkerTask workerTask;
  @Captor private ArgumentCaptor<Runnable> runnableArgumentCaptor;

  @Test
  public void testRunTask() throws WorkerTaskException {
    Mockito.doNothing().when(taskExecutor).execute(runnableArgumentCaptor.capture());

    taskManager.runTask(workerTask);

    assertNotNull(runnableArgumentCaptor.getValue());

    Mockito.verify(taskExecutor, Mockito.times(1)).execute(runnableArgumentCaptor.getValue());

    runnableArgumentCaptor.getValue().run();

    Mockito.verify(workerTask, Mockito.times(1)).getDescription();
    Mockito.verify(workerTask, Mockito.times(1)).startTask();
    Mockito.verify(workerTask, Mockito.times(1)).afterExecution();
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

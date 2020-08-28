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

import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.tasks.Task;
import org.comixedproject.task.TaskException;
import org.comixedproject.task.adaptors.WorkerTaskAdaptor;
import org.comixedproject.task.encoders.WorkerTaskEncoder;
import org.comixedproject.task.runner.TaskManager;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>MonitorTaskQueueWorkerTask</code> is a task that continuous runs,looking for other tasks
 * that have been queued. When it finds them it loads them, decodes them and adds them to the {@link
 * TaskManager} for execution.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class MonitorTaskQueueWorkerTask extends AbstractWorkerTask implements InitializingBean {
  @Autowired private TaskManager taskManager;
  @Autowired private WorkerTaskAdaptor workerTaskAdaptor;

  @Override
  protected String createDescription() {
    return "Task queue monitor";
  }

  @Override
  public void afterPropertiesSet() throws Exception {
    log.debug("Scheduling task queue monitor");
    this.taskManager.runTask(this);
  }

  @Override
  public void startTask() throws WorkerTaskException {
    log.debug("Checking queue for waiting tasks");
    final List<Task> taskQueue = this.workerTaskAdaptor.getNextTask();
    for (int index = 0; index < taskQueue.size(); index++) {
      Task task = taskQueue.get(index);
      log.debug("Rehydrating queued task");
      WorkerTaskEncoder<?> decoder;
      try {
        decoder = this.workerTaskAdaptor.getEncoder(task.getTaskType());
      } catch (TaskException error) {
        throw new WorkerTaskException("failed to get task decoder", error);
      }
      WorkerTask nextTask = decoder.decode(task);
      log.debug("Passing task to task manager");
      this.taskManager.runTask(nextTask, task);
    }
    try {
      Thread.sleep(1000L);
    } catch (InterruptedException error) {
      log.error("monitor task queue interrupted", error);
      Thread.currentThread().interrupt();
    }
  }

  @Override
  public void afterExecution() {
    log.debug("Rescheduling task queue monitor");
    this.taskManager.runTask(this);
  }
}

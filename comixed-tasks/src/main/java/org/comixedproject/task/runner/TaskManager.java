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

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Date;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.tasks.Task;
import org.comixedproject.model.tasks.TaskAuditLogEntry;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.model.MonitorTaskQueueWorkerTask;
import org.comixedproject.task.model.WorkerTask;
import org.comixedproject.task.model.WorkerTaskException;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Component;

/**
 * <code>TaskManager</code> handles running instances of {@link WorkerTask}.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class TaskManager implements InitializingBean {
  @Autowired private ThreadPoolTaskExecutor taskExecutor;
  @Autowired private TaskService taskService;

  /**
   * Enqueues a task, then deletes it upon successful completion.
   *
   * @param workerTask the worker task
   * @param task the persisted task
   */
  public void runTask(final WorkerTask workerTask, final Task task) {
    this.taskExecutor.execute(
        () -> {
          final String description = workerTask.getDescription();
          log.debug("Preparing to run task: {}", description);
          final Date started = new Date();
          try {
            workerTask.startTask();
            if (!(workerTask instanceof MonitorTaskQueueWorkerTask))
              this.updateAuditLog(true, started, description, null);
          } catch (WorkerTaskException error) {
            log.error("Error executing task: {}" + description, description, error);
            if (!(workerTask instanceof MonitorTaskQueueWorkerTask))
              this.updateAuditLog(false, started, description, error);
          } finally {
            workerTask.afterExecution();
            if (task != null) {
              log.debug("Deleting persisted task");
              this.taskService.delete(task);
            }
          }
        });
  }

  /**
   * Enqueue and execute the given task.
   *
   * @param workerTask the task
   */
  public void runTask(final WorkerTask workerTask) {
    this.runTask(workerTask, null);
  }

  /**
   * Creates a task audit log entry.
   *
   * @param success the success flag
   * @param started the started time
   * @param description the task decription
   * @param exception the optional exception message
   */
  private void updateAuditLog(
      final boolean success,
      final Date started,
      final String description,
      final Exception exception) {
    log.debug("Creating audit log entry");
    final TaskAuditLogEntry entry = new TaskAuditLogEntry();
    entry.setStartTime(started);
    entry.setEndTime(new Date());
    entry.setSuccessful(success);
    entry.setDescription(description);
    if (exception != null) {
      log.debug("Converting exception stacktrace to a string");
      final StringWriter stringWriter = new StringWriter();
      final PrintWriter printWriter = new PrintWriter(stringWriter);
      exception.printStackTrace(printWriter);
      entry.setException(stringWriter.toString());
    }
    TaskManager.this.taskService.saveAuditLogEntry(entry);
  }

  @Override
  public void afterPropertiesSet() throws Exception {
    this.taskExecutor.setThreadNamePrefix("Jarvis-");
    this.taskExecutor.setCorePoolSize(5);
    this.taskExecutor.setMaxPoolSize(10);
    this.taskExecutor.setWaitForTasksToCompleteOnShutdown(false);
  }
}

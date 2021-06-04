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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Date;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.tasks.PersistedTask;
import org.comixedproject.model.tasks.TaskAuditLogEntry;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.MonitorTaskQueueTask;
import org.comixedproject.task.Task;
import org.comixedproject.views.View;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Component;

/**
 * <code>TaskManager</code> handles running instances of {@link Task}.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class TaskManager implements InitializingBean {
  public static final String TASK_EXECUTOR_PREFIX = "Jarvis-";
  public static final int CORE_POOL_SIZE = 5;
  public static final int MAX_POOL_SIZE = 10;

  @Autowired
  @Qualifier("CxTaskExecutor")
  private ThreadPoolTaskExecutor taskExecutor;

  @Autowired private TaskService taskService;
  @Autowired private ObjectMapper objectMapper;

  /**
   * Enqueues a task, then deletes it upon successful completion.
   *
   * @param task the worker task
   * @param persistedTask the persisted task
   */
  public void runTask(final Task task, final PersistedTask persistedTask) {
    if (persistedTask != null) {
      if (this.taskService.getRunningTasks().containsKey(persistedTask.getId())) {
        log.debug("Rejecting task: already running");
        return;
      }
      this.taskService.getRunningTasks().put(persistedTask.getId(), persistedTask.getTaskType());
    }
    this.taskExecutor.execute(
        () -> {
          final String description = task.getDescription();
          log.debug("Preparing to run task: {}", description);
          final Date started = new Date();
          try {
            task.startTask();
            if (!(task instanceof MonitorTaskQueueTask))
              this.saveAuditLogEntry(task, true, started, null);
          } catch (Exception error) {
            log.error("Error executing task: {}" + description, description, error);
            if (!(task instanceof MonitorTaskQueueTask))
              this.saveAuditLogEntry(task, false, started, error);
          } finally {
            task.afterExecution();
            if (persistedTask != null) {
              log.debug("Deleting persisted task");
              this.taskService.getRunningTasks().remove(persistedTask.getId());
              this.taskService.delete(persistedTask);
            }
          }
        });
  }

  /**
   * Enqueue and execute the given task.
   *
   * @param task the task
   */
  public void runTask(final Task task) {
    this.runTask(task, null);
  }

  /**
   * Creates a task audit log entry.
   *
   * @param success the success flag
   * @param started the started time
   * @param description the task decription
   * @param exception the optional exception message
   */
  void saveAuditLogEntry(
      final Task task, final boolean success, final Date started, final Exception exception) {
    log.debug("Creating audit log entry");
    final var entry = new TaskAuditLogEntry(task.getTaskType());
    entry.setStartTime(started);
    entry.setEndTime(new Date());
    entry.setSuccessful(success);
    try {
      entry.setDescription(
          this.objectMapper
              .writerWithView(View.AuditLogEntryDetail.class)
              .writeValueAsString(task));
    } catch (JsonProcessingException error) {
      log.error("Failed to serialize task audit log entry", error);
      entry.setDescription("ERROR ENCODING DESCRIPTION");
    }
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
  public void afterPropertiesSet() {
    this.taskExecutor.setThreadNamePrefix(TASK_EXECUTOR_PREFIX);
    this.taskExecutor.setCorePoolSize(CORE_POOL_SIZE);
    this.taskExecutor.setMaxPoolSize(MAX_POOL_SIZE);
    this.taskExecutor.setWaitForTasksToCompleteOnShutdown(false);
  }
}

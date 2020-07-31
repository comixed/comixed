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

import java.util.Date;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.tasks.TaskAuditLogEntry;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.model.MonitorTaskQueue;
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

  public void runTask(final WorkerTask task) {
    this.taskExecutor.execute(
        () -> {
          final String description = task.getDescription();
          log.debug("Preparing to run task: {}", description);
          final Date started = new Date();
          boolean success = false;
          try {
            task.startTask();
            success = true;
          } catch (WorkerTaskException error) {
            log.error("Error executing task: {}" + description, error);
          } finally {
            task.afterExecution();
          }
          final Date ended = new Date();
          // do not log MonitorTaskQueue events
          if (!(task instanceof MonitorTaskQueue)) {
            final TaskAuditLogEntry entry = new TaskAuditLogEntry();
            entry.setStartTime(started);
            entry.setEndTime(ended);
            entry.setSuccessful(success);
            entry.setDescription(description);
            TaskManager.this.taskService.saveAuditLogEntry(entry);
          }
        });
  }

  @Override
  public void afterPropertiesSet() throws Exception {
    this.taskExecutor.setThreadNamePrefix("Jarvis-");
    this.taskExecutor.setCorePoolSize(5);
    this.taskExecutor.setMaxPoolSize(10);
    this.taskExecutor.setWaitForTasksToCompleteOnShutdown(false);
  }
}

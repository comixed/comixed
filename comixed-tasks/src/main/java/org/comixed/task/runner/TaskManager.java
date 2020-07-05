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

import lombok.extern.log4j.Log4j2;
import org.comixed.task.adaptors.TaskAdaptor;
import org.comixed.task.model.WorkerTask;
import org.comixed.task.model.WorkerTaskException;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Component;

@Component
@Log4j2
public class TaskManager implements InitializingBean {
  @Autowired private ThreadPoolTaskExecutor taskExecutor;
  @Autowired private TaskAdaptor taskAdaptor;

  public void runTask(final WorkerTask task) {
    this.taskExecutor.execute(
        () -> {
          log.debug("Preparing to run task: {}", task.getDescription());
          try {
            task.startTask();
          } catch (WorkerTaskException error) {
            log.error("Error executing task: {}" + task.getDescription(), error);
          } finally {
            task.afterExecution();
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

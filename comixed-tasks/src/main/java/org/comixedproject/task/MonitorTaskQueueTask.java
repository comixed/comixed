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

import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.state.messaging.ImportCountMessage;
import org.comixedproject.model.state.messaging.TaskCountMessage;
import org.comixedproject.model.tasks.PersistedTask;
import org.comixedproject.model.tasks.PersistedTaskType;
import org.comixedproject.task.adaptors.TaskAdaptor;
import org.comixedproject.task.encoders.TaskEncoder;
import org.comixedproject.task.runner.TaskManager;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * <code>MonitorTaskQueueTask</code> is a task that continuous runs,looking for other tasks that
 * have been queued. When it finds them it loads them, decodes them and adds them to the {@link
 * TaskManager} for execution.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class MonitorTaskQueueTask extends AbstractTask implements InitializingBean {
  public static final String TASK_UPDATE_TARGET = "/topic/taskcount";
  static final String IMPORT_COUNT_TOPIC = "/topic/import.count";

  @Autowired private TaskManager taskManager;
  @Autowired private TaskAdaptor taskAdaptor;
  @Autowired private SimpMessagingTemplate messagingTemplate;

  @Override
  protected String createDescription() {
    return "PersistedTask queue monitor";
  }

  @Override
  public void afterPropertiesSet() {
    log.debug("Scheduling task queue monitor");
    this.taskManager.runTask(this);
  }

  @Override
  public void startTask() throws TaskException {
    log.debug("Updating task counts");
    this.messagingTemplate.convertAndSend(
        TASK_UPDATE_TARGET, new TaskCountMessage(this.taskAdaptor.getTaskCount()));

    log.debug("Updating import counts");
    this.messagingTemplate.convertAndSend(
        IMPORT_COUNT_TOPIC,
        new ImportCountMessage(
            this.taskAdaptor.getTaskCount(PersistedTaskType.ADD_COMIC),
            this.taskAdaptor.getTaskCount(PersistedTaskType.PROCESS_COMIC)));

    log.debug("Checking queue for waiting tasks");
    final List<PersistedTask> persistedTaskQueue = this.taskAdaptor.getNextTask();
    for (int index = 0; index < persistedTaskQueue.size(); index++) {
      PersistedTask persistedTask = persistedTaskQueue.get(index);
      log.debug("Rehydrating queued persistedTask");
      TaskEncoder<?> decoder;
      try {
        decoder = this.taskAdaptor.getEncoder(persistedTask.getTaskType());
      } catch (TaskException error) {
        throw new TaskException("failed to get persistedTask decoder", error);
      }
      Task nextTask = decoder.decode(persistedTask);
      log.debug("Passing persistedTask to persistedTask manager");
      this.taskManager.runTask(nextTask, persistedTask);
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

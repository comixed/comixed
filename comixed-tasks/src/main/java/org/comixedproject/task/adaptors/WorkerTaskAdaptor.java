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

package org.comixedproject.task.adaptors;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.tasks.Task;
import org.comixedproject.model.tasks.TaskType;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.TaskException;
import org.comixedproject.task.encoders.WorkerTaskEncoder;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Service;

/**
 * <code>TaskAdadptor</code> provides methods for fetching {@link WorkerTaskEncoder} objects for
 * encoding and decoding persisted {@link Task} objects.
 *
 * @author Darryl L. Pierce
 */
@Service
@EnableConfigurationProperties
@PropertySource("classpath:task-adaptors.properties")
@ConfigurationProperties(prefix = "task", ignoreUnknownFields = false)
@Log4j2
public class WorkerTaskAdaptor implements InitializingBean {
  @Autowired private ApplicationContext applicationContext;
  @Autowired private TaskService taskService;

  private List<TaskTypeEntry> adaptors = new ArrayList<>();
  Map<TaskType, String> adaptorMap = new EnumMap<>(TaskType.class);

  public List<TaskTypeEntry> getAdaptors() {
    return adaptors;
  }

  /**
   * Returns the next task to be executed.
   *
   * @return the task
   */
  public List<Task> getNextTask() {
    log.debug("Getting the next task to run");
    return this.taskService.getTasksToRun(1);
  }

  @Override
  public void afterPropertiesSet() throws Exception {
    log.debug("Loading task action configuration");
    this.adaptorMap.clear();
    for (TaskTypeEntry entry : this.adaptors) {
      if (this.adaptorMap.containsKey(entry.getType())) {
        throw new TaskException("Configuration already set for type: " + entry.getType());
      } else {
        if (!this.applicationContext.containsBean(entry.getName()))
          throw new TaskException("Missing decoder bean: " + entry.getName());

        this.adaptorMap.put(entry.getType(), entry.getName());
      }
    }
  }

  /**
   * Returns the configured {@link WorkerTaskEncoder} for the given {@link TaskType}.
   *
   * @param taskType the task type
   * @return the adaptor bean
   * @throws TaskException if no adaptor is configured
   */
  public <T extends WorkerTaskEncoder> T getEncoder(final TaskType taskType) throws TaskException {
    log.debug("Getting task adaptor: type={}", taskType);

    if (!this.adaptorMap.containsKey(taskType))
      throw new TaskException("No adaptor configured: " + taskType);

    return (T) this.applicationContext.getBean(this.adaptorMap.get(taskType));
  }

  public static class TaskTypeEntry {
    private TaskType type;
    private String name;

    public TaskType getType() {
      return type;
    }

    public void setType(final TaskType type) {
      this.type = type;
    }

    public String getName() {
      return name;
    }

    public void setName(final String name) {
      this.name = name;
    }
  }
}

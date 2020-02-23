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

package org.comixed.task.adaptors;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.comixed.model.tasks.Task;
import org.comixed.model.tasks.TaskType;
import org.comixed.repositories.tasks.TaskRepository;
import org.comixed.task.TaskException;
import org.comixed.task.encoders.TaskEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.PropertySource;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@EnableConfigurationProperties
@PropertySource("classpath:task-adaptors.properties")
@ConfigurationProperties(prefix = "task", ignoreUnknownFields = false)
public class TaskAdaptor implements InitializingBean {
  private final Logger logger = LoggerFactory.getLogger(this.getClass());

  @Autowired private ApplicationContext applicationContext;
  @Autowired private TaskRepository taskRepository;

  private List<TaskTypeEntry> adaptors = new ArrayList<>();
  Map<TaskType, String> adaptorMap = new HashMap<>();

  public List<TaskTypeEntry> getAdaptors() {
    return adaptors;
  }

  public List<Task> getNextTask() {
    this.logger.debug("Getting the next task to run");
    return this.taskRepository.getTasksToRun(PageRequest.of(0, 1));
  }

  @Transactional
  public Task save(final Task task) {
    this.logger.debug("Saving task: type={}", task.getTaskType());
    return this.taskRepository.save(task);
  }

  @Transactional
  public void delete(final Task task) {
    this.logger.debug("Deleting task: id={} type={}", task.getId(), task.getTaskType());
    this.taskRepository.delete(task);
  }

  @Override
  public void afterPropertiesSet() throws Exception {
    this.logger.debug("Loading task action configuration");
    this.adaptorMap.clear();
    for (TaskTypeEntry entry : this.adaptors) {
      if (this.adaptorMap.containsKey(entry.getType())) {
        throw new Exception("Configuration already set for type: " + entry.getType());
      } else {
        if (!this.applicationContext.containsBean(entry.getName()))
          throw new Exception("Missing decoder bean: " + entry.getName());

        this.adaptorMap.put(entry.getType(), entry.getName());
      }
    }
  }

  /**
   * Returns the configured {@link TaskEncoder} for the given {@link TaskType}.
   *
   * @param taskType the task type
   * @return the adaptor bean
   * @throws TaskException if no adaptor is configured
   */
  public <T extends TaskEncoder> T getEncoder(final TaskType taskType) throws TaskException {
    this.logger.debug("Getting task adaptor: type={}", taskType);

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

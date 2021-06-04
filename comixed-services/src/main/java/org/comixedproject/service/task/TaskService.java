/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project.
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

package org.comixedproject.service.task;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.tasks.PersistedTask;
import org.comixedproject.model.tasks.PersistedTaskType;
import org.comixedproject.model.tasks.TaskAuditLogEntry;
import org.comixedproject.repositories.tasks.TaskAuditLogRepository;
import org.comixedproject.repositories.tasks.TaskRepository;
import org.comixedproject.service.ComiXedServiceException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>TaskService</code> provides functions for working with instances of {@link PersistedTask}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class TaskService {
  @Autowired private TaskRepository taskRepository;
  @Autowired private TaskAuditLogRepository taskAuditLogRepository;

  private Map<Long, PersistedTaskType> runningTasks = new HashMap<>();

  /**
   * Returns the current number of records with the given task type.
   *
   * @param targetPersistedTaskType the task type
   * @return the record count
   */
  public int getTaskCount(final PersistedTaskType targetPersistedTaskType) {
    final long result =
        this.taskRepository.getTaskCount(targetPersistedTaskType)
            + this.runningTasks.values().stream()
                .filter(taskType -> taskType == targetPersistedTaskType)
                .count();
    log.debug("Found {} instance{} of {}", result, result == 1 ? "" : "s", targetPersistedTaskType);
    return (int) result;
  }

  /**
   * Return all log entries after the cutoff timestamp.
   *
   * @param cutoff the cutoff
   * @param maximum
   * @return the log entries
   * @throws ComiXedServiceException if an error occurs
   */
  public List<TaskAuditLogEntry> getAuditLogEntriesAfter(final Date cutoff, final int maximum)
      throws ComiXedServiceException {
    log.debug("Loading task audit log entries after date: {}", cutoff);
    return this.taskAuditLogRepository.loadAllStartedAfterDate(cutoff, PageRequest.of(0, maximum));
  }

  /**
   * Deletes the specified persistedTask.
   *
   * @param persistedTask the persistedTask
   */
  @Transactional
  public void delete(final PersistedTask persistedTask) {
    log.debug("Deleting persistedTask: id={}", persistedTask.getId());
    this.taskRepository.delete(persistedTask);
  }

  /**
   * Saves the specified persistedTask.
   *
   * @param persistedTask the persistedTask
   * @return the saved persistedTask
   */
  @Transactional
  public PersistedTask save(final PersistedTask persistedTask) {
    log.debug("Saving task: type={}", persistedTask.getTaskType());
    return this.taskRepository.save(persistedTask);
  }

  /**
   * Returns a list of tasks to be executed.
   *
   * @param max the maximum number of taks
   * @return the tasks
   */
  public List<PersistedTask> getTasksToRun(final int max) {
    log.debug("Fetching next task to run");
    return this.taskRepository.getTasksToRun(PageRequest.of(0, max));
  }

  /**
   * Saves a entry to the audit log table.
   *
   * @param entry the entry
   */
  @Transactional
  public void saveAuditLogEntry(final TaskAuditLogEntry entry) {
    log.debug("Adding task audit log entry: {}", entry.getDescription());
    this.taskAuditLogRepository.save(entry);
  }

  /** Clears the task audit log. */
  @Transactional
  public void clearTaskAuditLog() {
    log.debug("Clearing task audit log");
    this.taskAuditLogRepository.deleteAll();
  }

  public Map<Long, PersistedTaskType> getRunningTasks() {
    return this.runningTasks;
  }

  /**
   * Return the number of tasks both in the database and running.
   *
   * @return the task count
   */
  public long getTaskCount() {
    log.debug("Fetching the number of tasks in the database");
    return this.taskRepository.count() + this.runningTasks.size();
  }
}

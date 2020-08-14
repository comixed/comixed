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

import static junit.framework.TestCase.*;

import java.util.Date;
import java.util.List;
import org.comixedproject.model.tasks.Task;
import org.comixedproject.model.tasks.TaskAuditLogEntry;
import org.comixedproject.model.tasks.TaskType;
import org.comixedproject.repositories.tasks.TaskAuditLogRepository;
import org.comixedproject.repositories.tasks.TaskRepository;
import org.comixedproject.service.ComiXedServiceException;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.data.domain.PageRequest;

@RunWith(MockitoJUnitRunner.class)
public class TaskServiceTest {
  private static final int TEST_TASK_COUNT = 279;
  private static final Date TEST_AUDIT_LOG_CUTOFF_DATE = new Date();

  @InjectMocks private TaskService taskService;
  @Mock private TaskRepository taskRepository;
  @Mock private TaskAuditLogRepository taskAuditLogRepository;
  @Mock private List<TaskAuditLogEntry> auditLogEntryList;
  @Mock private Task task;
  @Mock private Task savedTask;
  @Mock private List<Task> taskList;
  @Captor private ArgumentCaptor<PageRequest> pageRequestArgumentCaptor;

  @Test
  public void testGetTaskCount() {
    Mockito.when(taskRepository.getTaskCount(Mockito.any(TaskType.class)))
        .thenReturn(TEST_TASK_COUNT);

    final int result = taskService.getTaskCount(TaskType.ADD_COMIC);

    assertEquals(TEST_TASK_COUNT, result);
  }

  @Test
  public void testGetAuditLogEntriesAfter() throws ComiXedServiceException {
    Mockito.when(
            taskAuditLogRepository.findAllByStartTimeGreaterThanOrderByStartTime(
                Mockito.any(Date.class)))
        .thenReturn(auditLogEntryList);

    final List<TaskAuditLogEntry> result =
        taskService.getAuditLogEntriesAfter(TEST_AUDIT_LOG_CUTOFF_DATE);

    assertNotNull(result);
    assertSame(auditLogEntryList, result);

    Mockito.verify(taskAuditLogRepository, Mockito.times(1))
        .findAllByStartTimeGreaterThanOrderByStartTime(TEST_AUDIT_LOG_CUTOFF_DATE);
  }

  @Test
  public void testDeleteTask() {
    Mockito.doNothing().when(taskRepository).delete(Mockito.any(Task.class));

    taskService.delete(task);

    Mockito.verify(taskRepository, Mockito.times(1)).delete(task);
  }

  @Test
  public void testSaveTask() {
    Mockito.when(taskRepository.save(Mockito.any(Task.class))).thenReturn(savedTask);

    final Task result = taskService.save(task);

    assertNotNull(result);
    assertSame(savedTask, result);

    Mockito.verify(taskRepository, Mockito.times(1)).save(task);
  }

  @Test
  public void testGetTasksToRun() {
    Mockito.when(taskRepository.getTasksToRun(pageRequestArgumentCaptor.capture()))
        .thenReturn(taskList);

    final List<Task> result = taskService.getTasksToRun(TEST_TASK_COUNT);

    assertNotNull(result);
    assertSame(taskList, result);
    assertNotNull(pageRequestArgumentCaptor.getValue());
    assertEquals(0, pageRequestArgumentCaptor.getValue().getPageNumber());
    assertEquals(TEST_TASK_COUNT, pageRequestArgumentCaptor.getValue().getPageSize());

    Mockito.verify(taskRepository, Mockito.times(1))
        .getTasksToRun(pageRequestArgumentCaptor.getValue());
  }

  @Test
  public void testClearTaskAuditLog() {
    Mockito.doNothing().when(taskAuditLogRepository).deleteAll();

    taskService.clearTaskAuditLog();

    Mockito.verify(taskAuditLogRepository, Mockito.times(1)).deleteAll();
  }
}

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
import org.comixedproject.model.tasks.PersistedTask;
import org.comixedproject.model.tasks.PersistedTaskType;
import org.comixedproject.model.tasks.TaskAuditLogEntry;
import org.comixedproject.repositories.tasks.TaskAuditLogRepository;
import org.comixedproject.repositories.tasks.TaskRepository;
import org.comixedproject.service.ComiXedServiceException;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.data.domain.PageRequest;

@RunWith(MockitoJUnitRunner.class)
public class PersistedTaskServiceTest {
  private static final int TEST_TASK_COUNT = 279;
  private static final Date TEST_AUDIT_LOG_CUTOFF_DATE = new Date();
  private static final int TEST_MAXIMUM_RECORDS = 100;

  @InjectMocks private TaskService taskService;
  @Mock private TaskRepository taskRepository;
  @Mock private TaskAuditLogRepository taskAuditLogRepository;
  @Mock private List<TaskAuditLogEntry> auditLogEntryList;
  @Mock private PersistedTask persistedTask;
  @Mock private PersistedTask savedPersistedTask;
  @Mock private List<PersistedTask> persistedTaskList;

  @Captor private ArgumentCaptor<PageRequest> pageRequestArgumentCaptor;

  @Test
  public void testGetTaskCount() {
    Mockito.when(taskRepository.getTaskCount(Mockito.any(PersistedTaskType.class)))
        .thenReturn(TEST_TASK_COUNT);

    final int result = taskService.getTaskCount(PersistedTaskType.ADD_COMIC);

    assertEquals(TEST_TASK_COUNT, result);
  }

  @Test
  public void testGetAuditLogEntriesAfter() throws ComiXedServiceException {
    Mockito.when(
            taskAuditLogRepository.loadAllStartedAfterDate(
                Mockito.any(Date.class), pageRequestArgumentCaptor.capture()))
        .thenReturn(auditLogEntryList);

    final List<TaskAuditLogEntry> result =
        taskService.getAuditLogEntriesAfter(TEST_AUDIT_LOG_CUTOFF_DATE, TEST_MAXIMUM_RECORDS);

    assertNotNull(result);
    assertSame(auditLogEntryList, result);

    final PageRequest pageRequest = pageRequestArgumentCaptor.getValue();
    assertNotNull(pageRequest);
    assertEquals(0, pageRequest.getPageNumber());
    assertEquals(TEST_MAXIMUM_RECORDS, pageRequest.getPageSize());

    Mockito.verify(taskAuditLogRepository, Mockito.times(1))
        .loadAllStartedAfterDate(TEST_AUDIT_LOG_CUTOFF_DATE, pageRequestArgumentCaptor.getValue());
  }

  @Test
  public void testDeleteTask() {
    Mockito.doNothing().when(taskRepository).delete(Mockito.any(PersistedTask.class));

    taskService.delete(persistedTask);

    Mockito.verify(taskRepository, Mockito.times(1)).delete(persistedTask);
  }

  @Test
  public void testSaveTask() {
    Mockito.when(taskRepository.save(Mockito.any(PersistedTask.class)))
        .thenReturn(savedPersistedTask);

    final PersistedTask result = taskService.save(persistedTask);

    assertNotNull(result);
    assertSame(savedPersistedTask, result);

    Mockito.verify(taskRepository, Mockito.times(1)).save(persistedTask);
  }

  @Test
  public void testGetTasksToRun() {
    Mockito.when(taskRepository.getTasksToRun(pageRequestArgumentCaptor.capture()))
        .thenReturn(persistedTaskList);

    final List<PersistedTask> result = taskService.getTasksToRun(TEST_TASK_COUNT);

    assertNotNull(result);
    assertSame(persistedTaskList, result);
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

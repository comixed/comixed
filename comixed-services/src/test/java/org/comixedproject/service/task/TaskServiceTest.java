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
import org.comixedproject.model.tasks.TaskAuditLogEntry;
import org.comixedproject.model.tasks.TaskType;
import org.comixedproject.repositories.tasks.TaskAuditLogRepository;
import org.comixedproject.repositories.tasks.TaskRepository;
import org.comixedproject.service.ComiXedServiceException;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class TaskServiceTest {
  private static final int TEST_TASK_COUNT = 279;
  private static final Date TEST_AUDIT_LOG_CUTOFF_DATE = new Date();

  @InjectMocks private TaskService taskService;
  @Mock private TaskRepository taskRepository;
  @Mock private TaskAuditLogRepository taskAuditLogRepository;
  @Mock private List<TaskAuditLogEntry> auditLogEntryList;

  @Test
  public void testGetTaskCount() {
    Mockito.when(taskRepository.getTaskCount(Mockito.any(TaskType.class)))
        .thenReturn(TEST_TASK_COUNT);

    final int result = taskService.getTaskCount(TaskType.ADD_COMIC);

    assertEquals(TEST_TASK_COUNT, result);
  }

  @Test
  public void testGetAuditLogEntriesAfter() throws ComiXedServiceException {
    Mockito.when(taskAuditLogRepository.findAllByStartTimeGreaterThan(Mockito.any(Date.class)))
        .thenReturn(auditLogEntryList);

    final List<TaskAuditLogEntry> result =
        taskService.getAuditLogEntriesAfter(TEST_AUDIT_LOG_CUTOFF_DATE);

    assertNotNull(result);
    assertSame(auditLogEntryList, result);

    Mockito.verify(taskAuditLogRepository, Mockito.times(1))
        .findAllByStartTimeGreaterThan(TEST_AUDIT_LOG_CUTOFF_DATE);
  }
}

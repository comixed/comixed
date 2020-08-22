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

package org.comixedproject.controller.core;

import static junit.framework.TestCase.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.comixedproject.controller.ComiXedControllerException;
import org.comixedproject.model.auditlog.RestAuditLogEntry;
import org.comixedproject.model.net.ApiResponse;
import org.comixedproject.model.net.GetRestAuditLogResponse;
import org.comixedproject.model.net.GetTaskAuditLogResponse;
import org.comixedproject.model.tasks.TaskAuditLogEntry;
import org.comixedproject.service.ComiXedServiceException;
import org.comixedproject.service.auditlog.RestAuditLogService;
import org.comixedproject.service.task.TaskService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class AuditLogControllerTest {
  private static final Date TEST_LAST_UPDATED_DATE = new Date();
  private static final String TEST_USER_EMAIL = "user@domain.tld";
  public static final Date TEST_DEFAULT_CUTOFF_DATE = new Date(0);

  @InjectMocks private AuditLogController auditLogController;
  @Mock private TaskService taskService;
  @Mock private RestAuditLogService restAuditLogService;
  @Mock private TaskAuditLogEntry taskAuditLogEntry;
  @Mock private RestAuditLogEntry restAuditLogEntry;

  private List<TaskAuditLogEntry> auditLogEntries = new ArrayList<>();
  private List<RestAuditLogEntry> restAuditLogEntries = new ArrayList<>();

  @Before
  public void setUp() {
    this.auditLogEntries.add(taskAuditLogEntry);
    Mockito.when(taskAuditLogEntry.getStartTime()).thenReturn(TEST_LAST_UPDATED_DATE);
    this.restAuditLogEntries.add(restAuditLogEntry);
    Mockito.when(restAuditLogEntry.getEndTime()).thenReturn(TEST_LAST_UPDATED_DATE);
  }

  @Test
  public void testGetAllTaskEntries() throws ComiXedServiceException, ComiXedControllerException {
    Mockito.when(taskService.getAuditLogEntriesAfter(Mockito.any(Date.class)))
        .thenReturn(auditLogEntries);

    final ApiResponse<GetTaskAuditLogResponse> result =
        auditLogController.getAllTaskEntriesAfterDate(TEST_LAST_UPDATED_DATE.getTime());

    assertNotNull(result);
    assertTrue(result.isSuccess());
    assertSame(auditLogEntries, result.getResult().getEntries());
    assertEquals(TEST_LAST_UPDATED_DATE, result.getResult().getLatest());

    Mockito.verify(taskService, Mockito.times(1)).getAuditLogEntriesAfter(TEST_LAST_UPDATED_DATE);
  }

  @Test
  public void testClearTaskLogServiceRaisesException() {
    Mockito.doThrow(new RuntimeException("Test")).when(taskService).clearTaskAuditLog();

    final ApiResponse<Void> result = auditLogController.clearTaskAuditLog();

    assertNotNull(result);
    assertFalse(result.isSuccess());
    assertNotNull(result.getError());
  }

  @Test
  public void testClearTaskLog() {
    Mockito.doNothing().when(taskService).clearTaskAuditLog();

    final ApiResponse<Void> result = auditLogController.clearTaskAuditLog();

    assertNotNull(result);
    assertTrue(result.isSuccess());
    assertNull(result.getError());
  }

  @Test
  public void testGetRestAuditLogEntriesAfterDateServiceThrowsException() {
    Mockito.when(restAuditLogService.getEntriesAfterDate(Mockito.anyLong()))
        .thenThrow(RuntimeException.class);

    ApiResponse<GetRestAuditLogResponse> result =
        auditLogController.getAllRestEntriesAfterDate(TEST_LAST_UPDATED_DATE.getTime());

    assertNotNull(result);
    assertNull(result.getResult());
    assertFalse(result.isSuccess());

    Mockito.verify(restAuditLogService, Mockito.times(1))
        .getEntriesAfterDate(TEST_LAST_UPDATED_DATE.getTime());
  }

  @Test
  public void testGetRestAuditLogEntriesAfterDate() {
    Mockito.when(restAuditLogService.getEntriesAfterDate(Mockito.anyLong()))
        .thenReturn(restAuditLogEntries);

    ApiResponse<GetRestAuditLogResponse> result =
        auditLogController.getAllRestEntriesAfterDate(TEST_LAST_UPDATED_DATE.getTime());

    assertNotNull(result);
    assertTrue(result.isSuccess());
    assertNotNull(result.getResult());
    assertSame(restAuditLogEntries, result.getResult().getEntries());
    assertNotNull(result.getResult().getLatest());
    assertEquals(TEST_LAST_UPDATED_DATE, result.getResult().getLatest());

    Mockito.verify(restAuditLogService, Mockito.times(1))
        .getEntriesAfterDate(TEST_LAST_UPDATED_DATE.getTime());
  }

  @Test
  public void testGetRestAuditLogEntriesAfterDateNoEntries() {
    restAuditLogEntries.clear();

    Mockito.when(restAuditLogService.getEntriesAfterDate(Mockito.anyLong()))
        .thenReturn(restAuditLogEntries);

    ApiResponse<GetRestAuditLogResponse> result =
        auditLogController.getAllRestEntriesAfterDate(TEST_LAST_UPDATED_DATE.getTime());

    assertNotNull(result);
    assertTrue(result.isSuccess());
    assertNotNull(result.getResult());
    assertSame(restAuditLogEntries, result.getResult().getEntries());
    assertNotNull(result.getResult().getLatest());

    Mockito.verify(restAuditLogService, Mockito.times(1))
        .getEntriesAfterDate(TEST_LAST_UPDATED_DATE.getTime());
  }
}

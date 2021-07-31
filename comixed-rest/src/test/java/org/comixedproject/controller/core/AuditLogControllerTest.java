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
import org.comixedproject.controller.admin.AuditLogController;
import org.comixedproject.model.auditlog.WebAuditLogEntry;
import org.comixedproject.model.net.GetTaskAuditLogResponse;
import org.comixedproject.model.net.LoadWebAuditLogResponse;
import org.comixedproject.model.net.audit.LoadTaskAuditLogEntriesRequest;
import org.comixedproject.model.tasks.TaskAuditLogEntry;
import org.comixedproject.service.ComiXedServiceException;
import org.comixedproject.service.auditlog.WebAuditLogService;
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
  private static final int TEST_MAXIMUM_RECORDS = 100;

  @InjectMocks private AuditLogController auditLogController;
  @Mock private TaskService taskService;
  @Mock private WebAuditLogService webAuditLogService;
  @Mock private TaskAuditLogEntry taskAuditLogEntry;
  @Mock private WebAuditLogEntry webAuditLogEntry;

  private List<TaskAuditLogEntry> auditLogEntries = new ArrayList<>();
  private List<WebAuditLogEntry> restAuditLogEntries = new ArrayList<>();

  @Before
  public void setUp() {
    this.auditLogEntries.add(taskAuditLogEntry);
    Mockito.when(taskAuditLogEntry.getStartTime()).thenReturn(TEST_LAST_UPDATED_DATE);
    this.restAuditLogEntries.add(webAuditLogEntry);
    Mockito.when(webAuditLogEntry.getEndTime()).thenReturn(TEST_LAST_UPDATED_DATE);
  }

  @Test
  public void testGetAllTaskEntries() throws ComiXedServiceException {
    Mockito.when(taskService.getAuditLogEntriesAfter(Mockito.any(Date.class), Mockito.anyInt()))
        .thenReturn(auditLogEntries);

    final GetTaskAuditLogResponse result =
        auditLogController.getAllTaskEntriesAfterDate(
            new LoadTaskAuditLogEntriesRequest(
                TEST_LAST_UPDATED_DATE.getTime(), TEST_MAXIMUM_RECORDS));

    assertNotNull(result);
    assertSame(auditLogEntries, result.getEntries());
    assertEquals(TEST_LAST_UPDATED_DATE, result.getLatest());

    Mockito.verify(taskService, Mockito.times(1))
        .getAuditLogEntriesAfter(TEST_LAST_UPDATED_DATE, TEST_MAXIMUM_RECORDS + 1);
  }

  @Test
  public void testClearTaskLog() {
    Mockito.doNothing().when(taskService).clearTaskAuditLog();

    auditLogController.clearTaskAuditLog();

    Mockito.verify(taskService, Mockito.times(1)).clearTaskAuditLog();
  }

  @Test
  public void testGetRestAuditLogEntriesAfterDate() {
    Mockito.when(webAuditLogService.getEntriesAfterDate(Mockito.anyLong()))
        .thenReturn(restAuditLogEntries);

    LoadWebAuditLogResponse result =
        auditLogController.loadWebAuditLogEntries(TEST_LAST_UPDATED_DATE.getTime());

    assertNotNull(result);
    assertSame(restAuditLogEntries, result.getEntries());
    assertNotNull(result.getLatest());
    assertEquals(TEST_LAST_UPDATED_DATE, result.getLatest());

    Mockito.verify(webAuditLogService, Mockito.times(1))
        .getEntriesAfterDate(TEST_LAST_UPDATED_DATE.getTime());
  }

  @Test
  public void testGetRestAuditLogEntriesAfterDateNoEntries() {
    restAuditLogEntries.clear();

    Mockito.when(webAuditLogService.getEntriesAfterDate(Mockito.anyLong()))
        .thenReturn(restAuditLogEntries);

    LoadWebAuditLogResponse result =
        auditLogController.loadWebAuditLogEntries(TEST_LAST_UPDATED_DATE.getTime());

    assertNotNull(result);
    assertSame(restAuditLogEntries, result.getEntries());
    assertNotNull(result.getLatest());

    Mockito.verify(webAuditLogService, Mockito.times(1))
        .getEntriesAfterDate(TEST_LAST_UPDATED_DATE.getTime());
  }

  @Test
  public void testDeleteAllRestAuditLog() {
    Mockito.doNothing().when(webAuditLogService).clearLogEntries();

    auditLogController.deleteAllRestAuditLog();

    Mockito.verify(webAuditLogService, Mockito.times(1)).clearLogEntries();
  }
}

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

package org.comixed.controller.tasks;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;

import java.util.Date;
import java.util.List;
import org.comixed.controller.ComiXedControllerException;
import org.comixed.model.tasks.TaskAuditLogEntry;
import org.comixed.service.ComiXedServiceException;
import org.comixed.service.task.TaskService;
import org.comixed.service.user.UserService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class TaskControllerTest {
  private static final Date TEST_LAST_UPDATED_DATE = new Date();
  private static final String TEST_USER_EMAIL = "user@domain.tld";

  @InjectMocks private TaskController taskController;
  @Mock private UserService userService;
  @Mock private TaskService taskService;
  @Mock private List<TaskAuditLogEntry> auditLogEntries;

  @Test
  public void testGetAllEntries() throws ComiXedServiceException, ComiXedControllerException {
    Mockito.when(taskService.getAuditLogEntriesAfter(Mockito.any(Date.class)))
        .thenReturn(auditLogEntries);

    final List<TaskAuditLogEntry> result =
        taskController.getAllAfterDate(TEST_LAST_UPDATED_DATE.getTime());

    assertNotNull(result);
    assertSame(auditLogEntries, result);

    Mockito.verify(taskService, Mockito.times(1)).getAuditLogEntriesAfter(TEST_LAST_UPDATED_DATE);
  }
}

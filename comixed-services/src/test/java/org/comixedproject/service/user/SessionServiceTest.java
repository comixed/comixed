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

package org.comixedproject.service.user;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertTrue;

import org.comixedproject.model.session.SessionUpdate;
import org.comixedproject.model.session.UserSession;
import org.comixedproject.model.tasks.TaskType;
import org.comixedproject.service.task.TaskService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class SessionServiceTest {
  private static final Long TEST_TIMEOUT = 717L;
  private static final Integer TEST_TASK_COUNT = 213;

  @InjectMocks private SessionService sessionService;
  @Mock private UserSession userSession;
  @Mock private TaskService taskService;

  @Test
  public void testGetSessionUpdate() {
    Mockito.when(taskService.getTaskCount(Mockito.any())).thenReturn(TEST_TASK_COUNT);

    final SessionUpdate result = sessionService.getSessionUpdate(userSession, TEST_TIMEOUT);

    assertNotNull(result);
    assertTrue(result.getImportCount() > 0);

    Mockito.verify(taskService, Mockito.times(1)).getTaskCount(TaskType.PROCESS_COMIC);
    Mockito.verify(taskService, Mockito.times(1)).getTaskCount(TaskType.ADD_COMIC);
  }
}

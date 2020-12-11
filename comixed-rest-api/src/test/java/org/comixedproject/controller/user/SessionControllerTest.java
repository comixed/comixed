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

package org.comixedproject.controller.user;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;

import javax.servlet.http.HttpSession;
import org.comixedproject.model.net.session.SessionUpdateRequest;
import org.comixedproject.model.net.session.SessionUpdateResponse;
import org.comixedproject.model.session.SessionUpdate;
import org.comixedproject.model.session.UserSession;
import org.comixedproject.service.user.SessionService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class SessionControllerTest {
  private static final Long TEST_TIMESTAMP = System.currentTimeMillis();
  private static final Integer TEST_MAXIMUM_RECORDS = 100;
  private static final Long TEST_TIMEOUT = 717L;

  @InjectMocks private SessionController sessionController;
  @Mock private SessionService sessionService;
  @Mock private HttpSession httpSession;
  @Mock private UserSession userSession;
  @Captor private ArgumentCaptor<UserSession> userSessionArgumentCaptor;
  @Mock private SessionUpdateRequest sessionUpdateRequest;
  @Mock private SessionUpdate sessionUpdate;

  @Test
  public void testGetSessionUpdate() {
    Mockito.when(
            sessionService.getSessionUpdate(Mockito.anyLong(), Mockito.anyInt(), Mockito.anyLong()))
        .thenReturn(sessionUpdate);

    final SessionUpdateResponse response =
        sessionController.getSessionUpdate(
            httpSession,
            new SessionUpdateRequest(TEST_TIMESTAMP, TEST_MAXIMUM_RECORDS, TEST_TIMEOUT));

    assertNotNull(response);
    assertSame(sessionUpdate, response.getUpdate());

    Mockito.verify(sessionService, Mockito.times(1))
        .getSessionUpdate(TEST_TIMESTAMP, TEST_MAXIMUM_RECORDS, TEST_TIMEOUT);
  }
}

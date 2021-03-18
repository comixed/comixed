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

import java.security.Principal;
import org.comixedproject.model.net.session.SessionUpdateRequest;
import org.comixedproject.model.net.session.SessionUpdateResponse;
import org.comixedproject.model.session.SessionUpdate;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.SessionService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class SessionControllerTest {
  private static final Long TEST_TIMESTAMP = System.currentTimeMillis();
  private static final Integer TEST_MAXIMUM_RECORDS = 100;
  private static final Long TEST_TIMEOUT = 717L;
  private static final String TEST_EMAIL = "read@comixed.org";

  @InjectMocks private SessionController sessionController;
  @Mock private SessionService sessionService;
  @Mock private SessionUpdate sessionUpdate;
  @Mock private Principal principal;

  @Before
  public void setUp() {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
  }

  @Test
  public void testGetSessionUpdate() throws ComiXedUserException {
    Mockito.when(
            sessionService.getSessionUpdate(
                Mockito.anyLong(), Mockito.anyInt(), Mockito.anyLong(), Mockito.anyString()))
        .thenReturn(sessionUpdate);

    final SessionUpdateResponse response =
        sessionController.getSessionUpdate(
            principal,
            new SessionUpdateRequest(TEST_TIMESTAMP, TEST_MAXIMUM_RECORDS, TEST_TIMEOUT));

    assertNotNull(response);
    assertSame(sessionUpdate, response.getUpdate());

    Mockito.verify(sessionService, Mockito.times(1))
        .getSessionUpdate(TEST_TIMESTAMP, TEST_MAXIMUM_RECORDS, TEST_TIMEOUT, TEST_EMAIL);
  }
}

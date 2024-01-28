/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project.
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

package org.comixedproject.rest.user;

import static org.junit.Assert.*;

import java.security.Principal;
import java.util.List;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.model.net.user.*;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.service.library.LastReadException;
import org.comixedproject.service.library.LastReadService;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class UserControllerTest {
  private static final long TEST_USER_ID = 717L;
  private static final String TEST_EMAIL = "comixedreader@comixed.org";
  private static final String TEST_PASSWORD = "My!P455w0rD";
  private static final String TEST_PROPERTY_NAME = "property.name";
  private static final String TEST_PROPERTY_VALUE = "property value";
  private static final Boolean TEST_HAS_EXISTING = RandomUtils.nextBoolean();

  @InjectMocks private UserController controller;
  @Mock private UserService userService;
  @Mock private LastReadService lastReadService;
  @Mock private ComiXedUser user;
  @Mock private Principal principal;
  @Mock private List<ComicsReadStatistic> comicsReadStatisticsList;

  @Before
  public void setUp() {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
  }

  @Test
  public void testCheckForAdminAccount() {
    Mockito.when(userService.hasAdminAccounts()).thenReturn(TEST_HAS_EXISTING);

    final checkForAdminAccountResponse result = controller.checkForAdmin();

    assertNotNull(result);
    assertEquals(TEST_HAS_EXISTING, result.isHasExisting());

    Mockito.verify(userService, Mockito.times(1)).hasAdminAccounts();
  }

  @Test(expected = ComiXedUserException.class)
  public void testCreateAdminAccountServiceThrowsException() throws ComiXedUserException {
    Mockito.doThrow(ComiXedUserException.class)
        .when(userService)
        .createAdminAccount(Mockito.anyString(), Mockito.anyString());

    try {
      controller.createAdminAccount(new CreateAccountRequest(TEST_EMAIL, TEST_PASSWORD));
    } finally {
      Mockito.verify(userService, Mockito.times(1)).createAdminAccount(TEST_EMAIL, TEST_PASSWORD);
    }
  }

  @Test
  public void testCreateAdminAccount() throws ComiXedUserException {
    controller.createAdminAccount(new CreateAccountRequest(TEST_EMAIL, TEST_PASSWORD));

    Mockito.verify(userService, Mockito.times(1)).createAdminAccount(TEST_EMAIL, TEST_PASSWORD);
  }

  @Test(expected = ComiXedUserException.class)
  public void testLoadCurrentUserInvalidEmail() throws ComiXedUserException {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      controller.loadCurrentUser(principal);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    }
  }

  @Test
  public void testLoadCurrentUser() throws ComiXedUserException {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);

    final ComiXedUser result = controller.loadCurrentUser(principal);

    assertNotNull(result);
    assertSame(user, result);

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
  }

  @Test(expected = ComiXedUserException.class)
  public void testSetUserPropertyServiceFailure() throws ComiXedUserException {
    Mockito.when(
            userService.setUserProperty(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      controller.saveCurrentUserPreference(
          principal, TEST_PROPERTY_NAME, new SaveCurrentUserPreferenceRequest(TEST_PROPERTY_VALUE));
    } finally {
      Mockito.verify(userService, Mockito.times(1))
          .setUserProperty(TEST_EMAIL, TEST_PROPERTY_NAME, TEST_PROPERTY_VALUE);
    }
  }

  @Test
  public void testSetUserProperty() throws ComiXedUserException {
    Mockito.when(
            userService.setUserProperty(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(user);

    final ComiXedUser result =
        controller.saveCurrentUserPreference(
            principal,
            TEST_PROPERTY_NAME,
            new SaveCurrentUserPreferenceRequest(TEST_PROPERTY_VALUE));

    assertNotNull(result);
    assertSame(user, result);

    Mockito.verify(userService, Mockito.times(1))
        .setUserProperty(TEST_EMAIL, TEST_PROPERTY_NAME, TEST_PROPERTY_VALUE);
  }

  @Test(expected = ComiXedUserException.class)
  public void testDeleteUserPropertyServiceFailure() throws ComiXedUserException {
    Mockito.when(userService.deleteUserProperty(Mockito.anyString(), Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      controller.deleteCurrentUserProperty(principal, TEST_PROPERTY_NAME);
    } finally {
      Mockito.verify(userService, Mockito.times(1))
          .deleteUserProperty(TEST_EMAIL, TEST_PROPERTY_NAME);
    }
  }

  @Test
  public void testDeleteUserProperty() throws ComiXedUserException {
    Mockito.when(userService.deleteUserProperty(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(user);

    final ComiXedUser result = controller.deleteCurrentUserProperty(principal, TEST_PROPERTY_NAME);

    assertNotNull(result);
    assertSame(user, result);

    Mockito.verify(userService, Mockito.times(1))
        .deleteUserProperty(TEST_EMAIL, TEST_PROPERTY_NAME);
  }

  @Test(expected = ComiXedUserException.class)
  public void testSaveCurrentUserServiceThrowsException() throws ComiXedUserException {
    Mockito.when(
            userService.updateCurrentUser(
                Mockito.anyLong(), Mockito.anyString(), Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      controller.updateCurrentUser(
          TEST_USER_ID, new UpdateCurrentUserRequest(TEST_EMAIL, TEST_PASSWORD));
    } finally {
      Mockito.verify(userService, Mockito.times(1))
          .updateCurrentUser(TEST_USER_ID, TEST_EMAIL, TEST_PASSWORD);
    }
  }

  @Test
  public void testSaveCurrentUser() throws ComiXedUserException {
    Mockito.when(
            userService.updateCurrentUser(
                Mockito.anyLong(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(user);

    final ComiXedUser response =
        controller.updateCurrentUser(
            TEST_USER_ID, new UpdateCurrentUserRequest(TEST_EMAIL, TEST_PASSWORD));

    assertNotNull(response);
    assertSame(user, response);

    Mockito.verify(userService, Mockito.times(1))
        .updateCurrentUser(TEST_USER_ID, TEST_EMAIL, TEST_PASSWORD);
  }

  @Test(expected = ComiXedUserException.class)
  public void testLoadComicsReadStatisticsLastReadException()
      throws LastReadException, ComiXedUserException {
    Mockito.when(lastReadService.loadComicsReadStatistics(Mockito.anyString()))
        .thenThrow(LastReadException.class);

    try {
      controller.loadComicsReadStatistics(principal);
    } finally {
      Mockito.verify(lastReadService, Mockito.times(1)).loadComicsReadStatistics(TEST_EMAIL);
    }
  }

  @Test
  public void testLoadComicsReadStatistics() throws LastReadException, ComiXedUserException {
    Mockito.when(lastReadService.loadComicsReadStatistics(Mockito.anyString()))
        .thenReturn(comicsReadStatisticsList);

    final List<ComicsReadStatistic> result = controller.loadComicsReadStatistics(principal);

    assertNotNull(result);
    assertSame(comicsReadStatisticsList, result);

    Mockito.verify(lastReadService, Mockito.times(1)).loadComicsReadStatistics(TEST_EMAIL);
  }
}

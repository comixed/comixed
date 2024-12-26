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
  private static final boolean TEST_ADMIN = RandomUtils.nextBoolean();

  @InjectMocks private UserController controller;
  @Mock private UserService userService;
  @Mock private ComiXedUser user;
  @Mock private Principal principal;
  @Mock private List<ComicsReadStatistic> comicsReadStatisticsList;
  @Mock private List<ComiXedUser> userList;
  @Mock private CreateAccountRequest createAccountRequest;

  @Before
  public void setUp() {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
    Mockito.when(createAccountRequest.getEmail()).thenReturn(TEST_EMAIL);
    Mockito.when(createAccountRequest.getPassword()).thenReturn(TEST_PASSWORD);
    Mockito.when(createAccountRequest.isAdmin()).thenReturn(TEST_ADMIN);
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
      controller.createAdminAccount(new CreateAdminAccountRequest(TEST_EMAIL, TEST_PASSWORD));
    } finally {
      Mockito.verify(userService, Mockito.times(1)).createAdminAccount(TEST_EMAIL, TEST_PASSWORD);
    }
  }

  @Test
  public void testCreateAdminAccount() throws ComiXedUserException {
    controller.createAdminAccount(new CreateAdminAccountRequest(TEST_EMAIL, TEST_PASSWORD));

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

  @Test
  public void testLoadComicsReadStatistics() throws ComiXedUserException {
    Mockito.when(userService.loadComicsReadStatistics(Mockito.anyString()))
        .thenReturn(comicsReadStatisticsList);

    final List<ComicsReadStatistic> result = controller.loadComicsReadStatistics(principal);

    assertNotNull(result);
    assertSame(comicsReadStatisticsList, result);

    Mockito.verify(userService, Mockito.times(1)).loadComicsReadStatistics(TEST_EMAIL);
  }

  @Test
  public void testGetUserAccountList() {
    Mockito.when(userService.getUserAccountList()).thenReturn(userList);

    final List<ComiXedUser> result = controller.getUserAccountList();

    assertNotNull(result);
    assertSame(userList, result);

    Mockito.verify(userService, Mockito.times(1)).getUserAccountList();
  }

  @Test(expected = ComiXedUserException.class)
  public void testCreateUserAccount_serviceException() throws ComiXedUserException {
    Mockito.when(
            userService.createUserAccount(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenThrow(ComiXedUserException.class);

    try {
      controller.createUserAccount(createAccountRequest);
    } finally {
      Mockito.verify(userService, Mockito.times(1))
          .createUserAccount(TEST_EMAIL, TEST_PASSWORD, TEST_ADMIN);
    }
  }

  @Test
  public void testCreateUserAccount() throws ComiXedUserException {
    Mockito.when(
            userService.createUserAccount(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(userList);

    final List<ComiXedUser> result = controller.createUserAccount(createAccountRequest);

    assertNotNull(result);
    assertSame(userList, result);

    Mockito.verify(userService, Mockito.times(1))
        .createUserAccount(TEST_EMAIL, TEST_PASSWORD, TEST_ADMIN);
  }

  @Test(expected = ComiXedUserException.class)
  public void testUpdateUserAccount_serviceException() throws ComiXedUserException {
    Mockito.when(
            userService.updateUserAccount(
                Mockito.anyLong(), Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenThrow(ComiXedUserException.class);

    try {
      controller.updateUserAccount(createAccountRequest, TEST_USER_ID);
    } finally {
      Mockito.verify(userService, Mockito.times(1))
          .updateUserAccount(TEST_USER_ID, TEST_EMAIL, TEST_PASSWORD, TEST_ADMIN);
    }
  }

  @Test
  public void testUpdateUserAccount() throws ComiXedUserException {
    Mockito.when(
            userService.updateUserAccount(
                Mockito.anyLong(), Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(userList);

    final List<ComiXedUser> result =
        controller.updateUserAccount(createAccountRequest, TEST_USER_ID);

    assertNotNull(result);
    assertSame(userList, result);

    Mockito.verify(userService, Mockito.times(1))
        .updateUserAccount(TEST_USER_ID, TEST_EMAIL, TEST_PASSWORD, TEST_ADMIN);
  }

  @Test(expected = ComiXedUserException.class)
  public void testDeleteUserAccount_serviceException() throws ComiXedUserException {
    Mockito.doThrow(ComiXedUserException.class)
        .when(userService)
        .deleteUserAccount(Mockito.anyLong());

    try {
      controller.deleteUserAccount(TEST_USER_ID);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).deleteUserAccount(TEST_USER_ID);
    }
  }

  @Test
  public void testDeleteUserAccount() throws ComiXedUserException {
    controller.deleteUserAccount(TEST_USER_ID);

    Mockito.verify(userService, Mockito.times(1)).deleteUserAccount(TEST_USER_ID);
  }
}

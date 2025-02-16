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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class UserControllerTest {
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

  @BeforeEach
  void setUp() {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
    Mockito.when(createAccountRequest.getEmail()).thenReturn(TEST_EMAIL);
    Mockito.when(createAccountRequest.getPassword()).thenReturn(TEST_PASSWORD);
    Mockito.when(createAccountRequest.isAdmin()).thenReturn(TEST_ADMIN);
  }

  @Test
  void checkForAdminAccount() {
    Mockito.when(userService.hasAdminAccounts()).thenReturn(TEST_HAS_EXISTING);

    final checkForAdminAccountResponse result = controller.checkForAdmin();

    assertNotNull(result);
    assertEquals(TEST_HAS_EXISTING, result.isHasExisting());

    Mockito.verify(userService, Mockito.times(1)).hasAdminAccounts();
  }

  @Test
  void createAdminAccountServiceThrowsException() throws ComiXedUserException {
    Mockito.doThrow(ComiXedUserException.class)
        .when(userService)
        .createAdminAccount(Mockito.anyString(), Mockito.anyString());

    assertThrows(
        ComiXedUserException.class,
        () ->
            controller.createAdminAccount(
                new CreateAdminAccountRequest(TEST_EMAIL, TEST_PASSWORD)));
  }

  @Test
  void createAdminAccount() throws ComiXedUserException {
    controller.createAdminAccount(new CreateAdminAccountRequest(TEST_EMAIL, TEST_PASSWORD));

    Mockito.verify(userService, Mockito.times(1)).createAdminAccount(TEST_EMAIL, TEST_PASSWORD);
  }

  @Test
  void loadCurrentUserInvalidEmail() throws ComiXedUserException {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    assertThrows(ComiXedUserException.class, () -> controller.loadCurrentUser(principal));
  }

  @Test
  void loadCurrentUser() throws ComiXedUserException {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);

    final ComiXedUser result = controller.loadCurrentUser(principal);

    assertNotNull(result);
    assertSame(user, result);

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
  }

  @Test
  void setUserPropertyServiceFailure() throws ComiXedUserException {
    Mockito.when(
            userService.setUserProperty(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    assertThrows(
        ComiXedUserException.class,
        () ->
            controller.saveCurrentUserPreference(
                principal,
                TEST_PROPERTY_NAME,
                new SaveCurrentUserPreferenceRequest(TEST_PROPERTY_VALUE)));
  }

  @Test
  void setUserProperty() throws ComiXedUserException {
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

  @Test
  void deleteUserPropertyServiceFailure() throws ComiXedUserException {
    Mockito.when(userService.deleteUserProperty(Mockito.anyString(), Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    assertThrows(
        ComiXedUserException.class,
        () -> controller.deleteCurrentUserProperty(principal, TEST_PROPERTY_NAME));
  }

  @Test
  void deleteUserProperty() throws ComiXedUserException {
    Mockito.when(userService.deleteUserProperty(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(user);

    final ComiXedUser result = controller.deleteCurrentUserProperty(principal, TEST_PROPERTY_NAME);

    assertNotNull(result);
    assertSame(user, result);

    Mockito.verify(userService, Mockito.times(1))
        .deleteUserProperty(TEST_EMAIL, TEST_PROPERTY_NAME);
  }

  @Test
  void saveCurrentUserServiceThrowsException() throws ComiXedUserException {
    Mockito.when(
            userService.updateCurrentUser(
                Mockito.anyLong(), Mockito.anyString(), Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    assertThrows(
        ComiXedUserException.class,
        () ->
            controller.updateCurrentUser(
                TEST_USER_ID, new UpdateCurrentUserRequest(TEST_EMAIL, TEST_PASSWORD)));
  }

  @Test
  void saveCurrentUser() throws ComiXedUserException {
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
  void loadComicsReadStatistics() throws ComiXedUserException {
    Mockito.when(userService.loadComicsReadStatistics(Mockito.anyString()))
        .thenReturn(comicsReadStatisticsList);

    final List<ComicsReadStatistic> result = controller.loadComicsReadStatistics(principal);

    assertNotNull(result);
    assertSame(comicsReadStatisticsList, result);

    Mockito.verify(userService, Mockito.times(1)).loadComicsReadStatistics(TEST_EMAIL);
  }

  @Test
  void getUserAccountList() {
    Mockito.when(userService.getUserAccountList()).thenReturn(userList);

    final List<ComiXedUser> result = controller.getUserAccountList();

    assertNotNull(result);
    assertSame(userList, result);

    Mockito.verify(userService, Mockito.times(1)).getUserAccountList();
  }

  @Test
  void createUserAccount_serviceException() throws ComiXedUserException {
    Mockito.when(
            userService.createUserAccount(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenThrow(ComiXedUserException.class);

    assertThrows(
        ComiXedUserException.class, () -> controller.createUserAccount(createAccountRequest));
  }

  @Test
  void createUserAccount() throws ComiXedUserException {
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

  @Test
  void updateUserAccount_serviceException() throws ComiXedUserException {
    Mockito.when(
            userService.updateUserAccount(
                Mockito.anyLong(), Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenThrow(ComiXedUserException.class);

    assertThrows(
        ComiXedUserException.class,
        () -> controller.updateUserAccount(createAccountRequest, TEST_USER_ID));
  }

  @Test
  void updateUserAccount() throws ComiXedUserException {
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

  @Test
  void deleteUserAccount_serviceException() throws ComiXedUserException {
    Mockito.doThrow(ComiXedUserException.class)
        .when(userService)
        .deleteUserAccount(Mockito.anyLong());

    assertThrows(ComiXedUserException.class, () -> controller.deleteUserAccount(TEST_USER_ID));
  }

  @Test
  void deleteUserAccount() throws ComiXedUserException {
    controller.deleteUserAccount(TEST_USER_ID);

    Mockito.verify(userService, Mockito.times(1)).deleteUserAccount(TEST_USER_ID);
  }
}

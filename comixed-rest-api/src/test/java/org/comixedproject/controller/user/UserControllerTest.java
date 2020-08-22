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

package org.comixedproject.controller.user;

import static org.junit.Assert.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;
import org.comixedproject.model.net.SaveUserRequest;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.model.user.Role;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.comixedproject.utils.Utils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.Authentication;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class UserControllerTest {
  private static final String TEST_PROPERTY_NAME = "screen_width";
  private static final String TEST_PROPERTY_VALUE = "717";
  private static final String TEST_EMAIL = "comixedreader@comixed.org";
  private static final String INVALID_EMAIL = "nosuchreader@comixed.org";
  private static final String TEST_PASSWORD = "this!is!my!password";
  private static final String TEST_PASSWORD_HASH = "0123456789ABCDEF";
  private static final Role TEST_ROLE_READER = new Role("READER");
  private static final Role TEST_ROLE_ADMIN = new Role("ADMIN");
  private static final long TEST_USER_ID = 717;
  private static final Boolean TEST_IS_ADMIN = true;
  private static final String TEST_AUTH_EMAIL = "comixedadmin@comixed.org";

  @InjectMocks private UserController controller;
  @Mock private UserService userService;
  @Mock private ComiXedUser user;
  @Captor private ArgumentCaptor<ComiXedUser> userCaptor;
  @Mock private List<ComiXedUser> userList;
  @Mock private Authentication authentication;
  @Mock private Utils utils;
  @Mock private Principal principal;
  @Mock private ComiXedUser adminUser;

  private Optional<ComiXedUser> queryResultUser;

  @Before
  public void setUp() {
    controller.setReaderRole(TEST_ROLE_READER);
    controller.setAdminRole(TEST_ROLE_ADMIN);
  }

  @Test
  public void testAfterPropertiesSet() throws Exception, ComiXedUserException {
    Mockito.when(userService.findRoleByName("READER")).thenReturn(TEST_ROLE_READER);
    Mockito.when(userService.findRoleByName("ADMIN")).thenReturn(TEST_ROLE_ADMIN);

    controller.afterPropertiesSet();

    assertSame(TEST_ROLE_READER, controller.readerRole);
    assertSame(TEST_ROLE_ADMIN, controller.adminRole);

    Mockito.verify(userService, Mockito.times(1)).findRoleByName("READER");
    Mockito.verify(userService, Mockito.times(1)).findRoleByName("ADMIN");
  }

  @Test
  public void testSetUserProperty() throws ComiXedUserException {
    Mockito.when(authentication.getName()).thenReturn(TEST_EMAIL);
    Mockito.when(
            userService.setUserProperty(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(user);

    ComiXedUser result =
        controller.setUserProperty(authentication, TEST_PROPERTY_NAME, TEST_PROPERTY_VALUE);

    assertNotNull(result);
    assertSame(user, result);

    Mockito.verify(authentication, Mockito.times(1)).getName();
    Mockito.verify(userService, Mockito.times(1))
        .setUserProperty(TEST_EMAIL, TEST_PROPERTY_NAME, TEST_PROPERTY_VALUE);
  }

  @Test
  public void testDeleteUserProperty() {
    Mockito.when(authentication.getName()).thenReturn(TEST_EMAIL);
    Mockito.when(userService.deleteUserProperty(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(user);

    final ComiXedUser result = controller.deleteUserProperty(authentication, TEST_PROPERTY_NAME);

    assertNotNull(result);
    assertSame(user, result);

    Mockito.verify(authentication, Mockito.times(1)).getName();
    Mockito.verify(userService, Mockito.times(1))
        .deleteUserProperty(TEST_EMAIL, TEST_PROPERTY_NAME);
  }

  @Test(expected = ComiXedUserException.class)
  public void testSetUserPropertyForInvalidUser() throws ComiXedUserException {
    Mockito.when(authentication.getName()).thenReturn(TEST_EMAIL);
    Mockito.when(
            userService.setUserProperty(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      controller.setUserProperty(authentication, TEST_PROPERTY_NAME, TEST_PROPERTY_VALUE);
    } finally {
      Mockito.verify(authentication, Mockito.times(1)).getName();
      Mockito.verify(userService, Mockito.times(1))
          .setUserProperty(TEST_EMAIL, TEST_PROPERTY_NAME, TEST_PROPERTY_VALUE);
    }
  }

  @Test
  public void testGetCurrentUserWhenNotAuthented() throws ComiXedUserException {
    assertNull(controller.getCurrentUser(null));
  }

  @Test(expected = ComiXedUserException.class)
  public void testGetCurrentUserForMissingName() throws ComiXedUserException {
    Mockito.when(authentication.getName()).thenReturn(INVALID_EMAIL);
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      controller.getCurrentUser(authentication);
    } finally {
      Mockito.verify(authentication, Mockito.atLeast(1)).getName();
      Mockito.verify(userService, Mockito.times(1)).findByEmail(INVALID_EMAIL);
    }
  }

  @Test
  public void testGetCurrentUser() throws ComiXedUserException {
    Mockito.when(authentication.getName()).thenReturn(TEST_EMAIL);
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.doNothing().when(user).setAuthenticated(Mockito.anyBoolean());

    assertNotNull(controller.getCurrentUser(authentication));

    Mockito.verify(authentication, Mockito.atLeast(1)).getName();
    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(user, Mockito.times(1)).setAuthenticated(true);
  }

  @Test
  public void testUpdatePassword() throws ComiXedUserException {
    Mockito.when(authentication.getName()).thenReturn(TEST_EMAIL);
    Mockito.when(userService.setUserPassword(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(user);

    final ComiXedUser result = controller.updatePassword(authentication, TEST_PASSWORD);

    Mockito.verify(authentication, Mockito.atLeast(1)).getName();
    Mockito.verify(userService, Mockito.times(1)).setUserPassword(TEST_EMAIL, TEST_PASSWORD);
  }

  @Test(expected = ComiXedUserException.class)
  public void testSetUserEmailInvalidUser() throws ComiXedUserException {
    Mockito.when(authentication.getName()).thenReturn(TEST_EMAIL);
    Mockito.when(userService.setUserEmail(Mockito.anyString(), Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      controller.setUserEmail(authentication, TEST_EMAIL);
    } finally {
      Mockito.verify(authentication, Mockito.atLeast(1)).getName();
      Mockito.verify(userService, Mockito.times(1)).setUserEmail(TEST_EMAIL, TEST_EMAIL);
    }
  }

  @Test
  public void testSetUserEmail() throws ComiXedUserException {
    Mockito.when(authentication.getName()).thenReturn(TEST_EMAIL);
    Mockito.when(userService.setUserEmail(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(user);

    final ComiXedUser result = controller.setUserEmail(authentication, TEST_EMAIL);

    Mockito.verify(authentication, Mockito.atLeast(1)).getName();
    Mockito.verify(userService, Mockito.times(1)).setUserEmail(TEST_EMAIL, TEST_EMAIL);
  }

  @Test
  public void testGetAllUsers() {
    Mockito.when(userService.findAll()).thenReturn(userList);

    List<ComiXedUser> result = controller.getAllUsers();

    assertNotNull(result);
    assertSame(userList, result);

    Mockito.verify(userService, Mockito.times(1)).findAll();
  }

  @Test
  public void testUpdateUserDoesNotExist() throws ComiXedUserException {
    Mockito.when(principal.getName()).thenReturn(TEST_AUTH_EMAIL);
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(adminUser);
    Mockito.when(userService.findById(Mockito.anyLong())).thenReturn(null);

    ComiXedUser result =
        controller.updateUser(
            principal, TEST_USER_ID, new SaveUserRequest(TEST_EMAIL, TEST_PASSWORD, TEST_IS_ADMIN));

    assertNull(result);

    Mockito.verify(principal, Mockito.times(1)).getName();
    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_AUTH_EMAIL);
    Mockito.verify(userService, Mockito.times(1)).findById(TEST_USER_ID);
  }

  @Test
  public void testUpdateUserNonAdminCantChangeRoles() throws ComiXedUserException {
    Mockito.when(principal.getName()).thenReturn(TEST_AUTH_EMAIL);
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(adminUser);
    Mockito.when(userService.findById(Mockito.anyLong())).thenReturn(user);
    Mockito.when(adminUser.isAdmin()).thenReturn(false);
    Mockito.when(userService.save(Mockito.any(ComiXedUser.class))).thenReturn(user);

    ComiXedUser result =
        controller.updateUser(
            principal, TEST_USER_ID, new SaveUserRequest(TEST_EMAIL, TEST_PASSWORD, TEST_IS_ADMIN));

    assertNotNull(result);
    assertSame(user, result);

    Mockito.verify(principal, Mockito.times(1)).getName();
    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_AUTH_EMAIL);
    Mockito.verify(userService, Mockito.times(1)).findById(TEST_USER_ID);
    Mockito.verify(user, Mockito.never()).clearRoles();
    Mockito.verify(user, Mockito.never()).addRole(Mockito.any());
    Mockito.verify(userService, Mockito.times(1)).save(user);
  }

  @Test
  public void testUpdateUserAdminCantChangeOwnRoles() throws ComiXedUserException {
    Mockito.when(principal.getName()).thenReturn(TEST_AUTH_EMAIL);
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(adminUser);
    Mockito.when(userService.findById(Mockito.anyLong())).thenReturn(adminUser);
    Mockito.when(adminUser.isAdmin()).thenReturn(true);
    Mockito.when(adminUser.getId()).thenReturn(TEST_USER_ID);
    Mockito.when(userService.save(Mockito.any(ComiXedUser.class))).thenReturn(user);

    ComiXedUser result =
        controller.updateUser(
            principal, TEST_USER_ID, new SaveUserRequest(TEST_EMAIL, TEST_PASSWORD, TEST_IS_ADMIN));

    assertNotNull(result);
    assertSame(user, result);

    Mockito.verify(principal, Mockito.times(1)).getName();
    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_AUTH_EMAIL);
    Mockito.verify(userService, Mockito.times(1)).findById(TEST_USER_ID);
    Mockito.verify(user, Mockito.never()).clearRoles();
    Mockito.verify(user, Mockito.never()).addRole(Mockito.any());
    Mockito.verify(userService, Mockito.times(1)).save(adminUser);
  }

  @Test
  public void testUpdateUserGrantAdmin() throws ComiXedUserException {
    Mockito.when(principal.getName()).thenReturn(TEST_AUTH_EMAIL);
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(adminUser);
    Mockito.when(userService.findById(Mockito.anyLong())).thenReturn(user);
    Mockito.when(adminUser.isAdmin()).thenReturn(true);
    Mockito.doNothing().when(user).clearRoles();
    Mockito.doNothing().when(user).addRole(Mockito.any(Role.class));
    Mockito.when(userService.save(Mockito.any(ComiXedUser.class))).thenReturn(user);

    ComiXedUser result =
        controller.updateUser(
            principal, TEST_USER_ID, new SaveUserRequest(TEST_EMAIL, TEST_PASSWORD, TEST_IS_ADMIN));

    assertNotNull(result);
    assertSame(user, result);

    Mockito.verify(principal, Mockito.times(1)).getName();
    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_AUTH_EMAIL);
    Mockito.verify(userService, Mockito.times(1)).findById(TEST_USER_ID);
    Mockito.verify(user, Mockito.times(1)).clearRoles();
    Mockito.verify(user, Mockito.times(1)).addRole(TEST_ROLE_READER);
    Mockito.verify(user, Mockito.times(1)).addRole(TEST_ROLE_ADMIN);
    Mockito.verify(userService, Mockito.times(1)).save(user);
  }

  @Test(expected = ComiXedUserException.class)
  public void testDeleteUserInvalidId() throws ComiXedUserException {
    Mockito.doThrow(ComiXedUserException.class).when(userService).delete(Mockito.anyLong());

    try {
      controller.deleteUser(TEST_USER_ID);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).delete(TEST_USER_ID);
    }
  }

  @Test
  public void testDeleteUser() throws ComiXedUserException {
    Mockito.doNothing().when(userService).delete(Mockito.anyLong());

    controller.deleteUser(TEST_USER_ID);

    Mockito.verify(userService, Mockito.times(1)).delete(TEST_USER_ID);
  }

  @Test
  public void testSaveNewUser() throws ComiXedUserException {
    Mockito.when(
            userService.createUser(Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(user);

    final ComiXedUser result =
        controller.saveNewUser(new SaveUserRequest(TEST_EMAIL, TEST_PASSWORD, TEST_IS_ADMIN));

    assertNotNull(result);
    assertSame(user, result);

    Mockito.verify(userService, Mockito.times(1))
        .createUser(TEST_EMAIL, TEST_PASSWORD, TEST_IS_ADMIN);
  }
}

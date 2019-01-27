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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.web.controllers;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;

import java.util.List;
import java.util.Optional;

import org.comixed.library.model.ComiXedUser;
import org.comixed.library.model.Role;
import org.comixed.repositories.ComiXedUserRepository;
import org.comixed.repositories.RoleRepository;
import org.comixed.util.Utils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.Authentication;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class UserControllerTest
{
    private static final String TEST_PROPERTY_NAME = "screen_width";
    private static final String TEST_PROPERTY_VALUE = "717";
    private static final String TEST_EMAIL = "comixedreader@comixed.org";
    private static final String INVALID_EMAIL = "nosuchreader@comixed.org";
    private static final String TEST_PASSWORD = "this!is!my!password";
    private static final String TEST_PASSWORD_HASH = "0123456789ABCDEF";
    private static final Role TEST_ROLE_READER = new Role();
    private static final Role TEST_ROLE_ADMIN = new Role();
    private static final long TEST_USER_ID = 717;

    @InjectMocks
    private UserController controller;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private ComiXedUserRepository userRepository;

    @Mock
    private Optional<ComiXedUser> queryResultUser;

    @Mock
    private ComiXedUser user;

    @Captor
    private ArgumentCaptor<ComiXedUser> userCaptor;

    @Mock
    private List<ComiXedUser> userList;

    @Mock
    private Authentication authentication;

    @Mock
    private Utils utils;

    @Before
    public void setUp()
    {
        this.controller.readerRole = TEST_ROLE_READER;
        this.controller.adminRole = TEST_ROLE_ADMIN;
    }

    @Test
    public void testUpdateUserSettings()
    {
        Mockito.when(authentication.getName()).thenReturn(TEST_EMAIL);
        Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
        Mockito.doNothing().when(user).setProperty(TEST_PROPERTY_NAME, TEST_PROPERTY_VALUE);
        Mockito.when(userRepository.save(Mockito.any(ComiXedUser.class))).thenReturn(user);

        controller.setUserPreference(authentication, TEST_PROPERTY_NAME, TEST_PROPERTY_VALUE);

        Mockito.verify(authentication, Mockito.times(1)).getName();
        Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_EMAIL);
        Mockito.verify(user, Mockito.times(1)).setProperty(TEST_PROPERTY_NAME, TEST_PROPERTY_VALUE);
        Mockito.verify(userRepository, Mockito.times(1)).save(user);
    }

    @Test
    public void testUpdateUserSettingsNoSuchUser()
    {
        Mockito.when(authentication.getName()).thenReturn(TEST_EMAIL);
        Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(null);

        controller.setUserPreference(authentication, TEST_PROPERTY_NAME, TEST_PROPERTY_VALUE);

        Mockito.verify(authentication, Mockito.times(1)).getName();
        Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_EMAIL);
    }

    @Test
    public void testGetCurrentUserWhenNotAuthented()
    {
        assertNull(controller.getCurrentUser(null));
    }

    @Test
    public void testGetCurrentUserForMissingName()
    {
        Mockito.when(authentication.getName()).thenReturn(INVALID_EMAIL);
        Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(null);

        assertNull(controller.getCurrentUser(authentication));

        Mockito.verify(authentication, Mockito.atLeast(1)).getName();
        Mockito.verify(userRepository, Mockito.times(1)).findByEmail(INVALID_EMAIL);
    }

    @Test
    public void testGetCurrentUser()
    {
        Mockito.when(authentication.getName()).thenReturn(TEST_EMAIL);
        Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
        Mockito.doNothing().when(user).setAuthenticated(Mockito.anyBoolean());

        assertNotNull(controller.getCurrentUser(authentication));

        Mockito.verify(authentication, Mockito.atLeast(1)).getName();
        Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_EMAIL);
        Mockito.verify(user, Mockito.times(1)).setAuthenticated(true);
    }

    @Test
    public void testUpdatePassword()
    {
        Mockito.when(authentication.getName()).thenReturn(TEST_EMAIL);
        Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
        Mockito.when(utils.createHash(Mockito.any())).thenReturn(TEST_PASSWORD_HASH);
        Mockito.doNothing().when(user).setPasswordHash(Mockito.anyString());
        Mockito.when(userRepository.save(Mockito.any(ComiXedUser.class))).thenReturn(user);

        controller.updatePassword(authentication, TEST_PASSWORD);

        Mockito.verify(authentication, Mockito.atLeast(1)).getName();
        Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_EMAIL);
        Mockito.verify(user, Mockito.times(1)).setPasswordHash(TEST_PASSWORD_HASH);
        Mockito.verify(userRepository, Mockito.times(1)).save(user);
    }

    @Test
    public void testUpdateUsernameForInvalidUser()
    {
        Mockito.when(authentication.getName()).thenReturn(TEST_EMAIL);
        Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(null);
        Mockito.doNothing().when(authentication).setAuthenticated(Mockito.anyBoolean());

        controller.updateEmail(authentication, TEST_EMAIL);

        Mockito.verify(authentication, Mockito.atLeast(1)).getName();
        Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_EMAIL);
        Mockito.verify(authentication, Mockito.times(1)).setAuthenticated(false);
    }

    @Test
    public void testUpdateUsername()
    {
        Mockito.when(authentication.getName()).thenReturn(TEST_EMAIL);
        Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
        Mockito.doNothing().when(user).setEmail(Mockito.anyString());
        Mockito.when(userRepository.save(Mockito.any(ComiXedUser.class))).thenReturn(user);

        controller.updateEmail(authentication, TEST_EMAIL);

        Mockito.verify(authentication, Mockito.atLeast(1)).getName();
        Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_EMAIL);
        Mockito.verify(user, Mockito.times(1)).setEmail(TEST_EMAIL);
        Mockito.verify(userRepository, Mockito.times(1)).save(user);
    }

    @Test
    public void testGetAllUsers()
    {
        Mockito.when(userRepository.findAll()).thenReturn(userList);

        List<ComiXedUser> result = controller.getAllUsers();

        assertNotNull(result);
        assertSame(userList, result);

        Mockito.verify(userRepository, Mockito.times(1)).findAll();
    }

    @Test
    public void testUpdateUserDoesNotExist()
    {
        Mockito.when(userRepository.findById(Mockito.anyLong())).thenReturn(null);

        ComiXedUser result = controller.updateUser(TEST_USER_ID, TEST_EMAIL, TEST_PASSWORD, false);

        assertNull(result);

        Mockito.verify(userRepository, Mockito.times(1)).findById(TEST_USER_ID);
    }

    @Test
    public void testUpdateUserRemoveAdmin()
    {
        Mockito.when(userRepository.findById(Mockito.anyLong())).thenReturn(queryResultUser);
        Mockito.when(queryResultUser.get()).thenReturn(user);
        Mockito.doNothing().when(user).clearRoles();
        Mockito.doNothing().when(user).addRole(Mockito.any(Role.class));
        Mockito.when(userRepository.save(Mockito.any(ComiXedUser.class))).thenReturn(user);

        ComiXedUser result = controller.updateUser(TEST_USER_ID, TEST_EMAIL, TEST_PASSWORD, false);

        assertNotNull(result);
        assertSame(user, result);

        Mockito.verify(userRepository, Mockito.times(1)).findById(TEST_USER_ID);
        Mockito.verify(queryResultUser, Mockito.times(1)).get();
        Mockito.verify(user, Mockito.times(1)).clearRoles();
        Mockito.verify(user, Mockito.times(1)).addRole(TEST_ROLE_READER);
        Mockito.verify(userRepository, Mockito.times(1)).save(user);
    }

    @Test
    public void testUpdateUserGrantAdmin()
    {
        Mockito.when(userRepository.findById(Mockito.anyLong())).thenReturn(queryResultUser);
        Mockito.when(queryResultUser.get()).thenReturn(user);
        Mockito.doNothing().when(user).clearRoles();
        Mockito.doNothing().when(user).addRole(Mockito.any(Role.class));
        Mockito.when(userRepository.save(Mockito.any(ComiXedUser.class))).thenReturn(user);

        ComiXedUser result = controller.updateUser(TEST_USER_ID, TEST_EMAIL, TEST_PASSWORD, true);

        assertNotNull(result);
        assertSame(user, result);

        Mockito.verify(userRepository, Mockito.times(1)).findById(TEST_USER_ID);
        Mockito.verify(queryResultUser, Mockito.times(1)).get();
        Mockito.verify(user, Mockito.times(1)).clearRoles();
        Mockito.verify(user, Mockito.times(1)).addRole(TEST_ROLE_READER);
        Mockito.verify(user, Mockito.times(1)).addRole(TEST_ROLE_ADMIN);
        Mockito.verify(userRepository, Mockito.times(1)).save(user);
    }

    @Test
    public void testDeleteUserInvalidId()
    {
        Mockito.when(userRepository.findById(Mockito.anyLong())).thenReturn(null);

        boolean result = controller.deleteUser(TEST_USER_ID);

        assertFalse(result);

        Mockito.verify(userRepository, Mockito.times(1)).findById(TEST_USER_ID);
    }

    @Test
    public void testDeleteUser()
    {
        Mockito.when(userRepository.findById(Mockito.anyLong())).thenReturn(queryResultUser);
        Mockito.when(queryResultUser.get()).thenReturn(user);
        Mockito.doNothing().when(userRepository).delete(Mockito.any(ComiXedUser.class));

        boolean result = controller.deleteUser(TEST_USER_ID);

        assertTrue(result);

        Mockito.verify(userRepository, Mockito.times(1)).findById(TEST_USER_ID);
        Mockito.verify(queryResultUser, Mockito.times(1)).get();
        Mockito.verify(userRepository, Mockito.times(1)).delete(user);
    }
}
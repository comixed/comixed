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

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

import org.comixed.library.model.ComiXedUser;
import org.comixed.repositories.ComiXedUserRepository;
import org.comixed.util.Utils;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;
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

    @InjectMocks
    private UserController controller;

    @Mock
    private ComiXedUserRepository userRepository;

    @Mock
    private ComiXedUser user;

    @Mock
    private Authentication authentication;

    @Mock
    private Utils utils;

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
}
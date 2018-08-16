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

import org.comixed.library.model.ComiXedUser;
import org.comixed.repositories.ComiXedUserRepository;
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

    @InjectMocks
    private UserController controller;

    @Mock
    private ComiXedUserRepository userRepository;

    @Mock
    private ComiXedUser user;

    @Mock
    private Authentication authentication;

    @Test
    public void testUpdateUserSettings()
    {
        Mockito.when(authentication.getName()).thenReturn(TEST_EMAIL);
        Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
        Mockito.doNothing().when(user).setProperty(TEST_PROPERTY_NAME, TEST_PROPERTY_VALUE);
        Mockito.when(userRepository.save(Mockito.any(ComiXedUser.class))).thenReturn(user);

        controller.setUserProperty(authentication, TEST_PROPERTY_NAME, TEST_PROPERTY_VALUE);

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

        controller.setUserProperty(authentication, TEST_PROPERTY_NAME, TEST_PROPERTY_VALUE);

        Mockito.verify(authentication, Mockito.times(1)).getName();
        Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_EMAIL);
    }
}
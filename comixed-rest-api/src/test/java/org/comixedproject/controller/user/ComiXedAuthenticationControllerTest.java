/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

import org.comixedproject.authentication.AuthToken;
import org.comixedproject.authentication.JwtTokenUtil;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.users.ComiXedUserRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RunWith(MockitoJUnitRunner.class)
public class ComiXedAuthenticationControllerTest {
  private static final String TEST_EMAIL = "user@comixedproject.org";
  private static final String TEST_PASSWORD = "the!password";
  private static final String TEST_TOKEN = "The Test Token";

  @InjectMocks private ComiXedAuthenticationController authenticationController;
  @Mock private AuthenticationManager authenticationManager;
  @Mock private JwtTokenUtil jwtTokenUtil;
  @Mock private ComiXedUserRepository userRepository;
  @Mock private Authentication authentication;
  @Mock private ComiXedUser user;

  @Captor private ArgumentCaptor<UsernamePasswordAuthenticationToken> tokenArgumentCaptor;

  @Before
  public void setUp() {
    Mockito.when(user.getEmail()).thenReturn(TEST_EMAIL);
  }

  @Test
  public void testGenerateToken() {
    Mockito.when(authenticationManager.authenticate(tokenArgumentCaptor.capture()))
        .thenReturn(authentication);
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(jwtTokenUtil.generateToken(Mockito.any(ComiXedUser.class))).thenReturn(TEST_TOKEN);

    final AuthToken result = authenticationController.generateToken(TEST_EMAIL, TEST_PASSWORD);

    assertNotNull(result);
    assertEquals(TEST_EMAIL, result.getEmail());
    assertSame(TEST_TOKEN, result.getToken());

    assertSame(authentication, SecurityContextHolder.getContext().getAuthentication());

    assertNotNull(tokenArgumentCaptor.getValue());
    assertEquals(TEST_EMAIL, tokenArgumentCaptor.getValue().getName());
    assertEquals(TEST_PASSWORD, tokenArgumentCaptor.getValue().getCredentials());

    Mockito.verify(authenticationManager, Mockito.times(1))
        .authenticate(tokenArgumentCaptor.getValue());
    Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(jwtTokenUtil, Mockito.times(1)).generateToken(user);
  }
}

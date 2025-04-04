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

package org.comixedproject.http.websocket;

import static org.junit.Assert.assertThrows;

import junit.framework.TestCase;
import org.comixedproject.auth.ComiXedUserDetailsService;
import org.comixedproject.auth.JwtTokenUtil;
import org.comixedproject.model.websocket.StompPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ComiXedWebSocketChannelInterceptorTest {
  private static final String TEST_TOKEN = "This.is.the.auth.token";
  private static final String TEST_EMAIL = "user@domain.tld";

  @InjectMocks private ComiXedWebSocketChannelInterceptor interceptor;
  @Mock private ComiXedUserDetailsService userDetailsService;
  @Mock private JwtTokenUtil jwtTokenUtil;
  @Mock private StompHeaderAccessor stompHeaderAccessor;
  @Mock private UserDetails userDetails;

  @Captor ArgumentCaptor<StompPrincipal> principalArgumentCaptor;

  @BeforeEach
  void setUp() {
    Mockito.when(jwtTokenUtil.getEmailFromToken(Mockito.anyString())).thenReturn(TEST_EMAIL);
    Mockito.when(userDetailsService.loadUserByUsername(Mockito.anyString()))
        .thenReturn(userDetails);
    Mockito.doNothing().when(stompHeaderAccessor).setUser(principalArgumentCaptor.capture());
  }

  @Test
  void createPrincipal_invalidEmail() {
    Mockito.when(jwtTokenUtil.getEmailFromToken(Mockito.anyString()))
        .thenThrow(RuntimeException.class);

    interceptor.createPrincipal(stompHeaderAccessor, TEST_TOKEN);

    Mockito.verify(jwtTokenUtil, Mockito.times(1)).getEmailFromToken(TEST_TOKEN);
    Mockito.verify(userDetailsService, Mockito.never()).loadUserByUsername(Mockito.anyString());
  }

  @Test
  void createPrincipal_emailNotFound() {
    Mockito.when(userDetailsService.loadUserByUsername(Mockito.anyString()))
        .thenThrow(UsernameNotFoundException.class);

    assertThrows(
        UsernameNotFoundException.class,
        () -> interceptor.createPrincipal(stompHeaderAccessor, TEST_TOKEN));
  }

  @Test
  void createPrincipal_invalidToken() {
    Mockito.when(jwtTokenUtil.validateToken(Mockito.anyString(), Mockito.any(UserDetails.class)))
        .thenReturn(false);

    interceptor.createPrincipal(stompHeaderAccessor, TEST_TOKEN);

    Mockito.verify(jwtTokenUtil, Mockito.times(1)).validateToken(TEST_TOKEN, userDetails);
  }

  @Test
  void createPrincipal() {
    Mockito.when(jwtTokenUtil.validateToken(Mockito.anyString(), Mockito.any(UserDetails.class)))
        .thenReturn(true);

    interceptor.createPrincipal(stompHeaderAccessor, TEST_TOKEN);

    final StompPrincipal principal = principalArgumentCaptor.getValue();
    TestCase.assertNotNull(principal);
    TestCase.assertEquals(TEST_EMAIL, principal.getName());

    Mockito.verify(jwtTokenUtil, Mockito.times(1)).validateToken(TEST_TOKEN, userDetails);
    Mockito.verify(stompHeaderAccessor, Mockito.times(1)).setUser(principal);
  }
}

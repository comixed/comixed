/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

package org.comixedproject.authentication;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;
import static org.comixedproject.authentication.AuthenticationConstants.HEADER_STRING;
import static org.comixedproject.authentication.AuthenticationConstants.TOKEN_PREFIX;

import java.io.IOException;
import java.util.Base64;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.comixedproject.utils.Utils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

@RunWith(MockitoJUnitRunner.class)
public class ComiXedAuthenticationFilterTest {
  private static final String TEST_EMAIL = "reader@comixedproject.org";
  private static final String TEST_PASSWORD = "test password";
  private static final String TEST_AUTH_TOKEN =
      Base64.getEncoder().encodeToString((TEST_EMAIL + ":" + TEST_PASSWORD).getBytes());
  private static final String TEST_TOKEN_AUTH_TOKEN = TOKEN_PREFIX + " " + TEST_AUTH_TOKEN;
  private static final String TEST_BASIC_AUTH_HEADER = "basic " + TEST_AUTH_TOKEN;

  @InjectMocks private ComiXedAuthenticationFilter authenticationFilter;
  @Mock private ComiXedUserDetailsService userDetailsService;
  @Mock private JwtTokenUtil jwtTokenUtil;
  @Mock private Utils utils;
  @Mock private HttpServletRequest request;
  @Mock private HttpServletResponse response;
  @Mock private FilterChain filterChain;
  @Mock private UserDetails userDetails;
  @Mock private SecurityContext securityContext;

  @Captor
  private ArgumentCaptor<UsernamePasswordAuthenticationToken> authenticationTokenArgumentCaptor;

  @Before
  public void setUp() {
    Mockito.when(userDetailsService.loadUserByUsername(Mockito.anyString()))
        .thenReturn(userDetails);
    Mockito.when(userDetails.getPassword()).thenReturn(TEST_PASSWORD);
    Mockito.when(utils.createHash(Mockito.any(byte[].class))).thenReturn(TEST_PASSWORD);

    SecurityContextHolder.setContext(securityContext);
  }

  @Test
  public void testDoFilterInternalBasicAuth() throws ServletException, IOException {
    Mockito.when(request.getHeader(HEADER_STRING)).thenReturn(TEST_BASIC_AUTH_HEADER);

    authenticationFilter.doFilterInternal(request, response, filterChain);

    Mockito.verify(filterChain, Mockito.times(1)).doFilter(request, response);
  }

  @Test
  public void testDoFilterInternalExceptionOnEmailFromToken() throws ServletException, IOException {
    Mockito.when(request.getHeader(HEADER_STRING)).thenReturn(TEST_TOKEN_AUTH_TOKEN);
    Mockito.when(jwtTokenUtil.getEmailFromToken(Mockito.anyString()))
        .thenThrow(RuntimeException.class);

    authenticationFilter.doFilterInternal(request, response, filterChain);

    Mockito.verify(jwtTokenUtil, Mockito.times(1)).getEmailFromToken(TEST_AUTH_TOKEN);
  }

  @Test
  public void testDoFilterInternalTokenReceived() throws ServletException, IOException {
    Mockito.when(request.getHeader(HEADER_STRING)).thenReturn(TEST_TOKEN_AUTH_TOKEN);
    Mockito.when(jwtTokenUtil.getEmailFromToken(Mockito.anyString())).thenReturn(TEST_EMAIL);
    Mockito.when(jwtTokenUtil.validateToken(Mockito.anyString(), Mockito.any(UserDetails.class)))
        .thenReturn(true);
    Mockito.doNothing()
        .when(securityContext)
        .setAuthentication(authenticationTokenArgumentCaptor.capture());

    authenticationFilter.doFilterInternal(request, response, filterChain);

    assertNotNull(authenticationTokenArgumentCaptor.getValue());
    assertSame(userDetails, authenticationTokenArgumentCaptor.getValue().getPrincipal());

    Mockito.verify(jwtTokenUtil, Mockito.times(1)).getEmailFromToken(TEST_AUTH_TOKEN);
    Mockito.verify(jwtTokenUtil, Mockito.times(1)).validateToken(TEST_AUTH_TOKEN, userDetails);
    Mockito.verify(securityContext, Mockito.times(1))
        .setAuthentication(authenticationTokenArgumentCaptor.getValue());
    Mockito.verify(filterChain, Mockito.times(1)).doFilter(request, response);
  }

  @Test
  public void testDoFilterInternalInvalidTokenReceived() throws ServletException, IOException {
    Mockito.when(request.getHeader(HEADER_STRING)).thenReturn(TEST_TOKEN_AUTH_TOKEN);
    Mockito.when(jwtTokenUtil.getEmailFromToken(Mockito.anyString())).thenReturn(TEST_EMAIL);
    Mockito.when(jwtTokenUtil.validateToken(Mockito.anyString(), Mockito.any(UserDetails.class)))
        .thenReturn(false);

    authenticationFilter.doFilterInternal(request, response, filterChain);

    Mockito.verify(jwtTokenUtil, Mockito.times(1)).getEmailFromToken(TEST_AUTH_TOKEN);
    Mockito.verify(jwtTokenUtil, Mockito.times(1)).validateToken(TEST_AUTH_TOKEN, userDetails);
    Mockito.verify(filterChain, Mockito.times(1)).doFilter(request, response);
  }
}

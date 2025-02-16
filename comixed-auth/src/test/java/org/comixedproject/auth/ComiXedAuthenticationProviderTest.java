/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

package org.comixedproject.auth;

import static junit.framework.TestCase.*;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.adaptors.GenericUtilitiesAdaptor;
import org.comixedproject.model.user.ComiXedRole;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ComiXedAuthenticationProviderTest {
  private static final String TEST_EMAIL = "reader@comixedproject.org";
  private static final String TEST_PASSWORD = "A password";
  private static final String TEST_PASSWORD_HASH = "The password hash";

  @InjectMocks private ComiXedAuthenticationProvider authenticationProvider;
  @Mock private UserService userService;
  @Mock private GenericUtilitiesAdaptor genericUtilitiesAdaptor;
  @Mock private Authentication authentication;
  @Mock private ComiXedUser user;

  private List<ComiXedRole> roles = new ArrayList<>();

  @BeforeEach
  void setUp() {
    Mockito.when(authentication.getName()).thenReturn(TEST_EMAIL);
    Mockito.when(authentication.getCredentials()).thenReturn(TEST_PASSWORD);
    Mockito.when(user.getPasswordHash()).thenReturn(TEST_PASSWORD_HASH);
    Mockito.when(genericUtilitiesAdaptor.createHash(Mockito.any(byte[].class)))
        .thenReturn(TEST_PASSWORD_HASH);
    Mockito.when(user.getRoles()).thenReturn(roles);
    Mockito.when(userService.updateLastLoggedInDate(Mockito.any())).thenReturn(user);

    roles.add(new ComiXedRole("TEST"));
  }

  @Test
  void authentication_userServiceException() throws ComiXedUserException {
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    final Authentication result = authenticationProvider.authenticate(authentication);

    assertNull(result);

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
  }

  @Test
  void authenticationNoUserEmail() throws ComiXedUserException {
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(null);

    final Authentication result = authenticationProvider.authenticate(authentication);

    assertNull(result);

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
  }

  @Test
  void authentication_passwordsDontMatch() throws ComiXedUserException {
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(user.getPasswordHash()).thenReturn(TEST_PASSWORD_HASH.substring(1));

    final Authentication result = authenticationProvider.authenticate(authentication);

    assertNull(result);

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
  }

  @Test
  void authentication() throws ComiXedUserException {
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);

    final Authentication result = authenticationProvider.authenticate(authentication);

    assertNotNull(result);
    assertEquals(TEST_EMAIL, result.getPrincipal());
    assertEquals(TEST_PASSWORD, result.getCredentials());
    assertEquals(roles.size(), result.getAuthorities().size());
    assertTrue(
        result
            .getAuthorities()
            .contains(new SimpleGrantedAuthority("ROLE_" + roles.get(0).getName())));

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(userService, Mockito.times(1)).updateLastLoggedInDate(user);
  }
}

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

package org.comixedproject.auth;

import static junit.framework.TestCase.*;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.user.ComiXedRole;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.users.ComiXedUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@ExtendWith(MockitoExtension.class)
class ComiXedUserDetailsViewServiceTest {
  private static final String TEST_PASSWORD_HASH = "the password hash";
  private static final String TEST_USER_EMAIL = "reader@comixedproject.org";

  @InjectMocks private ComiXedUserDetailsService userDetailsService;
  @Mock private ComiXedUserRepository userRepository;
  @Mock private ComiXedUser user;

  private List<ComiXedRole> roles = new ArrayList<>();

  @BeforeEach
  void setUp() {
    roles.add(new ComiXedRole("ROLE"));
  }

  @Test
  void loadUserByUsername_notFound() {
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(null);

    assertThrows(
        UsernameNotFoundException.class,
        () -> userDetailsService.loadUserByUsername(TEST_USER_EMAIL));
  }

  @Test
  void loadUserByUsername() {
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(user.getPasswordHash()).thenReturn(TEST_PASSWORD_HASH);
    Mockito.when(user.getRoles()).thenReturn(roles);

    final UserDetails result = userDetailsService.loadUserByUsername(TEST_USER_EMAIL);

    assertNotNull(result);
    assertEquals(TEST_USER_EMAIL, result.getUsername());
    assertEquals(TEST_PASSWORD_HASH, result.getPassword());
    assertEquals(roles.size(), result.getAuthorities().size());

    Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
  }
}

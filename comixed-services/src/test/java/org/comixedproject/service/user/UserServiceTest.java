/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project.
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

package org.comixedproject.service.user;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertSame;

import java.util.Date;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.users.ComiXedUserRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class UserServiceTest {
  private static final String TEST_EMAIL = "user@somedomain.com";
  private static final String TEST_PROPERTY_NAME = "some.property.name";
  private static final String TEST_PROPERTY_VALUE = "The value of that property";

  @InjectMocks private UserService service;
  @Mock private ComiXedUserRepository userRepository;
  @Mock private ComiXedUser user;
  @Mock private ComiXedUser userRecord;

  @Test(expected = ComiXedUserException.class)
  public void testFindByEmailDoesNotExist() throws ComiXedUserException {
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(null);

    try {
      service.findByEmail(TEST_EMAIL);
    } finally {
      Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_EMAIL);
    }
  }

  @Test
  public void testFindByEmail() throws ComiXedUserException {
    Mockito.when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(userRecord);

    final ComiXedUser result = service.findByEmail(TEST_EMAIL);

    assertNotNull(result);
    assertSame(userRecord, result);

    Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_EMAIL);
  }

  @Test
  public void testSetUserProperty() throws ComiXedUserException {
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.doNothing().when(user).setProperty(Mockito.anyString(), Mockito.anyString());
    Mockito.when(userRepository.save(Mockito.any(ComiXedUser.class))).thenReturn(userRecord);

    final ComiXedUser result =
        service.setUserProperty(TEST_EMAIL, TEST_PROPERTY_NAME, TEST_PROPERTY_VALUE);

    assertNotNull(result);
    assertSame(userRecord, result);

    Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(user, Mockito.times(1)).setProperty(TEST_PROPERTY_NAME, TEST_PROPERTY_VALUE);
    Mockito.verify(userRepository, Mockito.times(1)).save(user);
  }

  @Test
  public void testDeleteUserProperty() throws ComiXedUserException {
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.doNothing().when(user).deleteProperty(Mockito.anyString());
    Mockito.when(userRepository.save(Mockito.any(ComiXedUser.class))).thenReturn(userRecord);

    final ComiXedUser result = service.deleteUserProperty(TEST_EMAIL, TEST_PROPERTY_NAME);

    assertNotNull(result);
    assertSame(userRecord, result);

    Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(user, Mockito.times(1)).deleteProperty(TEST_PROPERTY_NAME);
    Mockito.verify(userRepository, Mockito.times(1)).save(user);
  }

  @Test
  public void testUpdateLastLoggedInDate() {
    Mockito.when(userRepository.save(Mockito.any(ComiXedUser.class))).thenReturn(userRecord);

    final ComiXedUser result = service.updateLastLoggedInDate(user);

    assertNotNull(result);
    assertSame(userRecord, result);

    Mockito.verify(user, Mockito.times(1)).setLastLoginDate(Mockito.any(Date.class));
    Mockito.verify(userRepository, Mockito.times(1)).save(user);
  }
}

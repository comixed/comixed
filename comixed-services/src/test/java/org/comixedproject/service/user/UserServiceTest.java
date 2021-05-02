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
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.user.PublishCurrentUserAction;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.users.ComiXedUserRepository;
import org.comixedproject.utils.Utils;
import org.hibernate.exception.ConstraintViolationException;
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
  private static final long TEST_USER_ID = 73L;
  private static final String TEST_EMAIL = "user@somedomain.com";
  private static final String TEST_PASSWORD = "Th1s!15!my!p456w0rd!";
  private static final String TEST_PASSWORD_HASH = "the password hashed";
  private static final String TEST_PROPERTY_NAME = "some.property.name";
  private static final String TEST_PROPERTY_VALUE = "The value of that property";

  @InjectMocks private UserService service;
  @Mock private ComiXedUserRepository userRepository;
  @Mock private PublishCurrentUserAction publishCurrentUserAction;
  @Mock private Utils utils;
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
  public void testSetUserPropertyPublishingException()
      throws ComiXedUserException, PublishingException {
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.doNothing().when(user).setProperty(Mockito.anyString(), Mockito.anyString());
    Mockito.when(userRepository.save(Mockito.any(ComiXedUser.class))).thenReturn(userRecord);
    Mockito.doThrow(PublishingException.class)
        .when(publishCurrentUserAction)
        .publish(Mockito.any(ComiXedUser.class));

    final ComiXedUser result =
        service.setUserProperty(TEST_EMAIL, TEST_PROPERTY_NAME, TEST_PROPERTY_VALUE);

    assertNotNull(result);
    assertSame(userRecord, result);

    Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(user, Mockito.times(1)).setProperty(TEST_PROPERTY_NAME, TEST_PROPERTY_VALUE);
    Mockito.verify(userRepository, Mockito.times(1)).save(user);
    Mockito.verify(publishCurrentUserAction, Mockito.times(1)).publish(userRecord);
  }

  @Test
  public void testSetUserProperty() throws ComiXedUserException, PublishingException {
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
    Mockito.verify(publishCurrentUserAction, Mockito.times(1)).publish(userRecord);
  }

  @Test
  public void testDeleteUserPropertyPublishingException()
      throws ComiXedUserException, PublishingException {
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.doNothing().when(user).deleteProperty(Mockito.anyString());
    Mockito.when(userRepository.save(Mockito.any(ComiXedUser.class))).thenReturn(userRecord);
    Mockito.doThrow(PublishingException.class)
        .when(publishCurrentUserAction)
        .publish(Mockito.any(ComiXedUser.class));

    final ComiXedUser result = service.deleteUserProperty(TEST_EMAIL, TEST_PROPERTY_NAME);

    assertNotNull(result);
    assertSame(userRecord, result);

    Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(user, Mockito.times(1)).deleteProperty(TEST_PROPERTY_NAME);
    Mockito.verify(userRepository, Mockito.times(1)).save(user);
    Mockito.verify(publishCurrentUserAction, Mockito.times(1)).publish(userRecord);
  }

  @Test
  public void testDeleteUserProperty() throws ComiXedUserException, PublishingException {
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.doNothing().when(user).deleteProperty(Mockito.anyString());
    Mockito.when(userRepository.save(Mockito.any(ComiXedUser.class))).thenReturn(userRecord);

    final ComiXedUser result = service.deleteUserProperty(TEST_EMAIL, TEST_PROPERTY_NAME);

    assertNotNull(result);
    assertSame(userRecord, result);

    Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(user, Mockito.times(1)).deleteProperty(TEST_PROPERTY_NAME);
    Mockito.verify(userRepository, Mockito.times(1)).save(user);
    Mockito.verify(publishCurrentUserAction, Mockito.times(1)).publish(userRecord);
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

  @Test(expected = ComiXedUserException.class)
  public void testUpdateCurrentUserInvalidId() throws ComiXedUserException {
    Mockito.when(userRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.updateCurrentUser(TEST_USER_ID, TEST_EMAIL, TEST_PASSWORD);
    } finally {
      Mockito.verify(userRepository, Mockito.times(1)).getById(TEST_USER_ID);
    }
  }

  @Test(expected = ComiXedUserException.class)
  public void testUpdateCurrentUserSaveThrowsException() throws ComiXedUserException {
    Mockito.when(userRepository.getById(Mockito.anyLong())).thenReturn(user);
    Mockito.when(utils.createHash(Mockito.any(byte[].class))).thenReturn(TEST_PASSWORD_HASH);
    Mockito.when(userRepository.save(user)).thenThrow(ConstraintViolationException.class);

    try {
      service.updateCurrentUser(TEST_USER_ID, TEST_EMAIL, TEST_PASSWORD);
    } finally {
      Mockito.verify(userRepository, Mockito.times(1)).getById(TEST_USER_ID);
      Mockito.verify(userRepository, Mockito.times(1)).save(user);
    }
  }

  @Test
  public void testUpdateCurrentUserPublishingException()
      throws ComiXedUserException, PublishingException {
    Mockito.when(userRepository.getById(Mockito.anyLong())).thenReturn(user);
    Mockito.when(utils.createHash(Mockito.any(byte[].class))).thenReturn(TEST_PASSWORD_HASH);
    Mockito.when(userRepository.save(user)).thenReturn(userRecord);
    Mockito.doThrow(PublishingException.class)
        .when(publishCurrentUserAction)
        .publish(Mockito.any(ComiXedUser.class));

    final ComiXedUser result = service.updateCurrentUser(TEST_USER_ID, TEST_EMAIL, TEST_PASSWORD);

    assertNotNull(result);
    assertSame(userRecord, result);

    Mockito.verify(userRepository, Mockito.times(1)).getById(TEST_USER_ID);
    Mockito.verify(user, Mockito.times(1)).setEmail(TEST_EMAIL);
    Mockito.verify(user, Mockito.times(1)).setPasswordHash(TEST_PASSWORD_HASH);
    Mockito.verify(userRepository, Mockito.times(1)).save(user);
    Mockito.verify(publishCurrentUserAction, Mockito.times(1)).publish(userRecord);
  }

  @Test
  public void testUpdateCurrentUser() throws ComiXedUserException, PublishingException {
    Mockito.when(userRepository.getById(Mockito.anyLong())).thenReturn(user);
    Mockito.when(utils.createHash(Mockito.any(byte[].class))).thenReturn(TEST_PASSWORD_HASH);
    Mockito.when(userRepository.save(user)).thenReturn(userRecord);

    final ComiXedUser result = service.updateCurrentUser(TEST_USER_ID, TEST_EMAIL, TEST_PASSWORD);

    assertNotNull(result);
    assertSame(userRecord, result);

    Mockito.verify(userRepository, Mockito.times(1)).getById(TEST_USER_ID);
    Mockito.verify(user, Mockito.times(1)).setEmail(TEST_EMAIL);
    Mockito.verify(user, Mockito.times(1)).setPasswordHash(TEST_PASSWORD_HASH);
    Mockito.verify(userRepository, Mockito.times(1)).save(user);
    Mockito.verify(publishCurrentUserAction, Mockito.times(1)).publish(userRecord);
  }

  @Test
  public void testUpdateCurrentUserNullPassword() throws ComiXedUserException {
    Mockito.when(userRepository.getById(Mockito.anyLong())).thenReturn(user);
    Mockito.when(userRepository.save(user)).thenReturn(userRecord);

    final ComiXedUser result = service.updateCurrentUser(TEST_USER_ID, TEST_EMAIL, null);

    assertNotNull(result);
    assertSame(userRecord, result);

    Mockito.verify(userRepository, Mockito.times(1)).getById(TEST_USER_ID);
    Mockito.verify(user, Mockito.times(1)).setEmail(TEST_EMAIL);
    Mockito.verify(user, Mockito.never()).setPasswordHash(Mockito.anyString());
    Mockito.verify(userRepository, Mockito.times(1)).save(user);
  }

  @Test
  public void testUpdateCurrentUserEmptyPassword() throws ComiXedUserException {
    Mockito.when(userRepository.getById(Mockito.anyLong())).thenReturn(user);
    Mockito.when(userRepository.save(user)).thenReturn(userRecord);

    final ComiXedUser result = service.updateCurrentUser(TEST_USER_ID, TEST_EMAIL, " ");

    assertNotNull(result);
    assertSame(userRecord, result);

    Mockito.verify(userRepository, Mockito.times(1)).getById(TEST_USER_ID);
    Mockito.verify(user, Mockito.times(1)).setEmail(TEST_EMAIL);
    Mockito.verify(user, Mockito.never()).setPasswordHash(Mockito.anyString());
    Mockito.verify(userRepository, Mockito.times(1)).save(user);
  }
}

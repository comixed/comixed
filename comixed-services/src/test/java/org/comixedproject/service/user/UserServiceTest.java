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

import static junit.framework.TestCase.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertSame;

import java.util.List;
import java.util.Optional;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.model.user.Role;
import org.comixedproject.repositories.ComiXedUserRepository;
import org.comixedproject.repositories.RoleRepository;
import org.comixedproject.utils.Utils;
import org.hibernate.exception.ConstraintViolationException;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class UserServiceTest {
  private static final String TEST_EMAIL = "user@somedomain.com";
  private static final long TEST_USER_ID = 717L;
  private static final String TEST_ROLE_NAME = "ADMIN";
  private static final String TEST_PROPERTY_NAME = "some.property.name";
  private static final String TEST_PROPERTY_VALUE = "The value of that property";
  private static final String TEST_PASSWORD = "this.is.my.password!";
  private static final String TEST_PASSWORD_HASH = TEST_PASSWORD;
  private static final boolean TEST_IS_ADMIN = true;

  @InjectMocks private UserService service;
  @Mock private ComiXedUserRepository userRepository;
  @Mock private RoleRepository roleRepository;
  @Mock private ComiXedUser user;
  @Captor private ArgumentCaptor<ComiXedUser> userCaptor;
  @Mock private List<ComiXedUser> userList;
  @Mock private Role role;
  @Mock private Utils utils;

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
    Mockito.when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(user);

    final ComiXedUser result = service.findByEmail(TEST_EMAIL);

    assertNotNull(result);
    assertSame(user, result);

    Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_EMAIL);
  }

  @Test(expected = ComiXedUserException.class)
  public void testDeleteForInvalidUser() throws ComiXedUserException {
    Mockito.when(userRepository.findById(Mockito.anyLong())).thenReturn(Optional.empty());

    try {
      service.delete(TEST_USER_ID);
    } finally {
      Mockito.verify(userRepository, Mockito.times(1)).findById(TEST_USER_ID);
    }
  }

  @Test
  public void testDelete() throws ComiXedUserException {
    Mockito.when(userRepository.findById(Mockito.anyLong())).thenReturn(Optional.of(user));
    Mockito.doNothing().when(userRepository).delete(Mockito.any(ComiXedUser.class));

    service.delete(TEST_USER_ID);

    Mockito.verify(userRepository, Mockito.times(1)).findById(TEST_USER_ID);
    Mockito.verify(userRepository, Mockito.times(1)).delete(user);
  }

  @Test(expected = ComiXedUserException.class)
  public void testSaveRepositoryThrowsException() throws ComiXedUserException {
    Mockito.when(userRepository.save(Mockito.any(ComiXedUser.class)))
        .thenThrow(ConstraintViolationException.class);

    try {
      service.save(user);
    } finally {
      Mockito.verify(userRepository, Mockito.times(1)).save(user);
    }
  }

  @Test
  public void testSave() throws ComiXedUserException {
    Mockito.when(userRepository.save(Mockito.any(ComiXedUser.class))).thenReturn(user);

    final ComiXedUser result = service.save(user);

    assertNotNull(result);
    assertSame(user, result);

    Mockito.verify(userRepository, Mockito.times(1)).save(user);
  }

  @Test
  public void testFindAll() {
    Mockito.when(userRepository.findAll()).thenReturn(userList);

    final List<ComiXedUser> result = service.findAll();

    assertNotNull(result);
    assertSame(userList, result);

    Mockito.verify(userRepository, Mockito.times(1)).findAll();
  }

  @Test(expected = ComiXedUserException.class)
  public void testFindByIdWithInvalidId() throws ComiXedUserException {
    Mockito.when(userRepository.findById(Mockito.anyLong())).thenReturn(Optional.empty());

    try {
      service.findById(TEST_USER_ID);
    } finally {
      Mockito.verify(userRepository, Mockito.times(1)).findById(TEST_USER_ID);
    }
  }

  @Test
  public void testFindById() throws ComiXedUserException {
    Mockito.when(userRepository.findById(Mockito.anyLong())).thenReturn(Optional.of(user));

    final ComiXedUser result = service.findById(TEST_USER_ID);

    assertNotNull(result);
    assertSame(user, result);

    Mockito.verify(userRepository, Mockito.times(1)).findById(TEST_USER_ID);
  }

  @Test(expected = ComiXedUserException.class)
  public void testFindRoleByNameWithInvalidName() throws ComiXedUserException {
    Mockito.when(roleRepository.findByName(Mockito.anyString())).thenReturn(null);

    try {
      service.findRoleByName(TEST_ROLE_NAME);
    } finally {
      Mockito.verify(roleRepository, Mockito.times(1)).findByName(TEST_ROLE_NAME);
    }
  }

  @Test
  public void testFindRoleByName() throws ComiXedUserException {
    Mockito.when(roleRepository.findByName(Mockito.anyString())).thenReturn(role);

    final Role result = service.findRoleByName(TEST_ROLE_NAME);

    assertNotNull(result);
    assertSame(role, result);

    Mockito.verify(roleRepository, Mockito.times(1)).findByName(TEST_ROLE_NAME);
  }

  @Test
  public void testSetUserProperty() throws ComiXedUserException {
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.doNothing().when(user).setProperty(Mockito.anyString(), Mockito.anyString());
    Mockito.when(userRepository.save(Mockito.any(ComiXedUser.class))).thenReturn(user);

    final ComiXedUser result =
        service.setUserProperty(TEST_EMAIL, TEST_PROPERTY_NAME, TEST_PROPERTY_VALUE);

    assertNotNull(result);
    assertSame(user, result);

    Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(user, Mockito.times(1)).setProperty(TEST_PROPERTY_NAME, TEST_PROPERTY_VALUE);
    Mockito.verify(userRepository, Mockito.times(1)).save(user);
  }

  @Test
  public void testDeleteUserProperty() {
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.doNothing().when(user).deleteProperty(Mockito.anyString());
    Mockito.when(userRepository.save(Mockito.any(ComiXedUser.class))).thenReturn(user);

    final ComiXedUser result = service.deleteUserProperty(TEST_EMAIL, TEST_PROPERTY_NAME);

    assertNotNull(result);
    assertSame(user, result);

    Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(user, Mockito.times(1)).deleteProperty(TEST_PROPERTY_NAME);
    Mockito.verify(userRepository, Mockito.times(1)).save(user);
  }

  @Test
  public void testSetUserPassword() throws ComiXedUserException {
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(utils.createHash(Mockito.any(byte[].class))).thenReturn(TEST_PASSWORD_HASH);
    Mockito.doNothing().when(user).setPasswordHash(Mockito.anyString());
    Mockito.when(userRepository.save(Mockito.any(ComiXedUser.class))).thenReturn(user);

    final ComiXedUser result = service.setUserPassword(TEST_EMAIL, TEST_PASSWORD);

    assertNotNull(result);
    assertSame(user, result);

    Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(utils, Mockito.times(1)).createHash(TEST_PASSWORD.getBytes());
    Mockito.verify(user, Mockito.times(1)).setPasswordHash(TEST_PASSWORD_HASH);
    Mockito.verify(userRepository, Mockito.times(1)).save(user);
  }

  @Test
  public void testSetUserEmail() throws ComiXedUserException {
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.doNothing().when(user).setEmail(Mockito.anyString());
    Mockito.when(userRepository.save(Mockito.any(ComiXedUser.class))).thenReturn(user);

    final ComiXedUser result = service.setUserEmail(TEST_EMAIL, TEST_EMAIL);

    assertNotNull(result);
    assertSame(user, result);

    Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(user, Mockito.times(1)).setEmail(TEST_EMAIL);
    Mockito.verify(userRepository, Mockito.times(1)).save(user);
  }

  @Test
  public void testCreateUser() throws ComiXedUserException {
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(null);
    Mockito.when(utils.createHash(Mockito.any(byte[].class))).thenReturn(TEST_PASSWORD_HASH);
    Mockito.when(userRepository.save(userCaptor.capture())).thenReturn(user);

    final ComiXedUser result = service.createUser(TEST_EMAIL, TEST_PASSWORD, TEST_IS_ADMIN);

    assertNotNull(result);
    assertSame(user, result);
    assertEquals(TEST_EMAIL, userCaptor.getValue().getEmail());
    assertEquals(TEST_PASSWORD_HASH, userCaptor.getValue().getPasswordHash());

    Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(utils, Mockito.times(1)).createHash(TEST_PASSWORD.getBytes());
    Mockito.verify(userRepository, Mockito.times(1)).save(userCaptor.getValue());
  }
}

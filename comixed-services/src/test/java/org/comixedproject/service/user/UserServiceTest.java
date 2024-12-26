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

import static org.comixedproject.service.user.UserService.IMPORT_ROOT_DIRECTORY;
import static org.junit.Assert.*;

import java.util.*;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.adaptors.GenericUtilitiesAdaptor;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.user.PublishCurrentUserAction;
import org.comixedproject.model.net.user.ComicsReadStatistic;
import org.comixedproject.model.user.ComiXedRole;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.users.ComiXedRoleRepository;
import org.comixedproject.repositories.users.ComiXedUserRepository;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.hibernate.exception.ConstraintViolationException;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
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
  private static final String TEST_DENORMALIZED_ROOT_DIRECTORY =
      "/User/comixedreader/Documents/../Downloads/../Library/../Documents/comics";
  private static final boolean TEST_ADMIN = RandomUtils.nextBoolean();
  private static final long TEST_UNREAD_COMIC_BOOK_IDS = 750;
  private static final long TEST_TOTAL_COMIC_BOOKS = 800L;
  private static final long TEST_READ_COMIC_BOOK_IDS =
      TEST_TOTAL_COMIC_BOOKS - TEST_UNREAD_COMIC_BOOK_IDS;

  @InjectMocks private UserService service;
  @Mock private ComiXedUserRepository userRepository;
  @Mock private ComiXedRoleRepository roleRepository;
  @Mock private ComicBookService comicBookService;
  @Mock private GenericUtilitiesAdaptor genericUtilitiesAdaptor;
  @Mock private PublishCurrentUserAction publishCurrentUserAction;
  @Mock private ComiXedUser user;
  @Mock private ComiXedUser savedUser;
  @Mock private ComiXedUser existingUser;
  @Mock private ComiXedUser userRecord;
  @Mock private ComiXedRole adminRole;
  @Mock private ComiXedRole readerRole;
  @Mock private List<ComicsReadStatistic> comicsReadStatisticList;

  @Captor private ArgumentCaptor<ComiXedUser> userArgumentCaptor;

  private List<ComiXedUser> userList = new ArrayList<>();
  private List<ComiXedRole> roleList = new ArrayList<>();
  private Set<Long> readComicBookIdList = new HashSet<>();
  private List<Long> comicBookIdList = new ArrayList<>();

  @Before
  public void setUp() {
    Mockito.when(existingUser.getRoles()).thenReturn(roleList);
    for (long index = 0; index < TEST_READ_COMIC_BOOK_IDS; index++) readComicBookIdList.add(index);
    Mockito.when(existingUser.getReadComicBooks()).thenReturn(readComicBookIdList);
    Mockito.when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(existingUser);
    Mockito.when(roleRepository.findByName(ComiXedRole.ADMIN_ROLE)).thenReturn(adminRole);
    Mockito.when(roleRepository.findByName(ComiXedRole.READER_ROLE)).thenReturn(readerRole);
    Mockito.when(userRepository.findAll()).thenReturn(userList);
    Mockito.when(userRepository.save(userArgumentCaptor.capture())).thenReturn(savedUser);
    Mockito.when(userRepository.saveAndFlush(userArgumentCaptor.capture())).thenReturn(savedUser);
    for (long index = 0; index < TEST_TOTAL_COMIC_BOOKS; index++) comicBookIdList.add(index);
    Mockito.when(comicBookService.getAllIds()).thenReturn(comicBookIdList);
  }

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
  public void testSetUserProperty_publishingException()
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
  public void testSetUserProperty_importRootDirectory()
      throws ComiXedUserException, PublishingException {
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.doNothing().when(user).setProperty(Mockito.anyString(), Mockito.anyString());
    Mockito.when(userRepository.save(Mockito.any(ComiXedUser.class))).thenReturn(userRecord);

    final ComiXedUser result =
        service.setUserProperty(
            TEST_EMAIL, IMPORT_ROOT_DIRECTORY, TEST_DENORMALIZED_ROOT_DIRECTORY);

    assertNotNull(result);
    assertSame(userRecord, result);

    Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(user, Mockito.times(1))
        .setProperty(
            IMPORT_ROOT_DIRECTORY, FilenameUtils.normalize(TEST_DENORMALIZED_ROOT_DIRECTORY));
    Mockito.verify(userRepository, Mockito.times(1)).save(user);
    Mockito.verify(publishCurrentUserAction, Mockito.times(1)).publish(userRecord);
  }

  @Test
  public void testDeleteUserProperty_publishingException()
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
  public void testUpdateCurrentUser_invalidId() throws ComiXedUserException {
    Mockito.when(userRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.updateCurrentUser(TEST_USER_ID, TEST_EMAIL, TEST_PASSWORD);
    } finally {
      Mockito.verify(userRepository, Mockito.times(1)).getById(TEST_USER_ID);
    }
  }

  @Test(expected = ComiXedUserException.class)
  public void testUpdateCurrentUser_saveThrowsException() throws ComiXedUserException {
    Mockito.when(userRepository.getById(Mockito.anyLong())).thenReturn(user);
    Mockito.when(genericUtilitiesAdaptor.createHash(Mockito.any(byte[].class)))
        .thenReturn(TEST_PASSWORD_HASH);
    Mockito.when(userRepository.save(user)).thenThrow(ConstraintViolationException.class);

    try {
      service.updateCurrentUser(TEST_USER_ID, TEST_EMAIL, TEST_PASSWORD);
    } finally {
      Mockito.verify(userRepository, Mockito.times(1)).getById(TEST_USER_ID);
      Mockito.verify(userRepository, Mockito.times(1)).save(user);
    }
  }

  @Test
  public void testUpdateCurrentUser_publishingException()
      throws ComiXedUserException, PublishingException {
    Mockito.when(userRepository.getById(Mockito.anyLong())).thenReturn(user);
    Mockito.when(genericUtilitiesAdaptor.createHash(Mockito.any(byte[].class)))
        .thenReturn(TEST_PASSWORD_HASH);
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
    Mockito.when(genericUtilitiesAdaptor.createHash(Mockito.any(byte[].class)))
        .thenReturn(TEST_PASSWORD_HASH);
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
  public void testUpdateCurrentUser_nullPassword() throws ComiXedUserException {
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
  public void testUpdateCurrentUser_emptyPassword() throws ComiXedUserException {
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

  @Test
  public void testHasAdminAccounts_noUsers() {
    userList.clear();

    final boolean result = service.hasAdminAccounts();

    assertFalse(result);

    Mockito.verify(userRepository, Mockito.times(1)).findAll();
  }

  @Test
  public void testHasAdminAccounts_noAdminUsers() {
    Mockito.when(user.isAdmin()).thenReturn(false);
    userList.add(user);

    final boolean result = service.hasAdminAccounts();

    assertFalse(result);

    Mockito.verify(userRepository, Mockito.times(1)).findAll();
  }

  @Test
  public void testHasAdminAccounts() {
    Mockito.when(user.isAdmin()).thenReturn(true);
    userList.add(user);

    final boolean result = service.hasAdminAccounts();

    assertTrue(result);

    Mockito.verify(userRepository, Mockito.times(1)).findAll();
  }

  @Test(expected = ComiXedUserException.class)
  public void testCreateAdminAccount_hasExistingAdmin() throws ComiXedUserException {
    Mockito.when(user.isAdmin()).thenReturn(true);
    userList.add(user);

    try {
      service.createAdminAccount(TEST_EMAIL, TEST_PASSWORD);
    } finally {
      Mockito.verify(userRepository, Mockito.times(1)).findAll();
    }
  }

  @Test(expected = ComiXedUserException.class)
  public void testCreateAdminAccount_emailAlreadyUsed() throws ComiXedUserException {
    Mockito.when(user.isAdmin()).thenReturn(false);
    userList.add(user);
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);

    try {
      service.createAdminAccount(TEST_EMAIL, TEST_PASSWORD);
    } finally {
      Mockito.verify(userRepository, Mockito.times(1)).findAll();
      Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_EMAIL);
    }
  }

  @Test
  public void testCreateAdminAccount() throws ComiXedUserException {
    userList.clear();

    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(null);
    Mockito.when(userRepository.save(userArgumentCaptor.capture())).thenReturn(userRecord);
    Mockito.when(genericUtilitiesAdaptor.createHash(Mockito.any(byte[].class)))
        .thenReturn(TEST_PASSWORD_HASH);

    service.createAdminAccount(TEST_EMAIL, TEST_PASSWORD);

    final ComiXedUser createdUser = userArgumentCaptor.getValue();
    assertEquals(TEST_EMAIL, createdUser.getEmail());
    assertEquals(TEST_PASSWORD_HASH, createdUser.getPasswordHash());
    assertTrue(createdUser.getRoles().contains(adminRole));
    assertTrue(createdUser.getRoles().contains(readerRole));
    assertNotNull(createdUser.getLastLoginDate());

    Mockito.verify(userRepository, Mockito.times(1)).findAll();
    Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(genericUtilitiesAdaptor, Mockito.times(1)).createHash(TEST_PASSWORD.getBytes());
    Mockito.verify(userRepository, Mockito.times(1)).save(createdUser);
  }

  @Test
  public void testGetUserAccountList() {
    final List<ComiXedUser> result = service.getUserAccountList();
    assertNotNull(result);
    assertSame(userList, result);

    Mockito.verify(userRepository, Mockito.times(1)).findAll();
  }

  @Test(expected = ComiXedUserException.class)
  public void testCreateUserAccount_emailAlreadyUsed() throws ComiXedUserException {
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);

    try {
      service.createUserAccount(TEST_EMAIL, TEST_PASSWORD, TEST_ADMIN);
    } finally {
      Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_EMAIL);
    }
  }

  @Test
  public void testCreateUserAccount_isAdmin() throws ComiXedUserException {
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(null);

    final List<ComiXedUser> result = service.createUserAccount(TEST_EMAIL, TEST_PASSWORD, true);

    assertNotNull(result);
    assertSame(userList, result);

    final ComiXedUser createdUser = userArgumentCaptor.getValue();
    assertEquals(TEST_EMAIL, createdUser.getEmail());
    assertTrue(createdUser.getRoles().contains(adminRole));
    assertTrue(createdUser.getRoles().contains(readerRole));

    Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(userRepository, Mockito.times(1)).saveAndFlush(createdUser);
  }

  @Test
  public void testCreateUserAccount_isNotAdmin() throws ComiXedUserException {
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(null);

    final List<ComiXedUser> result = service.createUserAccount(TEST_EMAIL, TEST_PASSWORD, false);

    assertNotNull(result);
    assertSame(userList, result);

    final ComiXedUser createdUser = userArgumentCaptor.getValue();
    assertEquals(TEST_EMAIL, createdUser.getEmail());
    assertFalse(createdUser.getRoles().contains(adminRole));
    assertTrue(createdUser.getRoles().contains(readerRole));

    Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(userRepository, Mockito.times(1)).saveAndFlush(createdUser);
  }

  @Test(expected = ComiXedUserException.class)
  public void testUpdateUserAccount_invalidUser() throws ComiXedUserException {
    Mockito.when(userRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.updateUserAccount(TEST_USER_ID, TEST_EMAIL, TEST_PASSWORD, TEST_ADMIN);
    } finally {
      Mockito.verify(userRepository, Mockito.times(1)).getById(TEST_USER_ID);
    }
  }

  @Test(expected = ComiXedUserException.class)
  public void testUpdateUserAccount_removeAdminFromLastAdmin() throws ComiXedUserException {
    Mockito.when(existingUser.isAdmin()).thenReturn(true);
    Mockito.when(userRepository.getById(Mockito.anyLong())).thenReturn(existingUser);
    Mockito.when(savedUser.isAdmin()).thenReturn(true);

    userList.add(savedUser);

    try {
      service.updateUserAccount(TEST_USER_ID, TEST_EMAIL, TEST_PASSWORD, false);
    } finally {
      Mockito.verify(userRepository, Mockito.times(1)).getById(TEST_USER_ID);
    }
  }

  @Test
  public void testUpdateUserAccount_removeAdmin() throws ComiXedUserException {
    Mockito.when(existingUser.isAdmin()).thenReturn(true);
    Mockito.when(userRepository.getById(Mockito.anyLong())).thenReturn(existingUser);
    Mockito.when(savedUser.isAdmin()).thenReturn(true);

    userList.add(savedUser);
    userList.add(savedUser);

    final List<ComiXedUser> result =
        service.updateUserAccount(TEST_USER_ID, TEST_EMAIL.substring(1), TEST_PASSWORD, false);

    assertNotNull(result);
    assertSame(userList, result);

    final ComiXedUser updatedUser = userArgumentCaptor.getValue();
    assertNotNull(updatedUser);

    Mockito.verify(existingUser, Mockito.times(1)).setEmail(TEST_EMAIL.substring(1));
    Mockito.verify(existingUser, Mockito.times(1)).addRole(readerRole);
    Mockito.verify(existingUser, Mockito.never()).addRole(adminRole);

    Mockito.verify(userRepository, Mockito.times(1)).getById(TEST_USER_ID);
    Mockito.verify(userRepository, Mockito.times(1)).saveAndFlush(updatedUser);
  }

  @Test
  public void testUpdateUserAccount_addAdmin() throws ComiXedUserException {
    Mockito.when(userRepository.getById(Mockito.anyLong())).thenReturn(existingUser);

    final List<ComiXedUser> result =
        service.updateUserAccount(TEST_USER_ID, TEST_EMAIL.substring(1), TEST_PASSWORD, true);

    assertNotNull(result);
    assertSame(userList, result);

    final ComiXedUser updatedUser = userArgumentCaptor.getValue();
    assertNotNull(updatedUser);

    Mockito.verify(existingUser, Mockito.times(1)).setEmail(TEST_EMAIL.substring(1));
    Mockito.verify(existingUser, Mockito.times(1)).addRole(readerRole);
    Mockito.verify(existingUser, Mockito.times(1)).addRole(adminRole);

    Mockito.verify(userRepository, Mockito.times(1)).getById(TEST_USER_ID);
    Mockito.verify(userRepository, Mockito.times(1)).saveAndFlush(updatedUser);
  }

  @Test(expected = ComiXedUserException.class)
  public void testDeleteUserAccount_invalidUser() throws ComiXedUserException {
    Mockito.when(userRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.deleteUserAccount(TEST_USER_ID);
    } finally {
      Mockito.verify(userRepository, Mockito.times(1)).getById(TEST_USER_ID);
    }
  }

  @Test(expected = ComiXedUserException.class)
  public void testDeleteUserAccount_lastAdminAccount() throws ComiXedUserException {
    Mockito.when(existingUser.isAdmin()).thenReturn(true);
    Mockito.when(userRepository.getById(Mockito.anyLong())).thenReturn(existingUser);
    Mockito.when(savedUser.isAdmin()).thenReturn(true);
    userList.add(savedUser);

    try {
      service.deleteUserAccount(TEST_USER_ID);
    } finally {
      Mockito.verify(userRepository, Mockito.times(1)).getById(TEST_USER_ID);
    }
  }

  @Test
  public void testDeleteUserAccount() throws ComiXedUserException {
    Mockito.when(existingUser.isAdmin()).thenReturn(true);
    Mockito.when(userRepository.getById(Mockito.anyLong())).thenReturn(existingUser);
    Mockito.when(savedUser.isAdmin()).thenReturn(true);
    userList.add(savedUser);
    userList.add(savedUser);

    service.deleteUserAccount(TEST_USER_ID);

    Mockito.verify(userRepository, Mockito.times(1)).getById(TEST_USER_ID);
    Mockito.verify(userRepository, Mockito.times(1)).delete(existingUser);
  }

  @Test
  public void testSaveUser_publishException() throws PublishingException {
    Mockito.doThrow(PublishingException.class)
        .when(publishCurrentUserAction)
        .publish(Mockito.any(ComiXedUser.class));

    service.save(user);

    Mockito.verify(userRepository, Mockito.times(1)).save(user);
    Mockito.verify(publishCurrentUserAction, Mockito.times(1)).publish(savedUser);
  }

  @Test
  public void testSaveUser() throws PublishingException {
    service.save(user);

    Mockito.verify(userRepository, Mockito.times(1)).save(user);
    Mockito.verify(publishCurrentUserAction, Mockito.times(1)).publish(savedUser);
  }

  @Test
  public void testLoadComicsReadStatistics() {
    Mockito.when(userRepository.loadComicsReadStatistics(Mockito.anyString()))
        .thenReturn(comicsReadStatisticList);

    final List<ComicsReadStatistic> result = service.loadComicsReadStatistics(TEST_EMAIL);

    assertNotNull(result);
    assertSame(comicsReadStatisticList, result);

    Mockito.verify(userRepository, Mockito.times(1)).loadComicsReadStatistics(TEST_EMAIL);
  }

  @Test(expected = ComiXedUserException.class)
  public void testGetComicBookIdsForUser_invalidUser() throws ComiXedUserException {
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(null);
    try {
      service.getComicBookIdsForUser(TEST_EMAIL, true);
    } finally {
      Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_EMAIL);
    }
  }

  @Test
  public void testGetComicBookIdsForUser_unread() throws ComiXedUserException {
    final Collection<Long> result = service.getComicBookIdsForUser(TEST_EMAIL, true);

    assertEquals(TEST_UNREAD_COMIC_BOOK_IDS, result.size());
  }

  @Test
  public void testGetComicBookIdsForUser_read() throws ComiXedUserException {
    final Collection<Long> result = service.getComicBookIdsForUser(TEST_EMAIL, false);

    assertEquals(TEST_READ_COMIC_BOOK_IDS, result.size());
  }
}

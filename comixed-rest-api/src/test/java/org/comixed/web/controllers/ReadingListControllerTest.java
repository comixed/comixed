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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.web.controllers;

import org.comixed.library.lists.ReadingList;
import org.comixed.library.model.ComiXedUser;
import org.comixed.repositories.ComiXedUserRepository;
import org.comixed.repositories.ReadingListRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

import static org.junit.Assert.*;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ReadingListControllerTest {
  private static final String TEST_READING_LIST_NAME = "Test Reading List";
  private static final String TEST_READING_LIST_SUMMARY = "Test Reading List Description";
  private static final String TEST_USER_EMAIL = "reader@localhost.com";
  private static final long TEST_READING_LIST_ID = 78;

  @InjectMocks private ReadingListController controller;

  @Mock private ReadingListRepository readingListRepository;
  @Mock private ComiXedUserRepository userRepository;
  @Mock private ReadingList readingList;
  @Mock private Principal principal;
  @Mock private ComiXedUser user;
  @Mock private List<ReadingList> readingLists;

  @Test(expected = ReadingListNameException.class)
  public void testCreateReadingListNameAlreadyUsed()
      throws NoSuchReadingListException, ReadingListNameException {
    Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(
            readingListRepository.findReadingListForUser(
                Mockito.any(ComiXedUser.class), Mockito.anyString()))
        .thenReturn(readingList);

    try {
      controller.createReadingList(principal, TEST_READING_LIST_NAME, TEST_READING_LIST_SUMMARY);
    } finally {
      Mockito.verify(principal, Mockito.atLeast(1)).getName();
      Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
      Mockito.verify(readingListRepository, Mockito.times(1))
          .findReadingListForUser(user, TEST_READING_LIST_NAME);
    }
  }

  @Test
  public void testCreateReadingListName()
      throws NoSuchReadingListException, ReadingListNameException {
    Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(
            readingListRepository.findReadingListForUser(
                Mockito.any(ComiXedUser.class), Mockito.anyString()))
        .thenReturn(null);
    Mockito.when(readingListRepository.save(Mockito.any(ReadingList.class)))
        .thenReturn(readingList);

    ReadingList result =
        controller.createReadingList(principal, TEST_READING_LIST_NAME, TEST_READING_LIST_SUMMARY);

    assertNotNull(result);
    assertSame(user, result.getOwner());
    assertEquals(TEST_READING_LIST_NAME, result.getName());
    assertEquals(TEST_READING_LIST_SUMMARY, result.getSummary());

    Mockito.verify(principal, Mockito.atLeast(1)).getName();
    Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
    Mockito.verify(readingListRepository, Mockito.times(1))
        .findReadingListForUser(user, TEST_READING_LIST_NAME);
    Mockito.verify(readingListRepository, Mockito.times(1)).save(result);
  }

  @Test
  public void testGetReadingListsForUser() {
    Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(readingListRepository.findAllReadingListsForUser(Mockito.any(ComiXedUser.class)))
        .thenReturn(readingLists);
    Mockito.when(readingLists.size()).thenReturn(17);

    List<ReadingList> result = controller.getReadingListsForUser(principal);

    assertNotNull(result);
    assertSame(readingLists, result);

    Mockito.verify(principal, Mockito.atLeast(1)).getName();
    Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
    Mockito.verify(readingListRepository, Mockito.times(1)).findAllReadingListsForUser(user);
  }

  @Test(expected = NoSuchReadingListException.class)
  public void testUpdateNonexistantReadingList() throws NoSuchReadingListException {
    Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(readingListRepository.findById(TEST_READING_LIST_ID)).thenReturn(Optional.empty());

    try {
      controller.updateReadingList(
          principal, TEST_READING_LIST_ID, TEST_READING_LIST_NAME, TEST_READING_LIST_SUMMARY);
    } finally {
      Mockito.verify(principal, Mockito.atLeast(1)).getName();
      Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
      Mockito.verify(readingListRepository, Mockito.times(1)).findById(TEST_READING_LIST_ID);
    }
  }

  @Test
  public void testUpdateReadingList() throws NoSuchReadingListException {
    Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(readingListRepository.findById(TEST_READING_LIST_ID))
        .thenReturn(Optional.of(readingList));
    Mockito.doNothing().when(readingList).setName(Mockito.anyString());
    Mockito.doNothing().when(readingList).setSummary(Mockito.anyString());
    Mockito.when(readingListRepository.save(Mockito.any())).thenReturn(readingList);

    ReadingList result =
        controller.updateReadingList(
            principal, TEST_READING_LIST_ID, TEST_READING_LIST_NAME, TEST_READING_LIST_SUMMARY);

    assertNotNull(result);
    assertSame(readingList, result);

    Mockito.verify(principal, Mockito.atLeast(1)).getName();
    Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
    Mockito.verify(readingListRepository, Mockito.times(1)).findById(TEST_READING_LIST_ID);
    Mockito.verify(readingList, Mockito.times(1)).setName(TEST_READING_LIST_NAME);
    Mockito.verify(readingList, Mockito.times(1)).setSummary(TEST_READING_LIST_SUMMARY);
    Mockito.verify(readingListRepository, Mockito.times(1)).save(readingList);
  }
}

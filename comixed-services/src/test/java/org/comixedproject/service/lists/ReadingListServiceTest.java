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

package org.comixedproject.service.lists;

import static org.junit.Assert.*;

import java.util.*;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.library.ReadingListRepository;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ReadingListServiceTest {
  private static final String TEST_READING_LIST_NAME = "Test Reading List";
  private static final String TEST_READING_LIST_SUMMARY = "Test Reading List Description";
  private static final String TEST_USER_EMAIL = "reader@localhost.com";
  private static final long TEST_READING_LIST_ID = 78;
  private static final List<Long> TEST_READING_LIST_ENTRIES = new ArrayList<>();

  private static final Long TEST_COMIC_ID_1 = 1000L;
  private static final Long TEST_COMIC_ID_2 = 1001L;
  private static final Long TEST_COMIC_ID_3 = 1002L;
  private static final Long TEST_COMIC_ID_4 = 1003L;
  private static final Long TEST_COMIC_ID_5 = 1004L;

  static {
    TEST_READING_LIST_ENTRIES.add(TEST_COMIC_ID_1);
    TEST_READING_LIST_ENTRIES.add(TEST_COMIC_ID_2);
    TEST_READING_LIST_ENTRIES.add(TEST_COMIC_ID_3);
    TEST_READING_LIST_ENTRIES.add(TEST_COMIC_ID_4);
    TEST_READING_LIST_ENTRIES.add(TEST_COMIC_ID_5);
  }

  @InjectMocks private ReadingListService readingListService;
  @Mock private ReadingListRepository readingListRepository;
  @Mock private UserService userService;
  @Mock private ComicService comicService;
  @Mock private ReadingList readingList;
  @Mock private ReadingList savedReadingList;
  @Mock private ComiXedUser user;
  @Mock private ComiXedUser otherUser;
  @Mock private List<ReadingList> readingLists;
  @Mock private Comic comic;
  @Captor private ArgumentCaptor<ReadingList> readingListCaptor;

  private List<Comic> comicList = new ArrayList<>();
  private List<ReadingList> readingListList = new ArrayList<>();

  @Test(expected = ReadingListException.class)
  public void testGetReadingListsForUserInvalidEmail()
      throws ComiXedUserException, ReadingListException {
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      readingListService.getReadingListsForUser(TEST_USER_EMAIL);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
    }
  }

  @Test
  public void testGetReadingListsForUser() throws ComiXedUserException, ReadingListException {
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(readingListRepository.getAllReadingListsForOwner(Mockito.any(ComiXedUser.class)))
        .thenReturn(readingLists);

    List<ReadingList> result = readingListService.getReadingListsForUser(TEST_USER_EMAIL);

    assertNotNull(result);
    assertSame(readingLists, result);

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
    Mockito.verify(readingListRepository, Mockito.times(1)).getAllReadingListsForOwner(user);
  }

  @Test(expected = ReadingListException.class)
  public void testCreateReadingListInvalidEmail()
      throws ReadingListException, ComiXedUserException {
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      readingListService.createReadingList(
          TEST_USER_EMAIL, TEST_READING_LIST_NAME, TEST_READING_LIST_SUMMARY);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
    }
  }

  @Test(expected = ReadingListException.class)
  public void testCreateReadingListNameAlreadyUsed()
      throws ReadingListException, ComiXedUserException {
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(
            readingListRepository.findReadingListForUser(
                Mockito.any(ComiXedUser.class), Mockito.anyString()))
        .thenReturn(readingList);

    try {
      readingListService.createReadingList(
          TEST_USER_EMAIL, TEST_READING_LIST_NAME, TEST_READING_LIST_SUMMARY);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
      Mockito.verify(readingListRepository, Mockito.times(1))
          .findReadingListForUser(user, TEST_READING_LIST_NAME);
    }
  }

  @Test
  public void testCreateReadingList()
      throws ReadingListException, ComicException, ComiXedUserException {
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(
            readingListRepository.findReadingListForUser(
                Mockito.any(ComiXedUser.class), Mockito.anyString()))
        .thenReturn(null);
    Mockito.when(readingListRepository.save(readingListCaptor.capture())).thenReturn(readingList);

    ReadingList result =
        readingListService.createReadingList(
            TEST_USER_EMAIL, TEST_READING_LIST_NAME, TEST_READING_LIST_SUMMARY);

    assertNotNull(result);
    assertSame(readingList, result);
    assertSame(user, readingListCaptor.getValue().getOwner());
    assertEquals(TEST_READING_LIST_NAME, readingListCaptor.getValue().getName());
    assertEquals(TEST_READING_LIST_SUMMARY, readingListCaptor.getValue().getSummary());
    assertEquals(0, readingListCaptor.getValue().getComics().size());
    assertNotNull(readingListCaptor.getValue().getLastModifiedOn());

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
    Mockito.verify(readingListRepository, Mockito.times(1))
        .findReadingListForUser(user, TEST_READING_LIST_NAME);
    Mockito.verify(readingListRepository, Mockito.times(1)).save(readingListCaptor.getValue());
  }

  @Test(expected = ReadingListException.class)
  public void testUpdateReadingListInvalidEmail()
      throws ReadingListException, ComiXedUserException {
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(null);

    try {
      readingListService.updateReadingList(
          TEST_USER_EMAIL, TEST_READING_LIST_ID, TEST_READING_LIST_NAME, TEST_READING_LIST_SUMMARY);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
    }
  }

  @Test(expected = ReadingListException.class)
  public void testUpdateReadingListInvalidId() throws ReadingListException, ComiXedUserException {
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(
            readingListRepository.getReadingListForUserAndId(
                Mockito.any(ComiXedUser.class), Mockito.anyLong()))
        .thenReturn(null);

    try {
      readingListService.updateReadingList(
          TEST_USER_EMAIL, TEST_READING_LIST_ID, TEST_READING_LIST_NAME, TEST_READING_LIST_SUMMARY);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
      Mockito.verify(readingListRepository, Mockito.times(1))
          .getReadingListForUserAndId(user, TEST_READING_LIST_ID);
    }
  }

  @Test
  public void testUpdateReadingList() throws ReadingListException, ComiXedUserException {
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(
            readingListRepository.getReadingListForUserAndId(
                Mockito.any(ComiXedUser.class), Mockito.anyLong()))
        .thenReturn(readingList);
    Mockito.when(readingListRepository.save(Mockito.any())).thenReturn(savedReadingList);

    ReadingList result =
        readingListService.updateReadingList(
            TEST_USER_EMAIL,
            TEST_READING_LIST_ID,
            TEST_READING_LIST_NAME,
            TEST_READING_LIST_SUMMARY);

    assertNotNull(result);
    assertSame(savedReadingList, result);

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
    Mockito.verify(readingListRepository, Mockito.times(1))
        .getReadingListForUserAndId(user, TEST_READING_LIST_ID);
    Mockito.verify(readingList, Mockito.times(1)).setName(TEST_READING_LIST_NAME);
    Mockito.verify(readingList, Mockito.times(1)).setSummary(TEST_READING_LIST_SUMMARY);
    Mockito.verify(readingList, Mockito.times(1)).setLastModifiedOn(Mockito.any(Date.class));
    Mockito.verify(readingListRepository, Mockito.times(1)).save(readingList);
  }

  @Test(expected = ReadingListException.class)
  public void testGetReadingListForOtherUser() throws ReadingListException, ComiXedUserException {
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(
            readingListRepository.getReadingListForUserAndId(
                Mockito.any(ComiXedUser.class), Mockito.anyLong()))
        .thenReturn(readingList);
    Mockito.when(readingList.getOwner()).thenReturn(otherUser);

    try {
      readingListService.getReadingListForUser(TEST_USER_EMAIL, TEST_READING_LIST_ID);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
      Mockito.verify(readingListRepository, Mockito.times(1))
          .getReadingListForUserAndId(user, TEST_READING_LIST_ID);
    }
  }

  @Test
  public void testGetReadingListForUser() throws ReadingListException, ComiXedUserException {
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(
            readingListRepository.getReadingListForUserAndId(
                Mockito.any(ComiXedUser.class), Mockito.anyLong()))
        .thenReturn(readingList);
    Mockito.when(readingList.getOwner()).thenReturn(user);

    final ReadingList result =
        readingListService.getReadingListForUser(TEST_USER_EMAIL, TEST_READING_LIST_ID);

    assertNotNull(result);
    assertSame(readingList, result);

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
    Mockito.verify(readingListRepository, Mockito.times(1))
        .getReadingListForUserAndId(user, TEST_READING_LIST_ID);
  }

  @Test
  public void getReadingListsForComics() {
    Set<ReadingList> comicReadingList = new HashSet<>();

    for (int index = 0; index < 25; index++) {
      comicList.add(comic);
    }
    readingListList.add(readingList);

    Mockito.when(comic.getReadingLists()).thenReturn(comicReadingList);
    Mockito.when(
            readingListRepository.findByOwnerAndComic(
                Mockito.anyString(), Mockito.any(Comic.class)))
        .thenReturn(readingListList);

    readingListService.getReadingListsForComics(TEST_USER_EMAIL, comicList);

    Mockito.verify(readingListRepository, Mockito.times(comicList.size()))
        .findByOwnerAndComic(TEST_USER_EMAIL, comic);
  }

  @Test(expected = ReadingListException.class)
  public void testAddComicsToListNoSuchList() throws ReadingListException {
    List<Long> ids = new ArrayList<>();
    Mockito.when(readingListRepository.findById(Mockito.anyLong())).thenReturn(Optional.empty());

    try {
      readingListService.addComicsToList(TEST_USER_EMAIL, TEST_READING_LIST_ID, ids);
    } finally {
      Mockito.verify(readingListRepository, Mockito.times(1)).findById(TEST_READING_LIST_ID);
    }
  }

  @Test(expected = ReadingListException.class)
  public void testAddComicsToListNotOwner() throws ReadingListException {
    List<Long> ids = new ArrayList<>();
    Mockito.when(readingListRepository.findById(Mockito.anyLong()))
        .thenReturn(Optional.of(readingList));
    Mockito.when(readingList.getOwner()).thenReturn(user);
    Mockito.when(user.getEmail()).thenReturn(TEST_USER_EMAIL.substring(1));

    try {
      readingListService.addComicsToList(TEST_USER_EMAIL, TEST_READING_LIST_ID, ids);
    } finally {
      Mockito.verify(readingListRepository, Mockito.times(1)).findById(TEST_READING_LIST_ID);
    }
  }

  @Test(expected = ReadingListException.class)
  public void testAddComicsToListComicNotFound() throws ComicException, ReadingListException {
    List<Long> ids = new ArrayList<>();
    for (long index = 0L; index < 25L; index++) {
      ids.add(index);
    }
    Mockito.when(readingListRepository.findById(Mockito.anyLong()))
        .thenReturn(Optional.of(readingList));
    Mockito.when(readingList.getOwner()).thenReturn(user);
    Mockito.when(user.getEmail()).thenReturn(TEST_USER_EMAIL);
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenThrow(ComicException.class);

    try {
      readingListService.addComicsToList(TEST_USER_EMAIL, TEST_READING_LIST_ID, ids);
    } finally {
      Mockito.verify(readingListRepository, Mockito.times(1)).findById(TEST_READING_LIST_ID);
      Mockito.verify(comicService, Mockito.atLeast(1)).getComic(Mockito.anyLong());
    }
  }

  @Test
  public void testAddComicsToList() throws ComicException, ReadingListException {
    List<Long> ids = new ArrayList<>();
    for (long index = 0L; index < 25L; index++) {
      ids.add(index);
    }
    Mockito.when(readingListRepository.findById(Mockito.anyLong()))
        .thenReturn(Optional.of(readingList));
    Mockito.when(readingList.getOwner()).thenReturn(user);
    Mockito.when(user.getEmail()).thenReturn(TEST_USER_EMAIL);
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(readingListRepository.save(Mockito.any(ReadingList.class)))
        .thenReturn(readingList);

    int result = readingListService.addComicsToList(TEST_USER_EMAIL, TEST_READING_LIST_ID, ids);

    assertEquals(ids.size(), result);

    Mockito.verify(readingListRepository, Mockito.times(1)).findById(TEST_READING_LIST_ID);
    Mockito.verify(comicService, Mockito.times(ids.size())).getComic(Mockito.anyLong());
    Mockito.verify(readingListRepository, Mockito.times(1)).save(readingList);
  }

  @Test(expected = ReadingListException.class)
  public void testRemoveComicsFromListNoSuchList() throws ReadingListException {
    List<Long> ids = new ArrayList<>();
    Mockito.when(readingListRepository.findById(Mockito.anyLong())).thenReturn(Optional.empty());

    try {
      readingListService.removeComicsFromList(TEST_USER_EMAIL, TEST_READING_LIST_ID, ids);
    } finally {
      Mockito.verify(readingListRepository, Mockito.times(1)).findById(TEST_READING_LIST_ID);
    }
  }

  @Test(expected = ReadingListException.class)
  public void testRemoveComicsFromListNotOwner() throws ReadingListException {
    List<Long> ids = new ArrayList<>();
    Mockito.when(readingListRepository.findById(Mockito.anyLong()))
        .thenReturn(Optional.of(readingList));
    Mockito.when(readingList.getOwner()).thenReturn(user);
    Mockito.when(user.getEmail()).thenReturn(TEST_USER_EMAIL.substring(1));

    try {
      readingListService.removeComicsFromList(TEST_USER_EMAIL, TEST_READING_LIST_ID, ids);
    } finally {
      Mockito.verify(readingListRepository, Mockito.times(1)).findById(TEST_READING_LIST_ID);
    }
  }

  @Test(expected = ReadingListException.class)
  public void testRemoveComicsFromListComicNotFound() throws ComicException, ReadingListException {
    List<Long> ids = new ArrayList<>();
    for (long index = 0L; index < 25L; index++) {
      ids.add(index);
    }
    Mockito.when(readingListRepository.findById(Mockito.anyLong()))
        .thenReturn(Optional.of(readingList));
    Mockito.when(readingList.getOwner()).thenReturn(user);
    Mockito.when(user.getEmail()).thenReturn(TEST_USER_EMAIL);
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenThrow(ComicException.class);

    try {
      readingListService.removeComicsFromList(TEST_USER_EMAIL, TEST_READING_LIST_ID, ids);
    } finally {
      Mockito.verify(readingListRepository, Mockito.times(1)).findById(TEST_READING_LIST_ID);
      Mockito.verify(comicService, Mockito.atLeast(1)).getComic(Mockito.anyLong());
    }
  }

  @Test
  public void testRemoveComicsFromList() throws ComicException, ReadingListException {
    List<Long> ids = new ArrayList<>();
    for (long index = 0L; index < 25L; index++) {
      ids.add(index);
    }
    Mockito.when(readingListRepository.findById(Mockito.anyLong()))
        .thenReturn(Optional.of(readingList));
    Mockito.when(readingList.getOwner()).thenReturn(user);
    Mockito.when(user.getEmail()).thenReturn(TEST_USER_EMAIL);
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(readingListRepository.save(Mockito.any(ReadingList.class)))
        .thenReturn(readingList);

    int result =
        readingListService.removeComicsFromList(TEST_USER_EMAIL, TEST_READING_LIST_ID, ids);

    assertEquals(ids.size(), result);

    Mockito.verify(readingListRepository, Mockito.times(1)).findById(TEST_READING_LIST_ID);
    Mockito.verify(comicService, Mockito.times(ids.size())).getComic(Mockito.anyLong());
    Mockito.verify(readingListRepository, Mockito.times(1)).save(readingList);
  }

  @Test
  public void testSave() {
    Mockito.when(readingListRepository.save(Mockito.any(ReadingList.class)))
        .thenReturn(savedReadingList);

    final ReadingList result = readingListService.save(readingList);

    assertNotNull(result);
    assertSame(savedReadingList, result);

    Mockito.verify(readingList, Mockito.times(1)).setLastModifiedOn(Mockito.any(Date.class));
    Mockito.verify(readingListRepository, Mockito.times(1)).save(readingList);
  }
}

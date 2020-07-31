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

package org.comixedproject.service.library;

import static org.junit.Assert.*;

import java.util.*;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.library.ReadingList;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.ComiXedUserRepository;
import org.comixedproject.repositories.library.ReadingListRepository;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.comic.ComicService;
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
  private static final Long TEST_USER_ID = 17L;
  private static final Long TEST_OTHER_USER_ID = 29L;
  private static final Date TEST_LAST_UPDATED_DATE = new Date();

  static {
    TEST_READING_LIST_ENTRIES.add(TEST_COMIC_ID_1);
    TEST_READING_LIST_ENTRIES.add(TEST_COMIC_ID_2);
    TEST_READING_LIST_ENTRIES.add(TEST_COMIC_ID_3);
    TEST_READING_LIST_ENTRIES.add(TEST_COMIC_ID_4);
    TEST_READING_LIST_ENTRIES.add(TEST_COMIC_ID_5);
  }

  @InjectMocks private ReadingListService readingListService;
  @Mock private ReadingListRepository readingListRepository;
  @Mock private ComiXedUserRepository userRepository;
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

  @Test(expected = ReadingListNameException.class)
  public void testCreateReadingListNameAlreadyUsed()
      throws NoSuchReadingListException, ReadingListNameException, ComicException {
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(
            readingListRepository.findReadingListForUser(
                Mockito.any(ComiXedUser.class), Mockito.anyString()))
        .thenReturn(readingList);

    try {
      readingListService.createReadingList(
          TEST_USER_EMAIL, TEST_READING_LIST_NAME, TEST_READING_LIST_SUMMARY);
    } finally {
      Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
      Mockito.verify(readingListRepository, Mockito.times(1))
          .findReadingListForUser(user, TEST_READING_LIST_NAME);
    }
  }

  @Test
  public void testCreateReadingList()
      throws NoSuchReadingListException, ReadingListNameException, ComicException {
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
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
    assertNotNull(readingListCaptor.getValue().getLastUpdated());

    Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
    Mockito.verify(readingListRepository, Mockito.times(1))
        .findReadingListForUser(user, TEST_READING_LIST_NAME);
    Mockito.verify(readingListRepository, Mockito.times(1)).save(readingListCaptor.getValue());
  }

  @Test
  public void testGetReadingListsForUser() {
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(
            readingListRepository.getAllReadingListsForOwnerUpdatedAfter(
                Mockito.any(ComiXedUser.class), Mockito.any(Date.class)))
        .thenReturn(readingLists);

    List<ReadingList> result =
        readingListService.getReadingListsForUser(TEST_USER_EMAIL, TEST_LAST_UPDATED_DATE);

    assertNotNull(result);
    assertSame(readingLists, result);

    Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
    Mockito.verify(readingListRepository, Mockito.times(1))
        .getAllReadingListsForOwnerUpdatedAfter(user, TEST_LAST_UPDATED_DATE);
  }

  @Test(expected = NoSuchReadingListException.class)
  public void testUpdateNonexistantReadingList() throws NoSuchReadingListException, ComicException {
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(readingListRepository.findById(TEST_READING_LIST_ID)).thenReturn(Optional.empty());

    try {
      readingListService.updateReadingList(
          TEST_USER_EMAIL, TEST_READING_LIST_ID, TEST_READING_LIST_NAME, TEST_READING_LIST_SUMMARY);
    } finally {
      Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
      Mockito.verify(readingListRepository, Mockito.times(1)).findById(TEST_READING_LIST_ID);
    }
  }

  @Test
  public void testUpdateReadingList() throws NoSuchReadingListException, ComicException {
    Set<Comic> entries = new HashSet<>();

    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(readingListRepository.findById(TEST_READING_LIST_ID))
        .thenReturn(Optional.of(readingList));
    Mockito.doNothing().when(readingList).setName(Mockito.anyString());
    Mockito.doNothing().when(readingList).setSummary(Mockito.anyString());
    Mockito.when(readingListRepository.save(Mockito.any())).thenReturn(readingList);

    ReadingList result =
        readingListService.updateReadingList(
            TEST_USER_EMAIL,
            TEST_READING_LIST_ID,
            TEST_READING_LIST_NAME,
            TEST_READING_LIST_SUMMARY);

    assertNotNull(result);
    assertSame(readingList, result);

    Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
    Mockito.verify(readingListRepository, Mockito.times(1)).findById(TEST_READING_LIST_ID);
    Mockito.verify(readingList, Mockito.times(1)).setName(TEST_READING_LIST_NAME);
    Mockito.verify(readingList, Mockito.times(1)).setSummary(TEST_READING_LIST_SUMMARY);
    Mockito.verify(readingList, Mockito.times(1)).setLastUpdated(Mockito.any(Date.class));
    Mockito.verify(readingListRepository, Mockito.times(1)).save(readingList);
  }

  @Test(expected = NoSuchReadingListException.class)
  public void testGetReadingListForOtherUser() throws NoSuchReadingListException {
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(readingListRepository.findById(TEST_READING_LIST_ID))
        .thenReturn(Optional.of(readingList));
    Mockito.when(readingList.getOwner()).thenReturn(otherUser);
    Mockito.when(user.getId()).thenReturn(TEST_USER_ID);
    Mockito.when(otherUser.getId()).thenReturn(TEST_OTHER_USER_ID);

    try {
      readingListService.getReadingListForUser(TEST_USER_EMAIL, TEST_READING_LIST_ID);
    } finally {
      Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
      Mockito.verify(readingListRepository, Mockito.times(1)).findById(TEST_READING_LIST_ID);
      Mockito.verify(readingList, Mockito.times(1)).getOwner();
      Mockito.verify(otherUser, Mockito.atLeast(1)).getId();
      Mockito.verify(user, Mockito.atLeast(1)).getId();
    }
  }

  @Test
  public void testGetReadingListForUser() throws NoSuchReadingListException {
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(readingListRepository.findById(TEST_READING_LIST_ID))
        .thenReturn(Optional.of(readingList));
    Mockito.when(readingList.getOwner()).thenReturn(user);
    Mockito.when(user.getId()).thenReturn(TEST_USER_ID);

    final ReadingList result =
        readingListService.getReadingListForUser(TEST_USER_EMAIL, TEST_READING_LIST_ID);

    assertNotNull(result);
    assertSame(readingList, result);

    Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_USER_EMAIL);
    Mockito.verify(readingListRepository, Mockito.times(1)).findById(TEST_READING_LIST_ID);
    Mockito.verify(readingList, Mockito.times(1)).getOwner();
    Mockito.verify(user, Mockito.atLeast(2)).getId();
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
  public void testAddComicsToListNoSuchList() throws ComicException, ReadingListException {
    List<Long> ids = new ArrayList<>();
    Mockito.when(readingListRepository.findById(Mockito.anyLong())).thenReturn(Optional.empty());

    try {
      readingListService.addComicsToList(TEST_USER_EMAIL, TEST_READING_LIST_ID, ids);
    } finally {
      Mockito.verify(readingListRepository, Mockito.times(1)).findById(TEST_READING_LIST_ID);
    }
  }

  @Test(expected = ReadingListException.class)
  public void testAddComicsToListNotOwner() throws ComicException, ReadingListException {
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
  public void testRemoveComicsFromListNoSuchList() throws ComicException, ReadingListException {
    List<Long> ids = new ArrayList<>();
    Mockito.when(readingListRepository.findById(Mockito.anyLong())).thenReturn(Optional.empty());

    try {
      readingListService.removeComicsFromList(TEST_USER_EMAIL, TEST_READING_LIST_ID, ids);
    } finally {
      Mockito.verify(readingListRepository, Mockito.times(1)).findById(TEST_READING_LIST_ID);
    }
  }

  @Test(expected = ReadingListException.class)
  public void testRemoveComicsFromListNotOwner() throws ComicException, ReadingListException {
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

    Mockito.verify(readingList, Mockito.times(1)).setLastUpdated(Mockito.any(Date.class));
    Mockito.verify(readingListRepository, Mockito.times(1)).save(readingList);
  }
}

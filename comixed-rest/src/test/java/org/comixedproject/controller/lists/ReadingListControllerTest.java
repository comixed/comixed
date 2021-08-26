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

package org.comixedproject.controller.lists;

import static junit.framework.TestCase.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertSame;

import java.security.Principal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.model.net.AddComicsToReadingListRequest;
import org.comixedproject.model.net.AddComicsToReadingListResponse;
import org.comixedproject.model.net.RemoveComicsFromReadingListRequest;
import org.comixedproject.model.net.library.RemoveComicsFromReadingListResponse;
import org.comixedproject.model.net.lists.SaveReadingListRequest;
import org.comixedproject.model.net.lists.UpdateReadingListRequest;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.lists.ReadingListException;
import org.comixedproject.service.lists.ReadingListService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ReadingListControllerTest {
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
  private static final int TEST_COMIC_COUNT = 17;

  static {
    TEST_READING_LIST_ENTRIES.add(TEST_COMIC_ID_1);
    TEST_READING_LIST_ENTRIES.add(TEST_COMIC_ID_2);
    TEST_READING_LIST_ENTRIES.add(TEST_COMIC_ID_3);
    TEST_READING_LIST_ENTRIES.add(TEST_COMIC_ID_4);
    TEST_READING_LIST_ENTRIES.add(TEST_COMIC_ID_5);
  }

  @InjectMocks private ReadingListController controller;
  @Mock private ReadingListService readingListService;

  @Mock private ReadingList readingList;
  @Mock private Principal principal;
  @Mock private List<ReadingList> readingLists;
  @Mock private List<Long> comicIdList;

  @Test
  public void testGetReadingListsForUser() throws ReadingListException {
    Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
    Mockito.when(readingListService.getReadingListsForUser(Mockito.anyString()))
        .thenReturn(readingLists);

    List<ReadingList> result = controller.getReadingListsForUser(principal);

    assertNotNull(result);
    assertSame(readingLists, result);

    Mockito.verify(readingListService, Mockito.times(1)).getReadingListsForUser(TEST_USER_EMAIL);
    Mockito.verify(principal, Mockito.atLeast(1)).getName();
  }

  @Test
  public void testCreateReadingList() throws ReadingListException {
    Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
    Mockito.when(
            readingListService.createReadingList(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(readingList);

    ReadingList result =
        controller.createReadingList(
            principal,
            new SaveReadingListRequest(TEST_READING_LIST_NAME, TEST_READING_LIST_SUMMARY));

    assertNotNull(result);
    assertSame(result, readingList);

    Mockito.verify(principal, Mockito.times(1)).getName();
    Mockito.verify(readingListService, Mockito.times(1))
        .createReadingList(TEST_USER_EMAIL, TEST_READING_LIST_NAME, TEST_READING_LIST_SUMMARY);
  }

  @Test
  public void testUpdateReadingList() throws ReadingListException, ComicException {
    Set<Comic> entries = new HashSet<>();

    Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
    Mockito.when(
            readingListService.updateReadingList(
                Mockito.anyString(), Mockito.anyLong(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(readingList);

    ReadingList result =
        controller.updateReadingList(
            principal,
            TEST_READING_LIST_ID,
            new UpdateReadingListRequest(TEST_READING_LIST_NAME, TEST_READING_LIST_SUMMARY));

    assertNotNull(result);
    assertSame(readingList, result);

    Mockito.verify(principal, Mockito.atLeast(1)).getName();
    Mockito.verify(readingListService, Mockito.times(1))
        .updateReadingList(
            TEST_USER_EMAIL,
            TEST_READING_LIST_ID,
            TEST_READING_LIST_NAME,
            TEST_READING_LIST_SUMMARY);
  }

  @Test(expected = ReadingListException.class)
  public void testGetReadingListForOtherUser() throws ReadingListException {
    Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
    Mockito.when(readingListService.getReadingListForUser(Mockito.anyString(), Mockito.anyLong()))
        .thenThrow(ReadingListException.class);

    try {
      controller.getReadingList(principal, TEST_READING_LIST_ID);
    } finally {
      Mockito.verify(principal, Mockito.times(1)).getName();
      Mockito.verify(readingListService, Mockito.times(1))
          .getReadingListForUser(TEST_USER_EMAIL, TEST_READING_LIST_ID);
    }
  }

  @Test
  public void testGetReadingListForUser() throws ReadingListException {
    Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
    Mockito.when(readingListService.getReadingListForUser(Mockito.anyString(), Mockito.anyLong()))
        .thenReturn(readingList);

    final ReadingList result = controller.getReadingList(principal, TEST_READING_LIST_ID);

    assertNotNull(result);
    assertSame(readingList, result);

    Mockito.verify(principal, Mockito.times(1)).getName();
    Mockito.verify(readingListService, Mockito.times(1))
        .getReadingListForUser(TEST_USER_EMAIL, TEST_READING_LIST_ID);
  }

  @Test
  public void testAddComicsToList() throws ReadingListException {
    Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
    Mockito.when(
            readingListService.addComicsToList(
                Mockito.anyString(), Mockito.anyLong(), Mockito.anyList()))
        .thenReturn(TEST_COMIC_COUNT);

    AddComicsToReadingListResponse result =
        controller.addComicsToList(
            principal, TEST_READING_LIST_ID, new AddComicsToReadingListRequest(comicIdList));

    assertNotNull(result);
    assertEquals(TEST_COMIC_COUNT, result.getAddCount().intValue());

    Mockito.verify(readingListService, Mockito.times(1))
        .addComicsToList(TEST_USER_EMAIL, TEST_READING_LIST_ID, comicIdList);
  }

  @Test
  public void testRemoveComicsFromList() throws ReadingListException {
    Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
    Mockito.when(
            readingListService.removeComicsFromList(
                Mockito.anyString(), Mockito.anyLong(), Mockito.anyList()))
        .thenReturn(TEST_COMIC_COUNT);

    RemoveComicsFromReadingListResponse result =
        controller.removeComicsFromList(
            principal, TEST_READING_LIST_ID, new RemoveComicsFromReadingListRequest(comicIdList));

    assertNotNull(result);
    assertEquals(TEST_COMIC_COUNT, result.getRemoveCount());

    Mockito.verify(readingListService, Mockito.times(1))
        .removeComicsFromList(TEST_USER_EMAIL, TEST_READING_LIST_ID, comicIdList);
  }
}

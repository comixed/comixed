/*
 * ComiXed - A digital comicBook book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

package org.comixedproject.opds.rest;

import static junit.framework.TestCase.*;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.opds.OPDSException;
import org.comixedproject.opds.OPDSUtils;
import org.comixedproject.opds.model.OPDSAcquisitionFeed;
import org.comixedproject.opds.model.OPDSAcquisitionFeedEntry;
import org.comixedproject.opds.model.OPDSNavigationFeed;
import org.comixedproject.service.lists.ReadingListException;
import org.comixedproject.service.lists.ReadingListService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class OPDSListsControllerTest {
  private static final String TEST_EMAIL = "reader@comixedproject.org";
  private static final long TEST_READING_LIST_ID = 108L;
  private static final String TEST_READING_LIST_SUMMARY = "The list summary";
  private static final long TEST_COMIC_ID = 279L;

  @InjectMocks private OPDSListsController controller;
  @Mock private ReadingListService readingListService;
  @Mock private OPDSUtils opdsUtils;
  @Mock private Principal principal;
  @Mock private ReadingList readingList;
  @Mock private ComicBook comicBook;
  @Mock private OPDSAcquisitionFeedEntry comicEntry;

  private List<ReadingList> readingLists = new ArrayList<>();
  private List<ComicBook> comicBookList = new ArrayList<>();

  @Before
  public void setUp() {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
    readingLists.add(readingList);
    Mockito.when(readingList.getId()).thenReturn(TEST_READING_LIST_ID);
    Mockito.when(readingList.getSummary()).thenReturn(TEST_READING_LIST_SUMMARY);
    Mockito.when(readingList.getComicBooks()).thenReturn(comicBookList);
    comicBookList.add(comicBook);
    Mockito.when(comicBook.getId()).thenReturn(TEST_COMIC_ID);
  }

  @Test(expected = OPDSException.class)
  public void testLoadReadingListsServiceException() throws ReadingListException, OPDSException {
    Mockito.when(readingListService.loadReadingListsForUser(Mockito.anyString()))
        .thenThrow(ReadingListException.class);

    try {
      controller.loadReadingLists(principal);
    } finally {
      Mockito.verify(readingListService, Mockito.times(1)).loadReadingListsForUser(TEST_EMAIL);
    }
  }

  @Test
  public void testLoadReadingLists() throws ReadingListException, OPDSException {
    Mockito.when(readingListService.loadReadingListsForUser(Mockito.anyString()))
        .thenReturn(readingLists);

    final OPDSNavigationFeed result = controller.loadReadingLists(principal);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(
        String.format("/opds/lists/%d/", TEST_READING_LIST_ID),
        result.getEntries().get(0).getLinks().get(0).getReference());

    Mockito.verify(readingListService, Mockito.times(1)).loadReadingListsForUser(TEST_EMAIL);
  }

  @Test(expected = OPDSException.class)
  public void testLoadReadingListEntriesServiceException()
      throws ReadingListException, OPDSException {
    Mockito.when(readingListService.loadReadingListForUser(Mockito.anyString(), Mockito.anyLong()))
        .thenThrow(ReadingListException.class);

    try {
      controller.loadReadingListEntries(principal, TEST_READING_LIST_ID);
    } finally {
      Mockito.verify(readingListService, Mockito.times(1))
          .loadReadingListForUser(TEST_EMAIL, TEST_READING_LIST_ID);
    }
  }

  @Test
  public void testLoadReadingListEntries() throws ReadingListException, OPDSException {
    Mockito.when(readingListService.loadReadingListForUser(Mockito.anyString(), Mockito.anyLong()))
        .thenReturn(readingList);
    Mockito.when(opdsUtils.createComicEntry(Mockito.any(ComicBook.class))).thenReturn(comicEntry);

    final OPDSAcquisitionFeed result =
        controller.loadReadingListEntries(principal, TEST_READING_LIST_ID);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertTrue(result.getEntries().contains(comicEntry));

    Mockito.verify(readingListService, Mockito.times(1))
        .loadReadingListForUser(TEST_EMAIL, TEST_READING_LIST_ID);
    Mockito.verify(opdsUtils, Mockito.times(1)).createComicEntry(comicBook);
  }
}

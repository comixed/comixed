/*
 * ComiXed - A digital comic book library management application.
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

package org.comixedproject.rest.library;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;
import static org.comixedproject.rest.comicbooks.ComicBookSelectionController.LIBRARY_SELECTIONS;
import static org.comixedproject.rest.library.LastReadController.MAXIMUM;

import java.security.Principal;
import java.util.List;
import javax.servlet.http.HttpSession;
import org.comixedproject.model.library.LastRead;
import org.comixedproject.model.net.library.GetLastReadDatesResponse;
import org.comixedproject.service.comicbooks.ComicBookSelectionService;
import org.comixedproject.service.comicbooks.ComicSelectionException;
import org.comixedproject.service.library.LastReadException;
import org.comixedproject.service.library.LastReadService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class LastReadControllerTest {
  private static final String TEST_EMAIL = "reader@domain.org";
  private static final long TEST_LAST_ID = 17L;
  private static final long TEST_COMIC_BOOK_ID = 65L;
  private static final Object TEST_ENCODED_SELECTION_IDS = "The encoded selected ids";
  private static final String TEST_REENCODED_SELECTION_IDS = "The re-encoded selected ids";

  @InjectMocks private LastReadController controller;
  @Mock private LastReadService lastReadService;
  @Mock private ComicBookSelectionService comicBookSelectionService;
  @Mock private HttpSession session;
  @Mock private Principal principal;
  @Mock private List<LastRead> lastReadEntries;
  @Mock private List<LastRead> reducedLastReadEntries;
  @Mock private List<Long> selectedIds;

  @Before
  public void setUp() throws ComicSelectionException {
    Mockito.when(session.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTION_IDS);
    Mockito.when(comicBookSelectionService.decodeSelections(TEST_ENCODED_SELECTION_IDS))
        .thenReturn(selectedIds);
    Mockito.when(comicBookSelectionService.encodeSelections(selectedIds))
        .thenReturn(TEST_REENCODED_SELECTION_IDS);
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
  }

  @Test(expected = LastReadException.class)
  public void testGetLastReadEntriesForUserServiceException() throws LastReadException {
    Mockito.when(
            lastReadService.getLastReadEntries(
                Mockito.anyString(), Mockito.anyLong(), Mockito.anyInt()))
        .thenThrow(LastReadException.class);

    try {
      controller.getLastReadEntries(principal, TEST_LAST_ID);
    } finally {
      Mockito.verify(lastReadService, Mockito.times(1))
          .getLastReadEntries(TEST_EMAIL, TEST_LAST_ID, MAXIMUM + 1);
    }
  }

  @Test
  public void testGetLastReadEntriesTooManyEntries() throws LastReadException {
    Mockito.when(
            lastReadService.getLastReadEntries(
                Mockito.anyString(), Mockito.anyLong(), Mockito.anyInt()))
        .thenReturn(lastReadEntries);
    Mockito.when(lastReadEntries.size()).thenReturn(MAXIMUM + 1);
    Mockito.when(lastReadEntries.subList(Mockito.anyInt(), Mockito.anyInt()))
        .thenReturn(reducedLastReadEntries);

    final GetLastReadDatesResponse response =
        controller.getLastReadEntries(principal, TEST_LAST_ID);

    assertNotNull(response);
    assertSame(reducedLastReadEntries, response.getEntries());

    Mockito.verify(lastReadService, Mockito.times(1))
        .getLastReadEntries(TEST_EMAIL, TEST_LAST_ID, MAXIMUM + 1);
    Mockito.verify(lastReadEntries, Mockito.times(1)).subList(0, MAXIMUM);
  }

  @Test
  public void testGetLastReadEntries() throws LastReadException {
    Mockito.when(
            lastReadService.getLastReadEntries(
                Mockito.anyString(), Mockito.anyLong(), Mockito.anyInt()))
        .thenReturn(lastReadEntries);
    Mockito.when(lastReadEntries.size()).thenReturn(MAXIMUM);

    final GetLastReadDatesResponse response =
        controller.getLastReadEntries(principal, TEST_LAST_ID);

    assertNotNull(response);
    assertSame(lastReadEntries, response.getEntries());

    Mockito.verify(lastReadService, Mockito.times(1))
        .getLastReadEntries(TEST_EMAIL, TEST_LAST_ID, MAXIMUM + 1);
  }

  @Test(expected = LastReadException.class)
  public void testMarkSingleComicBookReadLastReadException() throws LastReadException {
    Mockito.doThrow(LastReadException.class)
        .when(lastReadService)
        .markComicBookAsRead(Mockito.anyString(), Mockito.anyLong());

    try {
      controller.markSingleComicBookRead(principal, TEST_COMIC_BOOK_ID);
    } finally {
      Mockito.verify(lastReadService, Mockito.times(1))
          .markComicBookAsRead(TEST_EMAIL, TEST_COMIC_BOOK_ID);
    }
  }

  @Test
  public void testMarkSingleComicBookRead() throws LastReadException {
    controller.markSingleComicBookRead(principal, TEST_COMIC_BOOK_ID);

    Mockito.verify(lastReadService, Mockito.times(1))
        .markComicBookAsRead(TEST_EMAIL, TEST_COMIC_BOOK_ID);
  }

  @Test(expected = LastReadException.class)
  public void testMarkSingleComicBookUnreadLastReadException() throws LastReadException {
    Mockito.doThrow(LastReadException.class)
        .when(lastReadService)
        .markComicBookAsUnread(Mockito.anyString(), Mockito.anyLong());

    try {
      controller.markSingleComicBookUnread(principal, TEST_COMIC_BOOK_ID);
    } finally {
      Mockito.verify(lastReadService, Mockito.times(1))
          .markComicBookAsUnread(TEST_EMAIL, TEST_COMIC_BOOK_ID);
    }
  }

  @Test
  public void testMarkSingleComicBookUnread() throws LastReadException {
    controller.markSingleComicBookUnread(principal, TEST_COMIC_BOOK_ID);

    Mockito.verify(lastReadService, Mockito.times(1))
        .markComicBookAsUnread(TEST_EMAIL, TEST_COMIC_BOOK_ID);
  }

  @Test(expected = LastReadException.class)
  public void testMarkSelectedComicBooksReadServiceException() throws LastReadException {
    Mockito.doThrow(LastReadException.class)
        .when(lastReadService)
        .markComicBooksAsRead(Mockito.anyString(), Mockito.anyList());

    controller.markSelectedComicBooksRead(session, principal);

    Mockito.verify(lastReadService, Mockito.times(1)).markComicBooksAsRead(TEST_EMAIL, selectedIds);
  }

  @Test(expected = LastReadException.class)
  public void testMarkSelectedComicBooksReadDecodingException()
      throws LastReadException, ComicSelectionException {
    Mockito.when(comicBookSelectionService.decodeSelections(TEST_ENCODED_SELECTION_IDS))
        .thenThrow(ComicSelectionException.class);

    try {
      controller.markSelectedComicBooksRead(session, principal);
    } finally {
      Mockito.verify(lastReadService, Mockito.never())
          .markComicBooksAsRead(Mockito.anyString(), Mockito.anyList());
    }
  }

  @Test(expected = LastReadException.class)
  public void testMarkSelectedComicBooksReadEncodingException()
      throws LastReadException, ComicSelectionException {
    Mockito.when(comicBookSelectionService.encodeSelections(selectedIds))
        .thenThrow(ComicSelectionException.class);

    try {
      controller.markSelectedComicBooksRead(session, principal);
    } finally {
      Mockito.verify(lastReadService, Mockito.times(1))
          .markComicBooksAsRead(TEST_EMAIL, selectedIds);
    }
  }

  @Test
  public void testMarkSelectedComicBooksRead() throws LastReadException {
    controller.markSelectedComicBooksRead(session, principal);

    Mockito.verify(lastReadService, Mockito.times(1)).markComicBooksAsRead(TEST_EMAIL, selectedIds);
  }

  @Test(expected = LastReadException.class)
  public void testMarkSelectedComicBooksUnreadDecodingException()
      throws LastReadException, ComicSelectionException {
    Mockito.when(comicBookSelectionService.decodeSelections(TEST_ENCODED_SELECTION_IDS))
        .thenThrow(ComicSelectionException.class);

    try {
      controller.markSelectedComicBooksUnread(session, principal);
    } finally {
      Mockito.verify(lastReadService, Mockito.never())
          .markComicBooksAsRead(Mockito.anyString(), Mockito.anyList());
    }
  }

  @Test(expected = LastReadException.class)
  public void testMarkSelectedComicBooksUnreadEncodingException()
      throws LastReadException, ComicSelectionException {
    Mockito.when(comicBookSelectionService.encodeSelections(selectedIds))
        .thenThrow(ComicSelectionException.class);

    try {
      controller.markSelectedComicBooksUnread(session, principal);
    } finally {
      Mockito.verify(lastReadService, Mockito.times(1))
          .markComicBooksAsUnread(TEST_EMAIL, selectedIds);
    }
  }

  @Test
  public void testMarkSelectedComicBooksUnread() throws LastReadException {
    controller.markSelectedComicBooksUnread(session, principal);

    Mockito.verify(lastReadService, Mockito.times(1))
        .markComicBooksAsUnread(TEST_EMAIL, selectedIds);
  }
}

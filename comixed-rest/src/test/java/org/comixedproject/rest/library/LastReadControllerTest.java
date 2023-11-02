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

import static junit.framework.TestCase.*;
import static org.comixedproject.rest.comicbooks.ComicBookSelectionController.LIBRARY_SELECTIONS;

import java.security.Principal;
import java.util.List;
import javax.servlet.http.HttpSession;
import org.comixedproject.model.net.comicbooks.LoadUnreadComicBookCountResponse;
import org.comixedproject.service.comicbooks.ComicBookSelectionException;
import org.comixedproject.service.comicbooks.ComicBookSelectionService;
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
  private static final long TEST_COMIC_BOOK_ID = 65L;
  private static final Object TEST_ENCODED_SELECTION_IDS = "The encoded selected ids";
  private static final String TEST_REENCODED_SELECTION_IDS = "The re-encoded selected ids";
  private static final long TEST_READ_COUNT = 717L;
  private static final long TEST_UNREAD_COUNT = 129L;

  @InjectMocks private LastReadController controller;
  @Mock private LastReadService lastReadService;
  @Mock private ComicBookSelectionService comicBookSelectionService;
  @Mock private HttpSession session;
  @Mock private Principal principal;
  @Mock private List<Long> selectedIds;

  @Before
  public void setUp() throws ComicBookSelectionException {
    Mockito.when(session.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTION_IDS);
    Mockito.when(comicBookSelectionService.decodeSelections(TEST_ENCODED_SELECTION_IDS))
        .thenReturn(selectedIds);
    Mockito.when(comicBookSelectionService.encodeSelections(selectedIds))
        .thenReturn(TEST_REENCODED_SELECTION_IDS);
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
  }

  @Test(expected = LastReadException.class)
  public void testGetUnreadCountLastReadExceptionForRead() throws LastReadException {
    Mockito.when(lastReadService.getReadCountForUser(Mockito.anyString()))
        .thenThrow(LastReadException.class);

    try {
      controller.getUnreadComicBookCount(principal);
    } finally {
      Mockito.verify(lastReadService, Mockito.times(1)).getReadCountForUser(TEST_EMAIL);
    }
  }

  @Test(expected = LastReadException.class)
  public void testGetUnreadCountLastReadExceptionForUnread() throws LastReadException {
    Mockito.when(lastReadService.getUnreadCountForUser(Mockito.anyString()))
        .thenThrow(LastReadException.class);

    try {
      controller.getUnreadComicBookCount(principal);
    } finally {
      Mockito.verify(lastReadService, Mockito.times(1)).getUnreadCountForUser(TEST_EMAIL);
    }
  }

  @Test
  public void testGetUnreadCount() throws LastReadException {
    Mockito.when(lastReadService.getReadCountForUser(Mockito.anyString()))
        .thenReturn(TEST_READ_COUNT);
    Mockito.when(lastReadService.getUnreadCountForUser(Mockito.anyString()))
        .thenReturn(TEST_UNREAD_COUNT);

    final LoadUnreadComicBookCountResponse response = controller.getUnreadComicBookCount(principal);

    assertEquals(TEST_READ_COUNT, response.getReadCount());
    assertEquals(TEST_UNREAD_COUNT, response.getUnreadCount());

    Mockito.verify(lastReadService, Mockito.times(1)).getUnreadCountForUser(TEST_EMAIL);
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
      throws LastReadException, ComicBookSelectionException {
    Mockito.when(comicBookSelectionService.decodeSelections(TEST_ENCODED_SELECTION_IDS))
        .thenThrow(ComicBookSelectionException.class);

    try {
      controller.markSelectedComicBooksRead(session, principal);
    } finally {
      Mockito.verify(lastReadService, Mockito.never())
          .markComicBooksAsRead(Mockito.anyString(), Mockito.anyList());
    }
  }

  @Test(expected = LastReadException.class)
  public void testMarkSelectedComicBooksReadEncodingException()
      throws LastReadException, ComicBookSelectionException {
    Mockito.when(comicBookSelectionService.encodeSelections(selectedIds))
        .thenThrow(ComicBookSelectionException.class);

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
      throws LastReadException, ComicBookSelectionException {
    Mockito.when(comicBookSelectionService.decodeSelections(TEST_ENCODED_SELECTION_IDS))
        .thenThrow(ComicBookSelectionException.class);

    try {
      controller.markSelectedComicBooksUnread(session, principal);
    } finally {
      Mockito.verify(lastReadService, Mockito.never())
          .markComicBooksAsRead(Mockito.anyString(), Mockito.anyList());
    }
  }

  @Test(expected = LastReadException.class)
  public void testMarkSelectedComicBooksUnreadEncodingException()
      throws LastReadException, ComicBookSelectionException {
    Mockito.when(comicBookSelectionService.encodeSelections(selectedIds))
        .thenThrow(ComicBookSelectionException.class);

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

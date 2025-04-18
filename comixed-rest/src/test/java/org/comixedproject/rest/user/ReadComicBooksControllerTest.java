/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

package org.comixedproject.rest.user;

import static org.comixedproject.rest.comicbooks.ComicBookSelectionController.LIBRARY_SELECTIONS;

import jakarta.servlet.http.HttpSession;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import org.comixedproject.service.comicbooks.ComicBookSelectionException;
import org.comixedproject.service.comicbooks.ComicSelectionService;
import org.comixedproject.service.user.ReadComicBooksException;
import org.comixedproject.service.user.ReadComicBooksService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ReadComicBooksControllerTest {
  private static final String TEST_EMAIL = "reader@comixedproject.org";
  private static final String TEST_ENCODED_IDS = "The encoded selected ids";
  private static final String TEST_REENCODED_IDS = "The re-encoded selected ids";
  private static final long TESTS_COMIC_ID = 129L;

  @InjectMocks private ReadComicBooksController controller;
  @Mock private ReadComicBooksService readComicBooksService;
  @Mock private ComicSelectionService comicSelectionService;
  @Mock private HttpSession httpSession;
  @Mock private Principal principal;

  private List selectedIds = new ArrayList();

  @Before
  public void setUp() throws ComicBookSelectionException {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
    Mockito.when(httpSession.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_IDS);
    Mockito.when(comicSelectionService.decodeSelections(TEST_ENCODED_IDS)).thenReturn(selectedIds);
    Mockito.when(comicSelectionService.encodeSelections(Mockito.anyList()))
        .thenReturn(TEST_REENCODED_IDS);
  }

  @Test(expected = ReadComicBooksException.class)
  public void testMarkComicBookAsRead_serviceThrowsException() throws ReadComicBooksException {
    Mockito.doThrow(ReadComicBooksException.class)
        .when(readComicBooksService)
        .markComicBookAsRead(Mockito.anyString(), Mockito.anyLong());

    try {
      controller.markSingleComicBookRead(principal, TESTS_COMIC_ID);
    } finally {
      Mockito.verify(readComicBooksService, Mockito.times(1))
          .markComicBookAsRead(TEST_EMAIL, TESTS_COMIC_ID);
    }
  }

  @Test
  public void testMarkComicBookAsRead() throws ReadComicBooksException {
    controller.markSingleComicBookRead(principal, TESTS_COMIC_ID);

    Mockito.verify(readComicBooksService, Mockito.times(1))
        .markComicBookAsRead(TEST_EMAIL, TESTS_COMIC_ID);
  }

  @Test(expected = ReadComicBooksException.class)
  public void testUmnarkComicBookAsRead_serviceThrowsException() throws ReadComicBooksException {
    Mockito.doThrow(ReadComicBooksException.class)
        .when(readComicBooksService)
        .unmarkComicBookAsRead(Mockito.anyString(), Mockito.anyLong());

    try {
      controller.unmarkSingleComicBookRead(principal, TESTS_COMIC_ID);
    } finally {
      Mockito.verify(readComicBooksService, Mockito.times(1))
          .unmarkComicBookAsRead(TEST_EMAIL, TESTS_COMIC_ID);
    }
  }

  @Test
  public void testUnmarkComicBookAsRead() throws ReadComicBooksException {
    controller.unmarkSingleComicBookRead(principal, TESTS_COMIC_ID);

    Mockito.verify(readComicBooksService, Mockito.times(1))
        .unmarkComicBookAsRead(TEST_EMAIL, TESTS_COMIC_ID);
  }

  @Test(expected = ReadComicBooksException.class)
  public void testMarkSelectedAsRead_serviceThrowsException()
      throws ReadComicBooksException, ComicBookSelectionException {
    Mockito.doThrow(ReadComicBooksException.class)
        .when(readComicBooksService)
        .markSelectionsAsRead(Mockito.anyString(), Mockito.anyList());

    try {
      controller.markSelectedComicBooksRead(principal, httpSession);
    } finally {
      Mockito.verify(readComicBooksService, Mockito.times(1))
          .markSelectionsAsRead(TEST_EMAIL, selectedIds);
    }
  }

  @Test(expected = ReadComicBooksException.class)
  public void testMarkSelectedAsRead_selectionExceptionDuringDecode()
      throws ReadComicBooksException, ComicBookSelectionException {
    Mockito.doThrow(ReadComicBooksException.class)
        .when(readComicBooksService)
        .markSelectionsAsRead(Mockito.anyString(), Mockito.anyList());

    try {
      controller.markSelectedComicBooksRead(principal, httpSession);
    } finally {
      Mockito.verify(comicSelectionService, Mockito.times(1)).decodeSelections(TEST_ENCODED_IDS);
    }
  }

  @Test(expected = ComicBookSelectionException.class)
  public void testMarkSelectedAsRead_selectionExceptionDuringEncode()
      throws ReadComicBooksException, ComicBookSelectionException {
    Mockito.doThrow(ComicBookSelectionException.class)
        .when(comicSelectionService)
        .encodeSelections(Mockito.anyList());

    try {
      controller.markSelectedComicBooksRead(principal, httpSession);
    } finally {
      Mockito.verify(comicSelectionService, Mockito.times(1)).encodeSelections(selectedIds);
    }
  }

  @Test
  public void testMarkSelectedAsRead() throws ReadComicBooksException, ComicBookSelectionException {
    controller.markSelectedComicBooksRead(principal, httpSession);

    Mockito.verify(readComicBooksService, Mockito.times(2))
        .markSelectionsAsRead(TEST_EMAIL, selectedIds);
    Mockito.verify(comicSelectionService, Mockito.times(1))
        .clearSelectedComicBooks(TEST_EMAIL, selectedIds);
  }

  @Test(expected = ReadComicBooksException.class)
  public void testUnmarkSelectedAsRead_serviceThrowsException()
      throws ReadComicBooksException, ComicBookSelectionException {
    Mockito.doThrow(ReadComicBooksException.class)
        .when(readComicBooksService)
        .unmarkSelectionsAsRead(Mockito.anyString(), Mockito.anyList());

    try {
      controller.unmarkSelectedComicBooksRead(principal, httpSession);
    } finally {
      Mockito.verify(readComicBooksService, Mockito.times(1))
          .unmarkSelectionsAsRead(TEST_EMAIL, selectedIds);
    }
  }

  @Test(expected = ReadComicBooksException.class)
  public void testUnmarkSelectedAsRead_selectionExceptionDuringDecode()
      throws ReadComicBooksException, ComicBookSelectionException {
    Mockito.doThrow(ReadComicBooksException.class)
        .when(readComicBooksService)
        .unmarkSelectionsAsRead(Mockito.anyString(), Mockito.anyList());

    try {
      controller.unmarkSelectedComicBooksRead(principal, httpSession);
    } finally {
      Mockito.verify(comicSelectionService, Mockito.times(1)).decodeSelections(TEST_ENCODED_IDS);
    }
  }

  @Test(expected = ComicBookSelectionException.class)
  public void testUnmarkSelectedAsRead_selectionExceptionDuringEncode()
      throws ReadComicBooksException, ComicBookSelectionException {
    Mockito.doThrow(ComicBookSelectionException.class)
        .when(comicSelectionService)
        .encodeSelections(Mockito.anyList());

    try {
      controller.unmarkSelectedComicBooksRead(principal, httpSession);
    } finally {
      Mockito.verify(comicSelectionService, Mockito.times(1)).encodeSelections(selectedIds);
    }
  }

  @Test
  public void testUnmarkSelectedAsRead()
      throws ReadComicBooksException, ComicBookSelectionException {
    controller.unmarkSelectedComicBooksRead(principal, httpSession);

    Mockito.verify(readComicBooksService, Mockito.times(1))
        .unmarkSelectionsAsRead(TEST_EMAIL, selectedIds);
    Mockito.verify(comicSelectionService, Mockito.times(1))
        .clearSelectedComicBooks(TEST_EMAIL, selectedIds);
  }
}

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

import static org.comixedproject.rest.comicbooks.ComicSelectionController.LIBRARY_SELECTIONS;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import jakarta.servlet.http.HttpSession;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import org.comixedproject.service.comicbooks.ComicSelectionException;
import org.comixedproject.service.comicbooks.ComicSelectionService;
import org.comixedproject.service.user.ReadComicsException;
import org.comixedproject.service.user.ReadComicsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ReadComicsControllerTest {
  private static final String TEST_EMAIL = "reader@comixedproject.org";
  private static final String TEST_ENCODED_IDS = "The encoded selected ids";
  private static final String TEST_REENCODED_IDS = "The re-encoded selected ids";
  private static final long TEST_COMIC_ID = 129L;

  @InjectMocks private ReadComicsController controller;
  @Mock private ReadComicsService readComicsService;
  @Mock private ComicSelectionService comicSelectionService;
  @Mock private HttpSession httpSession;
  @Mock private Principal principal;

  private List selectedIds = new ArrayList();

  @BeforeEach
  void setUp() throws ComicSelectionException {
    when(principal.getName()).thenReturn(TEST_EMAIL);
    when(httpSession.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_IDS);
    when(comicSelectionService.decodeSelections(TEST_ENCODED_IDS)).thenReturn(selectedIds);
    when(comicSelectionService.encodeSelections(anyList())).thenReturn(TEST_REENCODED_IDS);
  }

  @Test
  void markComicBookAsRead_serviceThrowsException() throws ReadComicsException {
    doThrow(ReadComicsException.class)
        .when(readComicsService)
        .markComicBookAsRead(anyString(), anyLong());

    assertThrows(
        ReadComicsException.class,
        () -> controller.markSingleComicBookRead(principal, TEST_COMIC_ID));
  }

  @Test
  void markComicBookAsRead() throws ReadComicsException {
    controller.markSingleComicBookRead(principal, TEST_COMIC_ID);

    verify(readComicsService).markComicBookAsRead(TEST_EMAIL, TEST_COMIC_ID);
  }

  @Test
  void umnarkComicBookAsRead_serviceThrowsException() throws ReadComicsException {
    doThrow(ReadComicsException.class)
        .when(readComicsService)
        .unmarkComicBookAsRead(anyString(), anyLong());

    assertThrows(
        ReadComicsException.class,
        () -> controller.unmarkSingleComicBookRead(principal, TEST_COMIC_ID));
  }

  @Test
  void unmarkComicBookAsRead() throws ReadComicsException {
    controller.unmarkSingleComicBookRead(principal, TEST_COMIC_ID);

    verify(readComicsService).unmarkComicBookAsRead(TEST_EMAIL, TEST_COMIC_ID);
  }

  @Test
  void markSelectedAsRead_serviceThrowsException() throws ReadComicsException {
    doThrow(ReadComicsException.class)
        .when(readComicsService)
        .markSelectionsAsRead(anyString(), anyList());

    assertThrows(
        ReadComicsException.class,
        () -> controller.markSelectedComicBooksRead(principal, httpSession));
  }

  @Test
  void markSelectedAsRead_selectionExceptionDuringEncode() throws ComicSelectionException {
    doThrow(ComicSelectionException.class).when(comicSelectionService).encodeSelections(anyList());

    assertThrows(
        ComicSelectionException.class,
        () -> controller.markSelectedComicBooksRead(principal, httpSession));
  }

  @Test
  void markSelectedAsRead() throws ReadComicsException, ComicSelectionException {
    controller.markSelectedComicBooksRead(principal, httpSession);

    verify(readComicsService).markSelectionsAsRead(TEST_EMAIL, selectedIds);
    verify(comicSelectionService).clearSelectedComicBooks(TEST_EMAIL, selectedIds);
  }

  @Test
  void unmarkSelectedAsRead_serviceThrowsException() throws ReadComicsException {
    doThrow(ReadComicsException.class)
        .when(readComicsService)
        .unmarkSelectionsAsRead(anyString(), anyList());

    assertThrows(
        ReadComicsException.class,
        () -> controller.unmarkSelectedComicBooksRead(principal, httpSession));
  }

  @Test
  void unmarkSelectedAsRead_selectionExceptionDuringEncode() throws ComicSelectionException {
    doThrow(ComicSelectionException.class).when(comicSelectionService).encodeSelections(anyList());

    assertThrows(
        ComicSelectionException.class,
        () -> controller.unmarkSelectedComicBooksRead(principal, httpSession));
  }

  @Test
  void unmarkSelectedAsRead() throws ReadComicsException, ComicSelectionException {
    controller.unmarkSelectedComicBooksRead(principal, httpSession);

    verify(readComicsService).unmarkSelectionsAsRead(TEST_EMAIL, selectedIds);
    verify(comicSelectionService).clearSelectedComicBooks(TEST_EMAIL, selectedIds);
  }
}

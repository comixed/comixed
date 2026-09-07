/*
 * ComiXed - A digital comicBook book library management application.
 * Copyright (C) 2018, The ComiXed Project.
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

package org.comixedproject.rest.comicbooks;

import static org.comixedproject.rest.comicbooks.ComicBookController.MISSING_COMIC_COVER_FILENAME;
import static org.comixedproject.rest.comicbooks.ComicBookSelectionController.LIBRARY_SELECTIONS;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import jakarta.servlet.http.HttpSession;
import java.security.Principal;
import java.util.*;
import org.comixedproject.model.comicbooks.*;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.model.net.comicbooks.*;
import org.comixedproject.service.comicbooks.*;
import org.comixedproject.service.comicpages.ComicPageException;
import org.comixedproject.service.comicpages.PageCacheService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class ComicBookControllerTest {
  private static final long TEST_COMIC_ID = 129;
  private static final Object TEST_ENCODED_SELECTIONS = "The encoded selection ids";
  private static final String TEST_REENCODED_SELECTIONS = "The re-encoded selection ids";
  private static final String TEST_EMAIL = "user@comixedproject.org";
  private static final ComicType TEST_COMIC_TYPE = ComicType.TRADEPAPERBACK;
  private static final String TEST_PUBLISHER = "The Publisher";
  private static final String TEST_SERIES = "The Series";
  private static final String TEST_VOLUME = "2025";
  private static final String TEST_ISSUE_NUMBER = "20";
  private static final String TEST_IMPRINT = "The Imprint";
  private static final String TEST_SORTABLE_NAME = "The Sortable Name";
  private static final String TEST_TITLE = "The Title";
  private static final Date TEST_COVER_DATE = new Date();
  private static final Date TEST_STORE_DATE = new Date();

  @InjectMocks private ComicBookController controller;
  @Mock private ComicDataService comicDataService;
  @Mock private ComicBookService comicBookService;
  @Mock private PageCacheService pageCacheService;
  @Mock private ComicSelectionService comicSelectionService;
  @Mock private List<PageOrderEntry> pageOrderEntryList;
  @Mock private HttpSession httpSession;
  @Mock private Principal principal;
  @Mock private DownloadDocument comicBookContent;
  @Mock private ResponseEntity<byte[]> responseEntity;
  @Mock private ComicBookData comicData;

  private List<Long> selectedIdList = new ArrayList<>();

  @Test
  void getComic_exceptionThrown() throws ComicBookException {
    when(comicDataService.getComic(anyLong())).thenThrow(ComicBookException.class);

    assertThrows(ComicBookException.class, () -> controller.getComic(TEST_COMIC_ID));

    verify(comicDataService).getComic(TEST_COMIC_ID);
  }

  @Test
  void getComic() throws ComicBookException {
    when(comicDataService.getComic(anyLong())).thenReturn(comicData);

    ComicBookData result = controller.getComic(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(comicData, result);

    verify(comicDataService).getComic(TEST_COMIC_ID);
  }

  @Test
  void downloadComic_fileServiceException() throws ComicBookException {
    when(comicDataService.getComicContent(anyLong())).thenThrow(ComicBookException.class);

    assertThrows(ComicBookException.class, () -> controller.downloadComic(TEST_COMIC_ID));

    verify(comicDataService).getComicContent(TEST_COMIC_ID);
  }

  @Test
  void downloadComic() throws ComicBookException {
    when(comicDataService.getComicContent(anyLong())).thenReturn(comicBookContent);

    final DownloadDocument result = controller.downloadComic(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(comicBookContent, result);

    verify(comicDataService).getComicContent(TEST_COMIC_ID);
  }

  @Test
  void getCachedCoverImage() throws ComicPageException {
    when(pageCacheService.getCoverPageContent(anyLong(), anyString())).thenReturn(responseEntity);

    final ResponseEntity<byte[]> result = controller.getCoverImage(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(responseEntity, result);

    verify(pageCacheService).getCoverPageContent(TEST_COMIC_ID, MISSING_COMIC_COVER_FILENAME);
  }

  @Test
  void savePageOrder_exceptionThrown() throws ComicBookException {
    doThrow(ComicBookException.class).when(comicDataService).savePageOrder(anyLong(), anyList());

    assertThrows(
        ComicBookException.class,
        () ->
            controller.savePageOrder(TEST_COMIC_ID, new SavePageOrderRequest(pageOrderEntryList)));

    verify(comicDataService).savePageOrder(TEST_COMIC_ID, pageOrderEntryList);
  }

  @Test
  void savePageOrder() throws ComicBookException {
    controller.savePageOrder(TEST_COMIC_ID, new SavePageOrderRequest(pageOrderEntryList));

    verify(comicDataService).savePageOrder(TEST_COMIC_ID, pageOrderEntryList);
  }

  @Test
  void updateComic() throws ComicBookException {
    when(comicDataService.updateComic(
            anyLong(),
            any(ComicType.class),
            anyString(),
            anyString(),
            anyString(),
            anyString(),
            anyString(),
            anyString(),
            anyString(),
            any(Date.class),
            any(Date.class)))
        .thenReturn(comicData);

    final ComicBookData result =
        controller.updateComic(
            TEST_COMIC_ID,
            new UpdateComicBookRequest(
                TEST_COMIC_TYPE,
                TEST_PUBLISHER,
                TEST_SERIES,
                TEST_VOLUME,
                TEST_ISSUE_NUMBER,
                TEST_IMPRINT,
                TEST_SORTABLE_NAME,
                TEST_TITLE,
                TEST_COVER_DATE,
                TEST_STORE_DATE));

    assertNotNull(result);
    assertSame(comicData, result);

    verify(comicDataService)
        .updateComic(
            TEST_COMIC_ID,
            TEST_COMIC_TYPE,
            TEST_PUBLISHER,
            TEST_SERIES,
            TEST_VOLUME,
            TEST_ISSUE_NUMBER,
            TEST_IMPRINT,
            TEST_SORTABLE_NAME,
            TEST_TITLE,
            TEST_COVER_DATE,
            TEST_STORE_DATE);
  }

  @Test
  void deleteComic_exceptionThrown() throws ComicBookException {
    doThrow(ComicBookException.class).when(comicDataService).deleteComicBook(anyLong());

    assertThrows(ComicBookException.class, () -> controller.deleteComicBook(TEST_COMIC_ID));

    verify(comicDataService).deleteComicBook(TEST_COMIC_ID);
  }

  @Test
  void deleteComicBook() throws ComicBookException {
    doNothing().when(comicDataService).deleteComicBook(anyLong());

    controller.deleteComicBook(TEST_COMIC_ID);

    verify(comicDataService).deleteComicBook(TEST_COMIC_ID);
  }

  @Test
  void undeleteComicBook() throws ComicBookException {
    doNothing().when(comicDataService).undeleteComicBook(anyLong());

    controller.undeleteComicBook(TEST_COMIC_ID);

    verify(comicDataService).undeleteComicBook(TEST_COMIC_ID);
  }

  @Test
  void undeleteComicBook_exceptionThrown() throws ComicBookException {
    doThrow(ComicBookException.class).when(comicDataService).undeleteComicBook(anyLong());

    assertThrows(ComicBookException.class, () -> controller.undeleteComicBook(TEST_COMIC_ID));

    verify(comicDataService).undeleteComicBook(TEST_COMIC_ID);
  }

  @Test
  void deleteSelectedComicBooks_exceptionOnDecode()
      throws ComicBookException, ComicBookSelectionException {
    when(principal.getName()).thenReturn(TEST_EMAIL);
    when(httpSession.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTIONS);
    when(comicSelectionService.decodeSelections(any()))
        .thenThrow(ComicBookSelectionException.class);

    assertThrows(
        ComicBookException.class,
        () -> controller.deleteSelectedComicBooks(httpSession, principal));

    verify(comicSelectionService).decodeSelections(TEST_ENCODED_SELECTIONS);
    verify(comicDataService, never()).deleteComicBooksById(selectedIdList);
  }

  @Test
  void deleteSelectedComicBooks_exceptionOnEncode()
      throws ComicBookException, ComicBookSelectionException {
    when(principal.getName()).thenReturn(TEST_EMAIL);
    when(httpSession.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTIONS);
    when(comicSelectionService.decodeSelections(any())).thenReturn(selectedIdList);
    when(comicSelectionService.encodeSelections(anyList()))
        .thenThrow(ComicBookSelectionException.class);
    doNothing().when(comicDataService).deleteComicBooksById(anyList());

    assertThrows(
        ComicBookException.class,
        () -> controller.deleteSelectedComicBooks(httpSession, principal));

    verify(comicSelectionService).decodeSelections(TEST_ENCODED_SELECTIONS);
    verify(comicDataService).deleteComicBooksById(selectedIdList);
    verify(comicSelectionService).clearSelectedComicBooks(TEST_EMAIL, selectedIdList);
    verify(comicSelectionService).encodeSelections(selectedIdList);
    verify(httpSession, never()).setAttribute(anyString(), anyString());
  }

  @Test
  void deleteSelectedComicBooks() throws ComicBookException, ComicBookSelectionException {
    when(principal.getName()).thenReturn(TEST_EMAIL);
    when(httpSession.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTIONS);
    when(comicSelectionService.decodeSelections(any())).thenReturn(selectedIdList);
    when(comicSelectionService.encodeSelections(anyList())).thenReturn(TEST_REENCODED_SELECTIONS);
    doNothing().when(comicDataService).deleteComicBooksById(anyList());

    controller.deleteSelectedComicBooks(httpSession, principal);

    verify(comicSelectionService).decodeSelections(TEST_ENCODED_SELECTIONS);
    verify(comicDataService).deleteComicBooksById(selectedIdList);
    verify(comicSelectionService).clearSelectedComicBooks(TEST_EMAIL, selectedIdList);
    verify(comicSelectionService).encodeSelections(selectedIdList);
    verify(httpSession).setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  void undeleteSelectedComicBooks_exceptionOnDecode() throws Exception {
    when(principal.getName()).thenReturn(TEST_EMAIL);
    when(httpSession.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTIONS);
    when(comicSelectionService.decodeSelections(any()))
        .thenThrow(ComicBookSelectionException.class);

    assertThrows(
        ComicBookException.class,
        () -> controller.undeleteSelectedComicBooks(httpSession, principal));

    verify(comicSelectionService).decodeSelections(TEST_ENCODED_SELECTIONS);
    verify(comicDataService, never()).undeleteComicBooksById(selectedIdList);
  }

  @Test
  void undeleteSelectedComicBooks_exceptionOnEncode() throws Exception {
    when(principal.getName()).thenReturn(TEST_EMAIL);
    when(httpSession.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTIONS);
    when(comicSelectionService.decodeSelections(any())).thenReturn(selectedIdList);
    when(comicSelectionService.encodeSelections(anyList()))
        .thenThrow(ComicBookSelectionException.class);

    assertThrows(
        ComicBookException.class,
        () -> controller.undeleteSelectedComicBooks(httpSession, principal));

    verify(comicSelectionService).decodeSelections(TEST_ENCODED_SELECTIONS);
    verify(comicDataService).undeleteComicBooksById(selectedIdList);
    verify(comicSelectionService).clearSelectedComicBooks(TEST_EMAIL, selectedIdList);
    verify(comicSelectionService).encodeSelections(selectedIdList);
    verify(httpSession, never()).setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  void undeleteSelectedComicBooks() throws Exception {
    when(principal.getName()).thenReturn(TEST_EMAIL);
    when(httpSession.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTIONS);
    when(comicSelectionService.decodeSelections(any())).thenReturn(selectedIdList);
    when(comicSelectionService.encodeSelections(anyList())).thenReturn(TEST_REENCODED_SELECTIONS);
    doNothing().when(comicDataService).undeleteComicBooksById(anyList());

    controller.undeleteSelectedComicBooks(httpSession, principal);

    verify(comicSelectionService).decodeSelections(TEST_ENCODED_SELECTIONS);
    verify(comicDataService).undeleteComicBooksById(selectedIdList);
    verify(comicSelectionService).clearSelectedComicBooks(TEST_EMAIL, selectedIdList);
    verify(comicSelectionService).encodeSelections(selectedIdList);
    verify(httpSession).setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }
}

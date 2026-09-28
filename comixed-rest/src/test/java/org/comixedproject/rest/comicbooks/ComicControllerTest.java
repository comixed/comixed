/*
 * ComiXed - A digital comic book library management application.
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

import static org.comixedproject.rest.comicbooks.ComicController.MISSING_COMIC_COVER_FILENAME;
import static org.comixedproject.rest.comicbooks.ComicSelectionController.LIBRARY_SELECTIONS;
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
class ComicControllerTest {
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

  @InjectMocks private ComicController controller;
  @Mock private ComicDataService comicDataService;
  @Mock private PageCacheService pageCacheService;
  @Mock private ComicSelectionService comicSelectionService;
  @Mock private List<PageOrderEntry> pageOrderEntryList;
  @Mock private HttpSession httpSession;
  @Mock private Principal principal;
  @Mock private DownloadDocument comicContent;
  @Mock private ResponseEntity<byte[]> responseEntity;
  @Mock private ComicDataSet comicData;

  private List<Long> selectedIdList = new ArrayList<>();

  @Test
  void getComic_exceptionThrown() throws ComicException {
    when(comicDataService.getComic(anyLong())).thenThrow(ComicException.class);

    assertThrows(ComicException.class, () -> controller.getComic(TEST_COMIC_ID));

    verify(comicDataService).getComic(TEST_COMIC_ID);
  }

  @Test
  void getComic() throws ComicException {
    when(comicDataService.getComic(anyLong())).thenReturn(comicData);

    ComicDataSet result = controller.getComic(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(comicData, result);

    verify(comicDataService).getComic(TEST_COMIC_ID);
  }

  @Test
  void downloadComic_fileServiceException() throws ComicException {
    when(comicDataService.getComicContent(anyLong())).thenThrow(ComicException.class);

    assertThrows(ComicException.class, () -> controller.downloadComic(TEST_COMIC_ID));

    verify(comicDataService).getComicContent(TEST_COMIC_ID);
  }

  @Test
  void downloadComic() throws ComicException {
    when(comicDataService.getComicContent(anyLong())).thenReturn(comicContent);

    final DownloadDocument result = controller.downloadComic(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(comicContent, result);

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
  void savePageOrder_exceptionThrown() throws ComicException {
    doThrow(ComicException.class).when(comicDataService).savePageOrder(anyLong(), anyList());

    assertThrows(
        ComicException.class,
        () ->
            controller.savePageOrder(TEST_COMIC_ID, new SavePageOrderRequest(pageOrderEntryList)));

    verify(comicDataService).savePageOrder(TEST_COMIC_ID, pageOrderEntryList);
  }

  @Test
  void savePageOrder() throws ComicException {
    controller.savePageOrder(TEST_COMIC_ID, new SavePageOrderRequest(pageOrderEntryList));

    verify(comicDataService).savePageOrder(TEST_COMIC_ID, pageOrderEntryList);
  }

  @Test
  void updateComic() throws ComicException {
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

    final ComicDataSet result =
        controller.updateComic(
            TEST_COMIC_ID,
            new UpdateComicRequest(
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
  void deleteComic_exceptionThrown() throws ComicException {
    doThrow(ComicException.class).when(comicDataService).deleteComic(anyLong());

    assertThrows(ComicException.class, () -> controller.deleteComic(TEST_COMIC_ID));

    verify(comicDataService).deleteComic(TEST_COMIC_ID);
  }

  @Test
  void deleteComic() throws ComicException {
    doNothing().when(comicDataService).deleteComic(anyLong());

    controller.deleteComic(TEST_COMIC_ID);

    verify(comicDataService).deleteComic(TEST_COMIC_ID);
  }

  @Test
  void undeleteComic() throws ComicException {
    doNothing().when(comicDataService).undeleteComic(anyLong());

    controller.undeleteComic(TEST_COMIC_ID);

    verify(comicDataService).undeleteComic(TEST_COMIC_ID);
  }

  @Test
  void undeleteComic_exceptionThrown() throws ComicException {
    doThrow(ComicException.class).when(comicDataService).undeleteComic(anyLong());

    assertThrows(ComicException.class, () -> controller.undeleteComic(TEST_COMIC_ID));

    verify(comicDataService).undeleteComic(TEST_COMIC_ID);
  }

  @Test
  void deleteSelectedComics_exceptionOnDecode() throws ComicException, ComicSelectionException {
    when(principal.getName()).thenReturn(TEST_EMAIL);
    when(httpSession.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTIONS);
    when(comicSelectionService.decodeSelections(any())).thenThrow(ComicSelectionException.class);

    assertThrows(
        ComicException.class, () -> controller.deleteSelectedComics(httpSession, principal));

    verify(comicSelectionService).decodeSelections(TEST_ENCODED_SELECTIONS);
    verify(comicDataService, never()).deleteComicsById(selectedIdList);
  }

  @Test
  void deleteSelectedComics_exceptionOnEncode() throws ComicException, ComicSelectionException {
    when(principal.getName()).thenReturn(TEST_EMAIL);
    when(httpSession.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTIONS);
    when(comicSelectionService.decodeSelections(any())).thenReturn(selectedIdList);
    when(comicSelectionService.encodeSelections(anyList()))
        .thenThrow(ComicSelectionException.class);
    doNothing().when(comicDataService).deleteComicsById(anyList());

    assertThrows(
        ComicException.class, () -> controller.deleteSelectedComics(httpSession, principal));

    verify(comicSelectionService).decodeSelections(TEST_ENCODED_SELECTIONS);
    verify(comicDataService).deleteComicsById(selectedIdList);
    verify(comicSelectionService).clearSelectedComics(TEST_EMAIL, selectedIdList);
    verify(comicSelectionService).encodeSelections(selectedIdList);
    verify(httpSession, never()).setAttribute(anyString(), anyString());
  }

  @Test
  void deleteSelectedComics() throws ComicException, ComicSelectionException {
    when(principal.getName()).thenReturn(TEST_EMAIL);
    when(httpSession.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTIONS);
    when(comicSelectionService.decodeSelections(any())).thenReturn(selectedIdList);
    when(comicSelectionService.encodeSelections(anyList())).thenReturn(TEST_REENCODED_SELECTIONS);
    doNothing().when(comicDataService).deleteComicsById(anyList());

    controller.deleteSelectedComics(httpSession, principal);

    verify(comicSelectionService).decodeSelections(TEST_ENCODED_SELECTIONS);
    verify(comicDataService).deleteComicsById(selectedIdList);
    verify(comicSelectionService).clearSelectedComics(TEST_EMAIL, selectedIdList);
    verify(comicSelectionService).encodeSelections(selectedIdList);
    verify(httpSession).setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  void undeleteSelectedComics_exceptionOnDecode() throws Exception {
    when(principal.getName()).thenReturn(TEST_EMAIL);
    when(httpSession.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTIONS);
    when(comicSelectionService.decodeSelections(any())).thenThrow(ComicSelectionException.class);

    assertThrows(
        ComicException.class, () -> controller.undeleteSelectedComics(httpSession, principal));

    verify(comicSelectionService).decodeSelections(TEST_ENCODED_SELECTIONS);
    verify(comicDataService, never()).undeleteComicsById(selectedIdList);
  }

  @Test
  void undeleteSelectedComics_exceptionOnEncode() throws Exception {
    when(principal.getName()).thenReturn(TEST_EMAIL);
    when(httpSession.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTIONS);
    when(comicSelectionService.decodeSelections(any())).thenReturn(selectedIdList);
    when(comicSelectionService.encodeSelections(anyList()))
        .thenThrow(ComicSelectionException.class);

    assertThrows(
        ComicException.class, () -> controller.undeleteSelectedComics(httpSession, principal));

    verify(comicSelectionService).decodeSelections(TEST_ENCODED_SELECTIONS);
    verify(comicDataService).undeleteComicsById(selectedIdList);
    verify(comicSelectionService).clearSelectedComics(TEST_EMAIL, selectedIdList);
    verify(comicSelectionService).encodeSelections(selectedIdList);
    verify(httpSession, never()).setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  void undeleteSelectedComics() throws Exception {
    when(principal.getName()).thenReturn(TEST_EMAIL);
    when(httpSession.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTIONS);
    when(comicSelectionService.decodeSelections(any())).thenReturn(selectedIdList);
    when(comicSelectionService.encodeSelections(anyList())).thenReturn(TEST_REENCODED_SELECTIONS);
    doNothing().when(comicDataService).undeleteComicsById(anyList());

    controller.undeleteSelectedComics(httpSession, principal);

    verify(comicSelectionService).decodeSelections(TEST_ENCODED_SELECTIONS);
    verify(comicDataService).undeleteComicsById(selectedIdList);
    verify(comicSelectionService).clearSelectedComics(TEST_EMAIL, selectedIdList);
    verify(comicSelectionService).encodeSelections(selectedIdList);
    verify(httpSession).setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }
}

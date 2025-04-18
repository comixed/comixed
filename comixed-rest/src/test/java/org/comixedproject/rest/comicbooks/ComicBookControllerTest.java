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
import static org.junit.Assert.*;

import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.security.Principal;
import java.util.*;
import org.comixedproject.model.comicbooks.*;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.model.net.comicbooks.*;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.service.comicbooks.*;
import org.comixedproject.service.comicpages.ComicPageException;
import org.comixedproject.service.comicpages.PageCacheService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ComicBookControllerTest {
  private static final long TEST_COMIC_ID = 129;
  private static final Object TEST_ENCODED_SELECTIONS = "The encoded selection ids";
  private static final String TEST_REENCODED_SELECTIONS = "The re-encoded selection ids";
  private static final String TEST_EMAIL = "user@comixedproject.org";

  @InjectMocks private ComicBookController controller;
  @Mock private ComicBookService comicBookService;
  @Mock private PageCacheService pageCacheService;
  @Mock private ComicSelectionService comicSelectionService;
  @Mock private ComicBook comicBook;
  @Mock private List<PageOrderEntry> pageOrderEntrylist;
  @Mock private HttpSession httpSession;
  @Mock private Principal principal;
  @Mock private DownloadDocument comicBookContent;
  @Mock private ResponseEntity<byte[]> responseEntity;
  @Mock private ComiXedUser user;

  private final Set<Long> comicBookIdSet = new HashSet<>();
  private List<Long> selectedIdList = new ArrayList<>();

  @Before
  public void setUp() throws ComicBookSelectionException, ComicBookException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);
    comicBookIdSet.add(TEST_COMIC_ID);
    Mockito.when(httpSession.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTIONS);
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
    Mockito.when(comicSelectionService.decodeSelections(Mockito.any())).thenReturn(selectedIdList);
    Mockito.when(comicSelectionService.encodeSelections(selectedIdList))
        .thenReturn(TEST_REENCODED_SELECTIONS);
    for (long index = 0L; index < 100L; index++) {
      selectedIdList.add(index);
    }
  }

  @Test
  public void testGetComicForNonexistentComic() throws ComicBookException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(null);

    ComicBook result = controller.getComic(TEST_COMIC_ID);

    assertNull(result);

    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
  }

  @Test
  public void testGetComic() throws ComicBookException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);

    ComicBook result = controller.getComic(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
  }

  @Test
  public void testUpdateComic() throws ComicBookException {
    Mockito.when(comicBookService.updateComic(Mockito.anyLong(), Mockito.any(ComicBook.class)))
        .thenReturn(comicBook);

    final ComicBook result = controller.updateComic(TEST_COMIC_ID, comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookService, Mockito.times(1)).updateComic(TEST_COMIC_ID, comicBook);
  }

  @Test
  public void testDeleteComicBook() throws ComicBookException {
    Mockito.when(comicBookService.deleteComicBook(Mockito.anyLong())).thenReturn(comicBook);

    final ComicBook result = controller.deleteComicBook(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookService, Mockito.times(1)).deleteComicBook(TEST_COMIC_ID);
  }

  @Test(expected = ComicBookException.class)
  public void testDeleteComicBookFails() throws ComicBookException {
    Mockito.when(comicBookService.deleteComicBook(Mockito.anyLong()))
        .thenThrow(ComicBookException.class);

    try {
      controller.deleteComicBook(TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicBookService, Mockito.times(1)).deleteComicBook(TEST_COMIC_ID);
    }
  }

  @Test
  public void testUndeleteComicBook() throws ComicBookException {
    Mockito.when(comicBookService.undeleteComicBook(Mockito.anyLong())).thenReturn(comicBook);

    final ComicBook result = controller.undeleteComicBook(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookService, Mockito.times(1)).undeleteComicBook(TEST_COMIC_ID);
  }

  @Test(expected = ComicBookException.class)
  public void testUndeleteComicBookFails() throws ComicBookException {
    Mockito.when(comicBookService.undeleteComicBook(Mockito.anyLong()))
        .thenThrow(ComicBookException.class);

    try {
      controller.undeleteComicBook(TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicBookService, Mockito.times(1)).undeleteComicBook(TEST_COMIC_ID);
    }
  }

  @Test
  public void testDeleteSelectedComicBooks() throws ComicBookException {
    Mockito.doNothing().when(comicBookService).deleteComicBooksById(selectedIdList);

    controller.deleteSelectedComicBooks(httpSession, principal);

    Mockito.verify(comicBookService, Mockito.times(1)).deleteComicBooksById(this.selectedIdList);
  }

  @Test
  public void testUndeleteSelectedComicBooks() throws Exception {
    Mockito.doNothing().when(comicBookService).undeleteComicBooksById(selectedIdList);

    controller.undeleteSelectedComicBooks(httpSession, principal);

    Mockito.verify(comicSelectionService, Mockito.times(1))
        .decodeSelections(TEST_ENCODED_SELECTIONS);
    Mockito.verify(comicBookService, Mockito.times(1)).undeleteComicBooksById(selectedIdList);
    Mockito.verify(comicSelectionService, Mockito.times(1)).encodeSelections(selectedIdList);
    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test(expected = ComicBookException.class)
  public void testDownloadComicFileServiceException() throws IOException, ComicBookException {
    Mockito.when(comicBookService.getComicContent(Mockito.anyLong()))
        .thenThrow(ComicBookException.class);

    try {
      controller.downloadComic(TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicBookService, Mockito.times(1)).getComicContent(TEST_COMIC_ID);
    }
  }

  @Test
  public void testDownloadComic() throws IOException, ComicBookException {
    Mockito.when(comicBookService.getComicContent(Mockito.anyLong())).thenReturn(comicBookContent);

    final DownloadDocument result = controller.downloadComic(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(comicBookContent, result);

    Mockito.verify(comicBookService, Mockito.times(1)).getComicContent(TEST_COMIC_ID);
  }

  @Test
  public void testGetCachedCoverImage() throws ComicBookException, ComicPageException {
    Mockito.when(pageCacheService.getCoverPageContent(Mockito.anyLong(), Mockito.anyString()))
        .thenReturn(responseEntity);

    final ResponseEntity<byte[]> result = controller.getCoverImage(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(responseEntity, result);

    Mockito.verify(pageCacheService, Mockito.times(1))
        .getCoverPageContent(TEST_COMIC_ID, MISSING_COMIC_COVER_FILENAME);
  }

  @Test
  public void testDeleteMetadata() throws ComicBookException {
    Mockito.when(comicBookService.deleteMetadata(Mockito.anyLong())).thenReturn(comicBook);

    final ComicBook result = controller.deleteMetadata(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookService, Mockito.times(1)).deleteMetadata(TEST_COMIC_ID);
  }

  @Test(expected = ComicBookException.class)
  public void testSavePageOrderServiceException() throws ComicBookException {
    Mockito.doThrow(ComicBookException.class)
        .when(comicBookService)
        .savePageOrder(Mockito.anyLong(), Mockito.anyList());

    try {
      controller.savePageOrder(TEST_COMIC_ID, new SavePageOrderRequest(pageOrderEntrylist));
    } finally {
      Mockito.verify(comicBookService, Mockito.times(1))
          .savePageOrder(TEST_COMIC_ID, pageOrderEntrylist);
    }
  }

  @Test
  public void testSavePageOrder() throws ComicBookException {
    controller.savePageOrder(TEST_COMIC_ID, new SavePageOrderRequest(pageOrderEntrylist));

    Mockito.verify(comicBookService, Mockito.times(1))
        .savePageOrder(TEST_COMIC_ID, pageOrderEntrylist);
  }
}

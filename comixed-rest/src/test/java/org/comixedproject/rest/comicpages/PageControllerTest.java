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

package org.comixedproject.rest.comicpages;

import static junit.framework.TestCase.assertNull;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertSame;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicpages.Page;
import org.comixedproject.model.net.comicpages.UpdatePageDeletionRequest;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.comixedproject.service.comicpages.PageCacheService;
import org.comixedproject.service.comicpages.PageException;
import org.comixedproject.service.comicpages.PageService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class PageControllerTest {
  private static final long TEST_PAGE_ID = 129;
  private static final int TEST_PAGE_INDEX = 7;
  private static final long TEST_COMIC_ID = 1002L;
  private static final byte[] TEST_PAGE_CONTENT = new byte[53253];
  private static final String TEST_PAGE_HASH = "12345";
  private static final String TEST_PAGE_CONTENT_TYPE = "application";
  private static final String TEST_PAGE_CONTENT_SUBTYPE = "image";

  @InjectMocks private PageController controller;
  @Mock private PageService pageService;
  @Mock private PageCacheService pageCacheService;
  @Mock private Page page;
  @Mock private ComicBook comicBook;
  @Mock private FileTypeAdaptor fileTypeAdaptor;
  @Mock private ComicBookAdaptor comicBookAdaptor;
  @Mock private List<Long> idList;

  @Captor private ArgumentCaptor<InputStream> inputStream;

  private ArchiveType archiveType = ArchiveType.CB7;

  @Before
  public void setUp() {
    Mockito.when(page.getHash()).thenReturn(TEST_PAGE_HASH);
  }

  @Test
  public void testGetPageForHashNoPageFound() throws PageException, AdaptorException {
    Mockito.when(pageService.getOneForHash(Mockito.anyString())).thenReturn(null);

    final ResponseEntity<byte[]> result = controller.getPageForHash(TEST_PAGE_HASH);

    assertNull(result);

    Mockito.verify(pageService, Mockito.times(1)).getOneForHash(TEST_PAGE_HASH);
  }

  @Test(expected = PageException.class)
  public void testGetPageForHashLoadPageContentThrowsException()
      throws PageException, AdaptorException {
    Mockito.when(pageService.getOneForHash(Mockito.anyString())).thenReturn(page);
    Mockito.when(pageCacheService.findByHash(Mockito.anyString())).thenReturn(null);
    Mockito.when(page.getComicBook()).thenReturn(comicBook);
    Mockito.when(page.getPageNumber()).thenReturn(TEST_PAGE_INDEX);
    Mockito.when(comicBookAdaptor.loadPageContent(Mockito.any(ComicBook.class), Mockito.anyInt()))
        .thenThrow(AdaptorException.class);

    try {
      controller.getPageForHash(TEST_PAGE_HASH);
    } finally {
      Mockito.verify(pageCacheService, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
      Mockito.verify(comicBookAdaptor, Mockito.times(1))
          .loadPageContent(comicBook, TEST_PAGE_INDEX);
    }
  }

  @Test
  public void testGetPageForHashSaveCacheThrowsException()
      throws PageException, AdaptorException, IOException {
    Mockito.when(pageService.getOneForHash(Mockito.anyString())).thenReturn(page);
    Mockito.when(pageCacheService.findByHash(Mockito.anyString())).thenReturn(null);
    Mockito.when(page.getComicBook()).thenReturn(comicBook);
    Mockito.when(page.getPageNumber()).thenReturn(TEST_PAGE_INDEX);
    Mockito.when(comicBookAdaptor.loadPageContent(Mockito.any(ComicBook.class), Mockito.anyInt()))
        .thenReturn(TEST_PAGE_CONTENT);
    Mockito.doThrow(IOException.class)
        .when(pageCacheService)
        .saveByHash(Mockito.anyString(), Mockito.any(byte[].class));
    Mockito.when(fileTypeAdaptor.getType(inputStream.capture())).thenReturn(TEST_PAGE_CONTENT_TYPE);
    Mockito.when(fileTypeAdaptor.getSubtype(inputStream.capture()))
        .thenReturn(TEST_PAGE_CONTENT_SUBTYPE);

    ResponseEntity<byte[]> result = controller.getPageForHash(TEST_PAGE_HASH);

    assertNotNull(result);
    assertSame(TEST_PAGE_CONTENT, result.getBody());

    Mockito.verify(pageCacheService, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(comicBookAdaptor, Mockito.times(1)).loadPageContent(comicBook, TEST_PAGE_INDEX);
    Mockito.verify(pageCacheService, Mockito.times(1))
        .saveByHash(TEST_PAGE_HASH, TEST_PAGE_CONTENT);
    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getType(inputStream.getAllValues().get(0));
    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getSubtype(inputStream.getAllValues().get(1));
  }

  @Test
  public void testGetPageForHash() throws ComicBookException, PageException, AdaptorException {
    Mockito.when(pageService.getOneForHash(Mockito.anyString())).thenReturn(page);
    Mockito.when(pageCacheService.findByHash(Mockito.anyString())).thenReturn(null);
    Mockito.when(page.getComicBook()).thenReturn(comicBook);
    Mockito.when(page.getPageNumber()).thenReturn(TEST_PAGE_INDEX);
    Mockito.when(comicBookAdaptor.loadPageContent(Mockito.any(ComicBook.class), Mockito.anyInt()))
        .thenReturn(TEST_PAGE_CONTENT);
    Mockito.when(fileTypeAdaptor.getType(inputStream.capture())).thenReturn(TEST_PAGE_CONTENT_TYPE);
    Mockito.when(fileTypeAdaptor.getSubtype(inputStream.capture()))
        .thenReturn(TEST_PAGE_CONTENT_SUBTYPE);

    ResponseEntity<byte[]> result = controller.getPageForHash(TEST_PAGE_HASH);

    assertNotNull(result);
    assertSame(TEST_PAGE_CONTENT, result.getBody());

    Mockito.verify(pageService, Mockito.times(1)).getOneForHash(TEST_PAGE_HASH);
    Mockito.verify(pageCacheService, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(comicBookAdaptor, Mockito.times(1)).loadPageContent(comicBook, TEST_PAGE_INDEX);
    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getType(inputStream.getAllValues().get(0));
    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getSubtype(inputStream.getAllValues().get(1));
  }

  @Test(expected = PageException.class)
  public void testGetPageContentLoadPageContentThrowsException()
      throws PageException, AdaptorException {
    Mockito.when(pageService.getForId(Mockito.anyLong())).thenReturn(page);
    Mockito.when(pageCacheService.findByHash(Mockito.anyString())).thenReturn(null);
    Mockito.when(page.getComicBook()).thenReturn(comicBook);
    Mockito.when(page.getPageNumber()).thenReturn(TEST_PAGE_INDEX);
    Mockito.when(comicBookAdaptor.loadPageContent(Mockito.any(ComicBook.class), Mockito.anyInt()))
        .thenThrow(AdaptorException.class);

    try {
      controller.getPageContent(TEST_PAGE_ID);
    } finally {
      Mockito.verify(pageService, Mockito.times(1)).getForId(TEST_PAGE_ID);
      Mockito.verify(pageCacheService, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
      Mockito.verify(comicBookAdaptor, Mockito.times(1))
          .loadPageContent(comicBook, TEST_PAGE_INDEX);
    }
  }

  @Test
  public void testGetPageContentSaveCacheThrowsException()
      throws PageException, AdaptorException, IOException {
    Mockito.when(pageService.getForId(Mockito.anyLong())).thenReturn(page);
    Mockito.when(pageCacheService.findByHash(Mockito.anyString())).thenReturn(null);
    Mockito.when(page.getComicBook()).thenReturn(comicBook);
    Mockito.when(page.getPageNumber()).thenReturn(TEST_PAGE_INDEX);
    Mockito.when(comicBookAdaptor.loadPageContent(Mockito.any(ComicBook.class), Mockito.anyInt()))
        .thenReturn(TEST_PAGE_CONTENT);
    Mockito.doThrow(IOException.class)
        .when(pageCacheService)
        .saveByHash(Mockito.anyString(), Mockito.any(byte[].class));
    Mockito.when(fileTypeAdaptor.getType(inputStream.capture())).thenReturn(TEST_PAGE_CONTENT_TYPE);
    Mockito.when(fileTypeAdaptor.getSubtype(inputStream.capture()))
        .thenReturn(TEST_PAGE_CONTENT_SUBTYPE);

    ResponseEntity<byte[]> result = controller.getPageContent(TEST_PAGE_ID);

    assertNotNull(result);
    assertSame(TEST_PAGE_CONTENT, result.getBody());

    Mockito.verify(pageService, Mockito.times(1)).getForId(TEST_PAGE_ID);
    Mockito.verify(pageCacheService, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(comicBookAdaptor, Mockito.times(1)).loadPageContent(comicBook, TEST_PAGE_INDEX);
    Mockito.verify(pageCacheService, Mockito.times(1))
        .saveByHash(TEST_PAGE_HASH, TEST_PAGE_CONTENT);
    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getType(inputStream.getAllValues().get(0));
    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getSubtype(inputStream.getAllValues().get(1));
  }

  @Test
  public void testGetPageContent() throws ComicBookException, PageException, AdaptorException {
    Mockito.when(pageService.getForId(Mockito.anyLong())).thenReturn(page);
    Mockito.when(pageCacheService.findByHash(Mockito.anyString())).thenReturn(null);
    Mockito.when(page.getComicBook()).thenReturn(comicBook);
    Mockito.when(page.getPageNumber()).thenReturn(TEST_PAGE_INDEX);
    Mockito.when(comicBookAdaptor.loadPageContent(Mockito.any(ComicBook.class), Mockito.anyInt()))
        .thenReturn(TEST_PAGE_CONTENT);
    Mockito.when(fileTypeAdaptor.getType(inputStream.capture())).thenReturn(TEST_PAGE_CONTENT_TYPE);
    Mockito.when(fileTypeAdaptor.getSubtype(inputStream.capture()))
        .thenReturn(TEST_PAGE_CONTENT_SUBTYPE);

    ResponseEntity<byte[]> result = controller.getPageContent(TEST_PAGE_ID);

    assertNotNull(result);
    assertSame(TEST_PAGE_CONTENT, result.getBody());

    Mockito.verify(pageService, Mockito.times(1)).getForId(TEST_PAGE_ID);
    Mockito.verify(pageCacheService, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(comicBookAdaptor, Mockito.times(1)).loadPageContent(comicBook, TEST_PAGE_INDEX);
    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getType(inputStream.getAllValues().get(0));
    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getSubtype(inputStream.getAllValues().get(1));
  }

  @Test
  public void testUpdatePageDeletionMarkDeleted() {
    controller.markPagesForDeletion(new UpdatePageDeletionRequest(idList));

    Mockito.verify(pageService, Mockito.times(1)).updatePageDeletion(idList, true);
  }

  @Test
  public void testUpdatePageDeletionUnmarkDeleted() {
    controller.unmarkPagesForDeletion(new UpdatePageDeletionRequest(idList));

    Mockito.verify(pageService, Mockito.times(1)).updatePageDeletion(idList, false);
  }
}

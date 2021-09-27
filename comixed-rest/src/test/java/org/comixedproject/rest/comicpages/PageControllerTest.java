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

package org.comixedproject.rest.comicpages;

import static org.junit.Assert.*;

import java.io.InputStream;
import java.util.List;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.adaptors.handlers.ComicFileHandler;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicpages.Page;
import org.comixedproject.service.comicbooks.ComicException;
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
  private static final String TEST_PAGE_FILENAME = "page01.jpg";

  @InjectMocks private PageController controller;
  @Mock private PageService pageService;
  @Mock private PageCacheService pageCacheService;
  @Mock private Page page;
  @Mock private List<Page> pageList;
  @Mock private Comic comic;
  @Mock private FileTypeAdaptor fileTypeAdaptor;
  @Mock private ComicFileHandler comicFileHandler;
  @Mock private ArchiveAdaptor archiveAdaptor;

  @Captor private ArgumentCaptor<InputStream> inputStream;

  private ArchiveType archiveType = ArchiveType.CB7;

  @Before
  public void setUp() {
    Mockito.when(page.getHash()).thenReturn(TEST_PAGE_HASH);
  }

  @Test
  public void testGetPageContent() throws ComicException, ArchiveAdaptorException, PageException {
    Mockito.when(pageService.getForId(Mockito.anyLong())).thenReturn(page);
    Mockito.when(pageCacheService.findByHash(Mockito.anyString())).thenReturn(null);
    Mockito.when(page.getComic()).thenReturn(comic);
    Mockito.when(comic.getArchiveType()).thenReturn(archiveType);
    Mockito.when(comicFileHandler.getArchiveAdaptorFor(Mockito.any(ArchiveType.class)))
        .thenReturn(archiveAdaptor);
    Mockito.when(page.getFilename()).thenReturn(TEST_PAGE_FILENAME);
    Mockito.when(archiveAdaptor.loadSingleFile(Mockito.any(Comic.class), Mockito.anyString()))
        .thenReturn(TEST_PAGE_CONTENT);
    Mockito.when(fileTypeAdaptor.typeFor(inputStream.capture())).thenReturn(TEST_PAGE_CONTENT_TYPE);
    Mockito.when(fileTypeAdaptor.subtypeFor(inputStream.capture()))
        .thenReturn(TEST_PAGE_CONTENT_SUBTYPE);

    ResponseEntity<byte[]> result = controller.getPageContent(TEST_PAGE_ID);

    assertNotNull(result);
    assertSame(TEST_PAGE_CONTENT, result.getBody());

    Mockito.verify(pageService, Mockito.times(1)).getForId(TEST_PAGE_ID);
    Mockito.verify(pageCacheService, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).typeFor(inputStream.getAllValues().get(0));
    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).subtypeFor(inputStream.getAllValues().get(1));
  }

  @Test
  public void testDeletePageInvalidId() throws PageException {
    Mockito.when(pageService.deletePage(Mockito.anyLong())).thenReturn(null);

    final Comic result = controller.deletePage(TEST_PAGE_ID);

    assertNull(result);

    Mockito.verify(pageService, Mockito.times(1)).deletePage(TEST_PAGE_ID);
  }

  @Test
  public void testDeletePage() throws PageException {
    Mockito.when(pageService.deletePage(Mockito.anyLong())).thenReturn(comic);

    final Comic result = controller.deletePage(TEST_PAGE_ID);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(pageService, Mockito.times(1)).deletePage(TEST_PAGE_ID);
  }

  @Test
  public void testUndeletePageForNonexistentPage() throws PageException {
    Mockito.when(pageService.undeletePage(Mockito.anyLong())).thenReturn(null);

    final Comic result = controller.undeletePage(TEST_PAGE_ID);

    assertNull(result);

    Mockito.verify(pageService, Mockito.times(1)).undeletePage(TEST_PAGE_ID);
  }

  @Test
  public void testUndeletePage() throws PageException {
    Mockito.when(pageService.undeletePage(Mockito.anyLong())).thenReturn(comic);

    final Comic result = controller.undeletePage(TEST_PAGE_ID);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(pageService, Mockito.times(1)).undeletePage(TEST_PAGE_ID);
  }

  @Test
  public void testGetPageInComicWithIndexNonexistentComic() throws ComicException {
    Mockito.when(pageService.getPageInComicByIndex(Mockito.anyLong(), Mockito.anyInt()))
        .thenReturn(null);

    assertNull(controller.getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX));

    Mockito.verify(pageService, Mockito.times(1))
        .getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX);
  }

  @Test
  public void testGetPageInComicWithInvalidIndex() throws ComicException {
    Mockito.when(pageService.getPageInComicByIndex(Mockito.anyLong(), Mockito.anyInt()))
        .thenReturn(null);

    assertNull(controller.getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX));

    Mockito.verify(pageService, Mockito.times(1))
        .getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX);
  }

  @Test
  public void testGetPageInComic() throws ComicException {
    Mockito.when(pageService.getPageInComicByIndex(Mockito.anyLong(), Mockito.anyInt()))
        .thenReturn(page);

    Page result = controller.getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX);

    assertNotNull(result);
    assertSame(page, result);

    Mockito.verify(pageService, Mockito.times(1))
        .getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX);
  }
}

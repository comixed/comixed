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

import static org.junit.Assert.*;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicpages.Page;
import org.comixedproject.model.net.comicbooks.*;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.comicfiles.ComicFileService;
import org.comixedproject.service.comicpages.PageCacheService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ComicBookControllerTest {
  private static final long TEST_COMIC_ID = 129;
  private static final String TEST_COMIC_FILE = "src/test/resources/example.cbz";
  private static final byte[] TEST_COMIC_CONTENT = "This is the comicBook content.".getBytes();
  private static final byte[] TEST_PAGE_CONTENT = new byte[53253];
  private static final String TEST_PAGE_CONTENT_TYPE = "application";
  private static final String TEST_PAGE_CONTENT_SUBTYPE = "image";
  private static final String TEST_PAGE_FILENAME = "cover.jpg";
  private static final String TEST_PAGE_HASH = "1234567890ABCDEF1234567890ABCDEF";

  @InjectMocks private ComicBookController controller;
  @Mock private ComicBookService comicBookService;
  @Mock private PageCacheService pageCacheService;
  @Mock private ComicBook comicBook;
  @Mock private ComicDetail comicDetail;
  @Mock private List<Long> comicIds;
  @Mock private ComicFileService comicFileService;
  @Mock private FileTypeAdaptor fileTypeAdaptor;
  @Mock private Page page;
  @Mock private ComicBookAdaptor comicBookAdaptor;
  @Mock private List<PageOrderEntry> pageOrderEntrylist;

  @Captor private ArgumentCaptor<InputStream> inputStreamCaptor;

  @Before
  public void setUp() {
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
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
  public void testDeleteComic() throws ComicBookException {
    Mockito.when(comicBookService.deleteComic(Mockito.anyLong())).thenReturn(comicBook);

    final ComicBook result = controller.deleteComic(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookService, Mockito.times(1)).deleteComic(TEST_COMIC_ID);
  }

  @Test(expected = ComicBookException.class)
  public void testDeleteComicFails() throws ComicBookException {
    Mockito.when(comicBookService.deleteComic(Mockito.anyLong()))
        .thenThrow(ComicBookException.class);

    try {
      controller.deleteComic(TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicBookService, Mockito.times(1)).deleteComic(TEST_COMIC_ID);
    }
  }

  @Test
  public void testMarkComicsDeleted() {
    Mockito.doNothing().when(comicBookService).deleteComics(comicIds);

    controller.markComicsDeleted(new MarkComicsDeletedRequest(this.comicIds));

    Mockito.verify(comicBookService, Mockito.times(1)).deleteComics(this.comicIds);
  }

  @Test
  public void testMarkComicsUndeleted() throws Exception {
    Mockito.doNothing().when(comicBookService).undeleteComics(comicIds);

    controller.markComicsUndeleted(new MarkComicsUndeletedRequest(comicIds));

    Mockito.verify(comicBookService, Mockito.times(1)).undeleteComics(comicIds);
  }

  @Test
  public void testDownloadComicForNonexistentComic() throws IOException, ComicBookException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(null);

    assertNull(controller.downloadComic(TEST_COMIC_ID));

    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
  }

  @Test
  public void testDownloadComicFileDoesNotExist() throws IOException, ComicBookException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(comicBookService.getComicContent(Mockito.any(ComicBook.class))).thenReturn(null);

    assertNull(controller.downloadComic(TEST_COMIC_ID));

    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(comicBookService, Mockito.times(1)).getComicContent(comicBook);
  }

  @Test
  public void testDownloadComic() throws IOException, ComicBookException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(comicBookService.getComicContent(Mockito.any(ComicBook.class)))
        .thenReturn(TEST_COMIC_CONTENT);
    Mockito.when(comicBook.getFilename()).thenReturn(TEST_COMIC_FILE);
    Mockito.when(comicDetail.getArchiveType()).thenReturn(ArchiveType.CBZ);

    ResponseEntity<InputStreamResource> result = controller.downloadComic(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(HttpStatus.OK, result.getStatusCode());
    assertTrue(result.getBody().contentLength() > 0);
    assertEquals(ArchiveType.CBZ.getMimeType(), result.getHeaders().getContentType().toString());

    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(comicBookService, Mockito.times(1)).getComicContent(comicBook);
    Mockito.verify(comicBook, Mockito.atLeast(1)).getFilename();
    Mockito.verify(comicDetail, Mockito.times(1)).getArchiveType();
  }

  @Test
  public void testDownloadComicNonexistent() throws IOException, ComicBookException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(null);

    ResponseEntity<InputStreamResource> result = controller.downloadComic(TEST_COMIC_ID);

    assertNull(result);

    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
  }

  @Test
  public void testDownloadComicFileNotFound() throws IOException, ComicBookException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(comicBookService.getComicContent(Mockito.any(ComicBook.class))).thenReturn(null);

    ResponseEntity<InputStreamResource> result = controller.downloadComic(TEST_COMIC_ID);

    assertNull(result);

    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(comicBookService, Mockito.times(1)).getComicContent(comicBook);
  }

  @Test(expected = ComicBookException.class)
  public void testGetCoverImageForInvalidComic()
      throws ComicBookException, IOException, AdaptorException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenThrow(ComicBookException.class);

    try {
      controller.getCoverImage(TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    }
  }

  @Test(expected = ComicBookException.class)
  public void testGetCoverImageForMissingComic()
      throws ComicBookException, IOException, AdaptorException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(comicBook.isMissing()).thenReturn(true);

    try {
      controller.getCoverImage(TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
      Mockito.verify(comicBook, Mockito.times(1)).isMissing();
    }
  }

  @Test
  public void testGetCachedCoverImageForUnprocessedComic()
      throws ComicBookException, IOException, AdaptorException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(comicBook.isMissing()).thenReturn(false);
    Mockito.when(comicBook.getPageCount()).thenReturn(0);
    Mockito.when(comicBook.getFilename()).thenReturn(TEST_COMIC_FILE);
    Mockito.when(comicFileService.getImportFileCover(Mockito.anyString()))
        .thenReturn(TEST_PAGE_CONTENT);
    Mockito.when(fileTypeAdaptor.getType(inputStreamCaptor.capture()))
        .thenReturn(TEST_PAGE_CONTENT_TYPE);
    Mockito.when(fileTypeAdaptor.getSubtype(inputStreamCaptor.capture()))
        .thenReturn(TEST_PAGE_CONTENT_SUBTYPE);

    final ResponseEntity<byte[]> result = controller.getCoverImage(TEST_COMIC_ID);

    assertNotNull(result);
    assertEquals(TEST_PAGE_CONTENT, result.getBody());

    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(comicBook, Mockito.times(1)).isMissing();
    Mockito.verify(comicFileService, Mockito.times(1)).getImportFileCover(TEST_COMIC_FILE);
    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getType(inputStreamCaptor.getValue());
    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getSubtype(inputStreamCaptor.getValue());
  }

  @Test
  public void testGetCoverImageForProcessedComic()
      throws ComicBookException, ArchiveAdaptorException, IOException, AdaptorException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(comicBook.isMissing()).thenReturn(false);
    Mockito.when(comicBook.getPageCount()).thenReturn(5);
    Mockito.when(comicBook.getPage(Mockito.anyInt())).thenReturn(page);
    Mockito.when(page.getHash()).thenReturn(TEST_PAGE_HASH);
    Mockito.when(pageCacheService.findByHash(Mockito.anyString())).thenReturn(null);
    Mockito.when(comicBookAdaptor.loadPageContent(Mockito.any(ComicBook.class), Mockito.anyInt()))
        .thenReturn(TEST_PAGE_CONTENT);
    Mockito.doNothing()
        .when(pageCacheService)
        .saveByHash(Mockito.anyString(), Mockito.any(byte[].class));
    Mockito.when(page.getFilename()).thenReturn(TEST_PAGE_FILENAME);
    Mockito.when(fileTypeAdaptor.getType(inputStreamCaptor.capture()))
        .thenReturn(TEST_PAGE_CONTENT_TYPE);
    Mockito.when(fileTypeAdaptor.getSubtype(inputStreamCaptor.capture()))
        .thenReturn(TEST_PAGE_CONTENT_SUBTYPE);

    final ResponseEntity<byte[]> result = controller.getCoverImage(TEST_COMIC_ID);

    assertNotNull(result);
    assertEquals(TEST_PAGE_CONTENT, result.getBody());

    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(comicBook, Mockito.times(1)).isMissing();
    Mockito.verify(page, Mockito.times(1)).getFilename();
    Mockito.verify(comicBookAdaptor, Mockito.times(1)).loadPageContent(comicBook, 0);
    Mockito.verify(pageCacheService, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(pageCacheService, Mockito.times(1))
        .saveByHash(TEST_PAGE_HASH, TEST_PAGE_CONTENT);
    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getType(inputStreamCaptor.getValue());
    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getSubtype(inputStreamCaptor.getValue());
  }

  @Test
  public void testGetCachedCoverImageForProcessedComic()
      throws ComicBookException, IOException, AdaptorException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(comicBook.isMissing()).thenReturn(false);
    Mockito.when(comicBook.getPageCount()).thenReturn(5);
    Mockito.when(comicBook.getPage(Mockito.anyInt())).thenReturn(page);
    Mockito.when(page.getHash()).thenReturn(TEST_PAGE_HASH);
    Mockito.when(pageCacheService.findByHash(Mockito.anyString())).thenReturn(TEST_PAGE_CONTENT);
    Mockito.when(page.getFilename()).thenReturn(TEST_PAGE_FILENAME);
    Mockito.when(fileTypeAdaptor.getType(inputStreamCaptor.capture()))
        .thenReturn(TEST_PAGE_CONTENT_TYPE);
    Mockito.when(fileTypeAdaptor.getSubtype(inputStreamCaptor.capture()))
        .thenReturn(TEST_PAGE_CONTENT_SUBTYPE);

    final ResponseEntity<byte[]> result = controller.getCoverImage(TEST_COMIC_ID);

    assertNotNull(result);
    assertEquals(TEST_PAGE_CONTENT, result.getBody());

    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(comicBook, Mockito.times(1)).isMissing();
    Mockito.verify(page, Mockito.times(1)).getFilename();
    Mockito.verify(pageCacheService, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getType(inputStreamCaptor.getValue());
    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getSubtype(inputStreamCaptor.getValue());
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

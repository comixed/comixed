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

import static org.junit.Assert.*;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicpages.Page;
import org.comixedproject.model.net.comicbooks.*;
import org.comixedproject.service.comicbooks.ComicException;
import org.comixedproject.service.comicbooks.ComicService;
import org.comixedproject.service.comicfiles.ComicFileService;
import org.comixedproject.service.comicpages.PageCacheService;
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
public class ComicControllerTest {
  private static final long TEST_COMIC_ID = 129;
  private static final String TEST_COMIC_FILE = "src/test/resources/example.cbz";
  private static final byte[] TEST_COMIC_CONTENT = "This is the comic content.".getBytes();
  private static final byte[] TEST_PAGE_CONTENT = new byte[53253];
  private static final String TEST_PAGE_CONTENT_TYPE = "application";
  private static final String TEST_PAGE_CONTENT_SUBTYPE = "image";
  private static final String TEST_PAGE_FILENAME = "cover.jpg";
  private static final String TEST_PAGE_HASH = "1234567890ABCDEF1234567890ABCDEF";

  @InjectMocks private ComicController controller;
  @Mock private ComicService comicService;
  @Mock private PageCacheService pageCacheService;
  @Mock private Comic comic;
  @Mock private List<Long> comicIds;
  @Mock private ComicFileService comicFileService;
  @Mock private FileTypeAdaptor fileTypeAdaptor;
  @Mock private Page page;
  @Mock private ComicBookAdaptor comicBookAdaptor;
  @Mock private List<PageOrderEntry> pageOrderEntrylist;

  @Captor private ArgumentCaptor<InputStream> inputStreamCaptor;

  @Test
  public void testGetComicForNonexistentComic() throws ComicException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(null);

    Comic result = controller.getComic(TEST_COMIC_ID);

    assertNull(result);

    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
  }

  @Test
  public void testGetComic() throws ComicException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);

    Comic result = controller.getComic(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
  }

  @Test
  public void testUpdateComic() throws ComicException {
    Mockito.when(comicService.updateComic(Mockito.anyLong(), Mockito.any(Comic.class)))
        .thenReturn(comic);

    final Comic result = controller.updateComic(TEST_COMIC_ID, comic);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(comicService, Mockito.times(1)).updateComic(TEST_COMIC_ID, comic);
  }

  @Test
  public void testDeleteComic() throws ComicException {
    Mockito.when(comicService.deleteComic(Mockito.anyLong())).thenReturn(comic);

    final Comic result = controller.deleteComic(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(comicService, Mockito.times(1)).deleteComic(TEST_COMIC_ID);
  }

  @Test(expected = ComicException.class)
  public void testDeleteComicFails() throws ComicException {
    Mockito.when(comicService.deleteComic(Mockito.anyLong())).thenThrow(ComicException.class);

    try {
      controller.deleteComic(TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicService, Mockito.times(1)).deleteComic(TEST_COMIC_ID);
    }
  }

  @Test
  public void testMarkComicsDeleted() {
    Mockito.doNothing().when(comicService).deleteComics(comicIds);

    controller.markComicsDeleted(new MarkComicsDeletedRequest(this.comicIds));

    Mockito.verify(comicService, Mockito.times(1)).deleteComics(this.comicIds);
  }

  @Test
  public void testMarkComicsUndeleted() throws Exception {
    Mockito.doNothing().when(comicService).undeleteComics(comicIds);

    controller.markComicsUndeleted(new MarkComicsUndeletedRequest(comicIds));

    Mockito.verify(comicService, Mockito.times(1)).undeleteComics(comicIds);
  }

  @Test
  public void testDownloadComicForNonexistentComic() throws IOException, ComicException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(null);

    assertNull(controller.downloadComic(TEST_COMIC_ID));

    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
  }

  @Test
  public void testDownloadComicFileDoesNotExist() throws IOException, ComicException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(comicService.getComicContent(Mockito.any(Comic.class))).thenReturn(null);

    assertNull(controller.downloadComic(TEST_COMIC_ID));

    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(comicService, Mockito.times(1)).getComicContent(comic);
  }

  @Test
  public void testDownloadComic() throws IOException, ComicException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(comicService.getComicContent(Mockito.any(Comic.class)))
        .thenReturn(TEST_COMIC_CONTENT);
    Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILE);
    Mockito.when(comic.getArchiveType()).thenReturn(ArchiveType.CBZ);

    ResponseEntity<InputStreamResource> result = controller.downloadComic(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(HttpStatus.OK, result.getStatusCode());
    assertTrue(result.getBody().contentLength() > 0);
    assertEquals(ArchiveType.CBZ.getMimeType(), result.getHeaders().getContentType().toString());

    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(comicService, Mockito.times(1)).getComicContent(comic);
    Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
    Mockito.verify(comic, Mockito.times(1)).getArchiveType();
  }

  @Test
  public void testDownloadComicNonexistent() throws IOException, ComicException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(null);

    ResponseEntity<InputStreamResource> result = controller.downloadComic(TEST_COMIC_ID);

    assertNull(result);

    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
  }

  @Test
  public void testDownloadComicFileNotFound() throws IOException, ComicException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(comicService.getComicContent(Mockito.any(Comic.class))).thenReturn(null);

    ResponseEntity<InputStreamResource> result = controller.downloadComic(TEST_COMIC_ID);

    assertNull(result);

    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(comicService, Mockito.times(1)).getComicContent(comic);
  }

  @Test(expected = ComicException.class)
  public void testGetCoverImageForInvalidComic()
      throws ComicException, IOException, AdaptorException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenThrow(ComicException.class);

    try {
      controller.getCoverImage(TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    }
  }

  @Test(expected = ComicException.class)
  public void testGetCoverImageForMissingComic()
      throws ComicException, IOException, AdaptorException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(comic.isMissing()).thenReturn(true);

    try {
      controller.getCoverImage(TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
      Mockito.verify(comic, Mockito.times(1)).isMissing();
    }
  }

  @Test
  public void testGetCachedCoverImageForUnprocessedComic()
      throws ComicException, IOException, AdaptorException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(comic.isMissing()).thenReturn(false);
    Mockito.when(comic.getPageCount()).thenReturn(0);
    Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILE);
    Mockito.when(comicFileService.getImportFileCover(Mockito.anyString()))
        .thenReturn(TEST_PAGE_CONTENT);
    Mockito.when(fileTypeAdaptor.getType(inputStreamCaptor.capture()))
        .thenReturn(TEST_PAGE_CONTENT_TYPE);
    Mockito.when(fileTypeAdaptor.getSubtype(inputStreamCaptor.capture()))
        .thenReturn(TEST_PAGE_CONTENT_SUBTYPE);

    final ResponseEntity<byte[]> result = controller.getCoverImage(TEST_COMIC_ID);

    assertNotNull(result);
    assertEquals(TEST_PAGE_CONTENT, result.getBody());

    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(comic, Mockito.times(1)).isMissing();
    Mockito.verify(comicFileService, Mockito.times(1)).getImportFileCover(TEST_COMIC_FILE);
    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getType(inputStreamCaptor.getValue());
    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getSubtype(inputStreamCaptor.getValue());
  }

  @Test
  public void testGetCoverImageForProcessedComic()
      throws ComicException, ArchiveAdaptorException, IOException, AdaptorException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(comic.isMissing()).thenReturn(false);
    Mockito.when(comic.getPageCount()).thenReturn(5);
    Mockito.when(comic.getPage(Mockito.anyInt())).thenReturn(page);
    Mockito.when(page.getHash()).thenReturn(TEST_PAGE_HASH);
    Mockito.when(pageCacheService.findByHash(Mockito.anyString())).thenReturn(null);
    Mockito.when(comicBookAdaptor.loadPageContent(Mockito.any(Comic.class), Mockito.anyInt()))
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

    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(comic, Mockito.times(1)).isMissing();
    Mockito.verify(page, Mockito.times(1)).getFilename();
    Mockito.verify(comicBookAdaptor, Mockito.times(1)).loadPageContent(comic, 0);
    Mockito.verify(pageCacheService, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(pageCacheService, Mockito.times(1))
        .saveByHash(TEST_PAGE_HASH, TEST_PAGE_CONTENT);
    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getType(inputStreamCaptor.getValue());
    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getSubtype(inputStreamCaptor.getValue());
  }

  @Test
  public void testGetCachedCoverImageForProcessedComic()
      throws ComicException, IOException, AdaptorException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(comic.isMissing()).thenReturn(false);
    Mockito.when(comic.getPageCount()).thenReturn(5);
    Mockito.when(comic.getPage(Mockito.anyInt())).thenReturn(page);
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

    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(comic, Mockito.times(1)).isMissing();
    Mockito.verify(page, Mockito.times(1)).getFilename();
    Mockito.verify(pageCacheService, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getType(inputStreamCaptor.getValue());
    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getSubtype(inputStreamCaptor.getValue());
  }

  @Test
  public void testDeleteMetadata() throws ComicException {
    Mockito.when(comicService.deleteMetadata(Mockito.anyLong())).thenReturn(comic);

    final Comic result = controller.deleteMetadata(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(comicService, Mockito.times(1)).deleteMetadata(TEST_COMIC_ID);
  }

  @Test(expected = ComicException.class)
  public void testSavePageOrderServiceException() throws ComicException {
    Mockito.doThrow(ComicException.class)
        .when(comicService)
        .savePageOrder(Mockito.anyLong(), Mockito.anyList());

    try {
      controller.savePageOrder(TEST_COMIC_ID, new SavePageOrderRequest(pageOrderEntrylist));
    } finally {
      Mockito.verify(comicService, Mockito.times(1))
          .savePageOrder(TEST_COMIC_ID, pageOrderEntrylist);
    }
  }

  @Test
  public void testSavePageOrder() throws ComicException {
    controller.savePageOrder(TEST_COMIC_ID, new SavePageOrderRequest(pageOrderEntrylist));

    Mockito.verify(comicService, Mockito.times(1)).savePageOrder(TEST_COMIC_ID, pageOrderEntrylist);
  }
}

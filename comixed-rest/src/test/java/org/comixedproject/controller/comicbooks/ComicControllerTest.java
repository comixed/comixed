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

package org.comixedproject.controller.comicbooks;

import static org.junit.Assert.*;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.adaptors.handlers.ComicFileHandler;
import org.comixedproject.adaptors.handlers.ComicFileHandlerException;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.Page;
import org.comixedproject.model.net.comicbooks.MarkComicsDeletedRequest;
import org.comixedproject.model.net.comicbooks.MarkComicsUndeletedRequest;
import org.comixedproject.service.comicbooks.ComicException;
import org.comixedproject.service.comicbooks.ComicService;
import org.comixedproject.service.comicbooks.PageCacheService;
import org.comixedproject.service.comicfiles.ComicFileService;
import org.comixedproject.task.MarkComicsForRemovalTask;
import org.comixedproject.task.UnmarkComicsForRemovalTask;
import org.comixedproject.task.runner.TaskManager;
import org.comixedproject.utils.FileTypeIdentifier;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;
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
  @Mock private TaskManager taskManager;
  @Mock private Comic comic;
  @Mock private ObjectFactory<MarkComicsForRemovalTask> deleteComicsTaskFactory;
  @Mock private MarkComicsForRemovalTask markComicsForRemovalTask;
  @Mock private ObjectFactory<UnmarkComicsForRemovalTask> undeleteComicsWorkerTaskObjectFactory;
  @Mock private UnmarkComicsForRemovalTask undeleteComicsWorkerTask;
  @Mock private List<Long> comicIds;
  @Mock private ComicFileService comicFileService;
  @Mock private FileTypeIdentifier fileTypeIdentifier;
  @Mock private Page page;
  @Mock private ComicFileHandler comicFileHandler;
  @Mock private ArchiveAdaptor archiveAdaptor;

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

  @Test(expected = ComicException.class)
  public void testRestoreComicFails() throws ComicException {
    Mockito.when(comicService.restoreComic(Mockito.anyLong())).thenThrow(ComicException.class);

    try {
      controller.restoreComic(TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicService, Mockito.times(1)).restoreComic(TEST_COMIC_ID);
    }
  }

  @Test
  public void testRestoreComic() throws ComicException {
    Mockito.when(comicService.restoreComic(Mockito.anyLong())).thenReturn(comic);

    final Comic response = controller.restoreComic(TEST_COMIC_ID);

    assertNotNull(response);
    assertSame(comic, response);

    Mockito.verify(comicService, Mockito.times(1)).restoreComic(TEST_COMIC_ID);
  }

  @Test
  public void testMarkComicsDeleted() {
    Mockito.when(this.deleteComicsTaskFactory.getObject())
        .thenReturn(this.markComicsForRemovalTask);
    Mockito.doNothing().when(this.markComicsForRemovalTask).setComicIds(Mockito.anyList());
    Mockito.doNothing().when(this.taskManager).runTask(Mockito.any());

    controller.markComicsDeleted(new MarkComicsDeletedRequest(this.comicIds));

    Mockito.verify(this.markComicsForRemovalTask, Mockito.times(1)).setComicIds(this.comicIds);
    Mockito.verify(this.taskManager, Mockito.times(1)).runTask(this.markComicsForRemovalTask);
  }

  @Test
  public void testMarkComicsUndeleted() {
    Mockito.when(this.undeleteComicsWorkerTaskObjectFactory.getObject())
        .thenReturn(undeleteComicsWorkerTask);

    controller.markComicsUndeleted(new MarkComicsUndeletedRequest(this.comicIds));

    Mockito.verify(undeleteComicsWorkerTask, Mockito.times(1)).setIds(this.comicIds);
    Mockito.verify(taskManager, Mockito.times(1)).runTask(undeleteComicsWorkerTask);
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
      throws ComicException, ArchiveAdaptorException, ComicFileHandlerException, IOException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenThrow(ComicException.class);

    try {
      controller.getCoverImage(TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    }
  }

  @Test(expected = ComicException.class)
  public void testGetCoverImageForMissingComic()
      throws ComicException, ArchiveAdaptorException, ComicFileHandlerException, IOException {
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
      throws ComicException, ArchiveAdaptorException, ComicFileHandlerException, IOException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(comic.isMissing()).thenReturn(false);
    Mockito.when(comic.getPageCount()).thenReturn(0);
    Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILE);
    Mockito.when(comicFileService.getImportFileCover(Mockito.anyString()))
        .thenReturn(TEST_PAGE_CONTENT);
    Mockito.when(fileTypeIdentifier.typeFor(inputStreamCaptor.capture()))
        .thenReturn(TEST_PAGE_CONTENT_TYPE);
    Mockito.when(fileTypeIdentifier.subtypeFor(inputStreamCaptor.capture()))
        .thenReturn(TEST_PAGE_CONTENT_SUBTYPE);

    final ResponseEntity<byte[]> result = controller.getCoverImage(TEST_COMIC_ID);

    assertNotNull(result);
    assertEquals(TEST_PAGE_CONTENT, result.getBody());

    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(comic, Mockito.times(1)).isMissing();
    Mockito.verify(comicFileService, Mockito.times(1)).getImportFileCover(TEST_COMIC_FILE);
    Mockito.verify(fileTypeIdentifier, Mockito.times(1)).typeFor(inputStreamCaptor.getValue());
    Mockito.verify(fileTypeIdentifier, Mockito.times(1)).subtypeFor(inputStreamCaptor.getValue());
  }

  @Test
  public void testGetCoverImageForProcessedComic()
      throws ComicException, ArchiveAdaptorException, ComicFileHandlerException, IOException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(comic.isMissing()).thenReturn(false);
    Mockito.when(comic.getPageCount()).thenReturn(5);
    Mockito.when(comic.getPage(Mockito.anyInt())).thenReturn(page);
    Mockito.when(page.getHash()).thenReturn(TEST_PAGE_HASH);
    Mockito.when(pageCacheService.findByHash(Mockito.anyString())).thenReturn(null);
    Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILE);
    Mockito.when(comicFileHandler.getArchiveAdaptorFor(Mockito.anyString()))
        .thenReturn(archiveAdaptor);
    Mockito.when(archiveAdaptor.loadSingleFile(Mockito.any(Comic.class), Mockito.anyString()))
        .thenReturn(TEST_PAGE_CONTENT);
    Mockito.doNothing()
        .when(pageCacheService)
        .saveByHash(Mockito.anyString(), Mockito.any(byte[].class));
    Mockito.when(page.getFilename()).thenReturn(TEST_PAGE_FILENAME);
    Mockito.when(fileTypeIdentifier.typeFor(inputStreamCaptor.capture()))
        .thenReturn(TEST_PAGE_CONTENT_TYPE);
    Mockito.when(fileTypeIdentifier.subtypeFor(inputStreamCaptor.capture()))
        .thenReturn(TEST_PAGE_CONTENT_SUBTYPE);

    final ResponseEntity<byte[]> result = controller.getCoverImage(TEST_COMIC_ID);

    assertNotNull(result);
    assertEquals(TEST_PAGE_CONTENT, result.getBody());

    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(comic, Mockito.times(1)).isMissing();
    Mockito.verify(page, Mockito.times(1)).getFilename();
    Mockito.verify(pageCacheService, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(pageCacheService, Mockito.times(1))
        .saveByHash(TEST_PAGE_HASH, TEST_PAGE_CONTENT);
    Mockito.verify(fileTypeIdentifier, Mockito.times(1)).typeFor(inputStreamCaptor.getValue());
    Mockito.verify(fileTypeIdentifier, Mockito.times(1)).subtypeFor(inputStreamCaptor.getValue());
  }

  @Test
  public void testGetCachedCoverImageForProcessedComic()
      throws ComicException, ArchiveAdaptorException, ComicFileHandlerException, IOException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(comic.isMissing()).thenReturn(false);
    Mockito.when(comic.getPageCount()).thenReturn(5);
    Mockito.when(comic.getPage(Mockito.anyInt())).thenReturn(page);
    Mockito.when(page.getHash()).thenReturn(TEST_PAGE_HASH);
    Mockito.when(pageCacheService.findByHash(Mockito.anyString())).thenReturn(TEST_PAGE_CONTENT);
    Mockito.when(page.getFilename()).thenReturn(TEST_PAGE_FILENAME);
    Mockito.when(fileTypeIdentifier.typeFor(inputStreamCaptor.capture()))
        .thenReturn(TEST_PAGE_CONTENT_TYPE);
    Mockito.when(fileTypeIdentifier.subtypeFor(inputStreamCaptor.capture()))
        .thenReturn(TEST_PAGE_CONTENT_SUBTYPE);

    final ResponseEntity<byte[]> result = controller.getCoverImage(TEST_COMIC_ID);

    assertNotNull(result);
    assertEquals(TEST_PAGE_CONTENT, result.getBody());

    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(comic, Mockito.times(1)).isMissing();
    Mockito.verify(page, Mockito.times(1)).getFilename();
    Mockito.verify(pageCacheService, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
    Mockito.verify(fileTypeIdentifier, Mockito.times(1)).typeFor(inputStreamCaptor.getValue());
    Mockito.verify(fileTypeIdentifier, Mockito.times(1)).subtypeFor(inputStreamCaptor.getValue());
  }

  @Test
  public void testDeleteMetadata() throws ComicException {
    Mockito.when(comicService.deleteMetadata(Mockito.anyLong())).thenReturn(comic);

    final Comic result = controller.deleteMetadata(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(comicService, Mockito.times(1)).deleteMetadata(TEST_COMIC_ID);
  }
}

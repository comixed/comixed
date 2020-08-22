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

package org.comixedproject.controller.comic;

import static org.junit.Assert.*;

import java.io.IOException;
import java.io.InputStream;
import java.security.Principal;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.handlers.ComicFileHandler;
import org.comixedproject.handlers.ComicFileHandlerException;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.Page;
import org.comixedproject.model.net.GetLibraryUpdatesRequest;
import org.comixedproject.model.net.GetLibraryUpdatesResponse;
import org.comixedproject.model.net.UndeleteMultipleComicsRequest;
import org.comixedproject.model.net.UndeleteMultipleComicsResponse;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.model.user.LastReadDate;
import org.comixedproject.repositories.ComiXedUserRepository;
import org.comixedproject.repositories.library.LastReadDatesRepository;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.service.comic.PageCacheService;
import org.comixedproject.service.file.FileService;
import org.comixedproject.task.model.DeleteComicsWorkerTask;
import org.comixedproject.task.model.RescanComicsWorkerTask;
import org.comixedproject.task.model.UndeleteComicsWorkerTask;
import org.comixedproject.task.model.WorkerTask;
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
  private static final int TEST_RESCAN_COUNT = 729;
  private static final String TEST_EMAIL_ADDRESS = "user@testing";
  private static final Long TEST_TIMESTAMP = System.currentTimeMillis();
  private static final int TEST_TIMEOUT = 2;
  private static final byte[] TEST_COMIC_CONTENT = "This is the comic content.".getBytes();
  private static final Integer TEST_MAXIMUM_RESULTS = 100;
  private static final byte[] TEST_PAGE_CONTENT = new byte[53253];
  private static final String TEST_PAGE_CONTENT_TYPE = "application";
  private static final String TEST_PAGE_CONTENT_SUBTYPE = "image";
  private static final String TEST_PAGE_FILENAME = "cover.jpg";
  private static final String TEST_PAGE_HASH = "1234567890ABCDEF1234567890ABCDEF";

  @InjectMocks private ComicController controller;
  @Mock private ComicService comicService;
  @Mock private PageCacheService pageCacheService;
  @Mock private LastReadDatesRepository lastReadRepository;
  @Mock private TaskManager taskManager;
  @Mock private List<Comic> comicList;
  @Mock private Comic comic;
  @Mock private Principal principal;
  @Mock private ComiXedUserRepository userRepository;
  @Mock private ComiXedUser user;
  @Mock private List<LastReadDate> lastReadList;
  @Mock private ObjectFactory<DeleteComicsWorkerTask> deleteComicsTaskFactory;
  @Mock private DeleteComicsWorkerTask deleteComicsTask;
  @Mock private ObjectFactory<UndeleteComicsWorkerTask> undeleteComicsWorkerTaskObjectFactory;
  @Mock private UndeleteComicsWorkerTask undeleteComicsWorkerTask;
  @Mock private List<Long> comicIds;
  @Mock private FileService fileService;
  @Mock private FileTypeIdentifier fileTypeIdentifier;
  @Captor private ArgumentCaptor<InputStream> inputStreamCaptor;
  @Mock private Page page;
  @Mock private LastReadDate lastReadDate;
  @Mock private ComicFileHandler comicFileHandler;
  @Mock private ArchiveAdaptor archiveAdaptor;
  @Mock private ObjectFactory<RescanComicsWorkerTask> rescanComicsWorkerTaskObjectFactory;
  @Mock private RescanComicsWorkerTask rescanComicsWorkerTask;

  private final List<Comic> emptyComicList = new ArrayList<>();

  @Test
  public void testGetComicsAddedSinceWithComicUpdate() throws ParseException, InterruptedException {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL_ADDRESS);
    Mockito.when(comicService.getComicsUpdatedSince(Mockito.anyLong(), Mockito.anyInt()))
        .thenReturn(comicList);
    Mockito.when(comicList.isEmpty()).thenReturn(false);
    Mockito.when(comicService.getLastReadDatesSince(Mockito.anyString(), Mockito.anyLong()))
        .thenReturn(lastReadList);
    Mockito.when(comicService.getProcessingCount()).thenReturn(0L);
    Mockito.when(comicService.getRescanCount()).thenReturn(0);

    final GetLibraryUpdatesResponse result =
        controller.getComicsUpdatedSince(
            principal,
            TEST_TIMESTAMP,
            new GetLibraryUpdatesRequest(TEST_TIMEOUT, TEST_MAXIMUM_RESULTS));

    assertNotNull(result);
    assertSame(comicList, result.getComics());
    assertSame(lastReadList, result.getLastReadDates());
    assertEquals(0, result.getProcessingCount());
    assertEquals(0, result.getRescanCount());

    Mockito.verify(principal, Mockito.times(1)).getName();
    Mockito.verify(comicService, Mockito.atLeast(1))
        .getComicsUpdatedSince(TEST_TIMESTAMP, TEST_MAXIMUM_RESULTS);
    Mockito.verify(comicList, Mockito.atLeast(1)).isEmpty();
    Mockito.verify(comicService, Mockito.atLeast(1)).getProcessingCount();
    Mockito.verify(comicService, Mockito.atLeast(1)).getRescanCount();
  }

  @Test
  public void testGetComicsAddedSinceWithLastReadUpdate()
      throws ParseException, InterruptedException {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL_ADDRESS);
    Mockito.when(comicService.getComicsUpdatedSince(Mockito.anyLong(), Mockito.anyInt()))
        .thenReturn(comicList);
    Mockito.when(comicList.isEmpty()).thenReturn(true);
    Mockito.when(comicService.getLastReadDatesSince(Mockito.anyString(), Mockito.anyLong()))
        .thenReturn(lastReadList);
    Mockito.when(lastReadList.isEmpty()).thenReturn(false);
    Mockito.when(comicService.getProcessingCount()).thenReturn(0L);
    Mockito.when(comicService.getRescanCount()).thenReturn(0);

    final GetLibraryUpdatesResponse result =
        controller.getComicsUpdatedSince(
            principal,
            TEST_TIMESTAMP,
            new GetLibraryUpdatesRequest(TEST_TIMEOUT, TEST_MAXIMUM_RESULTS));

    assertNotNull(result);
    assertSame(comicList, result.getComics());
    assertSame(lastReadList, result.getLastReadDates());
    assertEquals(0, result.getProcessingCount());
    assertEquals(0, result.getRescanCount());

    Mockito.verify(principal, Mockito.times(1)).getName();
    Mockito.verify(comicService, Mockito.atLeast(1))
        .getComicsUpdatedSince(TEST_TIMESTAMP, TEST_MAXIMUM_RESULTS);
    Mockito.verify(comicList, Mockito.atLeast(1)).isEmpty();
    Mockito.verify(comicService, Mockito.atLeast(1))
        .getLastReadDatesSince(TEST_EMAIL_ADDRESS, TEST_TIMESTAMP);
    Mockito.verify(lastReadList, Mockito.atLeast(1)).isEmpty();
    Mockito.verify(comicService, Mockito.atLeast(1)).getProcessingCount();
    Mockito.verify(comicService, Mockito.atLeast(1)).getRescanCount();
  }

  @Test
  public void testGetComicsAddedSinceWithRescans() throws ParseException, InterruptedException {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL_ADDRESS);
    Mockito.when(comicService.getComicsUpdatedSince(Mockito.anyLong(), Mockito.anyInt()))
        .thenReturn(comicList);
    Mockito.when(comicList.isEmpty()).thenReturn(true);
    Mockito.when(comicService.getLastReadDatesSince(Mockito.anyString(), Mockito.anyLong()))
        .thenReturn(lastReadList);
    Mockito.when(lastReadList.isEmpty()).thenReturn(true);
    Mockito.when(comicService.getProcessingCount()).thenReturn(0L);
    Mockito.when(comicService.getRescanCount()).thenReturn(10);

    final GetLibraryUpdatesResponse result =
        controller.getComicsUpdatedSince(
            principal,
            TEST_TIMESTAMP,
            new GetLibraryUpdatesRequest(TEST_TIMEOUT, TEST_MAXIMUM_RESULTS));

    assertNotNull(result);
    assertSame(comicList, result.getComics());
    assertSame(lastReadList, result.getLastReadDates());
    assertEquals(0, result.getProcessingCount());
    assertEquals(10, result.getRescanCount());

    Mockito.verify(principal, Mockito.times(1)).getName();
    Mockito.verify(comicService, Mockito.atLeast(1))
        .getComicsUpdatedSince(TEST_TIMESTAMP, TEST_MAXIMUM_RESULTS);
    Mockito.verify(comicList, Mockito.atLeast(1)).isEmpty();
    Mockito.verify(comicService, Mockito.atLeast(1))
        .getLastReadDatesSince(TEST_EMAIL_ADDRESS, TEST_TIMESTAMP);
    Mockito.verify(lastReadList, Mockito.atLeast(1)).isEmpty();
    Mockito.verify(comicService, Mockito.atLeast(1)).getProcessingCount();
    Mockito.verify(comicService, Mockito.times(1)).getRescanCount();
  }

  @Test
  public void testGetComicsAddedSinceWithImports() throws ParseException, InterruptedException {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL_ADDRESS);
    Mockito.when(comicService.getComicsUpdatedSince(Mockito.anyLong(), Mockito.anyInt()))
        .thenReturn(comicList);
    Mockito.when(comicList.isEmpty()).thenReturn(true);
    Mockito.when(comicService.getLastReadDatesSince(Mockito.anyString(), Mockito.anyLong()))
        .thenReturn(lastReadList);
    Mockito.when(lastReadList.isEmpty()).thenReturn(true);
    Mockito.when(comicService.getProcessingCount()).thenReturn(10L);
    Mockito.when(comicService.getRescanCount()).thenReturn(0);

    final GetLibraryUpdatesResponse result =
        controller.getComicsUpdatedSince(
            principal,
            TEST_TIMESTAMP,
            new GetLibraryUpdatesRequest(TEST_TIMEOUT, TEST_MAXIMUM_RESULTS));

    assertNotNull(result);
    assertSame(comicList, result.getComics());
    assertSame(lastReadList, result.getLastReadDates());
    assertEquals(10, result.getProcessingCount());
    assertEquals(0, result.getRescanCount());

    Mockito.verify(principal, Mockito.times(1)).getName();
    Mockito.verify(comicService, Mockito.atLeast(1))
        .getComicsUpdatedSince(TEST_TIMESTAMP, TEST_MAXIMUM_RESULTS);
    Mockito.verify(comicList, Mockito.atLeast(1)).isEmpty();
    Mockito.verify(comicService, Mockito.atLeast(1))
        .getLastReadDatesSince(TEST_EMAIL_ADDRESS, TEST_TIMESTAMP);
    Mockito.verify(lastReadList, Mockito.atLeast(1)).isEmpty();
    Mockito.verify(comicService, Mockito.atLeast(1)).getProcessingCount();
    Mockito.verify(comicService, Mockito.atLeast(1)).getRescanCount();
  }

  @Test
  public void testGetComicsAddedSinceNoUpdates() throws ParseException, InterruptedException {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL_ADDRESS);
    Mockito.when(comicService.getComicsUpdatedSince(Mockito.anyLong(), Mockito.anyInt()))
        .thenReturn(comicList);
    Mockito.when(comicList.isEmpty()).thenReturn(true);
    Mockito.when(comicService.getLastReadDatesSince(Mockito.anyString(), Mockito.anyLong()))
        .thenReturn(lastReadList);
    Mockito.when(lastReadList.isEmpty()).thenReturn(true);
    Mockito.when(comicService.getProcessingCount()).thenReturn(0L);
    Mockito.when(comicService.getRescanCount()).thenReturn(0);

    final GetLibraryUpdatesResponse result =
        controller.getComicsUpdatedSince(
            principal,
            TEST_TIMESTAMP,
            new GetLibraryUpdatesRequest(TEST_TIMEOUT, TEST_MAXIMUM_RESULTS));

    assertNotNull(result);
    assertSame(comicList, result.getComics());
    assertSame(lastReadList, result.getLastReadDates());
    assertEquals(0, result.getProcessingCount());
    assertEquals(0, result.getRescanCount());

    Mockito.verify(principal, Mockito.times(1)).getName();
    Mockito.verify(comicService, Mockito.atLeast(TEST_TIMEOUT))
        .getComicsUpdatedSince(TEST_TIMESTAMP, TEST_MAXIMUM_RESULTS);
    Mockito.verify(comicList, Mockito.atLeast(TEST_TIMEOUT)).isEmpty();
    Mockito.verify(comicService, Mockito.atLeast(TEST_TIMEOUT))
        .getLastReadDatesSince(TEST_EMAIL_ADDRESS, TEST_TIMESTAMP);
    Mockito.verify(lastReadList, Mockito.atLeast(TEST_TIMEOUT)).isEmpty();
    Mockito.verify(comicService, Mockito.atLeast(TEST_TIMEOUT)).getProcessingCount();
    Mockito.verify(comicService, Mockito.atLeast(TEST_TIMEOUT)).getRescanCount();
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
  public void testDeleteMultipleComics() {
    Mockito.when(this.deleteComicsTaskFactory.getObject()).thenReturn(this.deleteComicsTask);
    Mockito.doNothing().when(this.deleteComicsTask).setComicIds(Mockito.anyList());
    Mockito.doNothing().when(this.taskManager).runTask(Mockito.any());

    assertTrue(controller.deleteMultipleComics(this.comicIds));

    Mockito.verify(this.deleteComicsTaskFactory, Mockito.times(1)).getObject();
    Mockito.verify(this.deleteComicsTask, Mockito.times(1)).setComicIds(this.comicIds);
    Mockito.verify(this.taskManager, Mockito.times(1)).runTask(this.deleteComicsTask);
  }

  @Test
  public void testUndeleteMultipleComics() {
    Mockito.when(this.undeleteComicsWorkerTaskObjectFactory.getObject())
        .thenReturn(undeleteComicsWorkerTask);

    UndeleteMultipleComicsResponse result =
        controller.undeleteMultipleComics(new UndeleteMultipleComicsRequest(this.comicIds));

    assertNotNull(result);
    assertTrue(result.isSuccess());

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

  @Test
  public void testGetComicForNonexistentComic() throws ComicException {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL_ADDRESS);
    Mockito.when(comicService.getComic(Mockito.anyLong(), Mockito.anyString())).thenReturn(null);

    Comic result = controller.getComic(principal, TEST_COMIC_ID);

    assertNull(result);

    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID, TEST_EMAIL_ADDRESS);
  }

  @Test
  public void testGetComic() throws ComicException {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL_ADDRESS);
    Mockito.when(comicService.getComic(Mockito.anyLong(), Mockito.anyString())).thenReturn(comic);

    Comic result = controller.getComic(principal, TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID, TEST_EMAIL_ADDRESS);
  }

  @Test
  public void testUpdateComic() {
    Mockito.when(comicService.updateComic(Mockito.anyLong(), Mockito.any(Comic.class)))
        .thenReturn(comic);

    final Comic result = controller.updateComic(TEST_COMIC_ID, comic);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(comicService, Mockito.times(1)).updateComic(TEST_COMIC_ID, comic);
  }

  @Test
  public void testRescanComics() {
    Mockito.when(rescanComicsWorkerTaskObjectFactory.getObject())
        .thenReturn(rescanComicsWorkerTask);
    Mockito.doNothing().when(taskManager).runTask(Mockito.any(WorkerTask.class));
    Mockito.when(comicService.getRescanCount()).thenReturn(TEST_RESCAN_COUNT);

    final int result = controller.rescanComics();

    assertEquals(TEST_RESCAN_COUNT, result);

    Mockito.verify(taskManager, Mockito.times(1)).runTask(rescanComicsWorkerTask);
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
    Mockito.when(fileService.getImportFileCover(Mockito.anyString())).thenReturn(TEST_PAGE_CONTENT);
    Mockito.when(fileTypeIdentifier.typeFor(inputStreamCaptor.capture()))
        .thenReturn(TEST_PAGE_CONTENT_TYPE);
    Mockito.when(fileTypeIdentifier.subtypeFor(inputStreamCaptor.capture()))
        .thenReturn(TEST_PAGE_CONTENT_SUBTYPE);

    final ResponseEntity<byte[]> result = controller.getCoverImage(TEST_COMIC_ID);

    assertNotNull(result);
    assertEquals(TEST_PAGE_CONTENT, result.getBody());

    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(comic, Mockito.times(1)).isMissing();
    Mockito.verify(fileService, Mockito.times(1)).getImportFileCover(TEST_COMIC_FILE);
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

  @Test(expected = ComicException.class)
  public void testMarkAsReadNotAuthenticated() throws ComicException {
    Mockito.when(principal.getName()).thenReturn(null);

    try {
      controller.markAsRead(principal, TEST_COMIC_ID);
    } finally {
      Mockito.verify(principal, Mockito.times(1)).getName();
    }
  }

  @Test
  public void testMarkAsRead() throws ComicException {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL_ADDRESS);
    Mockito.when(comicService.markAsRead(Mockito.anyString(), Mockito.anyLong()))
        .thenReturn(lastReadDate);

    LastReadDate result = controller.markAsRead(principal, TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(lastReadDate, result);

    Mockito.verify(principal, Mockito.times(1)).getName();
    Mockito.verify(comicService, Mockito.times(1)).markAsRead(TEST_EMAIL_ADDRESS, TEST_COMIC_ID);
  }

  @Test(expected = ComicException.class)
  public void testMarkAsUnreadNotAuthenticated() throws ComicException {
    Mockito.when(principal.getName()).thenReturn(null);

    try {
      controller.markAsUnread(principal, TEST_COMIC_ID);
    } finally {
      Mockito.verify(principal, Mockito.times(1)).getName();
    }
  }

  @Test
  public void testMarkAsUnread() throws ComicException {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL_ADDRESS);
    Mockito.when(comicService.markAsUnread(Mockito.anyString(), Mockito.anyLong()))
        .thenReturn(true);

    boolean result = controller.markAsUnread(principal, TEST_COMIC_ID);

    assertTrue(result);

    Mockito.verify(principal, Mockito.times(1)).getName();
    Mockito.verify(comicService, Mockito.times(1)).markAsUnread(TEST_EMAIL_ADDRESS, TEST_COMIC_ID);
  }
}

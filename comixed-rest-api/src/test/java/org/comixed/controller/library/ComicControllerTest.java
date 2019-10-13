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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.controller.library;

import org.comixed.adaptors.ArchiveType;
import org.comixed.adaptors.archive.ArchiveAdaptorException;
import org.comixed.handlers.ComicFileHandlerException;
import org.comixed.model.library.Comic;
import org.comixed.model.library.Page;
import org.comixed.net.GetLibraryUpdatesResponse;
import org.comixed.model.user.ComiXedUser;
import org.comixed.model.user.LastReadDate;
import org.comixed.net.GetLibraryUpdatesRequest;
import org.comixed.repositories.ComiXedUserRepository;
import org.comixed.repositories.LastReadDatesRepository;
import org.comixed.service.file.FileService;
import org.comixed.service.library.ComicException;
import org.comixed.service.library.ComicService;
import org.comixed.task.model.DeleteComicsWorkerTask;
import org.comixed.task.runner.Worker;
import org.comixed.utils.FileTypeIdentifier;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.omg.CORBA_2_3.portable.InputStream;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.security.Principal;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.*;

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

    @InjectMocks private ComicController controller;
    @Mock private ComicService comicService;
    @Mock private LastReadDatesRepository lastReadRepository;
    @Mock private Worker worker;
    @Mock private List<Comic> comicList;
    @Mock private Comic comic;
    @Mock private Principal principal;
    @Mock private ComiXedUserRepository userRepository;
    @Mock private ComiXedUser user;
    @Mock private List<LastReadDate> lastReadList;
    @Mock private ObjectFactory<DeleteComicsWorkerTask> deleteComicsTaskFactory;
    @Mock private DeleteComicsWorkerTask deleteComicsTask;
    @Mock private List<Long> comicIds;
    @Mock private FileService fileService;
    @Mock private FileTypeIdentifier fileTypeIdentifier;
    @Captor private ArgumentCaptor<InputStream> inputStreamCaptor;
    @Mock private Page page;

    private List<Comic> emptyComicList = new ArrayList<>();

    @Test
    public void testGetComicsAddedSinceWithComicUpdate()
            throws
            ParseException,
            InterruptedException {
        Mockito.when(principal.getName())
               .thenReturn(TEST_EMAIL_ADDRESS);
        Mockito.when(comicService.getComicsUpdatedSince(Mockito.anyLong(),
                                                        Mockito.anyInt()))
               .thenReturn(comicList);
        Mockito.when(comicList.isEmpty())
               .thenReturn(false);
        Mockito.when(comicService.getLastReadDatesSince(Mockito.anyString(),
                                                        Mockito.anyLong()))
               .thenReturn(lastReadList);
        Mockito.when(comicService.getProcessingCount())
               .thenReturn(0L);
        Mockito.when(comicService.getRescanCount())
               .thenReturn(0);

        final GetLibraryUpdatesResponse result = controller.getComicsUpdatedSince(principal,
                                                                                  TEST_TIMESTAMP,
                                                                                  new GetLibraryUpdatesRequest(TEST_TIMEOUT,
                                                                                                   TEST_MAXIMUM_RESULTS));

        assertNotNull(result);
        assertSame(comicList,
                   result.getComics());
        assertSame(lastReadList,
                   result.getLastReadDates());
        assertEquals(0,
                     result.getProcessingCount());
        assertEquals(0,
                     result.getRescanCount());

        Mockito.verify(principal,
                       Mockito.times(1))
               .getName();
        Mockito.verify(comicService,
                       Mockito.atLeast(1))
               .getComicsUpdatedSince(TEST_TIMESTAMP,
                                      TEST_MAXIMUM_RESULTS);
        Mockito.verify(comicList,
                       Mockito.atLeast(1))
               .isEmpty();
        Mockito.verify(comicService,
                       Mockito.atLeast(1))
               .getProcessingCount();
        Mockito.verify(comicService,
                       Mockito.atLeast(1))
               .getRescanCount();
    }

    @Test
    public void testGetComicsAddedSinceWithLastReadUpdate()
            throws
            ParseException,
            InterruptedException {
        Mockito.when(principal.getName())
               .thenReturn(TEST_EMAIL_ADDRESS);
        Mockito.when(comicService.getComicsUpdatedSince(Mockito.anyLong(),
                                                        Mockito.anyInt()))
               .thenReturn(comicList);
        Mockito.when(comicList.isEmpty())
               .thenReturn(true);
        Mockito.when(comicService.getLastReadDatesSince(Mockito.anyString(),
                                                        Mockito.anyLong()))
               .thenReturn(lastReadList);
        Mockito.when(lastReadList.isEmpty())
               .thenReturn(false);
        Mockito.when(comicService.getProcessingCount())
               .thenReturn(0L);
        Mockito.when(comicService.getRescanCount())
               .thenReturn(0);

        final GetLibraryUpdatesResponse result = controller.getComicsUpdatedSince(principal,
                                                                                  TEST_TIMESTAMP,
                                                                                  new GetLibraryUpdatesRequest(TEST_TIMEOUT,
                                                                                                   TEST_MAXIMUM_RESULTS));

        assertNotNull(result);
        assertSame(comicList,
                   result.getComics());
        assertSame(lastReadList,
                   result.getLastReadDates());
        assertEquals(0,
                     result.getProcessingCount());
        assertEquals(0,
                     result.getRescanCount());

        Mockito.verify(principal,
                       Mockito.times(1))
               .getName();
        Mockito.verify(comicService,
                       Mockito.atLeast(1))
               .getComicsUpdatedSince(TEST_TIMESTAMP,
                                      TEST_MAXIMUM_RESULTS);
        Mockito.verify(comicList,
                       Mockito.atLeast(1))
               .isEmpty();
        Mockito.verify(comicService,
                       Mockito.atLeast(1))
               .getLastReadDatesSince(TEST_EMAIL_ADDRESS,
                                      TEST_TIMESTAMP);
        Mockito.verify(lastReadList,
                       Mockito.atLeast(1))
               .isEmpty();
        Mockito.verify(comicService,
                       Mockito.atLeast(1))
               .getProcessingCount();
        Mockito.verify(comicService,
                       Mockito.atLeast(1))
               .getRescanCount();
    }

    @Test
    public void testGetComicsAddedSinceWithRescans()
            throws
            ParseException,
            InterruptedException {
        Mockito.when(principal.getName())
               .thenReturn(TEST_EMAIL_ADDRESS);
        Mockito.when(comicService.getComicsUpdatedSince(Mockito.anyLong(),
                                                        Mockito.anyInt()))
               .thenReturn(comicList);
        Mockito.when(comicList.isEmpty())
               .thenReturn(true);
        Mockito.when(comicService.getLastReadDatesSince(Mockito.anyString(),
                                                        Mockito.anyLong()))
               .thenReturn(lastReadList);
        Mockito.when(lastReadList.isEmpty())
               .thenReturn(true);
        Mockito.when(comicService.getProcessingCount())
               .thenReturn(0L);
        Mockito.when(comicService.getRescanCount())
               .thenReturn(10);

        final GetLibraryUpdatesResponse result = controller.getComicsUpdatedSince(principal,
                                                                                  TEST_TIMESTAMP,
                                                                                  new GetLibraryUpdatesRequest(TEST_TIMEOUT,
                                                                                                   TEST_MAXIMUM_RESULTS));

        assertNotNull(result);
        assertSame(comicList,
                   result.getComics());
        assertSame(lastReadList,
                   result.getLastReadDates());
        assertEquals(0,
                     result.getProcessingCount());
        assertEquals(10,
                     result.getRescanCount());

        Mockito.verify(principal,
                       Mockito.times(1))
               .getName();
        Mockito.verify(comicService,
                       Mockito.atLeast(1))
               .getComicsUpdatedSince(TEST_TIMESTAMP,
                                      TEST_MAXIMUM_RESULTS);
        Mockito.verify(comicList,
                       Mockito.atLeast(1))
               .isEmpty();
        Mockito.verify(comicService,
                       Mockito.atLeast(1))
               .getLastReadDatesSince(TEST_EMAIL_ADDRESS,
                                      TEST_TIMESTAMP);
        Mockito.verify(lastReadList,
                       Mockito.atLeast(1))
               .isEmpty();
        Mockito.verify(comicService,
                       Mockito.atLeast(1))
               .getProcessingCount();
        Mockito.verify(comicService,
                       Mockito.times(1))
               .getRescanCount();
    }

    @Test
    public void testGetComicsAddedSinceWithImports()
            throws
            ParseException,
            InterruptedException {
        Mockito.when(principal.getName())
               .thenReturn(TEST_EMAIL_ADDRESS);
        Mockito.when(comicService.getComicsUpdatedSince(Mockito.anyLong(),
                                                        Mockito.anyInt()))
               .thenReturn(comicList);
        Mockito.when(comicList.isEmpty())
               .thenReturn(true);
        Mockito.when(comicService.getLastReadDatesSince(Mockito.anyString(),
                                                        Mockito.anyLong()))
               .thenReturn(lastReadList);
        Mockito.when(lastReadList.isEmpty())
               .thenReturn(true);
        Mockito.when(comicService.getProcessingCount())
               .thenReturn(10L);
        Mockito.when(comicService.getRescanCount())
               .thenReturn(0);

        final GetLibraryUpdatesResponse result = controller.getComicsUpdatedSince(principal,
                                                                                  TEST_TIMESTAMP,
                                                                                  new GetLibraryUpdatesRequest(TEST_TIMEOUT,
                                                                                                   TEST_MAXIMUM_RESULTS));

        assertNotNull(result);
        assertSame(comicList,
                   result.getComics());
        assertSame(lastReadList,
                   result.getLastReadDates());
        assertEquals(10,
                     result.getProcessingCount());
        assertEquals(0,
                     result.getRescanCount());

        Mockito.verify(principal,
                       Mockito.times(1))
               .getName();
        Mockito.verify(comicService,
                       Mockito.atLeast(1))
               .getComicsUpdatedSince(TEST_TIMESTAMP,
                                      TEST_MAXIMUM_RESULTS);
        Mockito.verify(comicList,
                       Mockito.atLeast(1))
               .isEmpty();
        Mockito.verify(comicService,
                       Mockito.atLeast(1))
               .getLastReadDatesSince(TEST_EMAIL_ADDRESS,
                                      TEST_TIMESTAMP);
        Mockito.verify(lastReadList,
                       Mockito.atLeast(1))
               .isEmpty();
        Mockito.verify(comicService,
                       Mockito.atLeast(1))
               .getProcessingCount();
        Mockito.verify(comicService,
                       Mockito.atLeast(1))
               .getRescanCount();
    }

    @Test
    public void testGetComicsAddedSinceNoUpdates()
            throws
            ParseException,
            InterruptedException {
        Mockito.when(principal.getName())
               .thenReturn(TEST_EMAIL_ADDRESS);
        Mockito.when(comicService.getComicsUpdatedSince(Mockito.anyLong(),
                                                        Mockito.anyInt()))
               .thenReturn(comicList);
        Mockito.when(comicList.isEmpty())
               .thenReturn(true);
        Mockito.when(comicService.getLastReadDatesSince(Mockito.anyString(),
                                                        Mockito.anyLong()))
               .thenReturn(lastReadList);
        Mockito.when(lastReadList.isEmpty())
               .thenReturn(true);
        Mockito.when(comicService.getProcessingCount())
               .thenReturn(0L);
        Mockito.when(comicService.getRescanCount())
               .thenReturn(0);

        final GetLibraryUpdatesResponse result = controller.getComicsUpdatedSince(principal,
                                                                                  TEST_TIMESTAMP,
                                                                                  new GetLibraryUpdatesRequest(TEST_TIMEOUT,
                                                                                                   TEST_MAXIMUM_RESULTS));

        assertNotNull(result);
        assertSame(comicList,
                   result.getComics());
        assertSame(lastReadList,
                   result.getLastReadDates());
        assertEquals(0,
                     result.getProcessingCount());
        assertEquals(0,
                     result.getRescanCount());

        Mockito.verify(principal,
                       Mockito.times(1))
               .getName();
        Mockito.verify(comicService,
                       Mockito.atLeast(TEST_TIMEOUT))
               .getComicsUpdatedSince(TEST_TIMESTAMP,
                                      TEST_MAXIMUM_RESULTS);
        Mockito.verify(comicList,
                       Mockito.atLeast(TEST_TIMEOUT))
               .isEmpty();
        Mockito.verify(comicService,
                       Mockito.atLeast(TEST_TIMEOUT))
               .getLastReadDatesSince(TEST_EMAIL_ADDRESS,
                                      TEST_TIMESTAMP);
        Mockito.verify(lastReadList,
                       Mockito.atLeast(TEST_TIMEOUT))
               .isEmpty();
        Mockito.verify(comicService,
                       Mockito.atLeast(TEST_TIMEOUT))
               .getProcessingCount();
        Mockito.verify(comicService,
                       Mockito.atLeast(TEST_TIMEOUT))
               .getRescanCount();
    }

    @Test
    public void testDeleteComic() {
        Mockito.when(comicService.deleteComic(Mockito.anyLong()))
               .thenReturn(true);

        assertTrue(controller.deleteComic(TEST_COMIC_ID));

        Mockito.verify(comicService,
                       Mockito.times(1))
               .deleteComic(TEST_COMIC_ID);
    }

    @Test
    public void testDeleteComicFails() {
        Mockito.when(comicService.deleteComic(Mockito.anyLong()))
               .thenReturn(false);

        assertFalse(controller.deleteComic(TEST_COMIC_ID));

        Mockito.verify(comicService,
                       Mockito.times(1))
               .deleteComic(TEST_COMIC_ID);
    }

    @Test
    public void testDeleteMultipleComics() {
        Mockito.when(this.deleteComicsTaskFactory.getObject())
               .thenReturn(this.deleteComicsTask);
        Mockito.doNothing()
               .when(this.deleteComicsTask)
               .setComicIds(Mockito.anyListOf(Long.class));
        Mockito.doNothing()
               .when(this.worker)
               .addTasksToQueue(Mockito.any());

        assertTrue(controller.deleteMultipleComics(this.comicIds));

        Mockito.verify(this.deleteComicsTaskFactory,
                       Mockito.times(1))
               .getObject();
        Mockito.verify(this.deleteComicsTask,
                       Mockito.times(1))
               .setComicIds(this.comicIds);
        Mockito.verify(this.worker,
                       Mockito.times(1))
               .addTasksToQueue(this.deleteComicsTask);
    }

    @Test
    public void testDownloadComicForNonexistentComic()
            throws
            IOException,
            ComicException {
        Mockito.when(comicService.getComic(Mockito.anyLong()))
               .thenReturn(null);

        assertNull(controller.downloadComic(TEST_COMIC_ID));

        Mockito.verify(comicService,
                       Mockito.times(1))
               .getComic(TEST_COMIC_ID);
    }

    @Test
    public void testDownloadComicFileDoesNotExist()
            throws
            IOException,
            ComicException {
        Mockito.when(comicService.getComic(Mockito.anyLong()))
               .thenReturn(comic);
        Mockito.when(comicService.getComicContent(Mockito.any(Comic.class)))
               .thenReturn(null);

        assertNull(controller.downloadComic(TEST_COMIC_ID));

        Mockito.verify(comicService,
                       Mockito.times(1))
               .getComic(TEST_COMIC_ID);
        Mockito.verify(comicService,
                       Mockito.times(1))
               .getComicContent(comic);
    }

    @Test
    public void testDownloadComic()
            throws
            IOException,
            ComicException {
        Mockito.when(comicService.getComic(Mockito.anyLong()))
               .thenReturn(comic);
        Mockito.when(comicService.getComicContent(Mockito.any(Comic.class)))
               .thenReturn(TEST_COMIC_CONTENT);
        Mockito.when(comic.getFilename())
               .thenReturn(TEST_COMIC_FILE);
        Mockito.when(comic.getArchiveType())
               .thenReturn(ArchiveType.CBZ);

        ResponseEntity<InputStreamResource> result = controller.downloadComic(TEST_COMIC_ID);

        assertNotNull(result);
        assertSame(HttpStatus.OK,
                   result.getStatusCode());
        assertTrue(result.getBody()
                         .contentLength() > 0);
        assertEquals(ArchiveType.CBZ.getMimeType(),
                     result.getHeaders()
                           .getContentType()
                           .toString());

        Mockito.verify(comicService,
                       Mockito.times(1))
               .getComic(TEST_COMIC_ID);
        Mockito.verify(comicService,
                       Mockito.times(1))
               .getComicContent(comic);
        Mockito.verify(comic,
                       Mockito.atLeast(1))
               .getFilename();
        Mockito.verify(comic,
                       Mockito.times(1))
               .getArchiveType();
    }

    @Test
    public void testDownloadComicNonexistent()
            throws
            IOException,
            ComicException {
        Mockito.when(comicService.getComic(Mockito.anyLong()))
               .thenReturn(null);

        ResponseEntity<InputStreamResource> result = controller.downloadComic(TEST_COMIC_ID);

        assertNull(result);

        Mockito.verify(comicService,
                       Mockito.times(1))
               .getComic(TEST_COMIC_ID);
    }

    @Test
    public void testDownloadComicFileNotFound()
            throws
            IOException,
            ComicException {
        Mockito.when(comicService.getComic(Mockito.anyLong()))
               .thenReturn(comic);
        Mockito.when(comicService.getComicContent(Mockito.any(Comic.class)))
               .thenReturn(null);

        ResponseEntity<InputStreamResource> result = controller.downloadComic(TEST_COMIC_ID);

        assertNull(result);

        Mockito.verify(comicService,
                       Mockito.times(1))
               .getComic(TEST_COMIC_ID);
        Mockito.verify(comicService,
                       Mockito.times(1))
               .getComicContent(comic);
    }

    @Test
    public void testGetComicForNonexistentComic()
            throws
            ComicException {
        Mockito.when(comicService.getComic(Mockito.anyLong()))
               .thenReturn(null);

        assertNull(controller.getComic(TEST_COMIC_ID));

        Mockito.verify(comicService,
                       Mockito.times(1))
               .getComic(TEST_COMIC_ID);
    }

    @Test
    public void testGetComic()
            throws
            ComicException {
        Mockito.when(comicService.getComic(Mockito.anyLong()))
               .thenReturn(comic);

        Comic result = controller.getComic(TEST_COMIC_ID);

        assertNotNull(result);
        assertSame(comic,
                   result);

        Mockito.verify(comicService,
                       Mockito.times(1))
               .getComic(TEST_COMIC_ID);
    }

    @Test
    public void testUpdateComic() {
        Mockito.when(comicService.updateComic(Mockito.anyLong(),
                                              Mockito.any(Comic.class)))
               .thenReturn(comic);

        final Comic result = controller.updateComic(TEST_COMIC_ID,
                                                    comic);

        assertNotNull(result);
        assertSame(comic,
                   result);

        Mockito.verify(comicService,
                       Mockito.times(1))
               .updateComic(TEST_COMIC_ID,
                            comic);
    }

    @Test
    public void testRescanComics() {
        Mockito.when(comicService.rescanComics())
               .thenReturn(TEST_RESCAN_COUNT);

        final int result = controller.rescanComics();

        assertEquals(TEST_RESCAN_COUNT,
                     result);

        Mockito.verify(comicService,
                       Mockito.times(1))
               .rescanComics();
    }

    @Test(expected = ComicException.class)
    public void testGetCoverImageForInvalidComic()
            throws
            ComicException,
            ArchiveAdaptorException,
            ComicFileHandlerException {
        Mockito.when(comicService.getComic(Mockito.anyLong()))
               .thenThrow(ComicException.class);

        try {
            controller.getCoverImage(TEST_COMIC_ID);
        }
        finally {
            Mockito.verify(comicService,
                           Mockito.times(1))
                   .getComic(TEST_COMIC_ID);
        }
    }

    @Test(expected = ComicException.class)
    public void testGetCoverImageForMissingComic()
            throws
            ComicException,
            ArchiveAdaptorException,
            ComicFileHandlerException {
        Mockito.when(comicService.getComic(Mockito.anyLong()))
               .thenReturn(comic);
        Mockito.when(comic.isMissing())
               .thenReturn(true);

        try {
            controller.getCoverImage(TEST_COMIC_ID);
        }
        finally {
            Mockito.verify(comicService,
                           Mockito.times(1))
                   .getComic(TEST_COMIC_ID);
            Mockito.verify(comic,
                           Mockito.times(1))
                   .isMissing();
        }
    }

    @Test
    public void testGetCoverImageForUnprocessedComic()
            throws
            ComicException,
            ArchiveAdaptorException,
            ComicFileHandlerException {
        Mockito.when(comicService.getComic(Mockito.anyLong()))
               .thenReturn(comic);
        Mockito.when(comic.isMissing())
               .thenReturn(false);
        Mockito.when(comic.getPageCount())
               .thenReturn(0);
        Mockito.when(comic.getFilename())
               .thenReturn(TEST_COMIC_FILE);
        Mockito.when(fileService.getImportFileCover(Mockito.anyString()))
               .thenReturn(TEST_PAGE_CONTENT);
        Mockito.when(fileTypeIdentifier.typeFor(inputStreamCaptor.capture()))
               .thenReturn(TEST_PAGE_CONTENT_TYPE);
        Mockito.when(fileTypeIdentifier.subtypeFor(inputStreamCaptor.capture()))
               .thenReturn(TEST_PAGE_CONTENT_SUBTYPE);

        final ResponseEntity<byte[]> result = controller.getCoverImage(TEST_COMIC_ID);

        assertNotNull(result);
        assertEquals(TEST_PAGE_CONTENT,
                     result.getBody());

        Mockito.verify(comicService,
                       Mockito.times(1))
               .getComic(TEST_COMIC_ID);
        Mockito.verify(comic,
                       Mockito.times(1))
               .isMissing();
        Mockito.verify(fileService,
                       Mockito.times(1))
               .getImportFileCover(TEST_COMIC_FILE);
        Mockito.verify(fileTypeIdentifier,
                       Mockito.times(1))
               .typeFor(inputStreamCaptor.getValue());
        Mockito.verify(fileTypeIdentifier,
                       Mockito.times(1))
               .subtypeFor(inputStreamCaptor.getValue());
    }

    @Test
    public void testGetCoverImageForProcessedComic()
            throws
            ComicException,
            ArchiveAdaptorException,
            ComicFileHandlerException {
        Mockito.when(comicService.getComic(Mockito.anyLong()))
               .thenReturn(comic);
        Mockito.when(comic.isMissing())
               .thenReturn(false);
        Mockito.when(comic.getPageCount())
               .thenReturn(5);
        Mockito.when(comic.getPage(Mockito.anyInt()))
               .thenReturn(page);
        Mockito.when(page.getContent())
               .thenReturn(TEST_PAGE_CONTENT);
        Mockito.when(page.getFilename())
               .thenReturn(TEST_PAGE_FILENAME);
        Mockito.when(fileTypeIdentifier.typeFor(inputStreamCaptor.capture()))
               .thenReturn(TEST_PAGE_CONTENT_TYPE);
        Mockito.when(fileTypeIdentifier.subtypeFor(inputStreamCaptor.capture()))
               .thenReturn(TEST_PAGE_CONTENT_SUBTYPE);

        final ResponseEntity<byte[]> result = controller.getCoverImage(TEST_COMIC_ID);

        assertNotNull(result);
        assertEquals(TEST_PAGE_CONTENT,
                     result.getBody());

        Mockito.verify(comicService,
                       Mockito.times(1))
               .getComic(TEST_COMIC_ID);
        Mockito.verify(comic,
                       Mockito.times(1))
               .isMissing();
        Mockito.verify(page,
                       Mockito.times(1))
               .getFilename();
        Mockito.verify(page,
                       Mockito.times(1))
               .getContent();
        Mockito.verify(fileTypeIdentifier,
                       Mockito.times(1))
               .typeFor(inputStreamCaptor.getValue());
        Mockito.verify(fileTypeIdentifier,
                       Mockito.times(1))
               .subtypeFor(inputStreamCaptor.getValue());
    }
}

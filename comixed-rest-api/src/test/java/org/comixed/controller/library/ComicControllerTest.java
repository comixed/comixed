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
import org.comixed.model.library.Comic;
import org.comixed.model.state.LibraryStatus;
import org.comixed.model.user.ComiXedUser;
import org.comixed.model.user.LastReadDate;
import org.comixed.repositories.ComiXedUserRepository;
import org.comixed.repositories.LastReadDatesRepository;
import org.comixed.service.library.ComicException;
import org.comixed.service.library.ComicService;
import org.comixed.tasks.DeleteComicsWorkerTask;
import org.comixed.tasks.Worker;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
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
    private static final String TEST_NONEXISTENT_FILE = "src/test/resources/this-file-doesnt-exist.cbz";
    private static final String TEST_DIRECTORY = "src/test/resources";
    private static final String TEST_COMIC_FILE = "src/test/resources/example.cbz";
    private static final String TEST_SERIES = "Awesome comic series";
    private static final String TEST_VOLUME = "2018";
    private static final String TEST_ISSUE_NUMBER = "52";
    private static final int TEST_RESCAN_COUNT = 729;
    private static final int TEST_IMPORT_COUNT = 217;
    private static final long TEST_USER_ID = 129;
    private static final String TEST_EMAIL_ADDRESS = "user@testing";
    private static final int TEST_TIMEOUT = 2;
    private static final byte[] TEST_COMIC_CONTENT = "This is the comic content.".getBytes();

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

    private List<Comic> emptyComicList = new ArrayList<>();

    @Test
    public void testGetComicsAddedSinceWithComicUpdate()
            throws
            ParseException,
            InterruptedException {
        Mockito.when(principal.getName())
               .thenReturn(TEST_EMAIL_ADDRESS);
        Mockito.when(comicService.getComicsAddedSince(Mockito.anyLong(),
                                                      Mockito.anyInt()))
               .thenReturn(comicList);
        Mockito.when(comicList.isEmpty())
               .thenReturn(false);
        Mockito.when(comicService.getLastReadDatesSince(Mockito.anyString(),
                                                        Mockito.anyLong()))
               .thenReturn(lastReadList);
        Mockito.when(comicService.getImportCount())
               .thenReturn(0);
        Mockito.when(comicService.getRescanCount())
               .thenReturn(0);

        final LibraryStatus result = controller.getComicsAddedSince(principal,
                                                                    0,
                                                                    1000L,
                                                                    100);

        assertNotNull(result);
        assertSame(comicList,
                   result.getComics());
        assertSame(lastReadList,
                   result.getLastReadDates());
        assertEquals(0,
                     result.getImportCount());
        assertEquals(0,
                     result.getRescanCount());

        Mockito.verify(principal,
                       Mockito.times(1))
               .getName();
        Mockito.verify(comicService,
                       Mockito.atLeast(1))
               .getComicsAddedSince(0,
                                    100);
        Mockito.verify(comicList,
                       Mockito.atLeast(1))
               .isEmpty();
        Mockito.verify(comicService,
                       Mockito.atLeast(1))
               .getImportCount();
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
        Mockito.when(comicService.getComicsAddedSince(Mockito.anyLong(),
                                                      Mockito.anyInt()))
               .thenReturn(comicList);
        Mockito.when(comicList.isEmpty())
               .thenReturn(true);
        Mockito.when(comicService.getLastReadDatesSince(Mockito.anyString(),
                                                        Mockito.anyLong()))
               .thenReturn(lastReadList);
        Mockito.when(lastReadList.isEmpty())
               .thenReturn(false);
        Mockito.when(comicService.getImportCount())
               .thenReturn(0);
        Mockito.when(comicService.getRescanCount())
               .thenReturn(0);

        final LibraryStatus result = controller.getComicsAddedSince(principal,
                                                                    0,
                                                                    1000L,
                                                                    100);

        assertNotNull(result);
        assertSame(comicList,
                   result.getComics());
        assertSame(lastReadList,
                   result.getLastReadDates());
        assertEquals(0,
                     result.getImportCount());
        assertEquals(0,
                     result.getRescanCount());

        Mockito.verify(principal,
                       Mockito.times(1))
               .getName();
        Mockito.verify(comicService,
                       Mockito.atLeast(1))
               .getComicsAddedSince(0l,
                                    100);
        Mockito.verify(comicList,
                       Mockito.atLeast(1))
               .isEmpty();
        Mockito.verify(comicService,
                       Mockito.atLeast(1))
               .getLastReadDatesSince(TEST_EMAIL_ADDRESS,
                                      0l);
        Mockito.verify(lastReadList,
                       Mockito.atLeast(1))
               .isEmpty();
        Mockito.verify(comicService,
                       Mockito.atLeast(1))
               .getImportCount();
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
        Mockito.when(comicService.getComicsAddedSince(Mockito.anyLong(),
                                                      Mockito.anyInt()))
               .thenReturn(comicList);
        Mockito.when(comicList.isEmpty())
               .thenReturn(true);
        Mockito.when(comicService.getLastReadDatesSince(Mockito.anyString(),
                                                        Mockito.anyLong()))
               .thenReturn(lastReadList);
        Mockito.when(lastReadList.isEmpty())
               .thenReturn(true);
        Mockito.when(comicService.getImportCount())
               .thenReturn(0);
        Mockito.when(comicService.getRescanCount())
               .thenReturn(10);

        final LibraryStatus result = controller.getComicsAddedSince(principal,
                                                                    0,
                                                                    1000L,
                                                                    100);

        assertNotNull(result);
        assertSame(comicList,
                   result.getComics());
        assertSame(lastReadList,
                   result.getLastReadDates());
        assertEquals(0,
                     result.getImportCount());
        assertEquals(10,
                     result.getRescanCount());

        Mockito.verify(principal,
                       Mockito.times(1))
               .getName();
        Mockito.verify(comicService,
                       Mockito.atLeast(1))
               .getComicsAddedSince(0l,
                                    100);
        Mockito.verify(comicList,
                       Mockito.atLeast(1))
               .isEmpty();
        Mockito.verify(comicService,
                       Mockito.atLeast(1))
               .getLastReadDatesSince(TEST_EMAIL_ADDRESS,
                                      0l);
        Mockito.verify(lastReadList,
                       Mockito.atLeast(1))
               .isEmpty();
        Mockito.verify(comicService,
                       Mockito.atLeast(1))
               .getImportCount();
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
        Mockito.when(comicService.getComicsAddedSince(Mockito.anyLong(),
                                                      Mockito.anyInt()))
               .thenReturn(comicList);
        Mockito.when(comicList.isEmpty())
               .thenReturn(true);
        Mockito.when(comicService.getLastReadDatesSince(Mockito.anyString(),
                                                        Mockito.anyLong()))
               .thenReturn(lastReadList);
        Mockito.when(lastReadList.isEmpty())
               .thenReturn(true);
        Mockito.when(comicService.getImportCount())
               .thenReturn(10);
        Mockito.when(comicService.getRescanCount())
               .thenReturn(0);

        final LibraryStatus result = controller.getComicsAddedSince(principal,
                                                                    0,
                                                                    1000L,
                                                                    100);

        assertNotNull(result);
        assertSame(comicList,
                   result.getComics());
        assertSame(lastReadList,
                   result.getLastReadDates());
        assertEquals(10,
                     result.getImportCount());
        assertEquals(0,
                     result.getRescanCount());

        Mockito.verify(principal,
                       Mockito.times(1))
               .getName();
        Mockito.verify(comicService,
                       Mockito.atLeast(1))
               .getComicsAddedSince(0l,
                                    100);
        Mockito.verify(comicList,
                       Mockito.atLeast(1))
               .isEmpty();
        Mockito.verify(comicService,
                       Mockito.atLeast(1))
               .getLastReadDatesSince(TEST_EMAIL_ADDRESS,
                                      0l);
        Mockito.verify(lastReadList,
                       Mockito.atLeast(1))
               .isEmpty();
        Mockito.verify(comicService,
                       Mockito.atLeast(1))
               .getImportCount();
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
        Mockito.when(comicService.getComicsAddedSince(Mockito.anyLong(),
                                                      Mockito.anyInt()))
               .thenReturn(comicList);
        Mockito.when(comicList.isEmpty())
               .thenReturn(true);
        Mockito.when(comicService.getLastReadDatesSince(Mockito.anyString(),
                                                        Mockito.anyLong()))
               .thenReturn(lastReadList);
        Mockito.when(lastReadList.isEmpty())
               .thenReturn(true);
        Mockito.when(comicService.getImportCount())
               .thenReturn(0);
        Mockito.when(comicService.getRescanCount())
               .thenReturn(0);

        final LibraryStatus result = controller.getComicsAddedSince(principal,
                                                                    0,
                                                                    TEST_TIMEOUT,
                                                                    100);

        assertNotNull(result);
        assertSame(comicList,
                   result.getComics());
        assertSame(lastReadList,
                   result.getLastReadDates());
        assertEquals(0,
                     result.getImportCount());
        assertEquals(0,
                     result.getRescanCount());

        Mockito.verify(principal,
                       Mockito.times(1))
               .getName();
        Mockito.verify(comicService,
                       Mockito.atLeast(TEST_TIMEOUT))
               .getComicsAddedSince(0l,
                                    100);
        Mockito.verify(comicList,
                       Mockito.atLeast(TEST_TIMEOUT))
               .isEmpty();
        Mockito.verify(comicService,
                       Mockito.atLeast(TEST_TIMEOUT))
               .getLastReadDatesSince(TEST_EMAIL_ADDRESS,
                                      0l);
        Mockito.verify(lastReadList,
                       Mockito.atLeast(TEST_TIMEOUT))
               .isEmpty();
        Mockito.verify(comicService,
                       Mockito.atLeast(TEST_TIMEOUT))
               .getImportCount();
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
}

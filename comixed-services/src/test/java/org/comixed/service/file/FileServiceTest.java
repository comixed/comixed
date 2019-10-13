/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

package org.comixed.service.file;

import org.comixed.adaptors.archive.ArchiveAdaptor;
import org.comixed.adaptors.archive.ArchiveAdaptorException;
import org.comixed.handlers.ComicFileHandler;
import org.comixed.handlers.ComicFileHandlerException;
import org.comixed.model.file.FileDetails;
import org.comixed.model.library.Comic;
import org.comixed.repositories.ComicRepository;
import org.comixed.task.model.AddComicWorkerTask;
import org.comixed.task.model.QueueComicsWorkerTask;
import org.comixed.task.runner.Worker;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.List;

import static org.junit.Assert.*;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class FileServiceTest {
    private static final String TEST_ARCHIVE_FILENAME = "example.cbz";
    private static final String TEST_COVER_FILENAME = "cover_image.jpg";
    private static final byte[] TEST_COVER_CONTENT = "this is image data".getBytes();
    private static final String TEST_ROOT_DIRECTORY = "src/test/resources";
    private static final String TEST_COMIC_ARCHIVE = TEST_ROOT_DIRECTORY + "/" + TEST_ARCHIVE_FILENAME;
    private static final String[] TEST_FILENAMES = new String[]{"First.cbz",
                                                                "Second.cbz",
                                                                "Third.cbr",
                                                                "Fourth.cb7"};

    @InjectMocks private FileService service;
    @Mock private ComicFileHandler comicFileHandler;
    @Mock private ArchiveAdaptor archiveAdaptor;
    @Mock private ComicRepository comicRepository;
    @Mock private Comic comic;
    @Mock private Worker worker;
    @Mock private ObjectFactory<QueueComicsWorkerTask> taskFactory;
    @Mock private QueueComicsWorkerTask queueComicsWorkerTask;

    @Test
    public void testGetImportFileCoverWithNoHandler()
            throws
            ComicFileHandlerException,
            ArchiveAdaptorException {
        Mockito.when(comicFileHandler.getArchiveAdaptorFor(Mockito.anyString()))
               .thenReturn(null);

        assertNull(service.getImportFileCover(TEST_COMIC_ARCHIVE));

        Mockito.verify(comicFileHandler,
                       Mockito.times(1))
               .getArchiveAdaptorFor(TEST_COMIC_ARCHIVE);
    }

    @Test
    public void testGetImportFileCoverWithNoCover()
            throws
            ComicFileHandlerException,
            ArchiveAdaptorException {
        Mockito.when(comicFileHandler.getArchiveAdaptorFor(Mockito.anyString()))
               .thenReturn(archiveAdaptor);
        Mockito.when(archiveAdaptor.getFirstImageFileName(Mockito.anyString()))
               .thenReturn(null);

        assertNull(service.getImportFileCover(TEST_COMIC_ARCHIVE));

        Mockito.verify(comicFileHandler,
                       Mockito.times(1))
               .getArchiveAdaptorFor(TEST_COMIC_ARCHIVE);
        Mockito.verify(archiveAdaptor,
                       Mockito.times(1))
               .getFirstImageFileName(TEST_COMIC_ARCHIVE);
    }

    @Test
    public void testGetImportFileCover()
            throws
            ComicFileHandlerException,
            ArchiveAdaptorException {
        Mockito.when(comicFileHandler.getArchiveAdaptorFor(Mockito.anyString()))
               .thenReturn(archiveAdaptor);
        Mockito.when(archiveAdaptor.getFirstImageFileName(Mockito.anyString()))
               .thenReturn(TEST_COVER_FILENAME);
        Mockito.when(archiveAdaptor.loadSingleFile(Mockito.anyString(),
                                                   Mockito.anyString()))
               .thenReturn(TEST_COVER_CONTENT);

        final byte[] result = service.getImportFileCover(TEST_COMIC_ARCHIVE);

        assertNotNull(result);
        assertEquals(TEST_COVER_CONTENT,
                     result);

        Mockito.verify(comicFileHandler,
                       Mockito.times(1))
               .getArchiveAdaptorFor(TEST_COMIC_ARCHIVE);
        Mockito.verify(archiveAdaptor,
                       Mockito.times(1))
               .getFirstImageFileName(TEST_COMIC_ARCHIVE);
        Mockito.verify(archiveAdaptor,
                       Mockito.times(1))
               .loadSingleFile(TEST_COMIC_ARCHIVE,
                               TEST_COVER_FILENAME);
    }

    @Test
    public void testGetAllComicsUnderInvalidDirectory()
            throws
            IOException {
        final List<FileDetails> result = service.getAllComicsUnder(TEST_ROOT_DIRECTORY + "/nonexistent");

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    public void testGetAllComicsUnderWithFileSupplied()
            throws
            IOException {
        final List<FileDetails> result = service.getAllComicsUnder(TEST_COMIC_ARCHIVE);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    public void testGetAllComicsAlreadyImported()
            throws
            IOException {
        Mockito.when(comicRepository.findByFilename(Mockito.anyString()))
               .thenReturn(comic);

        final List<FileDetails> result = service.getAllComicsUnder(TEST_ROOT_DIRECTORY);

        assertNotNull(result);
        assertTrue(result.isEmpty());

        Mockito.verify(comicRepository,
                       Mockito.times(1))
               .findByFilename(new File(TEST_COMIC_ARCHIVE).getCanonicalPath());
    }

    @Test
    public void testGetAllComicsUnder()
            throws
            IOException {
        final List<FileDetails> result = service.getAllComicsUnder(TEST_ROOT_DIRECTORY);

        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals(1,
                     result.size());
    }

    @Test
    public void testGetImportStatus()
            throws
            NoSuchAlgorithmException,
            InterruptedException {
        int expected = SecureRandom.getInstanceStrong()
                                   .nextInt(21275);
        Mockito.when(worker.getCountFor(AddComicWorkerTask.class))
               .thenReturn(expected);

        int result = service.getImportStatus();

        assertEquals(expected,
                     result);

        Mockito.verify(worker,
                       Mockito.times(1))
               .getCountFor(AddComicWorkerTask.class);
    }

    @Test
    public void testImportComicFilesDeleteBlockedPages()
            throws
            UnsupportedEncodingException {
        Mockito.when(taskFactory.getObject())
               .thenReturn(queueComicsWorkerTask);
        Mockito.doNothing()
               .when(queueComicsWorkerTask)
               .setDeleteBlockedPages(true);

        final int result = service.importComicFiles(TEST_FILENAMES,
                                                    true,
                                                    false);

        assertEquals(TEST_FILENAMES.length,
                     result);

        Mockito.verify(taskFactory,
                       Mockito.times(1))
               .getObject();
        Mockito.verify(queueComicsWorkerTask,
                       Mockito.times(1))
               .setDeleteBlockedPages(true);
        Mockito.verify(worker,
                       Mockito.times(1))
               .addTasksToQueue(queueComicsWorkerTask);
    }

    @Test
    public void testImportComicFilesIgnoreComicInfoXmlFile()
            throws
            UnsupportedEncodingException {
        Mockito.when(taskFactory.getObject())
               .thenReturn(queueComicsWorkerTask);
        Mockito.doNothing()
               .when(queueComicsWorkerTask)
               .setIgnoreMetadata(true);

        final int result = service.importComicFiles(TEST_FILENAMES,
                                                    false,
                                                    true);

        assertEquals(TEST_FILENAMES.length,
                     result);

        Mockito.verify(taskFactory,
                       Mockito.times(1))
               .getObject();
        Mockito.verify(queueComicsWorkerTask,
                       Mockito.times(1))
               .setIgnoreMetadata(true);
        Mockito.verify(worker,
                       Mockito.timeout(1))
               .addTasksToQueue(queueComicsWorkerTask);
    }

    @Test
    public void testImportComicFiles()
            throws
            UnsupportedEncodingException {
        Mockito.when(taskFactory.getObject())
               .thenReturn(queueComicsWorkerTask);

        final int result = service.importComicFiles(TEST_FILENAMES,
                                                    false,
                                                    false);

        assertEquals(TEST_FILENAMES.length,
                     result);

        Mockito.verify(taskFactory,
                       Mockito.times(1))
               .getObject();
        Mockito.verify(worker,
                       Mockito.times(1))
               .addTasksToQueue(queueComicsWorkerTask);
    }
}
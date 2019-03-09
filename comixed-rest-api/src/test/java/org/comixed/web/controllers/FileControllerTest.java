/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

package org.comixed.web.controllers;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import java.io.File;
import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.comixed.library.adaptors.archive.ArchiveAdaptor;
import org.comixed.library.adaptors.archive.ArchiveAdaptorException;
import org.comixed.library.model.Comic;
import org.comixed.library.model.ComicFileHandler;
import org.comixed.library.model.ComicFileHandlerException;
import org.comixed.library.model.FileDetails;
import org.comixed.repositories.ComicRepository;
import org.comixed.tasks.AddComicWorkerTask;
import org.comixed.tasks.QueueComicsWorkerTask;
import org.comixed.tasks.Worker;
import org.comixed.utils.ComicFileUtils;
import org.h2.store.fs.FileUtils;
import org.json.JSONException;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class FileControllerTest
{
    private static final String COVER_IMAGE_FILENAME = "coverimage.png";
    private static final String COMIC_ARCHIVE = "testcomic.cbz";
    private static final byte[] IMAGE_CONTENT = new byte[65535];
    private static final String TEST_FILE = "src/test/resources/example.cbz";
    private static final String TEST_DIRECTORY = "src/test";
    private static final String[] TEST_FILENAMES = new String[]
    {"First.cbz",
     "Second.cbz",
     "Third.cbr",
     "Fourth.cb7"};

    @InjectMocks
    private FileController controller;

    @Mock
    private ComicRepository comicRepository;

    @Mock
    private ComicFileHandler comicFileHandler;

    @Mock
    private ArchiveAdaptor archiveAdaptor;

    @Mock
    private Worker worker;

    @Mock
    private ObjectFactory<QueueComicsWorkerTask> taskFactory;

    @Mock
    private QueueComicsWorkerTask queueComicsWorkerTask;

    @Mock
    private Comic comic;

    @Test
    public void testGetImportFileCoverWithNoAdaptor() throws ComicFileHandlerException, ArchiveAdaptorException
    {
        Mockito.when(comicFileHandler.getArchiveAdaptorFor(COMIC_ARCHIVE)).thenReturn(null);

        assertNull(controller.getImportFileCover(COMIC_ARCHIVE));

        Mockito.verify(comicFileHandler, Mockito.times(1)).getArchiveAdaptorFor(COMIC_ARCHIVE);
    }

    @Test
    public void testGetImportFileCoverWithNoSuchFile() throws ArchiveAdaptorException, ComicFileHandlerException
    {
        Mockito.when(comicFileHandler.getArchiveAdaptorFor(COMIC_ARCHIVE)).thenReturn(archiveAdaptor);
        Mockito.when(archiveAdaptor.getFirstImageFileName(COMIC_ARCHIVE)).thenReturn(null);

        assertNull(controller.getImportFileCover(COMIC_ARCHIVE));

        Mockito.verify(comicFileHandler, Mockito.times(1)).getArchiveAdaptorFor(COMIC_ARCHIVE);
        Mockito.verify(archiveAdaptor, Mockito.times(1)).getFirstImageFileName(COMIC_ARCHIVE);
    }

    @Test
    public void testGetImportFileCover() throws ComicFileHandlerException, ArchiveAdaptorException
    {
        Mockito.when(comicFileHandler.getArchiveAdaptorFor(COMIC_ARCHIVE)).thenReturn(archiveAdaptor);
        Mockito.when(archiveAdaptor.getFirstImageFileName(COMIC_ARCHIVE)).thenReturn(COVER_IMAGE_FILENAME);
        Mockito.when(archiveAdaptor.loadSingleFile(COMIC_ARCHIVE, COVER_IMAGE_FILENAME)).thenReturn(IMAGE_CONTENT);

        assertEquals(IMAGE_CONTENT, controller.getImportFileCover(COMIC_ARCHIVE));

        Mockito.verify(comicFileHandler, Mockito.times(1)).getArchiveAdaptorFor(COMIC_ARCHIVE);
        Mockito.verify(archiveAdaptor, Mockito.times(1)).getFirstImageFileName(COMIC_ARCHIVE);
        Mockito.verify(archiveAdaptor, Mockito.times(1)).loadSingleFile(COMIC_ARCHIVE, COVER_IMAGE_FILENAME);
    }

    @Test
    public void testGetAllComicsUnderWithInvalidDirectory() throws IOException, JSONException
    {
        List<FileDetails> result = controller.getAllComicsUnder("src/test/resoureces/nonexistent");

        assertTrue(result.isEmpty());
    }

    @Test
    public void testGetAllComicsUnderForAFile() throws IOException, JSONException
    {
        List<FileDetails> result = controller.getAllComicsUnder(TEST_FILE);

        File file = new File(TEST_FILE);

        assertEquals(1, result.size());
        assertEquals(file.getAbsolutePath().replaceAll("\\\\", "/"), result.get(0).getFilename());
        assertEquals(FileUtils.getName(TEST_FILE), result.get(0).getBaseFilename());
        assertEquals(file.length(), result.get(0).getSize());
    }

    @Test
    public void testGetAllComicsUnder() throws IOException, JSONException
    {
        // way too much setup
        File contents = new File(TEST_DIRECTORY);
        Map<String,
            File> expectations = new HashMap<>();
        for (File file : contents.listFiles())
        {
            loadFiles(file, expectations);
        }

        Mockito.when(comicRepository.findByFilename(Mockito.anyString())).thenReturn(null);

        List<FileDetails> result = controller.getAllComicsUnder(TEST_DIRECTORY);

        Mockito.verify(comicRepository, Mockito.times(expectations.size())).findByFilename(Mockito.anyString());

        assertEquals(expectations.size(), result.size());
        for (FileDetails entry : result)
        {
            assertTrue(expectations.containsKey(entry.getFilename()));
            assertEquals(expectations.get(entry.getFilename()).getName(), entry.getBaseFilename());
            assertEquals(expectations.get(entry.getFilename()).length(), entry.getSize());
        }
    }

    @Test
    public void testGetAllComicsUnderAndAlreadyImported() throws IOException, JSONException
    {
        Mockito.when(comicRepository.findByFilename(Mockito.anyString())).thenReturn(comic);

        List<FileDetails> result = controller.getAllComicsUnder(TEST_DIRECTORY);

        assertTrue(result.isEmpty());

        Mockito.verify(comicRepository, Mockito.atLeastOnce()).findByFilename(Mockito.anyString());
    }

    private void loadFiles(File file,
                           Map<String,
                               File> expectations)
    {
        if (file.isDirectory())
        {
            for (File nextFile : file.listFiles())
            {
                loadFiles(nextFile, expectations);
            }
        }
        else
        {
            if (ComicFileUtils.isComicFile(file)) expectations.put(file.getAbsolutePath().replaceAll("\\\\", "/"),
                                                                   file);
        }
    }

    @Test
    public void testGetImportStatus() throws NoSuchAlgorithmException, InterruptedException
    {
        int expected = SecureRandom.getInstanceStrong().nextInt(21275);
        Mockito.when(worker.getCountFor(AddComicWorkerTask.class)).thenReturn(expected);

        int result = controller.getImportStatus();

        assertEquals(expected, result);

        Mockito.verify(worker, Mockito.times(1)).getCountFor(AddComicWorkerTask.class);
    }

    @Test
    public void testImportComicFiles()
    {
        Mockito.when(taskFactory.getObject()).thenReturn(queueComicsWorkerTask);

        controller.importComicFiles(TEST_FILENAMES, false);

        Mockito.verify(taskFactory, Mockito.times(1)).getObject();
        Mockito.verify(worker, Mockito.times(1)).addTasksToQueue(queueComicsWorkerTask);
    }

    @Test
    public void testImportComicFilesEncoded()
    {
        String[] fileNamesEncoded = new String[]
        {"e%3A%2Fcomics%20%26%20manga%2C%20etc%2B%2Ffirst_%231%3B.cbr",
         "f%3A%2Fcomics%40Home%2F~%2Fla%24t%20-%20(2000's)!.cbz"};

        QueueComicsWorkerTask dummyWorkerTask = new QueueComicsWorkerTask();

        Mockito.when(taskFactory.getObject()).thenReturn(dummyWorkerTask);

        controller.importComicFiles(fileNamesEncoded, false);

        Mockito.verify(taskFactory, Mockito.times(1)).getObject();
        Mockito.verify(worker, Mockito.times(1)).addTasksToQueue(dummyWorkerTask);

        assertEquals(2, dummyWorkerTask.filenames.size());
        assertEquals("e:/comics & manga, etc+/first_#1;.cbr", dummyWorkerTask.filenames.get(0));
        assertEquals("f:/comics@Home/~/la$t - (2000's)!.cbz", dummyWorkerTask.filenames.get(1));
    }

    @Test
    public void testImportComicFilesDeleteBlockedPages()
    {
        Mockito.when(taskFactory.getObject()).thenReturn(queueComicsWorkerTask);
        Mockito.doNothing().when(queueComicsWorkerTask).setDeleteBlockedPages(true);

        controller.importComicFiles(TEST_FILENAMES, true);

        Mockito.verify(taskFactory, Mockito.times(1)).getObject();
        Mockito.verify(queueComicsWorkerTask, Mockito.times(1)).setDeleteBlockedPages(true);
        Mockito.verify(worker, Mockito.times(1)).addTasksToQueue(queueComicsWorkerTask);
    }
}

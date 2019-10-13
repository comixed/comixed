/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

package org.comixed.task.model;

import org.comixed.adaptors.AdaptorException;
import org.comixed.adaptors.FilenameScraperAdaptor;
import org.comixed.handlers.ComicFileHandler;
import org.comixed.handlers.ComicFileHandlerException;
import org.comixed.model.library.Comic;
import org.comixed.model.library.Page;
import org.comixed.model.tasks.ProcessComicEntry;
import org.comixed.model.tasks.ProcessComicEntryType;
import org.comixed.repositories.ComicRepository;
import org.comixed.repositories.tasks.ProcessComicEntryRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.io.File;

import static junit.framework.TestCase.assertSame;

@RunWith(MockitoJUnitRunner.class)
@TestPropertySource(locations = "classpath:test-application.properties")
@SpringBootTest
public class AddComicWorkerTaskTest {
    private static final String TEST_CBZ_FILE = "src/test/resources/example.cbz";
    private static final String PAGE_HASH = "0123456789ABCDEF";

    @InjectMocks private AddComicWorkerTask task;
    @Mock private ComicFileHandler comicFileHandler;
    @Mock private ComicRepository comicRepository;
    @Mock private ProcessComicEntryRepository processComicEntryRepository;
    @Mock private ObjectFactory<Comic> comicFactory;
    @Mock private Comic comic;
    @Mock private Page page;
    @Mock private FilenameScraperAdaptor filenameScraperAdaptor;
    @Mock private ProcessComicEntry processComicEntry;
    @Captor private ArgumentCaptor<ProcessComicEntry> processComicEntryCaptor;

    @Test(expected = WorkerTaskException.class)
    public void testAddFileComicFileHandlerException()
            throws
            ComicFileHandlerException,
            WorkerTaskException {
        Mockito.when(comicFactory.getObject())
               .thenReturn(comic);
        Mockito.doThrow(ComicFileHandlerException.class)
               .when(comicFileHandler)
               .loadComicArchiveType(Mockito.any(Comic.class));

        try {
            File file = new File(TEST_CBZ_FILE);

            task.setFile(file);
            task.startTask();
        }
        finally {
            Mockito.verify(comicFactory,
                           Mockito.times(1))
                   .getObject();
            Mockito.verify(comicFileHandler,
                           Mockito.times(1))
                   .loadComicArchiveType(comic);
        }
    }

    @Test
    public void testAddFile()
            throws
            WorkerTaskException,
            ComicFileHandlerException,
            AdaptorException {
        Mockito.when(comicRepository.findByFilename(Mockito.anyString()))
               .thenReturn(null);
        Mockito.when(comicFactory.getObject())
               .thenReturn(comic);
        Mockito.doNothing()
               .when(comic)
               .setFilename(Mockito.anyString());
        Mockito.doNothing()
               .when(filenameScraperAdaptor)
               .execute(Mockito.any(Comic.class));
        Mockito.doNothing()
               .when(comicFileHandler)
               .loadComicArchiveType(Mockito.any(Comic.class));
        Mockito.when(comicRepository.save(Mockito.any(Comic.class)))
               .thenReturn(comic);
        Mockito.when(processComicEntryRepository.save(processComicEntryCaptor.capture()))
               .thenReturn(processComicEntry);

        task.setFile(new File(TEST_CBZ_FILE));
        task.startTask();

        assertSame(comic,
                   processComicEntryCaptor.getValue()
                                          .getComic());
        assertSame(ProcessComicEntryType.ADD_FILE_WITH_METADATA,
                   processComicEntryCaptor.getValue()
                                          .getProcessType());

        Mockito.verify(comicRepository,
                       Mockito.times(1))
               .findByFilename(new File(TEST_CBZ_FILE).getAbsolutePath());
        Mockito.verify(comicFactory,
                       Mockito.times(1))
               .getObject();
        Mockito.verify(comic,
                       Mockito.times(1))
               .setFilename(new File(TEST_CBZ_FILE).getAbsolutePath());
        Mockito.verify(filenameScraperAdaptor,
                       Mockito.times(1))
               .execute(comic);
        Mockito.verify(comicFileHandler,
                       Mockito.times(1))
               .loadComicArchiveType(comic);
        Mockito.verify(comicRepository,
                       Mockito.times(1))
               .save(comic);
        Mockito.verify(processComicEntryRepository,
                       Mockito.times(1))
               .save(processComicEntryCaptor.getValue());
    }

    @Test
    public void testAddFileIgnoreMetadata()
            throws
            WorkerTaskException,
            ComicFileHandlerException,
            AdaptorException {
        Mockito.when(comicRepository.findByFilename(Mockito.anyString()))
               .thenReturn(null);
        Mockito.when(comicFactory.getObject())
               .thenReturn(comic);
        Mockito.doNothing()
               .when(comic)
               .setFilename(Mockito.anyString());
        Mockito.doNothing()
               .when(filenameScraperAdaptor)
               .execute(Mockito.any(Comic.class));
        Mockito.doNothing()
               .when(comicFileHandler)
               .loadComicArchiveType(Mockito.any(Comic.class));
        Mockito.when(comicRepository.save(Mockito.any(Comic.class)))
               .thenReturn(comic);
        Mockito.when(processComicEntryRepository.save(processComicEntryCaptor.capture()))
               .thenReturn(processComicEntry);

        task.setFile(new File(TEST_CBZ_FILE));
        task.setIgnoreMetadata(true);
        task.startTask();

        assertSame(comic,
                   processComicEntryCaptor.getValue()
                                          .getComic());
        assertSame(ProcessComicEntryType.ADD_FILE_WITHOUT_METADATA,
                   processComicEntryCaptor.getValue()
                                          .getProcessType());

        Mockito.verify(comicRepository,
                       Mockito.times(1))
               .findByFilename(new File(TEST_CBZ_FILE).getAbsolutePath());
        Mockito.verify(comicFactory,
                       Mockito.times(1))
               .getObject();
        Mockito.verify(comic,
                       Mockito.times(1))
               .setFilename(new File(TEST_CBZ_FILE).getAbsolutePath());
        Mockito.verify(filenameScraperAdaptor,
                       Mockito.times(1))
               .execute(comic);
        Mockito.verify(comicFileHandler,
                       Mockito.times(1))
               .loadComicArchiveType(comic);
        Mockito.verify(comicRepository,
                       Mockito.times(1))
               .save(comic);
        Mockito.verify(processComicEntryRepository,
                       Mockito.times(1))
               .save(processComicEntryCaptor.getValue());
    }

    @Test
    public void testAddFileDeleteBlockedPages()
            throws
            WorkerTaskException,
            ComicFileHandlerException,
            AdaptorException {
        Mockito.when(comicRepository.findByFilename(Mockito.anyString()))
               .thenReturn(null);
        Mockito.when(comicFactory.getObject())
               .thenReturn(comic);
        Mockito.doNothing()
               .when(comic)
               .setFilename(Mockito.anyString());
        Mockito.doNothing()
               .when(filenameScraperAdaptor)
               .execute(Mockito.any(Comic.class));
        Mockito.doNothing()
               .when(comicFileHandler)
               .loadComicArchiveType(Mockito.any(Comic.class));
        Mockito.when(comicRepository.save(Mockito.any(Comic.class)))
               .thenReturn(comic);
        Mockito.when(processComicEntryRepository.save(processComicEntryCaptor.capture()))
               .thenReturn(processComicEntry);

        task.setFile(new File(TEST_CBZ_FILE));
        task.setDeleteBlockedPages(true);
        task.startTask();

        assertSame(comic,
                   processComicEntryCaptor.getValue()
                                          .getComic());
        assertSame(ProcessComicEntryType.ADD_FILE_DELETE_PAGES_WITH_METADATA,
                   processComicEntryCaptor.getValue()
                                          .getProcessType());

        Mockito.verify(comicRepository,
                       Mockito.times(1))
               .findByFilename(new File(TEST_CBZ_FILE).getAbsolutePath());
        Mockito.verify(comicFactory,
                       Mockito.times(1))
               .getObject();
        Mockito.verify(comic,
                       Mockito.times(1))
               .setFilename(new File(TEST_CBZ_FILE).getAbsolutePath());
        Mockito.verify(filenameScraperAdaptor,
                       Mockito.times(1))
               .execute(comic);
        Mockito.verify(comicFileHandler,
                       Mockito.times(1))
               .loadComicArchiveType(comic);
        Mockito.verify(comicRepository,
                       Mockito.times(1))
               .save(comic);
        Mockito.verify(processComicEntryRepository,
                       Mockito.times(1))
               .save(processComicEntryCaptor.getValue());
    }

    @Test
    public void testAddFileDeleteBlockedPagesIgnoreMetadata()
            throws
            WorkerTaskException,
            ComicFileHandlerException,
            AdaptorException {
        Mockito.when(comicRepository.findByFilename(Mockito.anyString()))
               .thenReturn(null);
        Mockito.when(comicFactory.getObject())
               .thenReturn(comic);
        Mockito.doNothing()
               .when(comic)
               .setFilename(Mockito.anyString());
        Mockito.doNothing()
               .when(filenameScraperAdaptor)
               .execute(Mockito.any(Comic.class));
        Mockito.doNothing()
               .when(comicFileHandler)
               .loadComicArchiveType(Mockito.any(Comic.class));
        Mockito.when(comicRepository.save(Mockito.any(Comic.class)))
               .thenReturn(comic);
        Mockito.when(processComicEntryRepository.save(processComicEntryCaptor.capture()))
               .thenReturn(processComicEntry);

        task.setFile(new File(TEST_CBZ_FILE));
        task.setDeleteBlockedPages(true);
        task.setIgnoreMetadata(true);
        task.startTask();

        assertSame(comic,
                   processComicEntryCaptor.getValue()
                                          .getComic());
        assertSame(ProcessComicEntryType.ADD_FILE_DELETE_PAGES_WITHOUT_METADATA,
                   processComicEntryCaptor.getValue()
                                          .getProcessType());

        Mockito.verify(comicRepository,
                       Mockito.times(1))
               .findByFilename(new File(TEST_CBZ_FILE).getAbsolutePath());
        Mockito.verify(comicFactory,
                       Mockito.times(1))
               .getObject();
        Mockito.verify(comic,
                       Mockito.times(1))
               .setFilename(new File(TEST_CBZ_FILE).getAbsolutePath());
        Mockito.verify(filenameScraperAdaptor,
                       Mockito.times(1))
               .execute(comic);
        Mockito.verify(comicFileHandler,
                       Mockito.times(1))
               .loadComicArchiveType(comic);
        Mockito.verify(comicRepository,
                       Mockito.times(1))
               .save(comic);
        Mockito.verify(processComicEntryRepository,
                       Mockito.times(1))
               .save(processComicEntryCaptor.getValue());
    }
}

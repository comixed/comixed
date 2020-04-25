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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixed.task.model;

import java.io.File;
import org.comixed.adaptors.AdaptorException;
import org.comixed.adaptors.FilenameScraperAdaptor;
import org.comixed.handlers.ComicFileHandler;
import org.comixed.handlers.ComicFileHandlerException;
import org.comixed.model.comic.Comic;
import org.comixed.model.comic.Page;
import org.comixed.model.tasks.Task;
import org.comixed.repositories.comic.ComicRepository;
import org.comixed.repositories.tasks.TaskRepository;
import org.comixed.task.encoders.ProcessComicTaskEncoder;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@RunWith(MockitoJUnitRunner.class)
@TestPropertySource(locations = "classpath:application.properties")
@SpringBootTest
public class AddComicWorkerTaskTest {
  private static final String TEST_CBZ_FILE = "src/test/resources/example.cbz";
  private static final String PAGE_HASH = "0123456789ABCDEF";

  @InjectMocks private AddComicWorkerTask task;
  @Mock private ComicFileHandler comicFileHandler;
  @Mock private ComicRepository comicRepository;
  @Mock private ObjectFactory<Comic> comicFactory;
  @Mock private Comic comic;
  @Mock private Page page;
  @Mock private FilenameScraperAdaptor filenameScraperAdaptor;
  @Mock private ObjectFactory<ProcessComicTaskEncoder> processComicTaskEncoderObjectFactory;
  @Mock private ProcessComicTaskEncoder processComicTaskEncoder;
  @Mock private Task workerTask;
  @Mock private TaskRepository taskRepository;

  @Test
  public void testAddFile()
      throws WorkerTaskException, ComicFileHandlerException, AdaptorException {
    Mockito.when(comicRepository.findByFilename(Mockito.anyString())).thenReturn(null);
    Mockito.when(comicFactory.getObject()).thenReturn(comic);
    Mockito.when(comicRepository.save(Mockito.any(Comic.class))).thenReturn(comic);
    Mockito.when(processComicTaskEncoderObjectFactory.getObject())
        .thenReturn(processComicTaskEncoder);
    Mockito.when(processComicTaskEncoder.encode()).thenReturn(workerTask);

    task.setDeleteBlockedPages(false);
    task.setIgnoreMetadata(false);

    task.setFilename(TEST_CBZ_FILE);
    task.startTask();

    Mockito.verify(comicRepository, Mockito.times(1))
        .findByFilename(new File(TEST_CBZ_FILE).getAbsolutePath());
    Mockito.verify(comicFactory, Mockito.times(1)).getObject();
    Mockito.verify(comic, Mockito.times(1)).setFilename(new File(TEST_CBZ_FILE).getAbsolutePath());
    Mockito.verify(filenameScraperAdaptor, Mockito.times(1)).execute(comic);
    Mockito.verify(comicFileHandler, Mockito.times(1)).loadComicArchiveType(comic);
    Mockito.verify(comicRepository, Mockito.times(1)).save(comic);
    Mockito.verify(processComicTaskEncoder, Mockito.times(1)).setComic(comic);
    Mockito.verify(processComicTaskEncoder, Mockito.times(1)).setDeleteBlockedPages(false);
    Mockito.verify(processComicTaskEncoder, Mockito.times(1)).setIgnoreMetadata(false);
  }

  @Test
  public void testAddFileIgnoreMetadata()
      throws WorkerTaskException, ComicFileHandlerException, AdaptorException {
    Mockito.when(comicRepository.findByFilename(Mockito.anyString())).thenReturn(null);
    Mockito.when(comicFactory.getObject()).thenReturn(comic);
    Mockito.when(comicRepository.save(Mockito.any(Comic.class))).thenReturn(comic);
    Mockito.when(processComicTaskEncoderObjectFactory.getObject())
        .thenReturn(processComicTaskEncoder);
    Mockito.when(processComicTaskEncoder.encode()).thenReturn(workerTask);

    task.setDeleteBlockedPages(false);
    task.setIgnoreMetadata(true);

    task.setFilename(TEST_CBZ_FILE);
    task.startTask();

    Mockito.verify(comicRepository, Mockito.times(1))
        .findByFilename(new File(TEST_CBZ_FILE).getAbsolutePath());
    Mockito.verify(comicFactory, Mockito.times(1)).getObject();
    Mockito.verify(comic, Mockito.times(1)).setFilename(new File(TEST_CBZ_FILE).getAbsolutePath());
    Mockito.verify(filenameScraperAdaptor, Mockito.times(1)).execute(comic);
    Mockito.verify(comicFileHandler, Mockito.times(1)).loadComicArchiveType(comic);
    Mockito.verify(comicRepository, Mockito.times(1)).save(comic);
    Mockito.verify(processComicTaskEncoder, Mockito.times(1)).setComic(comic);
    Mockito.verify(processComicTaskEncoder, Mockito.times(1)).setDeleteBlockedPages(false);
    Mockito.verify(processComicTaskEncoder, Mockito.times(1)).setIgnoreMetadata(true);
  }

  @Test
  public void testAddFileDeleteBlockedPages()
      throws WorkerTaskException, ComicFileHandlerException, AdaptorException {
    Mockito.when(comicRepository.findByFilename(Mockito.anyString())).thenReturn(null);
    Mockito.when(comicFactory.getObject()).thenReturn(comic);
    Mockito.when(comicRepository.save(Mockito.any(Comic.class))).thenReturn(comic);
    Mockito.when(processComicTaskEncoderObjectFactory.getObject())
        .thenReturn(processComicTaskEncoder);
    Mockito.when(processComicTaskEncoder.encode()).thenReturn(workerTask);

    task.setDeleteBlockedPages(true);
    task.setIgnoreMetadata(false);

    task.setFilename(TEST_CBZ_FILE);
    task.startTask();

    Mockito.verify(comicRepository, Mockito.times(1))
        .findByFilename(new File(TEST_CBZ_FILE).getAbsolutePath());
    Mockito.verify(comicFactory, Mockito.times(1)).getObject();
    Mockito.verify(comic, Mockito.times(1)).setFilename(new File(TEST_CBZ_FILE).getAbsolutePath());
    Mockito.verify(filenameScraperAdaptor, Mockito.times(1)).execute(comic);
    Mockito.verify(comicFileHandler, Mockito.times(1)).loadComicArchiveType(comic);
    Mockito.verify(comicRepository, Mockito.times(1)).save(comic);
    Mockito.verify(processComicTaskEncoder, Mockito.times(1)).setComic(comic);
    Mockito.verify(processComicTaskEncoder, Mockito.times(1)).setDeleteBlockedPages(true);
    Mockito.verify(processComicTaskEncoder, Mockito.times(1)).setIgnoreMetadata(false);
  }

  @Test
  public void testAddFileDeleteBlockedPagesIgnoreMetadata()
      throws WorkerTaskException, ComicFileHandlerException, AdaptorException {
    Mockito.when(comicRepository.findByFilename(Mockito.anyString())).thenReturn(null);
    Mockito.when(comicFactory.getObject()).thenReturn(comic);
    Mockito.when(comicRepository.save(Mockito.any(Comic.class))).thenReturn(comic);
    Mockito.when(processComicTaskEncoderObjectFactory.getObject())
        .thenReturn(processComicTaskEncoder);
    Mockito.when(processComicTaskEncoder.encode()).thenReturn(workerTask);

    task.setDeleteBlockedPages(true);
    task.setIgnoreMetadata(true);

    task.setFilename(TEST_CBZ_FILE);
    task.startTask();

    Mockito.verify(comicRepository, Mockito.times(1))
        .findByFilename(new File(TEST_CBZ_FILE).getAbsolutePath());
    Mockito.verify(comicFactory, Mockito.times(1)).getObject();
    Mockito.verify(comic, Mockito.times(1)).setFilename(new File(TEST_CBZ_FILE).getAbsolutePath());
    Mockito.verify(filenameScraperAdaptor, Mockito.times(1)).execute(comic);
    Mockito.verify(comicFileHandler, Mockito.times(1)).loadComicArchiveType(comic);
    Mockito.verify(comicRepository, Mockito.times(1)).save(comic);
    Mockito.verify(processComicTaskEncoder, Mockito.times(1)).setComic(comic);
    Mockito.verify(processComicTaskEncoder, Mockito.times(1)).setDeleteBlockedPages(true);
    Mockito.verify(processComicTaskEncoder, Mockito.times(1)).setIgnoreMetadata(true);
  }
}

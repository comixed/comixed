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

package org.comixedproject.task.model;

import java.io.IOException;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.handlers.ComicFileHandler;
import org.comixedproject.handlers.ComicFileHandlerException;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.service.comic.ComicService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@RunWith(MockitoJUnitRunner.class)
@TestPropertySource(locations = "classpath:application.properties")
@SpringBootTest
public class ExportComicWorkerTaskTest {
  private static final String TEST_COMIC_FILENAME = "/Users/comixeduser/Comics/thiscomic.cbz";

  @InjectMocks private ExportComicWorkerTask workerTask;
  @Mock private ComicFileHandler comicFileHandler;
  @Mock private ComicService comicService;
  @Mock private ArchiveAdaptor archiveAdaptor;
  @Mock private Comic comic;

  @Before
  public void setUp() {
    workerTask.setArchiveAdaptor(archiveAdaptor);
    workerTask.setComic(comic);
  }

  @Test(expected = WorkerTaskException.class)
  public void testStartTaskComicFileHandlerRaisesException()
      throws ComicFileHandlerException, WorkerTaskException {
    Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILENAME);
    Mockito.doThrow(new ComicFileHandlerException("Expected"))
        .when(comicFileHandler)
        .loadComic(Mockito.any(Comic.class));

    try {
      workerTask.startTask();
    } finally {
      Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
      Mockito.verify(comicFileHandler, Mockito.times(1)).loadComic(comic);
    }
  }

  @Test(expected = WorkerTaskException.class)
  public void testStartTaskArchiveAdaptorRaisesException()
      throws ComicFileHandlerException, ArchiveAdaptorException, WorkerTaskException, IOException {
    Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILENAME);
    Mockito.doNothing().when(comicFileHandler).loadComic(Mockito.any(Comic.class));
    Mockito.doThrow(new ArchiveAdaptorException("Expected"))
        .when(archiveAdaptor)
        .saveComic(Mockito.any(Comic.class), Mockito.anyBoolean());

    try {
      workerTask.startTask();
    } finally {
      Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
      Mockito.verify(comicFileHandler, Mockito.times(1)).loadComic(comic);
      Mockito.verify(archiveAdaptor, Mockito.times(1)).saveComic(comic, false);
    }
  }

  @Test
  public void testStartTaskWithRenamePages()
      throws ArchiveAdaptorException, ComicFileHandlerException, WorkerTaskException, IOException {
    Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILENAME);
    Mockito.doNothing().when(comicFileHandler).loadComic(Mockito.any(Comic.class));
    Mockito.when(archiveAdaptor.saveComic(Mockito.any(Comic.class), Mockito.anyBoolean()))
        .thenReturn(comic);

    workerTask.setRenamePages(true);
    workerTask.startTask();

    Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
    Mockito.verify(comicFileHandler, Mockito.times(1)).loadComic(comic);
    Mockito.verify(archiveAdaptor, Mockito.times(1)).saveComic(comic, true);
  }

  @Test
  public void testStartTask()
      throws ComicFileHandlerException, ArchiveAdaptorException, WorkerTaskException, IOException {
    Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILENAME);
    Mockito.doNothing().when(comicFileHandler).loadComic(Mockito.any(Comic.class));
    Mockito.when(archiveAdaptor.saveComic(Mockito.any(Comic.class), Mockito.anyBoolean()))
        .thenReturn(comic);

    workerTask.startTask();

    Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
    Mockito.verify(comicFileHandler, Mockito.times(1)).loadComic(comic);
    Mockito.verify(archiveAdaptor, Mockito.times(1)).saveComic(comic, false);
  }
}

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

package org.comixedproject.task;

import static junit.framework.TestCase.assertNotNull;

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
public class ExportComicTaskTest {
  private static final String TEST_COMIC_FILENAME = "/Users/comixeduser/Comics/thiscomic.cbz";

  @InjectMocks private ExportComicTask task;
  @Mock private ComicService comicService;
  @Mock private ComicFileHandler comicFileHandler;
  @Mock private ArchiveAdaptor archiveAdaptor;
  @Mock private Comic comic;

  @Before
  public void setUp() {
    task.setArchiveAdaptor(archiveAdaptor);
    task.setComic(comic);
  }

  @Test
  public void testCreateDescription() {
    assertNotNull(task.createDescription());
  }

  @Test(expected = TaskException.class)
  public void testStartTaskComicFileHandlerRaisesException()
      throws ComicFileHandlerException, TaskException {
    Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILENAME);
    Mockito.doThrow(new ComicFileHandlerException("Expected"))
        .when(comicFileHandler)
        .loadComic(Mockito.any(Comic.class));

    try {
      task.startTask();
    } finally {
      Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
      Mockito.verify(comicFileHandler, Mockito.times(1)).loadComic(comic);
    }
  }

  @Test(expected = TaskException.class)
  public void testStartTaskArchiveAdaptorRaisesException()
      throws ComicFileHandlerException, ArchiveAdaptorException, TaskException, IOException {
    Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILENAME);
    Mockito.doNothing().when(comicFileHandler).loadComic(Mockito.any(Comic.class));
    Mockito.doThrow(new ArchiveAdaptorException("Expected"))
        .when(archiveAdaptor)
        .saveComic(Mockito.any(Comic.class), Mockito.anyBoolean());

    try {
      task.startTask();
    } finally {
      Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
      Mockito.verify(comicFileHandler, Mockito.times(1)).loadComic(comic);
      Mockito.verify(archiveAdaptor, Mockito.times(1)).saveComic(comic, false);
    }
  }

  @Test
  public void testStartTaskWithRenamePages()
      throws ArchiveAdaptorException, ComicFileHandlerException, TaskException, IOException {
    Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILENAME);
    Mockito.doNothing().when(comicFileHandler).loadComic(Mockito.any(Comic.class));
    Mockito.when(archiveAdaptor.saveComic(Mockito.any(Comic.class), Mockito.anyBoolean()))
        .thenReturn(comic);

    task.setRenamePages(true);
    task.startTask();

    Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
    Mockito.verify(comicFileHandler, Mockito.times(1)).loadComic(comic);
    Mockito.verify(archiveAdaptor, Mockito.times(1)).saveComic(comic, true);
    Mockito.verify(comicService, Mockito.times(1)).save(comic);
  }

  @Test
  public void testStartTask()
      throws ComicFileHandlerException, ArchiveAdaptorException, TaskException, IOException {
    Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILENAME);
    Mockito.doNothing().when(comicFileHandler).loadComic(Mockito.any(Comic.class));
    Mockito.when(archiveAdaptor.saveComic(Mockito.any(Comic.class), Mockito.anyBoolean()))
        .thenReturn(comic);

    task.startTask();

    Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
    Mockito.verify(comicFileHandler, Mockito.times(1)).loadComic(comic);
    Mockito.verify(archiveAdaptor, Mockito.times(1)).saveComic(comic, false);
    Mockito.verify(comicService, Mockito.times(1)).save(comic);
  }
}

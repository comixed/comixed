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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject.task.model;

import static junit.framework.TestCase.assertEquals;

import java.io.IOException;
import java.io.InputStream;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.handlers.ComicFileHandler;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.ComicFileDetails;
import org.comixedproject.repositories.comic.ComicRepository;
import org.comixedproject.utils.Utils;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@RunWith(MockitoJUnitRunner.class)
@TestPropertySource(locations = "classpath:application.properties")
@SpringBootTest
public class ProcessComicTaskTest {
  private static final String TEST_FILE_HASH = "OICU812";
  private static final String TEST_COMIC_FILENAME = "src/test/resources/example.cbz";

  @InjectMocks private ProcessComicTask task;
  @Mock private Comic comic;
  @Captor private ArgumentCaptor<ComicFileDetails> comicFileDetailsCaptor;
  @Mock private ArchiveAdaptor archiveAdaptor;
  @Mock private ComicRepository comicRepository;
  @Mock private Utils utils;
  @Mock private ComicFileHandler comicFileHandler;

  private ArchiveType archiveType = ArchiveType.CBZ;

  @Test
  public void testStartTask() throws WorkerTaskException, ArchiveAdaptorException, IOException {
    Mockito.when(comic.getArchiveType()).thenReturn(archiveType);
    Mockito.when(comicFileHandler.getArchiveAdaptorFor(Mockito.any(ArchiveType.class)))
        .thenReturn(archiveAdaptor);
    Mockito.doNothing().when(archiveAdaptor).loadComic(comic);
    Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILENAME);
    Mockito.when(utils.createHash(Mockito.any(InputStream.class))).thenReturn(TEST_FILE_HASH);
    Mockito.doNothing().when(comic).setFileDetails(comicFileDetailsCaptor.capture());
    Mockito.when(comicRepository.save(Mockito.any(Comic.class))).thenReturn(comic);

    task.setComic(comic);
    task.setIgnoreMetadata(false);
    task.setDeleteBlockedPages(false);

    task.startTask();

    assertEquals(TEST_FILE_HASH, comicFileDetailsCaptor.getValue().getHash());

    Mockito.verify(comicFileHandler, Mockito.times(1)).getArchiveAdaptorFor(archiveType);
    Mockito.verify(archiveAdaptor, Mockito.times(1)).loadComic(comic);
    Mockito.verify(comic, Mockito.times(1)).setFileDetails(comicFileDetailsCaptor.getValue());
    Mockito.verify(comicRepository, Mockito.times(1)).save(comic);
  }
}

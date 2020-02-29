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

package org.comixed.task.model;

import org.comixed.adaptors.archive.ArchiveAdaptor;
import org.comixed.adaptors.archive.ArchiveAdaptorException;
import org.comixed.model.library.Comic;
import org.comixed.model.library.ComicFileDetails;
import org.comixed.repositories.library.ComicRepository;
import org.comixed.utils.Utils;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.io.IOException;
import java.io.InputStream;

import static junit.framework.TestCase.assertEquals;

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

  @Test
  public void testStartTask() throws WorkerTaskException, ArchiveAdaptorException, IOException {
    Mockito.when(comic.getArchiveAdaptor()).thenReturn(archiveAdaptor);
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

    Mockito.verify(comic, Mockito.times(1)).getArchiveAdaptor();
    Mockito.verify(archiveAdaptor, Mockito.times(1)).loadComic(comic);
    Mockito.verify(comic, Mockito.times(1)).setFileDetails(comicFileDetailsCaptor.getValue());
    Mockito.verify(comicRepository, Mockito.times(1)).save(comic);
  }
}

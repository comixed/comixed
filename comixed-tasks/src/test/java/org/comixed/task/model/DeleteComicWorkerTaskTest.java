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
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.io.FileUtils;
import org.comixed.model.comic.Comic;
import org.comixed.repositories.comic.ComicRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(PowerMockRunner.class)
@PrepareForTest(FileUtils.class)
@SpringBootTest
public class DeleteComicWorkerTaskTest {
  private static final String TEST_FILENAME = "/Users/comixed/Comics/comic.cbz";

  private static final long TEST_COMIC_ID = 23;

  @InjectMocks private DeleteComicWorkerTask workerTask;
  @Mock private ComicRepository comicRepository;
  @Mock private List<Comic> comicList;
  @Mock private Comic comic;
  @Captor private ArgumentCaptor<File> file;

  private List<Long> comicIds = new ArrayList<>();

  @Before
  public void setUp() {
    workerTask.setComic(comic);
    workerTask.setDeleteFile(true);
  }

  @Test
  public void testStartTask() throws WorkerTaskException {
    workerTask.setComic(comic);
    workerTask.setDeleteFile(false);

    workerTask.startTask();

    Mockito.verify(comic, Mockito.times(1)).setDateDeleted(Mockito.any());
    Mockito.verify(comic, Mockito.times(1)).setDateLastUpdated(Mockito.any());
    Mockito.verify(comicRepository, Mockito.times(1)).save(comic);
  }

  @Test
  public void testStartTaskDeleteFile() throws WorkerTaskException, IOException {
    Mockito.when(comic.getFilename()).thenReturn(TEST_FILENAME);

    PowerMockito.mockStatic(FileUtils.class);
    PowerMockito.doNothing().when(FileUtils.class);
    FileUtils.forceDelete(Mockito.any());

    workerTask.setComic(comic);
    workerTask.setDeleteFile(true);

    workerTask.startTask();

    Mockito.verify(comicRepository, Mockito.times(1)).delete(comic);
    PowerMockito.verifyStatic(FileUtils.class, Mockito.times(1));
    FileUtils.forceDelete(Mockito.any());
  }
}

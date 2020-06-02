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

import static junit.framework.TestCase.assertTrue;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.apache.commons.io.FileUtils;
import org.comixed.model.comic.Comic;
import org.comixed.model.library.ReadingList;
import org.comixed.repositories.comic.ComicRepository;
import org.comixed.repositories.library.ReadingListRepository;
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

  private static final int TEST_READING_LIST_COUNT = 25;

  @InjectMocks private DeleteComicWorkerTask workerTask;
  @Mock private ComicRepository comicRepository;
  @Mock private ReadingListRepository readingListRepository;
  @Mock private List<Comic> comicList;
  @Mock private Comic comic;
  @Captor private ArgumentCaptor<File> file;
  @Mock private ReadingList readingList;

  private List<Long> comicIds = new ArrayList<>();

  @Before
  public void setUp() {
    workerTask.setComic(comic);
    workerTask.setDeleteFile(true);
  }

  @Test
  public void testStartTask() throws WorkerTaskException {
    Set<ReadingList> readingLists = new HashSet<>();
    for (int index = 0; index < TEST_READING_LIST_COUNT; index++) {
      ReadingList list = new ReadingList();
      list.setName("List" + index);
      list.setSummary("List" + index);
      readingLists.add(list);
      readingList.getComics().add(comic);
    }
    Mockito.when(comic.getReadingLists()).thenReturn(readingLists);

    workerTask.setComic(comic);
    workerTask.setDeleteFile(false);

    workerTask.startTask();

    assertTrue(readingLists.isEmpty());

    Mockito.verify(readingListRepository, Mockito.times(TEST_READING_LIST_COUNT))
        .save(Mockito.any(ReadingList.class));
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

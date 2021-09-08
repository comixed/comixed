/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project.
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

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.tasks.PersistedTask;
import org.comixedproject.model.tasks.PersistedTaskType;
import org.comixedproject.service.comicbooks.ComicException;
import org.comixedproject.service.comicbooks.ComicService;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.adaptors.TaskAdaptor;
import org.comixedproject.task.encoders.MarkComicForRemovalTaskEncoder;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class MarkComicsForRemovalTaskTest {
  private static final Long TEST_COMIC_ID = 213L;

  @InjectMocks private MarkComicsForRemovalTask task;
  @Mock private TaskAdaptor taskAdaptor;
  @Mock private TaskService taskService;
  @Mock private MarkComicForRemovalTaskEncoder markComicForRemovalTaskEncoder;
  @Mock private ComicService comicService;
  @Mock private Comic comic;
  @Mock private PersistedTask persistedTaskRecord;

  @Captor private ArgumentCaptor<PersistedTask> taskArgumentCaptor;

  private List<Long> idList = new ArrayList<>();

  @Test
  public void testCreateDescription() {
    task.setComicIds(idList);
    assertNotNull(task.createDescription());
  }

  @Test
  public void testStartTask() throws TaskException, TaskException, ComicException {
    idList.add(TEST_COMIC_ID);

    Mockito.when(taskAdaptor.getEncoder(Mockito.any(PersistedTaskType.class)))
        .thenReturn(markComicForRemovalTaskEncoder);
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(taskService.save(taskArgumentCaptor.capture())).thenReturn(persistedTaskRecord);

    task.setComicIds(idList);
    task.startTask();

    Mockito.verify(taskAdaptor, Mockito.times(idList.size()))
        .getEncoder(PersistedTaskType.MARK_COMIC_FOR_REMOVAL);
    Mockito.verify(markComicForRemovalTaskEncoder, Mockito.times(idList.size())).setComic(comic);
    Mockito.verify(taskService, Mockito.times(idList.size())).save(taskArgumentCaptor.getValue());
  }
}

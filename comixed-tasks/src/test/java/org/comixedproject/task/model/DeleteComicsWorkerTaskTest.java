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

package org.comixedproject.task.model;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.tasks.Task;
import org.comixedproject.model.tasks.TaskType;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.TaskException;
import org.comixedproject.task.adaptors.WorkerTaskAdaptor;
import org.comixedproject.task.encoders.DeleteComicWorkerTaskEncoder;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class DeleteComicsWorkerTaskTest {
  private static final Long TEST_COMIC_ID = 213L;

  @InjectMocks private DeleteComicsWorkerTask task;
  @Mock private WorkerTaskAdaptor workerTaskAdaptor;
  @Mock private TaskService taskService;
  @Mock private DeleteComicWorkerTaskEncoder deleteComicTaskEncoder;
  @Mock private ComicService comicService;
  @Mock private Comic comic;
  @Captor private ArgumentCaptor<Task> taskArgumentCaptor;
  @Mock private Task taskRecord;

  @Test
  public void testStartTask() throws WorkerTaskException, TaskException, ComicException {
    List<Long> ids = new ArrayList<>();
    ids.add(TEST_COMIC_ID);

    Mockito.when(workerTaskAdaptor.getEncoder(Mockito.any(TaskType.class)))
        .thenReturn(deleteComicTaskEncoder);
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(taskService.save(taskArgumentCaptor.capture())).thenReturn(taskRecord);

    task.setComicIds(ids);
    task.startTask();

    Mockito.verify(workerTaskAdaptor, Mockito.times(ids.size())).getEncoder(TaskType.DELETE_COMIC);
    Mockito.verify(deleteComicTaskEncoder, Mockito.times(ids.size())).setComic(comic);
    Mockito.verify(deleteComicTaskEncoder, Mockito.times(ids.size())).setDeleteComicFile(false);
    Mockito.verify(taskService, Mockito.times(ids.size())).save(taskArgumentCaptor.getValue());
  }
}

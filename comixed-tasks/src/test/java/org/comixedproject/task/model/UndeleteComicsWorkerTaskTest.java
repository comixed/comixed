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
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.encoders.UndeleteComicWorkerTaskEncoder;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;

@RunWith(MockitoJUnitRunner.class)
public class UndeleteComicsWorkerTaskTest {
  @InjectMocks private UndeleteComicsWorkerTask workerTask;
  @Mock private ObjectFactory<UndeleteComicWorkerTaskEncoder> undeleteComicTaskEncoderObjectFactory;
  @Mock private UndeleteComicWorkerTaskEncoder undeleteComicWorkerTaskEncoder;
  @Mock private Task task;
  @Mock private ComicService comicService;
  @Mock private Comic comic;
  @Mock private TaskService taskService;

  private List<Long> ids = new ArrayList<>();

  @Test
  public void testStartTask() throws WorkerTaskException, ComicException {
    for (long index = 0L; index < 25L; index++) ids.add(index);

    Mockito.when(undeleteComicTaskEncoderObjectFactory.getObject())
        .thenReturn(undeleteComicWorkerTaskEncoder);
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(undeleteComicWorkerTaskEncoder.encode()).thenReturn(task);
    Mockito.when(taskService.save(Mockito.any(Task.class))).thenReturn(task);

    workerTask.setIds(ids);

    workerTask.startTask();

    Mockito.verify(undeleteComicTaskEncoderObjectFactory, Mockito.times(ids.size())).getObject();
    for (int index = 0; index < ids.size(); index++) {
      Mockito.verify(comicService, Mockito.times(1)).getComic(ids.get(index));
    }
    Mockito.verify(undeleteComicWorkerTaskEncoder, Mockito.times(ids.size())).setComic(comic);
    Mockito.verify(taskService, Mockito.times(ids.size())).save(task);
  }
}

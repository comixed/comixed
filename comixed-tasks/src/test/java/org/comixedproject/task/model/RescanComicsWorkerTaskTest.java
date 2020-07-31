/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import static junit.framework.TestCase.assertNotNull;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.tasks.Task;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.encoders.RescanComicWorkerTaskEncoder;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;

@RunWith(MockitoJUnitRunner.class)
public class RescanComicsWorkerTaskTest {
  @InjectMocks private RescanComicsWorkerTask rescanComicsWorkerTask;

  @Mock
  private ObjectFactory<RescanComicWorkerTaskEncoder> rescanComicWorkerTaskEncoderObjectFactory;

  @Mock private RescanComicWorkerTaskEncoder rescanComicWorkerTaskEncoder;
  @Mock private ComicService comicService;
  @Mock private Comic comic;
  @Mock private TaskService taskService;
  @Mock private Task task;
  @Mock private Task savedTask;

  private List<Comic> comicList = new ArrayList<>();

  @Test
  public void testGetDescription() {
    assertNotNull(rescanComicsWorkerTask.createDescription());
  }

  @Test
  public void testStartTask() throws WorkerTaskException {
    for (int index = 0; index < 33; index++) comicList.add(comic);

    Mockito.when(comicService.getComicsById(Mockito.anyLong(), Mockito.anyInt()))
        .thenReturn(comicList, Collections.emptyList());
    Mockito.when(rescanComicWorkerTaskEncoderObjectFactory.getObject())
        .thenReturn(rescanComicWorkerTaskEncoder);
    Mockito.when(rescanComicWorkerTaskEncoder.encode()).thenReturn(task);
    Mockito.when(taskService.save(Mockito.any(Task.class))).thenReturn(savedTask);

    rescanComicsWorkerTask.startTask();

    Mockito.verify(rescanComicWorkerTaskEncoderObjectFactory, Mockito.times(comicList.size()))
        .getObject();
    Mockito.verify(rescanComicWorkerTaskEncoder, Mockito.times(comicList.size())).setComic(comic);
    Mockito.verify(rescanComicWorkerTaskEncoder, Mockito.times(comicList.size())).encode();
    Mockito.verify(taskService, Mockito.times(comicList.size())).save(task);
  }
}

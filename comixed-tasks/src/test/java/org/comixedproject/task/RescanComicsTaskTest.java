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

package org.comixedproject.task;

import static junit.framework.TestCase.assertNotNull;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.tasks.PersistedTask;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.encoders.RescanComicTaskEncoder;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;

@RunWith(MockitoJUnitRunner.class)
public class RescanComicsTaskTest {
  @InjectMocks private RescanComicsTask task;
  @Mock private ObjectFactory<RescanComicTaskEncoder> rescanComicTaskEncoderObjectFactory;
  @Mock private RescanComicTaskEncoder rescanComicTaskEncoder;
  @Mock private ComicService comicService;
  @Mock private Comic comic;
  @Mock private TaskService taskService;
  @Mock private PersistedTask persistedTask;
  @Mock private PersistedTask savedPersistedTask;

  private List<Comic> comicList = new ArrayList<>();

  @Test
  public void testGetDescription() {
    assertNotNull(task.createDescription());
  }

  @Test
  public void testStartTask() throws TaskException {
    for (int index = 0; index < 33; index++) comicList.add(comic);

    Mockito.when(comicService.getComicsById(Mockito.anyLong(), Mockito.anyInt()))
        .thenReturn(comicList, Collections.emptyList());
    Mockito.when(rescanComicTaskEncoderObjectFactory.getObject())
        .thenReturn(rescanComicTaskEncoder);
    Mockito.when(rescanComicTaskEncoder.encode()).thenReturn(persistedTask);
    Mockito.when(taskService.save(Mockito.any(PersistedTask.class))).thenReturn(savedPersistedTask);

    task.startTask();

    Mockito.verify(rescanComicTaskEncoderObjectFactory, Mockito.times(comicList.size()))
        .getObject();
    Mockito.verify(rescanComicTaskEncoder, Mockito.times(comicList.size())).setComic(comic);
    Mockito.verify(rescanComicTaskEncoder, Mockito.times(comicList.size())).encode();
    Mockito.verify(taskService, Mockito.times(comicList.size())).save(persistedTask);
  }
}

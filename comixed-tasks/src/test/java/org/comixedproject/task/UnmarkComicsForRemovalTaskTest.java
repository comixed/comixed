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
import org.comixedproject.service.comicbooks.ComicException;
import org.comixedproject.service.comicbooks.ComicService;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.encoders.UnmarkComicForRemovalTaskEncoder;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;

@RunWith(MockitoJUnitRunner.class)
public class UnmarkComicsForRemovalTaskTest {
  @InjectMocks private UnmarkComicsForRemovalTask task;

  @Mock
  private ObjectFactory<UnmarkComicForRemovalTaskEncoder> undeleteComicTaskEncoderObjectFactory;

  @Mock private UnmarkComicForRemovalTaskEncoder unmarkComicForRemovalTaskEncoder;
  @Mock private PersistedTask persistedTask;
  @Mock private ComicService comicService;
  @Mock private Comic comic;
  @Mock private TaskService taskService;

  private List<Long> ids = new ArrayList<>();

  @Test
  public void testCreateDescription() {
    assertNotNull(task.createDescription());
  }

  @Test
  public void testStartTask() throws TaskException, ComicException {
    for (long index = 0L; index < 25L; index++) ids.add(index);

    Mockito.when(undeleteComicTaskEncoderObjectFactory.getObject())
        .thenReturn(unmarkComicForRemovalTaskEncoder);
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(unmarkComicForRemovalTaskEncoder.encode()).thenReturn(persistedTask);
    Mockito.when(taskService.save(Mockito.any(PersistedTask.class))).thenReturn(persistedTask);

    task.setIds(ids);

    task.startTask();

    Mockito.verify(undeleteComicTaskEncoderObjectFactory, Mockito.times(ids.size())).getObject();
    for (int index = 0; index < ids.size(); index++) {
      Mockito.verify(comicService, Mockito.times(1)).getComic(ids.get(index));
    }
    Mockito.verify(unmarkComicForRemovalTaskEncoder, Mockito.times(ids.size())).setComic(comic);
    Mockito.verify(taskService, Mockito.times(ids.size())).save(persistedTask);
  }
}

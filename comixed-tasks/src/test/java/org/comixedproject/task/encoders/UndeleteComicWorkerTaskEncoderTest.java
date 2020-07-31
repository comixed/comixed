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

package org.comixedproject.task.encoders;

import static junit.framework.TestCase.*;

import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.tasks.Task;
import org.comixedproject.model.tasks.TaskType;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.model.UndeleteComicWorkerTask;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;

@RunWith(MockitoJUnitRunner.class)
public class UndeleteComicWorkerTaskEncoderTest {
  @InjectMocks private UndeleteComicWorkerTaskEncoder undeleteComicTaskEncoder;
  @Mock private ObjectFactory<UndeleteComicWorkerTask> undeleteComicWorkerTaskObjectFactory;
  @Mock private UndeleteComicWorkerTask undeleteComicWorkerTask;
  @Mock private Comic comic;
  @Mock private TaskService taskService;

  private Task task = new Task();

  @Test
  public void encode() {
    undeleteComicTaskEncoder.setComic(comic);

    Task result = undeleteComicTaskEncoder.encode();

    assertNotNull(result);
    assertEquals(TaskType.UNDELETE_COMIC, result.getTaskType());
    assertSame(comic, result.getComic());
  }

  @Test
  public void testDecode() {
    task.setComic(comic);
    task.setTaskType(TaskType.UNDELETE_COMIC);

    Mockito.when(undeleteComicWorkerTaskObjectFactory.getObject())
        .thenReturn(undeleteComicWorkerTask);

    final UndeleteComicWorkerTask result = undeleteComicTaskEncoder.decode(task);

    assertNotNull(result);
    assertSame(undeleteComicWorkerTask, result);

    Mockito.verify(taskService, Mockito.times(1)).delete(task);
    Mockito.verify(undeleteComicWorkerTask, Mockito.times(1)).setComic(comic);
  }
}

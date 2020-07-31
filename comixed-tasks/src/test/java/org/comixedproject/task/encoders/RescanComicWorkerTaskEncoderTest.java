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

package org.comixedproject.task.encoders;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;

import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.tasks.Task;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.model.RescanComicWorkerTask;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;

@RunWith(MockitoJUnitRunner.class)
public class RescanComicWorkerTaskEncoderTest {
  @InjectMocks private RescanComicWorkerTaskEncoder encoder;
  @Mock private Comic comic;
  @Mock private TaskService taskService;
  @Mock private ObjectFactory<RescanComicWorkerTask> rescanComicWorkerTaskObjectFactory;
  @Mock private RescanComicWorkerTask workerTask;

  @Test
  public void testEncode() {
    encoder.setComic(comic);

    final Task result = encoder.encode();

    assertNotNull(result);
    assertSame(comic, result.getComic());
  }

  @Test
  public void testDecode() {
    final Task task = new Task();
    task.setComic(comic);

    Mockito.when(rescanComicWorkerTaskObjectFactory.getObject()).thenReturn(workerTask);

    final RescanComicWorkerTask result = encoder.decode(task);

    assertNotNull(result);

    Mockito.verify(taskService, Mockito.times(1)).delete(task);
    Mockito.verify(workerTask, Mockito.times(1)).setComic(comic);
    Mockito.verify(taskService, Mockito.times(1)).delete(task);
  }
}

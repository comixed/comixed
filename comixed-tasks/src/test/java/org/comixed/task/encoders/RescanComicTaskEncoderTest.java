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

package org.comixed.task.encoders;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;

import org.comixed.model.library.Comic;
import org.comixed.model.tasks.Task;
import org.comixed.repositories.tasks.TaskRepository;
import org.comixed.task.model.RescanComicWorkerTask;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;

@RunWith(MockitoJUnitRunner.class)
public class RescanComicTaskEncoderTest {
  @InjectMocks private RescanComicTaskEncoder encoder;
  @Mock private Comic comic;
  @Mock private TaskRepository taskRepository;
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

    Mockito.verify(taskRepository, Mockito.times(1)).delete(task);
    Mockito.verify(workerTask, Mockito.times(1)).setComic(comic);
    Mockito.verify(taskRepository, Mockito.times(1)).delete(task);
  }
}

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

import static junit.framework.TestCase.*;
import static org.comixed.task.encoders.DeleteComicTaskEncoder.DELETE_COMIC;

import org.comixed.model.library.Comic;
import org.comixed.model.tasks.Task;
import org.comixed.repositories.tasks.TaskRepository;
import org.comixed.task.model.DeleteComicWorkerTask;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;

@RunWith(MockitoJUnitRunner.class)
public class DeleteComicTaskEncoderTest {
  @InjectMocks private DeleteComicTaskEncoder encoder;
  @Mock private Comic comic;
  @Mock private TaskRepository taskRepository;
  @Mock private ObjectFactory<DeleteComicWorkerTask> deleteComicsWorkerTaskObjectFactory;
  @Mock private DeleteComicWorkerTask deleteComicWorkerTask;

  @Test
  public void testEncode() {
    encoder.setComic(comic);
    encoder.setDeleteComicFile(false);

    final Task result = encoder.encode();

    assertNotNull(result);
    assertSame(comic, result.getComic());
    assertEquals(Boolean.FALSE.toString(), result.getProperty(DELETE_COMIC));
  }

  @Test
  public void testEncodeForDeletion() {
    encoder.setComic(comic);
    encoder.setDeleteComicFile(true);

    final Task result = encoder.encode();

    assertNotNull(result);
    assertSame(comic, result.getComic());
    assertEquals(Boolean.TRUE.toString(), result.getProperty(DELETE_COMIC));
  }

  @Test
  public void testDecode() {
    final Task task = new Task();
    task.setComic(comic);
    task.setProperty(DELETE_COMIC, String.valueOf(false));

    Mockito.when(deleteComicsWorkerTaskObjectFactory.getObject()).thenReturn(deleteComicWorkerTask);

    final DeleteComicWorkerTask result = encoder.decode(task);

    assertNotNull(result);
    assertSame(deleteComicWorkerTask, result);

    Mockito.verify(taskRepository, Mockito.times(1)).delete(task);
    Mockito.verify(deleteComicWorkerTask, Mockito.times(1)).setComic(comic);
  }

  @Test
  public void testDecodeForDeletion() {
    final Task task = new Task();
    task.setComic(comic);
    task.setProperty(DELETE_COMIC, String.valueOf(true));

    Mockito.when(deleteComicsWorkerTaskObjectFactory.getObject()).thenReturn(deleteComicWorkerTask);

    final DeleteComicWorkerTask result = encoder.decode(task);

    assertNotNull(result);
    assertSame(deleteComicWorkerTask, result);

    Mockito.verify(taskRepository, Mockito.times(1)).delete(task);
    Mockito.verify(deleteComicWorkerTask, Mockito.times(1)).setComic(comic);
  }
}

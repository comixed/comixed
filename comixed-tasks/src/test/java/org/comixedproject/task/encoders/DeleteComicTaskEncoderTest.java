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

import static junit.framework.TestCase.*;

import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.tasks.PersistedTask;
import org.comixedproject.task.DeleteComicTask;
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
  @Mock private ObjectFactory<DeleteComicTask> deleteComicTaskObjectFactory;
  @Mock private DeleteComicTask deleteComicTask;

  @Test
  public void testEncode() {
    encoder.setComic(comic);
    encoder.setDeleteComicFile(false);

    final PersistedTask result = encoder.encode();

    assertNotNull(result);
    assertSame(comic, result.getComic());
    assertEquals(Boolean.FALSE.toString(), result.getProperty(DeleteComicTaskEncoder.DELETE_COMIC));
  }

  @Test
  public void testEncodeForDeletion() {
    encoder.setComic(comic);
    encoder.setDeleteComicFile(true);

    final PersistedTask result = encoder.encode();

    assertNotNull(result);
    assertSame(comic, result.getComic());
    assertEquals(Boolean.TRUE.toString(), result.getProperty(DeleteComicTaskEncoder.DELETE_COMIC));
  }

  @Test
  public void testDecode() {
    final PersistedTask persistedTask = new PersistedTask();
    persistedTask.setComic(comic);
    persistedTask.setProperty(DeleteComicTaskEncoder.DELETE_COMIC, String.valueOf(false));

    Mockito.when(deleteComicTaskObjectFactory.getObject()).thenReturn(deleteComicTask);

    final DeleteComicTask result = encoder.decode(persistedTask);

    assertNotNull(result);
    assertSame(deleteComicTask, result);

    Mockito.verify(deleteComicTask, Mockito.times(1)).setComic(comic);
    Mockito.verify(deleteComicTask, Mockito.times(1)).setDeleteFile(false);
  }

  @Test
  public void testDecodeForDeletion() {
    final PersistedTask persistedTask = new PersistedTask();
    persistedTask.setComic(comic);
    persistedTask.setProperty(DeleteComicTaskEncoder.DELETE_COMIC, String.valueOf(true));

    Mockito.when(deleteComicTaskObjectFactory.getObject()).thenReturn(deleteComicTask);

    final DeleteComicTask result = encoder.decode(persistedTask);

    assertNotNull(result);
    assertSame(deleteComicTask, result);

    Mockito.verify(deleteComicTask, Mockito.times(1)).setComic(comic);
    Mockito.verify(deleteComicTask, Mockito.times(1)).setDeleteFile(true);
  }
}

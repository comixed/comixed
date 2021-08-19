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
import org.comixedproject.task.MarkComicForRemovalTask;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;

@RunWith(MockitoJUnitRunner.class)
public class MarkComicForRemovalTaskEncoderTest {
  @InjectMocks private MarkComicForRemovalTaskEncoder encoder;
  @Mock private Comic comic;
  @Mock private ObjectFactory<MarkComicForRemovalTask> deleteComicTaskObjectFactory;
  @Mock private MarkComicForRemovalTask markComicForRemovalTask;

  @Test
  public void testEncode() {
    encoder.setComic(comic);

    final PersistedTask result = encoder.encode();

    assertNotNull(result);
    assertSame(comic, result.getComic());
  }

  @Test
  public void testDecode() {
    final PersistedTask persistedTask = new PersistedTask();
    persistedTask.setComic(comic);

    Mockito.when(deleteComicTaskObjectFactory.getObject()).thenReturn(markComicForRemovalTask);

    final MarkComicForRemovalTask result = encoder.decode(persistedTask);

    assertNotNull(result);
    assertSame(markComicForRemovalTask, result);

    Mockito.verify(markComicForRemovalTask, Mockito.times(1)).setComic(comic);
  }
}

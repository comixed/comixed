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

import java.util.Random;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.tasks.PersistedTask;
import org.comixedproject.model.tasks.PersistedTaskType;
import org.comixedproject.task.ProcessComicTask;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;

@RunWith(MockitoJUnitRunner.class)
public class ProcessComicTaskEncoderTest {
  private static final Random RANDOM = new Random();

  @InjectMocks private ProcessComicTaskEncoder encoder;
  @Mock private Comic comic;
  @Mock private ObjectFactory<ProcessComicTask> processComicTaskObjectFactory;
  @Mock private ProcessComicTask processComicTask;

  private final Boolean deleteBlockedPages = RANDOM.nextBoolean();
  private final Boolean ignoreMetadata = !this.deleteBlockedPages;

  @Test
  public void testEncode() {
    encoder.setComic(comic);
    encoder.setDeleteBlockedPages(this.deleteBlockedPages);
    encoder.setIgnoreMetadata(this.ignoreMetadata);

    final PersistedTask result = encoder.encode();

    assertNotNull(result);
    assertSame(PersistedTaskType.PROCESS_COMIC, result.getTaskType());
    assertSame(comic, result.getComic());
    assertEquals(
        this.deleteBlockedPages,
        Boolean.valueOf(result.getProperty(ProcessComicTaskEncoder.DELETE_BLOCKED_PAGES)));
    assertEquals(
        this.ignoreMetadata,
        Boolean.valueOf(result.getProperty(ProcessComicTaskEncoder.IGNORE_METADATA)));
  }

  @Test
  public void testDecode() {
    Mockito.when(processComicTaskObjectFactory.getObject()).thenReturn(processComicTask);

    final PersistedTask persistedTask = new PersistedTask();
    persistedTask.setComic(comic);
    persistedTask.setProperty(
        ProcessComicTaskEncoder.DELETE_BLOCKED_PAGES, String.valueOf(this.deleteBlockedPages));
    persistedTask.setProperty(
        ProcessComicTaskEncoder.IGNORE_METADATA, String.valueOf(this.ignoreMetadata));

    final ProcessComicTask result = encoder.decode(persistedTask);

    assertNotNull(result);
    assertSame(processComicTask, result);

    Mockito.verify(processComicTask, Mockito.times(1)).setComic(comic);
    Mockito.verify(processComicTask, Mockito.times(1))
        .setDeleteBlockedPages(this.deleteBlockedPages);
    Mockito.verify(processComicTask, Mockito.times(1)).setIgnoreMetadata(this.ignoreMetadata);
  }
}

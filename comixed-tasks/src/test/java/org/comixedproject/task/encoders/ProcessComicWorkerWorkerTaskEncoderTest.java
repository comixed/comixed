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
import org.comixedproject.model.tasks.Task;
import org.comixedproject.model.tasks.TaskType;
import org.comixedproject.task.model.ProcessComicWorkerTask;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;

@RunWith(MockitoJUnitRunner.class)
public class ProcessComicWorkerWorkerTaskEncoderTest {
  private static final Random RANDOM = new Random();

  @InjectMocks private ProcessComicWorkerTaskEncoder encoder;
  @Captor private ArgumentCaptor<Task> taskArgumentCaptor;
  @Mock private Comic comic;
  @Mock private ObjectFactory<ProcessComicWorkerTask> processComicTaskObjectFactory;
  @Mock private ProcessComicWorkerTask workerTask;

  private final Boolean deleteBlockedPages = RANDOM.nextBoolean();
  private final Boolean ignoreMetadata = !this.deleteBlockedPages;

  @Test
  public void testEncode() {
    encoder.setComic(comic);
    encoder.setDeleteBlockedPages(this.deleteBlockedPages);
    encoder.setIgnoreMetadata(this.ignoreMetadata);

    final Task result = encoder.encode();

    assertNotNull(result);
    assertSame(TaskType.PROCESS_COMIC, result.getTaskType());
    assertSame(comic, result.getComic());
    assertEquals(
        this.deleteBlockedPages,
        Boolean.valueOf(result.getProperty(ProcessComicWorkerTaskEncoder.DELETE_BLOCKED_PAGES)));
    assertEquals(
        this.ignoreMetadata,
        Boolean.valueOf(result.getProperty(ProcessComicWorkerTaskEncoder.IGNORE_METADATA)));
  }

  @Test
  public void testDecode() {
    Mockito.when(processComicTaskObjectFactory.getObject()).thenReturn(workerTask);

    final Task task = new Task();
    task.setComic(comic);
    task.setProperty(
        ProcessComicWorkerTaskEncoder.DELETE_BLOCKED_PAGES,
        String.valueOf(this.deleteBlockedPages));
    task.setProperty(
        ProcessComicWorkerTaskEncoder.IGNORE_METADATA, String.valueOf(this.ignoreMetadata));

    final ProcessComicWorkerTask result = encoder.decode(task);

    assertNotNull(result);
    assertSame(workerTask, result);

    Mockito.verify(workerTask, Mockito.times(1)).setComic(comic);
    Mockito.verify(workerTask, Mockito.times(1)).setDeleteBlockedPages(this.deleteBlockedPages);
    Mockito.verify(workerTask, Mockito.times(1)).setIgnoreMetadata(this.ignoreMetadata);
  }
}

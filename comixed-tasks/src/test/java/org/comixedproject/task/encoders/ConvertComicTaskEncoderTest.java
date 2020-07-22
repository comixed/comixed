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

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertNotNull;
import static org.junit.Assert.assertSame;

import java.util.Random;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.tasks.Task;
import org.comixedproject.repositories.tasks.TaskRepository;
import org.comixedproject.task.model.ConvertComicWorkerTask;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;

@RunWith(MockitoJUnitRunner.class)
public class ConvertComicTaskEncoderTest {
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CBZ;
  private static final Random RANDOM = new Random();
  private static final boolean TEST_RENAME_PAGES = RANDOM.nextBoolean();
  private static final boolean TEST_DELETE_PAGES = RANDOM.nextBoolean();

  @InjectMocks private ConvertComicTaskEncoder encoder;
  @Mock private ObjectFactory<ConvertComicWorkerTask> convertComicWorkerTaskObjectFactory;
  @Mock private ConvertComicWorkerTask convertComicWorkerTask;
  @Mock private TaskRepository taskRepository;
  @Mock private Comic comic;
  @Mock private Task task;

  @Test
  public void testEncode() {
    encoder.setComic(comic);
    encoder.setTargetArchiveType(TEST_ARCHIVE_TYPE);
    encoder.setRenamePages(TEST_RENAME_PAGES);
    encoder.setDeletePages(TEST_DELETE_PAGES);
    encoder.setDeletePages(TEST_DELETE_PAGES);

    Task result = encoder.encode();

    assertNotNull(result);
    assertSame(comic, result.getComic());
    assertEquals(
        TEST_ARCHIVE_TYPE.toString(), result.getProperty(ConvertComicTaskEncoder.ARCHIVE_TYPE));
    assertEquals(
        String.valueOf(TEST_RENAME_PAGES),
        result.getProperty(ConvertComicTaskEncoder.RENAME_PAGES));
    assertEquals(
        String.valueOf(TEST_DELETE_PAGES),
        result.getProperty(ConvertComicTaskEncoder.DELETE_PAGES));
  }

  @Test
  public void testDecode() {
    Mockito.when(convertComicWorkerTaskObjectFactory.getObject())
        .thenReturn(convertComicWorkerTask);
    Mockito.when(task.getComic()).thenReturn(comic);
    Mockito.when(task.getProperty(ConvertComicTaskEncoder.ARCHIVE_TYPE))
        .thenReturn(TEST_ARCHIVE_TYPE.toString());
    Mockito.when(task.getProperty(ConvertComicTaskEncoder.RENAME_PAGES))
        .thenReturn(String.valueOf(TEST_RENAME_PAGES));
    Mockito.when(task.getProperty(ConvertComicTaskEncoder.DELETE_PAGES))
        .thenReturn(String.valueOf(TEST_DELETE_PAGES));

    ConvertComicWorkerTask result = encoder.decode(task);

    assertNotNull(result);
    assertSame(convertComicWorkerTask, result);

    Mockito.verify(convertComicWorkerTask, Mockito.times(1)).setComic(comic);
    Mockito.verify(convertComicWorkerTask, Mockito.times(1))
        .setTargetArchiveType(TEST_ARCHIVE_TYPE);
    Mockito.verify(convertComicWorkerTask, Mockito.times(1)).setRenamePages(TEST_RENAME_PAGES);
    Mockito.verify(convertComicWorkerTask, Mockito.times(1)).setDeletePages(TEST_DELETE_PAGES);
    Mockito.verify(taskRepository, Mockito.times(1)).delete(task);
  }
}

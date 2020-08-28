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

import java.util.Random;
import org.comixedproject.model.tasks.Task;
import org.comixedproject.task.model.AddComicWorkerTask;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;

@RunWith(MockitoJUnitRunner.class)
public class AddComicWorkerTaskEncoderTest {
  private static final Random RANDOM = new Random();

  private static final String TEST_FILENAME = "/path/to/comicfile.cbz";

  @InjectMocks private AddComicWorkerTaskEncoder adaptor;
  @Mock private ObjectFactory<AddComicWorkerTask> addComicWorkerTaskObjectFactory;
  @Mock private AddComicWorkerTask addComicWorkerTask;

  private boolean deleteBlockedPages = RANDOM.nextBoolean();
  private boolean ignoreMetadata = !deleteBlockedPages;

  @Test
  public void testEncode() {
    adaptor.setComicFilename(TEST_FILENAME);
    adaptor.setDeleteBlockedPages(deleteBlockedPages);
    adaptor.setIgnoreMetadata(ignoreMetadata);

    final Task result = adaptor.encode();

    assertNotNull(result);
    assertEquals(TEST_FILENAME, result.getProperty(AddComicWorkerTaskEncoder.FILENAME));
    assertEquals(
        String.valueOf(this.deleteBlockedPages),
        result.getProperty(AddComicWorkerTaskEncoder.DELETE_BLOCKED_PAGES));
    assertEquals(
        String.valueOf(this.ignoreMetadata),
        result.getProperty(AddComicWorkerTaskEncoder.IGNORE_METADATA));
  }

  @Test
  public void testDecode() {
    final Task task = new Task();
    task.setProperty(AddComicWorkerTaskEncoder.FILENAME, TEST_FILENAME);
    task.setProperty(
        AddComicWorkerTaskEncoder.DELETE_BLOCKED_PAGES, String.valueOf(this.deleteBlockedPages));
    task.setProperty(
        AddComicWorkerTaskEncoder.IGNORE_METADATA, String.valueOf(this.ignoreMetadata));

    Mockito.when(addComicWorkerTaskObjectFactory.getObject()).thenReturn(addComicWorkerTask);

    final AddComicWorkerTask result = adaptor.decode(task);

    Mockito.verify(addComicWorkerTask, Mockito.times(1)).setFilename(TEST_FILENAME);
    Mockito.verify(addComicWorkerTask, Mockito.times(1))
        .setDeleteBlockedPages(this.deleteBlockedPages);
    Mockito.verify(addComicWorkerTask, Mockito.times(1)).setIgnoreMetadata(this.ignoreMetadata);
  }
}

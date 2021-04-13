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
import org.comixedproject.model.tasks.PersistedTask;
import org.comixedproject.task.AddComicTask;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;

@RunWith(MockitoJUnitRunner.class)
public class AddComicTaskEncoderTest {
  private static final Random RANDOM = new Random();

  private static final String TEST_FILENAME = "/path/to/comicfile.cbz";

  @InjectMocks private AddComicTaskEncoder encoder;
  @Mock private ObjectFactory<AddComicTask> addComicTaskObjectFactory;
  @Mock private AddComicTask addComicTask;

  private boolean deleteBlockedPages = RANDOM.nextBoolean();
  private boolean ignoreMetadata = !deleteBlockedPages;

  @Test
  public void testEncode() {
    encoder.setComicFilename(TEST_FILENAME);
    encoder.setDeleteBlockedPages(deleteBlockedPages);
    encoder.setIgnoreMetadata(ignoreMetadata);

    final PersistedTask result = encoder.encode();

    assertNotNull(result);
    assertEquals(TEST_FILENAME, result.getProperty(AddComicTaskEncoder.FILENAME));
    assertEquals(
        String.valueOf(this.deleteBlockedPages),
        result.getProperty(AddComicTaskEncoder.DELETE_BLOCKED_PAGES));
    assertEquals(
        String.valueOf(this.ignoreMetadata),
        result.getProperty(AddComicTaskEncoder.IGNORE_METADATA));
  }

  @Test
  public void testDecode() {
    final PersistedTask persistedTask = new PersistedTask();
    persistedTask.setProperty(AddComicTaskEncoder.FILENAME, TEST_FILENAME);
    persistedTask.setProperty(
        AddComicTaskEncoder.DELETE_BLOCKED_PAGES, String.valueOf(this.deleteBlockedPages));
    persistedTask.setProperty(
        AddComicTaskEncoder.IGNORE_METADATA, String.valueOf(this.ignoreMetadata));

    Mockito.when(addComicTaskObjectFactory.getObject()).thenReturn(addComicTask);

    final AddComicTask result = encoder.decode(persistedTask);

    Mockito.verify(addComicTask, Mockito.times(1)).setFilename(TEST_FILENAME);
    Mockito.verify(addComicTask, Mockito.times(1)).setDeleteBlockedPages(this.deleteBlockedPages);
    Mockito.verify(addComicTask, Mockito.times(1)).setIgnoreMetadata(this.ignoreMetadata);
  }
}

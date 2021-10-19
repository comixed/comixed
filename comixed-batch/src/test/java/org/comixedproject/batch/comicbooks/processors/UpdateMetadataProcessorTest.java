/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

package org.comixedproject.batch.comicbooks.processors;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;

import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.Comic;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class UpdateMetadataProcessorTest {
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CB7;

  @InjectMocks private UpdateMetadataProcessor processor;
  @Mock private ComicBookAdaptor comicBookAdaptor;
  @Mock private Comic comic;

  @Before
  public void setUp() {
    Mockito.when(comic.getArchiveType()).thenReturn(TEST_ARCHIVE_TYPE);
  }

  @Test
  public void testProcessUpdateException() throws Exception {
    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).save(comic, TEST_ARCHIVE_TYPE, false, false);
  }

  @Test
  public void testProcess() throws Exception {
    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).save(comic, TEST_ARCHIVE_TYPE, false, false);
  }
}

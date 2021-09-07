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

import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.batch.BatchException;
import org.comixedproject.handlers.ComicFileHandler;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.Comic;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class UpdateMetadataProcessorTest {
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CBZ;

  @InjectMocks private UpdateMetadataProcessor processor;
  @Mock private ComicFileHandler comicFileHandler;
  @Mock private Comic comic;
  @Mock private Comic updatedComic;
  @Mock private ArchiveAdaptor archiveAdaptor;

  @Test(expected = BatchException.class)
  public void testProcessNoArchiveAdaptorFound() throws Exception {
    Mockito.when(comic.getArchiveType()).thenReturn(TEST_ARCHIVE_TYPE);
    Mockito.when(comicFileHandler.getArchiveAdaptorFor(Mockito.any(ArchiveType.class)))
        .thenReturn(null);

    try {
      processor.process(comic);
    } finally {
      Mockito.verify(comicFileHandler, Mockito.times(1)).getArchiveAdaptorFor(TEST_ARCHIVE_TYPE);
    }
  }

  @Test(expected = ArchiveAdaptorException.class)
  public void testProcessUpdateException() throws Exception {
    Mockito.when(comic.getArchiveType()).thenReturn(TEST_ARCHIVE_TYPE);
    Mockito.when(comicFileHandler.getArchiveAdaptorFor(Mockito.any(ArchiveType.class)))
        .thenReturn(archiveAdaptor);
    Mockito.when(archiveAdaptor.updateComic(Mockito.any(Comic.class)))
        .thenThrow(ArchiveAdaptorException.class);

    try {
      processor.process(comic);
    } finally {
      Mockito.verify(comicFileHandler, Mockito.times(1)).getArchiveAdaptorFor(TEST_ARCHIVE_TYPE);
      Mockito.verify(archiveAdaptor, Mockito.times(1)).updateComic(comic);
    }
  }

  @Test
  public void testProcess() throws Exception {
    Mockito.when(comic.getArchiveType()).thenReturn(TEST_ARCHIVE_TYPE);
    Mockito.when(comicFileHandler.getArchiveAdaptorFor(Mockito.any(ArchiveType.class)))
        .thenReturn(archiveAdaptor);
    Mockito.when(archiveAdaptor.updateComic(Mockito.any(Comic.class))).thenReturn(updatedComic);

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(updatedComic, result);

    Mockito.verify(comicFileHandler, Mockito.times(1)).getArchiveAdaptorFor(TEST_ARCHIVE_TYPE);
    Mockito.verify(archiveAdaptor, Mockito.times(1)).updateComic(comic);
  }
}

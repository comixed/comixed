/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

package org.comixedproject.importer;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.comixedproject.importer.adaptors.ComicFileImportAdaptor;
import org.comixedproject.importer.adaptors.ComicRackBackupAdaptor;
import org.comixedproject.importer.adaptors.ImportAdaptorException;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.library.ReadingListNameException;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ImportFileProcessorTest {
  private static final String TEST_SOURCE_FILENAME = "src/test/resources/comicrack-backup.xml";

  @InjectMocks private ImportFileProcessor processor;

  @Mock private ComicRackBackupAdaptor comicRackBackupAdaptor;

  @Captor private ArgumentCaptor<File> fileCaptor;

  @Captor private ArgumentCaptor<Map> pagesCaptor;

  @Captor private ArgumentCaptor<Map> guidsCaptor;

  @Mock private ComicFileImportAdaptor importAdaptor;

  private List<Comic> comicList = new ArrayList<>();

  @Test(expected = ProcessorException.class)
  public void testProcessNullFile() throws ProcessorException {
    this.processor.process(null);
  }

  @Test(expected = ProcessorException.class)
  public void testProcessFileNotFound() throws ProcessorException {
    this.processor.process(TEST_SOURCE_FILENAME.substring(1));
  }

  @Test(expected = ProcessorException.class)
  public void testProcessSourceIsDirectory() throws ProcessorException {
    this.processor.process("src/test/resources");
  }

  @Test(expected = ProcessorException.class)
  public void testProcessComicFileImporterThrowsException()
      throws ImportAdaptorException, ProcessorException {
    Mockito.when(comicRackBackupAdaptor.load(Mockito.any(), Mockito.any(), Mockito.any()))
        .thenReturn(comicList);
    Mockito.doThrow(ImportAdaptorException.class)
        .when(importAdaptor)
        .importComics(Mockito.anyList(), Mockito.anyList(), Mockito.anyMap(), Mockito.any());

    try {
      this.processor.process(TEST_SOURCE_FILENAME);
    } finally {
      Mockito.verify(comicRackBackupAdaptor, Mockito.times(1))
          .load(fileCaptor.capture(), pagesCaptor.capture(), guidsCaptor.capture());
      Mockito.verify(importAdaptor, Mockito.times(1))
          .importComics(
              comicList,
              this.processor.replacements,
              this.processor.currentPages,
              this.processor.importUser);
    }
  }

  @Test(expected = ProcessorException.class)
  public void testProcessComicFileImporterThrowsComicExceptionException()
      throws ProcessorException, ImportAdaptorException, ReadingListNameException, ComicException {
    Mockito.doThrow(ComicException.class)
        .when(importAdaptor)
        .importLists(Mockito.any(), Mockito.any());

    try {
      this.processor.process(TEST_SOURCE_FILENAME);
    } finally {
      Mockito.verify(comicRackBackupAdaptor, Mockito.times(1))
          .load(fileCaptor.capture(), pagesCaptor.capture(), guidsCaptor.capture());
    }
  }

  @Test(expected = ProcessorException.class)
  public void testProcessComicFileImporterThrowsReadingListNameExceptionExceptionException()
      throws ProcessorException, ImportAdaptorException, ReadingListNameException, ComicException {
    Mockito.doThrow(ReadingListNameException.class)
        .when(importAdaptor)
        .importLists(Mockito.any(), Mockito.any());

    try {
      this.processor.process(TEST_SOURCE_FILENAME);
    } finally {
      Mockito.verify(comicRackBackupAdaptor, Mockito.times(1))
          .load(fileCaptor.capture(), pagesCaptor.capture(), guidsCaptor.capture());
    }
  }

  @Test
  public void testProcess() throws ImportAdaptorException, ProcessorException {
    Mockito.when(comicRackBackupAdaptor.load(Mockito.any(), Mockito.any(), Mockito.any()))
        .thenReturn(comicList);
    Mockito.doNothing()
        .when(importAdaptor)
        .importComics(Mockito.anyList(), Mockito.anyList(), Mockito.anyMap(), Mockito.any());

    this.processor.process(TEST_SOURCE_FILENAME);

    Mockito.verify(comicRackBackupAdaptor, Mockito.times(1))
        .load(fileCaptor.capture(), pagesCaptor.capture(), guidsCaptor.capture());
    Mockito.verify(importAdaptor, Mockito.times(1))
        .importComics(
            comicList,
            this.processor.replacements,
            this.processor.currentPages,
            this.processor.importUser);
  }
}

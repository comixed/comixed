/*
 * ComiXed - A digital comicBook book library management application.
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

import static junit.framework.TestCase.*;
import static org.comixedproject.batch.comicbooks.ConsolidationConfiguration.PARAM_DELETE_REMOVED_COMIC_FILES;

import java.io.File;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.file.FileAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.item.ExecutionContext;

@RunWith(MockitoJUnitRunner.class)
public class DeleteComicBookProcessorTest {
  private static final String TEST_FILENAME = "/Users/comixed/Documents/comics/comicBook.cbz";

  @InjectMocks private DeleteComicProcessor processor;
  @Mock private ComicBookService comicBookService;
  @Mock private FileAdaptor fileAdaptor;
  @Mock private ComicBookAdaptor comicBookAdaptor;
  @Mock private StepExecution stepExecution;
  @Mock private JobExecution jobExecution;
  @Mock private ExecutionContext executionContext;
  @Mock private ComicBook comicBook;
  @Mock private ComicDetail comicDetail;
  @Mock private File file;

  @Before
  public void setUp() {
    Mockito.when(stepExecution.getJobExecution()).thenReturn(jobExecution);
    Mockito.when(jobExecution.getExecutionContext()).thenReturn(executionContext);
    processor.beforeStep(stepExecution);
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(comicDetail.getFile()).thenReturn(file);
    Mockito.when(comicDetail.getFilename()).thenReturn(TEST_FILENAME);
  }

  @Test
  public void testProcessWithDeleteFile() {
    Mockito.when(
            executionContext.getString(PARAM_DELETE_REMOVED_COMIC_FILES, String.valueOf(false)))
        .thenReturn(String.valueOf(true));

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookService, Mockito.times(1)).deleteComicBook(comicBook);
    Mockito.verify(fileAdaptor, Mockito.times(1)).deleteFile(file);
    Mockito.verify(comicBookAdaptor, Mockito.times(1)).deleteMetadataFile(comicBook);
  }

  @Test
  public void testProcessWithDeleteFileThrowsException() {
    Mockito.when(
            executionContext.getString(PARAM_DELETE_REMOVED_COMIC_FILES, String.valueOf(false)))
        .thenReturn(String.valueOf(true));

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookService, Mockito.times(1)).deleteComicBook(comicBook);
    Mockito.verify(fileAdaptor, Mockito.times(1)).deleteFile(file);
    Mockito.verify(comicBookAdaptor, Mockito.times(1)).deleteMetadataFile(comicBook);
  }

  @Test
  public void testProcess() {
    Mockito.when(
            executionContext.getString(PARAM_DELETE_REMOVED_COMIC_FILES, String.valueOf(false)))
        .thenReturn(String.valueOf(false));

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookService, Mockito.times(1)).deleteComicBook(comicBook);
    Mockito.verify(fileAdaptor, Mockito.never()).deleteFile(Mockito.any());
  }

  @Test
  public void testAfterStep() {
    assertNull(processor.afterStep(stepExecution));
  }
}

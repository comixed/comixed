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

import static junit.framework.TestCase.*;
import static org.comixedproject.batch.comicbooks.ConsolidationConfiguration.PARAM_DELETE_REMOVED_COMIC_FILES;

import java.io.File;
import org.comixedproject.adaptors.file.FileAdaptor;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.service.comicbooks.ComicService;
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
public class DeleteComicProcessorTest {
  private static final String TEST_FILENAME = "/Users/comixed/Documents/comics/comic.cbz";

  @InjectMocks private DeleteComicProcessor processor;
  @Mock private ComicService comicService;
  @Mock private FileAdaptor fileAdaptor;
  @Mock private StepExecution stepExecution;
  @Mock private JobExecution jobExecution;
  @Mock private ExecutionContext executionContext;
  @Mock private Comic comic;
  @Mock private File file;

  @Before
  public void setUp() {
    Mockito.when(stepExecution.getJobExecution()).thenReturn(jobExecution);
    Mockito.when(jobExecution.getExecutionContext()).thenReturn(executionContext);
    processor.beforeStep(stepExecution);
    Mockito.when(comic.getFile()).thenReturn(file);
    Mockito.when(comic.getFilename()).thenReturn(TEST_FILENAME);
  }

  @Test
  public void testProcessWithDeleteFile() {
    Mockito.when(
            executionContext.getString(PARAM_DELETE_REMOVED_COMIC_FILES, String.valueOf(false)))
        .thenReturn(String.valueOf(true));

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(comicService, Mockito.times(1)).deleteComic(comic);
    Mockito.verify(fileAdaptor, Mockito.times(1)).deleteFile(file);
  }

  @Test
  public void testProcessWithDeleteFileThrowsException() {
    Mockito.when(
            executionContext.getString(PARAM_DELETE_REMOVED_COMIC_FILES, String.valueOf(false)))
        .thenReturn(String.valueOf(true));

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(comicService, Mockito.times(1)).deleteComic(comic);
    Mockito.verify(fileAdaptor, Mockito.times(1)).deleteFile(file);
  }

  @Test
  public void testProcess() {
    Mockito.when(
            executionContext.getString(PARAM_DELETE_REMOVED_COMIC_FILES, String.valueOf(false)))
        .thenReturn(String.valueOf(false));

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(comicService, Mockito.times(1)).deleteComic(comic);
    Mockito.verify(fileAdaptor, Mockito.never()).deleteFile(Mockito.any());
  }

  @Test
  public void testAfterStep() {
    assertNull(processor.afterStep(stepExecution));
  }
}

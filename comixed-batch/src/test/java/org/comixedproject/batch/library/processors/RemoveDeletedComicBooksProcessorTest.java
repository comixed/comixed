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

package org.comixedproject.batch.library.processors;

import static junit.framework.TestCase.*;
import static org.comixedproject.batch.library.OrganizeLibraryConfiguration.ORGANIZE_LIBRARY_JOB_DELETE_REMOVED_COMIC_FILES;

import java.io.File;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.file.FileAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.batch.core.job.JobExecution;
import org.springframework.batch.core.step.StepExecution;
import org.springframework.batch.infrastructure.item.ExecutionContext;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class RemoveDeletedComicBooksProcessorTest {
  private static final String TEST_FILENAME = "/Users/comixed/Documents/comics/comicBook.cbz";

  @InjectMocks private RemoveDeletedComicBooksProcessor processor;
  @Mock private ComicBookService comicBookService;
  @Mock private FileAdaptor fileAdaptor;
  @Mock private ComicBookAdaptor comicBookAdaptor;
  @Mock private StepExecution stepExecution;
  @Mock private JobExecution jobExecution;
  @Mock private ExecutionContext executionContext;
  @Mock private ComicBook comicBook;
  @Mock private ComicDetail comicDetail;
  @Mock private File file;

  @BeforeEach
  public void setUp() {
    Mockito.when(stepExecution.getJobExecution()).thenReturn(jobExecution);
    Mockito.when(jobExecution.getExecutionContext()).thenReturn(executionContext);
    processor.beforeStep(stepExecution);
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(comicDetail.getFile()).thenReturn(file);
    Mockito.when(comicDetail.getFilename()).thenReturn(TEST_FILENAME);
  }

  @Test
  void process_withDeleteFile() {
    Mockito.when(
            executionContext.getString(
                ORGANIZE_LIBRARY_JOB_DELETE_REMOVED_COMIC_FILES, String.valueOf(false)))
        .thenReturn(String.valueOf(true));

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookService, Mockito.times(1)).deleteComicBook(comicBook);
    Mockito.verify(fileAdaptor, Mockito.times(1)).deleteFile(file);
    Mockito.verify(comicBookAdaptor, Mockito.times(1)).deleteMetadataFile(comicBook);
  }

  @Test
  void process() {
    Mockito.when(
            executionContext.getString(
                ORGANIZE_LIBRARY_JOB_DELETE_REMOVED_COMIC_FILES, String.valueOf(false)))
        .thenReturn(String.valueOf(false));

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookService, Mockito.times(1)).deleteComicBook(comicBook);
    Mockito.verify(fileAdaptor, Mockito.never()).deleteFile(Mockito.any());
  }

  @Test
  void afterStep() {
    assertNull(processor.afterStep(stepExecution));
  }
}

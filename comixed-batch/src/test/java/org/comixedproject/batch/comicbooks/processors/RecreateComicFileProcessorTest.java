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

import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.handlers.ComicFileHandler;
import org.comixedproject.adaptors.handlers.ComicFileHandlerException;
import org.comixedproject.batch.comicbooks.RecreateComicFilesConfiguration;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.Comic;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.StepExecution;

@RunWith(MockitoJUnitRunner.class)
public class RecreateComicFileProcessorTest {
  private static final String TEST_TARGET_ARCHIVE = ArchiveType.CBZ.toString();

  @InjectMocks private RecreateComicFileProcessor processor;
  @Mock private StepExecution stepExecution;
  @Mock private JobParameters jobParameters;
  @Mock private ComicFileHandler comicFileHandler;
  @Mock private Comic comic;
  @Mock private ArchiveAdaptor targetArchiveAdaptor;
  @Mock private Comic savedComic;

  @Before
  public void setUp() throws ComicFileHandlerException {
    Mockito.when(stepExecution.getJobParameters()).thenReturn(jobParameters);
    Mockito.when(jobParameters.getString(RecreateComicFilesConfiguration.JOB_TARGET_ARCHIVE))
        .thenReturn(TEST_TARGET_ARCHIVE);
    Mockito.when(comicFileHandler.getArchiveAdaptorFor(Mockito.any(ArchiveType.class)))
        .thenReturn(targetArchiveAdaptor);
    Mockito.when(jobParameters.getString(RecreateComicFilesConfiguration.JOB_DELETE_MARKED_PAGES))
        .thenReturn(String.valueOf(false));
    Mockito.when(jobParameters.getString(RecreateComicFilesConfiguration.JOB_RENAME_PAGES))
        .thenReturn(String.valueOf(false));
    processor.beforeStep(stepExecution);
  }

  @Test
  public void testProcessDeleteMarkedPages() throws Exception {
    Mockito.when(jobParameters.getString(RecreateComicFilesConfiguration.JOB_DELETE_MARKED_PAGES))
        .thenReturn(String.valueOf(true));

    processor.process(comic);

    Mockito.verify(comic, Mockito.times(1)).removeDeletedPages();
  }

  @Test
  public void testProcessRenamePages() throws Exception {
    Mockito.when(jobParameters.getString(RecreateComicFilesConfiguration.JOB_RENAME_PAGES))
        .thenReturn(String.valueOf(true));
    Mockito.when(targetArchiveAdaptor.saveComic(Mockito.any(Comic.class), Mockito.anyBoolean()))
        .thenReturn(savedComic);

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(savedComic, result);

    Mockito.verify(comic, Mockito.never()).removeDeletedPages();
    Mockito.verify(targetArchiveAdaptor, Mockito.times(1)).saveComic(comic, true);
  }

  @Test
  public void testProcess() throws Exception {
    Mockito.when(targetArchiveAdaptor.saveComic(Mockito.any(Comic.class), Mockito.anyBoolean()))
        .thenReturn(savedComic);

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(savedComic, result);

    Mockito.verify(comic, Mockito.never()).removeDeletedPages();
    Mockito.verify(targetArchiveAdaptor, Mockito.times(1)).saveComic(comic, false);
  }

  @Test
  public void testExitStatus() {
    assertNull(processor.afterStep(stepExecution));
  }
}

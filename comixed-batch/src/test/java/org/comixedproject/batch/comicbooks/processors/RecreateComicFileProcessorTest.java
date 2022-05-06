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

import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.batch.comicbooks.RecreateComicFilesConfiguration;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.service.admin.ConfigurationService;
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
  private static final ArchiveType TEST_TARGET_ARCHIVE = ArchiveType.CBZ;
  private static final String TEST_TARGET_ARCHIVE_NAME = TEST_TARGET_ARCHIVE.toString();
  private static final String TEST_PAGE_RENAMING_RULE = "The page renaming rule";

  @InjectMocks private RecreateComicFileProcessor processor;
  @Mock private ConfigurationService configurationService;
  @Mock private StepExecution stepExecution;
  @Mock private JobParameters jobParameters;
  @Mock private ComicBookAdaptor comicBookAdaptor;
  @Mock private ComicBook comicBook;

  @Before
  public void setUp() throws AdaptorException {
    Mockito.when(stepExecution.getJobParameters()).thenReturn(jobParameters);
    Mockito.when(jobParameters.getString(RecreateComicFilesConfiguration.JOB_TARGET_ARCHIVE))
        .thenReturn(TEST_TARGET_ARCHIVE_NAME);
    Mockito.when(jobParameters.getString(RecreateComicFilesConfiguration.JOB_DELETE_MARKED_PAGES))
        .thenReturn(String.valueOf(false));
    processor.beforeStep(stepExecution);
    Mockito.when(
            configurationService.getOptionValue(
                ConfigurationService.CFG_LIBRARY_PAGE_RENAMING_RULE, ""))
        .thenReturn(TEST_PAGE_RENAMING_RULE);
  }

  @Test
  public void testProcessDeleteMarkedPages() throws Exception {
    Mockito.when(jobParameters.getString(RecreateComicFilesConfiguration.JOB_DELETE_MARKED_PAGES))
        .thenReturn(String.valueOf(true));

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookAdaptor, Mockito.times(1))
        .save(comicBook, TEST_TARGET_ARCHIVE, true, TEST_PAGE_RENAMING_RULE);
  }

  @Test
  public void testProcess() throws Exception {
    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBook, Mockito.never()).removeDeletedPages();
    Mockito.verify(comicBookAdaptor, Mockito.times(1))
        .save(comicBook, TEST_TARGET_ARCHIVE, false, TEST_PAGE_RENAMING_RULE);
  }

  @Test
  public void testExitStatus() {
    assertNull(processor.afterStep(stepExecution));
  }
}

/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

package org.comixedproject.batch.comicbooks.readers;

import static org.comixedproject.batch.comicbooks.ProcessComicBooksConfiguration.JOB_PROCESS_COMIC_BOOKS_BATCH_NAME;
import static org.junit.Assert.*;

import org.comixedproject.model.batch.ComicBatch;
import org.comixedproject.service.batch.ComicBatchService;
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
public class MarkComicBatchCompletedReaderTest {
  private static final String TEST_BATCH_NAME = "The batch name";

  @InjectMocks private MarkComicBatchCompletedReader reader;
  @Mock private ComicBatchService comicBatchService;
  @Mock private StepExecution stepExecution;
  @Mock private JobParameters jobParameters;
  @Mock private ComicBatch comicBatch;

  @Before
  public void setUp() {
    Mockito.when(jobParameters.getString(JOB_PROCESS_COMIC_BOOKS_BATCH_NAME))
        .thenReturn(TEST_BATCH_NAME);
    Mockito.when(stepExecution.getJobParameters()).thenReturn(jobParameters);
    reader.batchName = TEST_BATCH_NAME;
  }

  @Test
  public void testBeforeStep() {
    reader.batchName = null;

    reader.beforeStep(stepExecution);

    assertNotNull(reader.batchName);
    assertEquals(TEST_BATCH_NAME, reader.batchName);
  }

  @Test
  public void testRead() {
    Mockito.when(comicBatchService.getIncompleteBatchByName(Mockito.anyString()))
        .thenReturn(comicBatch);

    final ComicBatch result = reader.read();

    assertNotNull(result);
    assertSame(comicBatch, result);

    Mockito.verify(comicBatchService, Mockito.times(1)).getIncompleteBatchByName(TEST_BATCH_NAME);
  }

  @Test
  public void testReadNoneFOund() {
    Mockito.when(comicBatchService.getIncompleteBatchByName(Mockito.anyString())).thenReturn(null);

    final ComicBatch result = reader.read();

    assertNull(result);

    Mockito.verify(comicBatchService, Mockito.times(1)).getIncompleteBatchByName(TEST_BATCH_NAME);
  }
}

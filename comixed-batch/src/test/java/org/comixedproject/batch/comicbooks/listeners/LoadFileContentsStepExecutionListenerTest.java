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

package org.comixedproject.batch.comicbooks.listeners;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertTrue;
import static org.comixedproject.batch.comicbooks.ProcessComicBooksConfiguration.JOB_PROCESS_COMIC_BOOKS_BATCH_NAME;
import static org.comixedproject.model.messaging.batch.ProcessComicBooksStatus.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.batch.PublishBatchProcessDetailUpdateAction;
import org.comixedproject.messaging.comicbooks.PublishProcessComicBooksStatusAction;
import org.comixedproject.model.batch.BatchProcessDetail;
import org.comixedproject.model.batch.ComicBatch;
import org.comixedproject.model.batch.ComicBatchEntry;
import org.comixedproject.model.messaging.batch.ProcessComicBooksStatus;
import org.comixedproject.service.batch.ComicBatchService;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.batch.core.*;
import org.springframework.batch.item.ExecutionContext;

@RunWith(MockitoJUnitRunner.class)
public class LoadFileContentsStepExecutionListenerTest {
  private static final Date TEST_JOB_STARTED = new Date();
  private static final String TEST_BATCH_NAME = "The batch name";
  private static final long TEST_UNPROCESSED = 25L;
  private static final String TEST_JOB_NAME = "The job name";

  @InjectMocks private LoadFileContentsStepExecutionListener listener;
  @Mock private ComicBatchService comicBatchService;
  @Mock private StepExecution stepExecution;
  @Mock private JobInstance jobInstance;
  @Mock private JobExecution jobExecution;
  @Mock private ExecutionContext executionContext;
  @Mock private ComicBookService comicBookService;
  @Mock private PublishProcessComicBooksStatusAction publishProcessComicBooksStatusAction;
  @Mock private PublishBatchProcessDetailUpdateAction publishBatchProcessDetailUpdateAction;
  @Mock private JobParameters jobParameters;
  @Mock private ComicBatch comicBatch;

  @Captor ArgumentCaptor<ProcessComicBooksStatus> processComicStatusArgumentCaptor;
  @Captor ArgumentCaptor<BatchProcessDetail> batchProcessDetailArgumentCaptor;

  private List<ComicBatchEntry> comicBatchEntries = new ArrayList<>();

  @Before
  public void setUp() throws PublishingException {
    Mockito.when(jobExecution.getJobParameters()).thenReturn(jobParameters);
    Mockito.when(jobInstance.getJobName()).thenReturn(TEST_JOB_NAME);
    Mockito.when(jobExecution.getJobInstance()).thenReturn(jobInstance);
    Mockito.when(jobExecution.getStatus()).thenReturn(BatchStatus.COMPLETED);
    Mockito.when(jobExecution.getExitStatus()).thenReturn(ExitStatus.COMPLETED);
    Mockito.when(jobParameters.getString(JOB_PROCESS_COMIC_BOOKS_BATCH_NAME))
        .thenReturn(TEST_BATCH_NAME);
    Mockito.when(stepExecution.getJobParameters()).thenReturn(jobParameters);

    Mockito.when(comicBookService.getUnprocessedComicsWithoutContentCount(Mockito.anyString()))
        .thenReturn(TEST_UNPROCESSED);

    for (int index = 0; index < TEST_UNPROCESSED * 2; index++) {
      comicBatchEntries.add(Mockito.mock(ComicBatchEntry.class));
    }
    Mockito.when(comicBatch.getEntries()).thenReturn(comicBatchEntries);
    Mockito.when(comicBatchService.getByName(TEST_BATCH_NAME)).thenReturn(comicBatch);

    Mockito.when(stepExecution.getJobExecution()).thenReturn(jobExecution);
    Mockito.when(jobExecution.getExecutionContext()).thenReturn(executionContext);
    Mockito.when(executionContext.containsKey(PROCESS_COMIC_BOOKS_STATUS_JOB_STARTED))
        .thenReturn(true);
    Mockito.when(executionContext.getLong(PROCESS_COMIC_BOOKS_STATUS_JOB_STARTED))
        .thenReturn(TEST_JOB_STARTED.getTime());
    Mockito.when(executionContext.getString(PROCESS_COMIC_BOOKS_STATUS_STEP_NAME))
        .thenReturn(PROCESS_COMIC_BOOKS_STEP_NAME_LOAD_FILE_CONTENTS);
    Mockito.doNothing()
        .when(publishProcessComicBooksStatusAction)
        .publish(processComicStatusArgumentCaptor.capture());
    Mockito.doNothing()
        .when(publishBatchProcessDetailUpdateAction)
        .publish(batchProcessDetailArgumentCaptor.capture());
  }

  @Test
  public void testBeforeStep() throws PublishingException {
    listener.beforeStep(stepExecution);

    final ProcessComicBooksStatus status = processComicStatusArgumentCaptor.getValue();
    assertTrue(status.isActive());
    assertEquals(PROCESS_COMIC_BOOKS_STEP_NAME_LOAD_FILE_CONTENTS, status.getStepName());

    final BatchProcessDetail detail = batchProcessDetailArgumentCaptor.getValue();

    Mockito.verify(executionContext, Mockito.times(1))
        .putLong(PROCESS_COMIC_BOOKS_STATUS_TOTAL_COMICS, comicBatchEntries.size());
    Mockito.verify(executionContext, Mockito.times(1))
        .putLong(
            PROCESS_COMIC_BOOKS_STATUS_PROCESSED_COMICS,
            comicBatchEntries.size() - TEST_UNPROCESSED);

    Mockito.verify(comicBookService, Mockito.times(1))
        .getUnprocessedComicsWithoutContentCount(TEST_BATCH_NAME);
    Mockito.verify(executionContext, Mockito.times(1))
        .putString(
            PROCESS_COMIC_BOOKS_STATUS_STEP_NAME, PROCESS_COMIC_BOOKS_STEP_NAME_LOAD_FILE_CONTENTS);
    Mockito.verify(executionContext, Mockito.times(1))
        .putLong(PROCESS_COMIC_BOOKS_STATUS_TOTAL_COMICS, comicBatchEntries.size());
    Mockito.verify(publishProcessComicBooksStatusAction, Mockito.times(1)).publish(status);
    Mockito.verify(publishBatchProcessDetailUpdateAction, Mockito.times(1)).publish(detail);
  }

  @Test
  public void testBeforeStepPublisingException() throws PublishingException {
    Mockito.doThrow(PublishingException.class)
        .when(publishProcessComicBooksStatusAction)
        .publish(Mockito.any());

    listener.beforeStep(stepExecution);

    final BatchProcessDetail detail = batchProcessDetailArgumentCaptor.getValue();

    Mockito.verify(comicBookService, Mockito.times(1))
        .getUnprocessedComicsWithoutContentCount(TEST_BATCH_NAME);
    Mockito.verify(executionContext, Mockito.times(1))
        .putString(
            PROCESS_COMIC_BOOKS_STATUS_STEP_NAME, PROCESS_COMIC_BOOKS_STEP_NAME_LOAD_FILE_CONTENTS);
    Mockito.verify(executionContext, Mockito.times(1))
        .putLong(PROCESS_COMIC_BOOKS_STATUS_TOTAL_COMICS, comicBatchEntries.size());
    Mockito.verify(publishProcessComicBooksStatusAction, Mockito.times(1)).publish(Mockito.any());
    Mockito.verify(publishBatchProcessDetailUpdateAction, Mockito.times(1)).publish(detail);
  }

  @Test
  public void testAfterStep() throws PublishingException {
    listener.afterStep(stepExecution);

    final ProcessComicBooksStatus status = processComicStatusArgumentCaptor.getValue();
    assertTrue(status.isActive());
    assertEquals(PROCESS_COMIC_BOOKS_STEP_NAME_LOAD_FILE_CONTENTS, status.getStepName());

    final BatchProcessDetail detail = batchProcessDetailArgumentCaptor.getValue();

    Mockito.verify(executionContext, Mockito.times(1))
        .putLong(PROCESS_COMIC_BOOKS_STATUS_TOTAL_COMICS, comicBatchEntries.size());
    Mockito.verify(executionContext, Mockito.times(1))
        .putLong(
            PROCESS_COMIC_BOOKS_STATUS_PROCESSED_COMICS,
            comicBatchEntries.size() - TEST_UNPROCESSED);

    Mockito.verify(publishProcessComicBooksStatusAction, Mockito.times(1)).publish(status);
    Mockito.verify(publishBatchProcessDetailUpdateAction, Mockito.times(1)).publish(detail);
  }

  @Test
  public void testAfterStepPublisingException() throws PublishingException {
    Mockito.doThrow(PublishingException.class)
        .when(publishProcessComicBooksStatusAction)
        .publish(Mockito.any());

    listener.afterStep(stepExecution);

    Mockito.verify(publishProcessComicBooksStatusAction, Mockito.times(1)).publish(Mockito.any());
  }
}

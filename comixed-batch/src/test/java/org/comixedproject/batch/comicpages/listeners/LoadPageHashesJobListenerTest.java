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

package org.comixedproject.batch.comicpages.listeners;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertFalse;
import static junit.framework.TestCase.assertNotNull;
import static org.comixedproject.batch.comicpages.LoadPageHashesConfiguration.JOB_LOAD_PAGE_HASHES_STARTED;
import static org.comixedproject.model.messaging.batch.ProcessComicBooksStatus.*;
import static org.comixedproject.model.messaging.batch.ProcessComicBooksStatus.PROCESS_COMIC_BOOKS_STATUS_JOB_STARTED;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.batch.PublishBatchProcessDetailUpdateAction;
import org.comixedproject.messaging.comicbooks.PublishProcessComicBooksStatusAction;
import org.comixedproject.model.batch.BatchProcessDetail;
import org.comixedproject.model.batch.ComicBatchEntry;
import org.comixedproject.model.messaging.batch.ProcessComicBooksStatus;
import org.comixedproject.service.comicpages.PageService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.batch.core.*;
import org.springframework.batch.item.ExecutionContext;

@RunWith(MockitoJUnitRunner.class)
public class LoadPageHashesJobListenerTest {
  private static final Date TEST_JOB_STARTED = new Date();
  private static final String TEST_STEP_NAME = "step-name";
  private static final long TEST_TOTAL_COMICS = 27L;
  private static final long TEST_PROCESSED_COMICS = 15L;
  private static final String TEST_BATCH_NAME = "The Batch Name";
  private static final String TEST_JOB_NAME = "The job name";
  private static final long TEST_PAGE_WITH_HASH_COUNT = 129L;
  private static final Long TEST_PAGE_COUNT = TEST_PAGE_WITH_HASH_COUNT * 2L;

  @InjectMocks private LoadPageHashesJobListener listener;
  @Mock private PageService pageService;
  @Mock private JobInstance jobInstance;
  @Mock private JobExecution jobExecution;
  @Mock private ExecutionContext executionContext;
  @Mock private PublishProcessComicBooksStatusAction publishProcessComicBooksStatusAction;
  @Mock private PublishBatchProcessDetailUpdateAction publishBatchProcessDetailUpdateAction;
  @Mock private JobParameters jobParameters;

  @Captor ArgumentCaptor<Long> timestampArgumentCaptor;
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
    Mockito.when(pageService.getCount()).thenReturn(TEST_PAGE_COUNT);

    Mockito.when(jobExecution.getJobParameters()).thenReturn(jobParameters);
    Mockito.when(jobExecution.getExecutionContext()).thenReturn(executionContext);
    Mockito.when(executionContext.getLong(PROCESS_COMIC_BOOKS_STATUS_JOB_STARTED))
        .thenReturn(TEST_JOB_STARTED.getTime());
    Mockito.when(executionContext.getString(PROCESS_COMIC_BOOKS_STATUS_STEP_NAME))
        .thenReturn(TEST_STEP_NAME);
    Mockito.when(executionContext.getLong(PROCESS_COMIC_BOOKS_STATUS_TOTAL_COMICS))
        .thenReturn(TEST_TOTAL_COMICS);
    Mockito.when(executionContext.getLong(PROCESS_COMIC_BOOKS_STATUS_PROCESSED_COMICS))
        .thenReturn(TEST_PROCESSED_COMICS);
    Mockito.doNothing()
        .when(publishProcessComicBooksStatusAction)
        .publish(processComicStatusArgumentCaptor.capture());
    Mockito.doNothing()
        .when(publishBatchProcessDetailUpdateAction)
        .publish(batchProcessDetailArgumentCaptor.capture());
  }

  @Test
  public void testBeforeJob() throws PublishingException {
    Mockito.doNothing()
        .when(executionContext)
        .putLong(Mockito.anyString(), timestampArgumentCaptor.capture());

    listener.beforeJob(jobExecution);

    final Long timestamp = timestampArgumentCaptor.getAllValues().get(0);
    assertNotNull(timestamp);

    final BatchProcessDetail detail = batchProcessDetailArgumentCaptor.getValue();

    Mockito.verify(executionContext, Mockito.times(1))
        .putLong(JOB_LOAD_PAGE_HASHES_STARTED, timestamp);
    Mockito.verify(publishBatchProcessDetailUpdateAction, Mockito.times(1)).publish(detail);
  }

  @Test
  public void testBeforeJobPublishingException() throws PublishingException {
    Mockito.doNothing()
        .when(executionContext)
        .putLong(Mockito.anyString(), timestampArgumentCaptor.capture());

    listener.beforeJob(jobExecution);

    final Long timestamp = timestampArgumentCaptor.getAllValues().get(0);
    assertNotNull(timestamp);

    Mockito.verify(executionContext, Mockito.times(1))
        .putLong(JOB_LOAD_PAGE_HASHES_STARTED, timestamp);
  }

  @Test
  public void testAfterJob() throws PublishingException {
    Mockito.when(executionContext.containsKey(PROCESS_COMIC_BOOKS_STATUS_JOB_STARTED))
        .thenReturn(true);

    listener.afterJob(jobExecution);

    final ProcessComicBooksStatus status = processComicStatusArgumentCaptor.getValue();
    assertNotNull(status);
    assertFalse(status.isActive());
    assertEquals(TEST_JOB_STARTED, status.getStarted());
    assertEquals(TEST_STEP_NAME, status.getStepName());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_PROCESSED_COMICS, status.getProcessed());

    final BatchProcessDetail detail = batchProcessDetailArgumentCaptor.getValue();

    Mockito.verify(publishProcessComicBooksStatusAction, Mockito.times(1)).publish(status);
    Mockito.verify(publishBatchProcessDetailUpdateAction, Mockito.times(1)).publish(detail);
  }

  @Test
  public void testAfterJobPublishingException() throws PublishingException {
    Mockito.when(executionContext.containsKey(PROCESS_COMIC_BOOKS_STATUS_JOB_STARTED))
        .thenReturn(true);

    listener.afterJob(jobExecution);

    final ProcessComicBooksStatus status = processComicStatusArgumentCaptor.getValue();

    assertNotNull(status);
    assertFalse(status.isActive());
    assertEquals(TEST_JOB_STARTED, status.getStarted());
    assertEquals(TEST_STEP_NAME, status.getStepName());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_PROCESSED_COMICS, status.getProcessed());

    final BatchProcessDetail detail = batchProcessDetailArgumentCaptor.getValue();

    Mockito.verify(publishProcessComicBooksStatusAction, Mockito.times(1)).publish(status);
    Mockito.verify(publishBatchProcessDetailUpdateAction, Mockito.times(1)).publish(detail);
  }
}

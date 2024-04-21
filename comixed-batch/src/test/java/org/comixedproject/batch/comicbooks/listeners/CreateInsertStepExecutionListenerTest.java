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
import static org.comixedproject.model.messaging.batch.AddComicBooksStatus.*;

import java.util.Date;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.batch.PublishBatchProcessDetailUpdateAction;
import org.comixedproject.messaging.comicbooks.PublishAddComicBooksStatusAction;
import org.comixedproject.model.batch.BatchProcessDetail;
import org.comixedproject.model.messaging.batch.AddComicBooksStatus;
import org.comixedproject.service.comicfiles.ComicFileService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.batch.core.*;
import org.springframework.batch.item.ExecutionContext;

@RunWith(MockitoJUnitRunner.class)
public class CreateInsertStepExecutionListenerTest {
  private static final long TEST_TOTAL_COMICS = 77L;
  private static final Date TEST_JOB_STARTED = new Date();
  private static final long TEST_PROCESSED_COMICS = 15L;
  private static final String TEST_JOB_NAME = "The job name";

  @InjectMocks private CreateInsertStepExecutionListener listener;
  @Mock private StepExecution stepExecution;
  @Mock private JobInstance jobInstance;
  @Mock private JobParameters jobParameters;
  @Mock private JobExecution jobExecution;
  @Mock private ExecutionContext executionContext;
  @Mock private ComicFileService comicFileService;
  @Mock private PublishAddComicBooksStatusAction publishAddComicBooksStatusAction;
  @Mock private PublishBatchProcessDetailUpdateAction publishBatchProcessDetailUpdateAction;

  @Captor ArgumentCaptor<AddComicBooksStatus> processComicStatusArgumentCaptor;
  @Captor ArgumentCaptor<BatchProcessDetail> batchProcessDetailArgumentCaptor;

  @Before
  public void setUp() throws PublishingException {
    Mockito.when(jobExecution.getJobParameters()).thenReturn(jobParameters);
    Mockito.when(jobInstance.getJobName()).thenReturn(TEST_JOB_NAME);
    Mockito.when(jobExecution.getJobInstance()).thenReturn(jobInstance);
    Mockito.when(jobExecution.getStatus()).thenReturn(BatchStatus.COMPLETED);
    Mockito.when(jobExecution.getExitStatus()).thenReturn(ExitStatus.COMPLETED);
    Mockito.when(stepExecution.getJobExecution()).thenReturn(jobExecution);
    Mockito.when(jobExecution.getExecutionContext()).thenReturn(executionContext);
    Mockito.when(executionContext.containsKey(ADD_COMIC_BOOKS_JOB_STARTED)).thenReturn(true);
    Mockito.when(executionContext.containsKey(ADD_COMIC_BOOKS_JOB_FINISHED)).thenReturn(false);
    Mockito.when(executionContext.getLong(ADD_COMIC_BOOKS_JOB_STARTED))
        .thenReturn(TEST_JOB_STARTED.getTime());
    Mockito.when(executionContext.getLong(ADD_COMIC_BOOKS_TOTAL_COMICS))
        .thenReturn(TEST_TOTAL_COMICS);
    Mockito.when(executionContext.getLong(ADD_COMIC_BOOKS_PROCESSED_COMICS))
        .thenReturn(TEST_PROCESSED_COMICS);
    Mockito.doNothing()
        .when(publishAddComicBooksStatusAction)
        .publish(processComicStatusArgumentCaptor.capture());
    Mockito.doNothing()
        .when(publishBatchProcessDetailUpdateAction)
        .publish(batchProcessDetailArgumentCaptor.capture());
  }

  @Test
  public void testBeforeStep() throws PublishingException {
    Mockito.when(comicFileService.getComicFileDescriptorCount()).thenReturn(TEST_TOTAL_COMICS);

    listener.beforeStep(stepExecution);

    final AddComicBooksStatus status = processComicStatusArgumentCaptor.getValue();
    assertTrue(status.isActive());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_PROCESSED_COMICS, status.getProcessed());

    final BatchProcessDetail detail = batchProcessDetailArgumentCaptor.getValue();

    Mockito.verify(comicFileService, Mockito.times(2)).getComicFileDescriptorCount();
    Mockito.verify(executionContext, Mockito.times(2))
        .putLong(ADD_COMIC_BOOKS_TOTAL_COMICS, TEST_TOTAL_COMICS);
    Mockito.verify(publishAddComicBooksStatusAction, Mockito.times(1)).publish(status);
    Mockito.verify(publishBatchProcessDetailUpdateAction, Mockito.times(1)).publish(Mockito.any());
    Mockito.verify(publishBatchProcessDetailUpdateAction, Mockito.times(1)).publish(detail);
  }

  @Test
  public void testBeforeStepPublisingException() throws PublishingException {
    Mockito.when(comicFileService.getComicFileDescriptorCount()).thenReturn(TEST_TOTAL_COMICS);
    Mockito.doThrow(PublishingException.class)
        .when(publishAddComicBooksStatusAction)
        .publish(Mockito.any());

    listener.beforeStep(stepExecution);

    final BatchProcessDetail detail = batchProcessDetailArgumentCaptor.getValue();

    Mockito.verify(comicFileService, Mockito.times(2)).getComicFileDescriptorCount();
    Mockito.verify(executionContext, Mockito.times(2))
        .putLong(ADD_COMIC_BOOKS_TOTAL_COMICS, TEST_TOTAL_COMICS);
    Mockito.verify(publishAddComicBooksStatusAction, Mockito.times(1)).publish(Mockito.any());
    Mockito.verify(publishBatchProcessDetailUpdateAction, Mockito.times(1)).publish(detail);
  }

  @Test
  public void testAfterStep() throws PublishingException {
    listener.afterStep(stepExecution);

    final AddComicBooksStatus status = processComicStatusArgumentCaptor.getValue();
    assertTrue(status.isActive());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_PROCESSED_COMICS, status.getProcessed());

    final BatchProcessDetail detail = batchProcessDetailArgumentCaptor.getValue();

    Mockito.verify(publishAddComicBooksStatusAction, Mockito.times(1)).publish(status);
    Mockito.verify(publishBatchProcessDetailUpdateAction, Mockito.times(1)).publish(detail);
  }

  @Test
  public void testAfterStepPublisingException() throws PublishingException {
    Mockito.doThrow(PublishingException.class)
        .when(publishAddComicBooksStatusAction)
        .publish(Mockito.any());

    listener.afterStep(stepExecution);

    final BatchProcessDetail detail = batchProcessDetailArgumentCaptor.getValue();

    Mockito.verify(publishAddComicBooksStatusAction, Mockito.times(1)).publish(Mockito.any());
    Mockito.verify(publishBatchProcessDetailUpdateAction, Mockito.times(1)).publish(detail);
  }
}

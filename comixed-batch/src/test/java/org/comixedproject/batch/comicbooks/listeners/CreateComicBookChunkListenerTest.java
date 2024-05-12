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

import static junit.framework.TestCase.*;
import static junit.framework.TestCase.assertEquals;
import static org.comixedproject.model.messaging.batch.ProcessComicBooksStatus.IMPORT_COMIC_FILES_STEP;

import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.batch.PublishBatchProcessDetailUpdateAction;
import org.comixedproject.messaging.comicbooks.PublishProcessComicBooksStatusAction;
import org.comixedproject.model.batch.BatchProcessDetail;
import org.comixedproject.model.messaging.batch.ProcessComicBooksStatus;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.comicfiles.ComicFileService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.batch.core.*;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.scope.context.StepContext;

@RunWith(MockitoJUnitRunner.class)
public class CreateComicBookChunkListenerTest {
  private static final String TEST_JOB_NAME = "The job name";
  private static final long TEST_COMIC_FILE_COUNT = 717L;
  private static final long TEST_COMIC_BOOK_COUNT = 129L;

  @InjectMocks private CreateComicBookChunkListener listener;
  @Mock private ComicFileService comicFileService;
  @Mock private ComicBookService comicBookService;
  @Mock private ChunkContext chunkContext;
  @Mock private PublishBatchProcessDetailUpdateAction publishBatchProcessDetailUpdateAction;
  @Mock private PublishProcessComicBooksStatusAction publishProcessComicBooksStatusAction;
  @Mock private StepContext stepContext;
  @Mock private StepExecution stepExecution;
  @Mock private JobParameters jobParameters;
  @Mock private JobInstance jobInstance;
  @Mock private JobExecution jobExecution;

  @Captor ArgumentCaptor<ProcessComicBooksStatus> processComicStatusArgumentCaptor;
  @Captor ArgumentCaptor<BatchProcessDetail> batchProcessDetailArgumentCaptor;

  @Before
  public void setUp() throws PublishingException {
    Mockito.when(jobExecution.getJobParameters()).thenReturn(jobParameters);
    Mockito.when(jobInstance.getJobName()).thenReturn(TEST_JOB_NAME);
    Mockito.when(jobExecution.getJobInstance()).thenReturn(jobInstance);
    Mockito.when(jobExecution.getStatus()).thenReturn(BatchStatus.COMPLETED);
    Mockito.when(jobExecution.getExitStatus()).thenReturn(ExitStatus.COMPLETED);
    Mockito.when(chunkContext.getStepContext()).thenReturn(stepContext);
    Mockito.when(stepContext.getStepExecution()).thenReturn(stepExecution);
    Mockito.when(stepExecution.getJobExecution()).thenReturn(jobExecution);
    Mockito.doNothing()
        .when(publishProcessComicBooksStatusAction)
        .publish(processComicStatusArgumentCaptor.capture());
    Mockito.doNothing()
        .when(publishBatchProcessDetailUpdateAction)
        .publish(batchProcessDetailArgumentCaptor.capture());
    Mockito.when(comicFileService.getComicFileDescriptorCount()).thenReturn(TEST_COMIC_FILE_COUNT);
    Mockito.when(comicBookService.getComicBookCount()).thenReturn(TEST_COMIC_BOOK_COUNT);
  }

  @Test
  public void testBeforeChunk() throws PublishingException {
    listener.beforeChunk(chunkContext);

    final ProcessComicBooksStatus status = processComicStatusArgumentCaptor.getValue();

    assertNotNull(status);
    assertTrue(status.isActive());
    assertEquals(IMPORT_COMIC_FILES_STEP, status.getStepName());
    assertEquals(TEST_COMIC_BOOK_COUNT + TEST_COMIC_FILE_COUNT, status.getTotal());
    assertEquals(TEST_COMIC_BOOK_COUNT, status.getProcessed());

    final BatchProcessDetail detail = batchProcessDetailArgumentCaptor.getValue();

    Mockito.verify(publishProcessComicBooksStatusAction, Mockito.times(1)).publish(status);
    Mockito.verify(publishBatchProcessDetailUpdateAction, Mockito.times(1)).publish(detail);
  }

  @Test
  public void testAfterChunkError() throws PublishingException {
    listener.afterChunkError(chunkContext);

    final ProcessComicBooksStatus status = processComicStatusArgumentCaptor.getValue();

    assertNotNull(status);
    assertTrue(status.isActive());
    assertEquals(IMPORT_COMIC_FILES_STEP, status.getStepName());
    assertEquals(TEST_COMIC_BOOK_COUNT + TEST_COMIC_FILE_COUNT, status.getTotal());
    assertEquals(TEST_COMIC_BOOK_COUNT, status.getProcessed());

    final BatchProcessDetail detail = batchProcessDetailArgumentCaptor.getValue();

    Mockito.verify(publishProcessComicBooksStatusAction, Mockito.times(1)).publish(status);
    Mockito.verify(publishBatchProcessDetailUpdateAction, Mockito.times(1)).publish(detail);
  }

  @Test
  public void testAfterStep() throws PublishingException {
    listener.afterChunk(chunkContext);

    final ProcessComicBooksStatus status = processComicStatusArgumentCaptor.getValue();

    assertNotNull(status);
    assertTrue(status.isActive());
    assertEquals(IMPORT_COMIC_FILES_STEP, status.getStepName());
    assertEquals(TEST_COMIC_BOOK_COUNT + TEST_COMIC_FILE_COUNT, status.getTotal());
    assertEquals(TEST_COMIC_BOOK_COUNT, status.getProcessed());

    final BatchProcessDetail detail = batchProcessDetailArgumentCaptor.getValue();

    Mockito.verify(publishProcessComicBooksStatusAction, Mockito.times(1)).publish(status);
    Mockito.verify(publishBatchProcessDetailUpdateAction, Mockito.times(1)).publish(detail);
  }

  @Test
  public void testAfterStepAndCompleted() throws PublishingException {
    Mockito.when(comicFileService.getComicFileDescriptorCount()).thenReturn(0L);

    listener.afterChunk(chunkContext);

    final ProcessComicBooksStatus status = processComicStatusArgumentCaptor.getValue();

    assertNotNull(status);
    assertFalse(status.isActive());
    assertEquals(IMPORT_COMIC_FILES_STEP, status.getStepName());
    assertEquals(TEST_COMIC_BOOK_COUNT, status.getTotal());
    assertEquals(TEST_COMIC_BOOK_COUNT, status.getProcessed());

    final BatchProcessDetail detail = batchProcessDetailArgumentCaptor.getValue();

    Mockito.verify(publishProcessComicBooksStatusAction, Mockito.times(1)).publish(status);
    Mockito.verify(publishBatchProcessDetailUpdateAction, Mockito.times(1)).publish(detail);
  }
}

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

package org.comixedproject.batch.comicbooks.listeners;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertTrue;
import static org.comixedproject.batch.comicbooks.RecreateComicFilesConfiguration.RECREATE_COMIC_FILES_JOB;
import static org.comixedproject.model.messaging.batch.ProcessComicBooksStatus.RECREATE_COMIC_FILE_STEP;

import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.batch.PublishBatchProcessDetailUpdateAction;
import org.comixedproject.messaging.comicbooks.PublishProcessComicBooksStatusAction;
import org.comixedproject.model.batch.BatchProcessDetail;
import org.comixedproject.model.messaging.batch.ProcessComicBooksStatus;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.batch.core.*;
import org.springframework.batch.core.job.JobExecution;
import org.springframework.batch.core.job.JobInstance;
import org.springframework.batch.core.job.parameters.JobParameters;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.scope.context.StepContext;
import org.springframework.batch.core.step.StepExecution;

@ExtendWith(MockitoExtension.class)
class RecreateComicFileChunkListenerTest {
  private static final long TEST_TOTAL_COMICS = 77L;
  private static final long TEST_PROCESSED_COMICS = 15L;

  @InjectMocks private RecreateComicFileChunkListener listener;
  @Mock private ComicBookService comicBookService;
  @Mock private ChunkContext chunkContext;
  @Mock private StepContext stepContext;
  @Mock private StepExecution stepExecution;
  @Mock private JobInstance jobInstance;
  @Mock private JobExecution jobExecution;
  @Mock private PublishProcessComicBooksStatusAction publishProcessComicBooksStatusAction;
  @Mock private PublishBatchProcessDetailUpdateAction publishBatchProcessDetailUpdateAction;
  @Mock private JobParameters jobParameters;

  @Captor ArgumentCaptor<ProcessComicBooksStatus> processComicStatusArgumentCaptor;
  @Captor ArgumentCaptor<BatchProcessDetail> batchProcessDetailArgumentCaptor;

  @BeforeEach
  public void setUp() throws PublishingException {
    Mockito.when(jobExecution.getJobParameters()).thenReturn(jobParameters);
    Mockito.when(jobInstance.getJobName()).thenReturn(RECREATE_COMIC_FILES_JOB);
    Mockito.when(jobExecution.getJobInstance()).thenReturn(jobInstance);
    Mockito.when(jobExecution.getStatus()).thenReturn(BatchStatus.COMPLETED);
    Mockito.when(jobExecution.getExitStatus()).thenReturn(ExitStatus.COMPLETED);
    Mockito.when(comicBookService.getComicBookCount()).thenReturn(TEST_TOTAL_COMICS);
    Mockito.when(comicBookService.getRecreatingCount()).thenReturn(TEST_PROCESSED_COMICS);

    Mockito.when(chunkContext.getStepContext()).thenReturn(stepContext);
    Mockito.when(stepExecution.getJobExecution()).thenReturn(jobExecution);
    Mockito.when(stepContext.getStepExecution()).thenReturn(stepExecution);
    Mockito.doNothing()
        .when(publishProcessComicBooksStatusAction)
        .publish(processComicStatusArgumentCaptor.capture());
    Mockito.doNothing()
        .when(publishBatchProcessDetailUpdateAction)
        .publish(batchProcessDetailArgumentCaptor.capture());
  }

  @Test
  void beforeChunk() throws PublishingException {
    listener.beforeChunk(chunkContext); // fixme

    final ProcessComicBooksStatus status = processComicStatusArgumentCaptor.getValue();

    assertNotNull(status);
    assertTrue(status.isActive());
    assertEquals(RECREATE_COMIC_FILE_STEP, status.getStepName());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_TOTAL_COMICS - TEST_PROCESSED_COMICS, status.getProcessed());

    Mockito.verify(publishProcessComicBooksStatusAction, Mockito.times(1)).publish(status);
  }

  @Test
  void afterChunk() throws PublishingException {
    listener.afterChunk(chunkContext);

    final ProcessComicBooksStatus status = processComicStatusArgumentCaptor.getValue();

    assertNotNull(status);
    assertTrue(status.isActive());
    assertEquals(RECREATE_COMIC_FILE_STEP, status.getStepName());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_TOTAL_COMICS - TEST_PROCESSED_COMICS, status.getProcessed());

    Mockito.verify(publishProcessComicBooksStatusAction, Mockito.times(1)).publish(status);
  }

  @Test
  void afterChunkError() throws PublishingException {
    listener.afterChunkError(chunkContext);

    final ProcessComicBooksStatus status = processComicStatusArgumentCaptor.getValue();

    assertNotNull(status);
    assertTrue(status.isActive());
    assertEquals(RECREATE_COMIC_FILE_STEP, status.getStepName());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_TOTAL_COMICS - TEST_PROCESSED_COMICS, status.getProcessed());

    Mockito.verify(publishProcessComicBooksStatusAction, Mockito.times(1)).publish(status);
  }

  @Test
  void afterChunk_publishingException() throws PublishingException {
    listener.beforeChunk(chunkContext);

    final ProcessComicBooksStatus status = processComicStatusArgumentCaptor.getValue();

    assertNotNull(status);
    assertTrue(status.isActive());
    assertEquals(RECREATE_COMIC_FILE_STEP, status.getStepName());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_TOTAL_COMICS - TEST_PROCESSED_COMICS, status.getProcessed());

    Mockito.verify(publishProcessComicBooksStatusAction, Mockito.times(1)).publish(status);
  }
}

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
import static org.comixedproject.batch.comicbooks.UpdateMetadataConfiguration.UPDATE_METADATA_JOB;
import static org.comixedproject.model.messaging.batch.ProcessComicsStatus.UPDATE_METADATA_STEP;
import static org.mockito.Mockito.*;

import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.batch.PublishBatchProcessDetailUpdateAction;
import org.comixedproject.messaging.comicbooks.PublishProcessComicsStatusAction;
import org.comixedproject.model.batch.BatchProcessDetail;
import org.comixedproject.model.messaging.batch.ProcessComicsStatus;
import org.comixedproject.service.comicbooks.ComicService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.batch.core.*;
import org.springframework.batch.core.job.JobExecution;
import org.springframework.batch.core.job.JobInstance;
import org.springframework.batch.core.job.parameters.JobParameters;
import org.springframework.batch.core.scope.context.StepSynchronizationManager;
import org.springframework.batch.core.step.StepExecution;
import org.springframework.batch.infrastructure.item.Chunk;

@ExtendWith(MockitoExtension.class)
class UpdateMetadataChunkListenerTest {
  private static final long TEST_TOTAL_COMICS = 77L;
  private static final long TEST_PROCESSED_COMICS = 15L;

  @InjectMocks private UpdateMetadataChunkListener listener;
  @Mock private ComicService comicService;
  @Mock private Chunk chunk;
  @Mock private StepExecution stepExecution;
  @Mock private JobInstance jobInstance;
  @Mock private JobExecution jobExecution;
  @Mock private PublishProcessComicsStatusAction publishProcessComicsStatusAction;
  @Mock private PublishBatchProcessDetailUpdateAction publishBatchProcessDetailUpdateAction;
  @Mock private JobParameters jobParameters;

  @Captor ArgumentCaptor<ProcessComicsStatus> processComicStatusArgumentCaptor;
  @Captor ArgumentCaptor<BatchProcessDetail> batchProcessDetailArgumentCaptor;

  @BeforeEach
  void setUp() throws PublishingException {
    when(jobExecution.getJobParameters()).thenReturn(jobParameters);
    when(jobInstance.getJobName()).thenReturn(UPDATE_METADATA_JOB);
    when(jobExecution.getJobInstance()).thenReturn(jobInstance);
    when(jobExecution.getStatus()).thenReturn(BatchStatus.COMPLETED);
    when(jobExecution.getExitStatus()).thenReturn(ExitStatus.COMPLETED);
    when(comicService.getComicCount()).thenReturn(TEST_TOTAL_COMICS);
    when(comicService.getUpdateMetadataCount()).thenReturn(TEST_PROCESSED_COMICS);

    when(stepExecution.getJobExecution()).thenReturn(jobExecution);
    doNothing()
        .when(publishProcessComicsStatusAction)
        .publish(processComicStatusArgumentCaptor.capture());
    doNothing()
        .when(publishBatchProcessDetailUpdateAction)
        .publish(batchProcessDetailArgumentCaptor.capture());

    when(stepExecution.getJobExecution()).thenReturn(jobExecution);
    StepSynchronizationManager.register(stepExecution);
  }

  @Test
  void beforeChunk() throws PublishingException {
    listener.beforeChunk(chunk);

    final ProcessComicsStatus status = processComicStatusArgumentCaptor.getValue();

    assertNotNull(status);
    assertTrue(status.isActive());
    assertEquals(UPDATE_METADATA_STEP, status.getStepName());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_TOTAL_COMICS - TEST_PROCESSED_COMICS, status.getProcessed());

    verify(publishProcessComicsStatusAction).publish(status);
  }

  @Test
  void afterChunk() throws PublishingException {
    listener.afterChunk(chunk);

    final ProcessComicsStatus status = processComicStatusArgumentCaptor.getValue();

    assertNotNull(status);
    assertTrue(status.isActive());
    assertEquals(UPDATE_METADATA_STEP, status.getStepName());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_TOTAL_COMICS - TEST_PROCESSED_COMICS, status.getProcessed());

    verify(publishProcessComicsStatusAction).publish(status);
  }

  @Test
  void afterChunkError() throws PublishingException {
    listener.onChunkError(new RuntimeException(), chunk);

    final ProcessComicsStatus status = processComicStatusArgumentCaptor.getValue();

    assertNotNull(status);
    assertTrue(status.isActive());
    assertEquals(UPDATE_METADATA_STEP, status.getStepName());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_TOTAL_COMICS - TEST_PROCESSED_COMICS, status.getProcessed());

    verify(publishProcessComicsStatusAction).publish(status);
  }
}

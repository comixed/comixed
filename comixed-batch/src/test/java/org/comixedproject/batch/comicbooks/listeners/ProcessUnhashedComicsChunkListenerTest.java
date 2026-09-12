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

import static junit.framework.TestCase.*;
import static org.comixedproject.batch.comicbooks.ProcessUnhashedComicsConfiguration.PROCESS_UNHASHED_COMICS_JOB;
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
class ProcessUnhashedComicsChunkListenerTest {
  private static final long TEST_PAGE_COUNT = 717L;
  private static final long TEST_PAGE_WITHOUT_HASH_COUNT = TEST_PAGE_COUNT / 2L;

  @InjectMocks private ProcessUnhashedComicsChunkListener listener;
  @Mock private PublishProcessComicsStatusAction publishProcessComicsStatusAction;
  @Mock private PublishBatchProcessDetailUpdateAction publishBatchProcessDetailUpdateAction;
  @Mock private ComicService comicService;
  @Mock private Chunk chunk;
  @Mock private StepExecution stepExecution;
  @Mock private JobParameters jobParameters;
  @Mock private JobInstance jobInstance;
  @Mock private JobExecution jobExecution;

  @Captor private ArgumentCaptor<ProcessComicsStatus> publishComicBooksStatusArgumentCaptor;
  @Captor private ArgumentCaptor<BatchProcessDetail> batchProcessDetailArgumentCaptor;

  @BeforeEach
  void setUp() throws PublishingException {
    when(comicService.getComicCount()).thenReturn(TEST_PAGE_COUNT);
    when(comicService.findComicsWithUnhashedPagesCount()).thenReturn(TEST_PAGE_WITHOUT_HASH_COUNT);

    when(jobExecution.getJobParameters()).thenReturn(jobParameters);
    when(jobInstance.getJobName()).thenReturn(PROCESS_UNHASHED_COMICS_JOB);
    when(jobExecution.getJobInstance()).thenReturn(jobInstance);
    when(jobExecution.getStatus()).thenReturn(BatchStatus.COMPLETED);
    when(jobExecution.getExitStatus()).thenReturn(ExitStatus.COMPLETED);
    when(stepExecution.getJobExecution()).thenReturn(jobExecution);
    when(comicService.hasComicsWithUnhashedPages()).thenReturn(true);
    doNothing()
        .when(publishProcessComicsStatusAction)
        .publish(publishComicBooksStatusArgumentCaptor.capture());
    doNothing()
        .when(publishBatchProcessDetailUpdateAction)
        .publish(batchProcessDetailArgumentCaptor.capture());

    when(stepExecution.getJobExecution()).thenReturn(jobExecution);
    StepSynchronizationManager.register(stepExecution);
  }

  @Test
  void beforeChunk() throws PublishingException {
    listener.beforeChunk(chunk);

    this.doCommonChecks();
  }

  @Test
  void afterChunk() throws PublishingException {
    listener.afterChunk(chunk);

    this.doCommonChecks();
  }

  @Test
  void afterChunkError() throws PublishingException {
    listener.onChunkError(new RuntimeException(), chunk);

    this.doCommonChecks();
  }

  private void doCommonChecks() throws PublishingException {
    final ProcessComicsStatus status = publishComicBooksStatusArgumentCaptor.getValue();

    assertNotNull(status);
    assertTrue(status.isActive());

    verify(publishProcessComicsStatusAction, times(1)).publish(status);
  }
}

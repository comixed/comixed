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

import static junit.framework.TestCase.*;
import static org.comixedproject.batch.comicpages.LoadPageHashesConfiguration.LOAD_PAGE_HASHES_JOB;

import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.batch.PublishBatchProcessDetailUpdateAction;
import org.comixedproject.messaging.comicbooks.PublishProcessComicBooksStatusAction;
import org.comixedproject.model.batch.BatchProcessDetail;
import org.comixedproject.model.messaging.batch.ProcessComicBooksStatus;
import org.comixedproject.service.comicpages.ComicPageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.batch.core.*;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.scope.context.StepContext;

@ExtendWith(MockitoExtension.class)
class LoadPageHashChunkListenerTest {
  private static final long TEST_PAGE_COUNT = 717L;
  private static final long TEST_PAGE_WITHOUT_HASH_COUNT = TEST_PAGE_COUNT / 2L;

  @InjectMocks private LoadPageHashChunkListener listener;
  @Mock private PublishProcessComicBooksStatusAction publishProcessComicBooksStatusAction;
  @Mock private PublishBatchProcessDetailUpdateAction publishBatchProcessDetailUpdateAction;
  @Mock private ComicPageService comicPageService;
  @Mock private ChunkContext chunkContext;
  @Mock private StepContext stepContext;
  @Mock private StepExecution stepExecution;
  @Mock private JobParameters jobParameters;
  @Mock private JobInstance jobInstance;
  @Mock private JobExecution jobExecution;

  @Captor private ArgumentCaptor<ProcessComicBooksStatus> publishComicBooksStatusArgumentCaptor;
  @Captor private ArgumentCaptor<BatchProcessDetail> batchProcessDetailArgumentCaptor;

  @BeforeEach
  public void setUp() throws PublishingException {
    Mockito.when(comicPageService.getCount()).thenReturn(TEST_PAGE_COUNT);
    Mockito.when(comicPageService.getPagesWithoutHashCount())
        .thenReturn(TEST_PAGE_WITHOUT_HASH_COUNT);

    Mockito.when(jobExecution.getJobParameters()).thenReturn(jobParameters);
    Mockito.when(jobInstance.getJobName()).thenReturn(LOAD_PAGE_HASHES_JOB);
    Mockito.when(jobExecution.getJobInstance()).thenReturn(jobInstance);
    Mockito.when(jobExecution.getStatus()).thenReturn(BatchStatus.COMPLETED);
    Mockito.when(jobExecution.getExitStatus()).thenReturn(ExitStatus.COMPLETED);
    Mockito.when(chunkContext.getStepContext()).thenReturn(stepContext);
    Mockito.when(stepContext.getStepExecution()).thenReturn(stepExecution);
    Mockito.when(stepExecution.getJobExecution()).thenReturn(jobExecution);
    Mockito.doNothing()
        .when(publishProcessComicBooksStatusAction)
        .publish(publishComicBooksStatusArgumentCaptor.capture());
    Mockito.doNothing()
        .when(publishBatchProcessDetailUpdateAction)
        .publish(batchProcessDetailArgumentCaptor.capture());
  }

  @Test
  void beforeChunk() throws PublishingException {
    listener.beforeChunk(chunkContext);

    this.doCommonChecks();
  }

  @Test
  void afterChunk() throws PublishingException {
    listener.afterChunk(chunkContext);

    this.doCommonChecks();
  }

  @Test
  void afterChunkError() throws PublishingException {
    listener.afterChunkError(chunkContext);

    this.doCommonChecks();
  }

  private void doCommonChecks() throws PublishingException {
    final ProcessComicBooksStatus status = publishComicBooksStatusArgumentCaptor.getValue();

    assertNotNull(status);
    assertTrue(status.isActive());

    Mockito.verify(publishProcessComicBooksStatusAction, Mockito.times(1)).publish(status);
  }
}

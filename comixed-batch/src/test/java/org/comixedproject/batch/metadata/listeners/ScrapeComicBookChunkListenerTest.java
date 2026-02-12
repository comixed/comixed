/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

package org.comixedproject.batch.metadata.listeners;

import static junit.framework.TestCase.*;
import static org.comixedproject.batch.metadata.MetadataProcessConfiguration.*;

import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.metadata.PublishMetadataUpdateProcessStateUpdateAction;
import org.comixedproject.model.net.metadata.MetadataUpdateProcessUpdate;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.batch.core.job.JobExecution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.scope.context.StepContext;
import org.springframework.batch.core.step.StepExecution;
import org.springframework.batch.infrastructure.item.Chunk;
import org.springframework.batch.infrastructure.item.ExecutionContext;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ScrapeComicBookChunkListenerTest {
  private static final Long TEST_TOTAL_COMICS = 800L;
  private static final Long TEST_REMAINING_COMICS = 723L;
  @InjectMocks private ScrapeComicBookChunkListener listener;
  @Mock private ComicBookService comicBookService;

  @Mock
  private PublishMetadataUpdateProcessStateUpdateAction
      publishMetadataUpdateProcessStateUpdateAction;

  @Mock private Chunk chunk;
  @Mock private ChunkContext chunkContext;
  @Mock private StepContext stepContext;
  @Mock private StepExecution stepExecution;
  @Mock private JobExecution jobExecution;
  @Mock private ExecutionContext executionContext;

  @Captor private ArgumentCaptor<MetadataUpdateProcessUpdate> payloadArgumentCaptor;

  @BeforeEach
  public void setUp() throws PublishingException {
    Mockito.when(chunkContext.getStepContext()).thenReturn(stepContext);
    Mockito.when(stepContext.getStepExecution()).thenReturn(stepExecution);
    Mockito.when(stepExecution.getJobExecution()).thenReturn(jobExecution);
    Mockito.when(jobExecution.getExecutionContext()).thenReturn(executionContext);
    Mockito.doNothing()
        .when(publishMetadataUpdateProcessStateUpdateAction)
        .publish(payloadArgumentCaptor.capture());
  }

  @Test
  void beforeChunk() {
    listener.beforeChunk(chunk);

    Mockito.verify(chunkContext, Mockito.never()).getStepContext();
  }

  @Test
  void afterChunkFinishedParameterPresent() {
    Mockito.when(executionContext.containsKey(PARAM_METADATA_UPDATE_STARTED)).thenReturn(true);
    Mockito.when(executionContext.containsKey(PARAM_METADATA_UPDATE_FINISHED)).thenReturn(true);

    listener.afterChunk(chunk);

    final MetadataUpdateProcessUpdate payload = payloadArgumentCaptor.getValue();
    assertNotNull(payload);
    assertFalse(payload.isActive());
    assertEquals(0L, payload.getTotalComics());
    assertEquals(0L, payload.getCompletedComics());
  }

  @Test
  void afterChunk_publishException() throws PublishingException {
    Mockito.when(executionContext.containsKey(PARAM_METADATA_UPDATE_STARTED)).thenReturn(true);
    Mockito.when(executionContext.containsKey(PARAM_METADATA_UPDATE_FINISHED)).thenReturn(false);
    Mockito.when(executionContext.getLong(PARAM_METADATA_UPDATE_TOTAL_COMICS))
        .thenReturn(TEST_TOTAL_COMICS);
    Mockito.when(comicBookService.findComicsForBatchMetadataUpdateCount())
        .thenReturn(TEST_REMAINING_COMICS);
    Mockito.doThrow(PublishingException.class)
        .when(publishMetadataUpdateProcessStateUpdateAction)
        .publish(payloadArgumentCaptor.capture());

    try {
      listener.afterChunk(chunk);
    } finally {
      final MetadataUpdateProcessUpdate payload = payloadArgumentCaptor.getValue();
      assertNotNull(payload);
      assertTrue(payload.isActive());
      assertEquals(TEST_TOTAL_COMICS.longValue(), payload.getTotalComics());
      assertEquals(
          TEST_TOTAL_COMICS - TEST_REMAINING_COMICS.longValue(), payload.getCompletedComics());
    }
  }

  @Test
  void afterChunk() {
    Mockito.when(executionContext.containsKey(PARAM_METADATA_UPDATE_STARTED)).thenReturn(true);
    Mockito.when(executionContext.containsKey(PARAM_METADATA_UPDATE_FINISHED)).thenReturn(false);
    Mockito.when(executionContext.getLong(PARAM_METADATA_UPDATE_TOTAL_COMICS))
        .thenReturn(TEST_TOTAL_COMICS);
    Mockito.when(comicBookService.findComicsForBatchMetadataUpdateCount())
        .thenReturn(TEST_REMAINING_COMICS);

    listener.afterChunk(chunk);

    final MetadataUpdateProcessUpdate payload = payloadArgumentCaptor.getValue();
    assertNotNull(payload);
    assertTrue(payload.isActive());
    assertEquals(TEST_TOTAL_COMICS.longValue(), payload.getTotalComics());
    assertEquals(
        TEST_TOTAL_COMICS - TEST_REMAINING_COMICS.longValue(), payload.getCompletedComics());
  }

  @Test
  void afterChunkError() {
    listener.onChunkError(new RuntimeException(), chunk);

    Mockito.verify(chunkContext, Mockito.never()).getStepContext();
  }
}

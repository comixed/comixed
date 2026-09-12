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
import static org.mockito.Mockito.*;

import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.metadata.PublishMetadataUpdateProcessStateUpdateAction;
import org.comixedproject.model.net.metadata.MetadataUpdateProcessUpdate;
import org.comixedproject.service.comicbooks.ComicService;
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
class ScrapeComicChunkListenerTest {
  private static final long TEST_TOTAL_COMICS = 800L;
  private static final long TEST_REMAINING_COMICS = 723L;

  @InjectMocks private ScrapeComicChunkListener listener;
  @Mock private ComicService comicService;

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
  void setUp() throws PublishingException {
    when(chunkContext.getStepContext()).thenReturn(stepContext);
    when(stepContext.getStepExecution()).thenReturn(stepExecution);
    when(stepExecution.getJobExecution()).thenReturn(jobExecution);
    when(jobExecution.getExecutionContext()).thenReturn(executionContext);
    doNothing()
        .when(publishMetadataUpdateProcessStateUpdateAction)
        .publish(payloadArgumentCaptor.capture());
  }

  @Test
  void beforeChunk() {
    listener.beforeChunk(chunk);

    verify(chunkContext, never()).getStepContext();
  }

  @Test
  void afterChunkFinishedParameterPresent() {
    when(executionContext.containsKey(PARAM_METADATA_UPDATE_STARTED)).thenReturn(true);
    when(executionContext.containsKey(PARAM_METADATA_UPDATE_FINISHED)).thenReturn(true);

    listener.afterChunk(chunk);

    final MetadataUpdateProcessUpdate payload = payloadArgumentCaptor.getValue();
    assertNotNull(payload);
    assertFalse(payload.isActive());
    assertEquals(0L, payload.getTotalComics());
    assertEquals(0L, payload.getCompletedComics());
  }

  @Test
  void afterChunk_publishException() throws PublishingException {
    when(executionContext.containsKey(PARAM_METADATA_UPDATE_STARTED)).thenReturn(true);
    when(executionContext.containsKey(PARAM_METADATA_UPDATE_FINISHED)).thenReturn(false);
    when(executionContext.getLong(PARAM_METADATA_UPDATE_TOTAL_COMICS))
        .thenReturn(TEST_TOTAL_COMICS);
    when(comicService.findComicsForBatchMetadataUpdateCount()).thenReturn(TEST_REMAINING_COMICS);
    doThrow(PublishingException.class)
        .when(publishMetadataUpdateProcessStateUpdateAction)
        .publish(payloadArgumentCaptor.capture());

    try {
      listener.afterChunk(chunk);
    } finally {
      final MetadataUpdateProcessUpdate payload = payloadArgumentCaptor.getValue();
      assertNotNull(payload);
      assertTrue(payload.isActive());
      assertEquals(TEST_TOTAL_COMICS, payload.getTotalComics());
      assertEquals(TEST_TOTAL_COMICS - TEST_REMAINING_COMICS, payload.getCompletedComics());
    }
  }

  @Test
  void afterChunk() {
    when(executionContext.containsKey(PARAM_METADATA_UPDATE_STARTED)).thenReturn(true);
    when(executionContext.containsKey(PARAM_METADATA_UPDATE_FINISHED)).thenReturn(false);
    when(executionContext.getLong(PARAM_METADATA_UPDATE_TOTAL_COMICS))
        .thenReturn(TEST_TOTAL_COMICS);
    when(comicService.findComicsForBatchMetadataUpdateCount()).thenReturn(TEST_REMAINING_COMICS);

    listener.afterChunk(chunk);

    final MetadataUpdateProcessUpdate payload = payloadArgumentCaptor.getValue();
    assertNotNull(payload);
    assertTrue(payload.isActive());
    assertEquals(TEST_TOTAL_COMICS, payload.getTotalComics());
    assertEquals(TEST_TOTAL_COMICS - TEST_REMAINING_COMICS, payload.getCompletedComics());
  }

  @Test
  void afterChunkError() {
    listener.onChunkError(new RuntimeException(), chunk);

    verify(chunkContext, never()).getStepContext();
  }
}

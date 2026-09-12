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
import static org.mockito.ArgumentMatchers.anyString;
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
import org.springframework.batch.infrastructure.item.ExecutionContext;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class UpdateComicMetadataJobListenerTest {
  private static final long TEST_TOTAL_COUNT = 717L;

  @Mock
  protected PublishMetadataUpdateProcessStateUpdateAction
      publishMetadataUpdateProcessStateUpdateAction;

  @InjectMocks private UpdateComicMetadataJobListener listener;
  @Mock private ComicService comicService;
  @Mock private JobExecution jobExecution;
  @Mock private ExecutionContext executionContext;

  @Captor private ArgumentCaptor<Long> finishedTimestampArgumentCaptor;
  @Captor private ArgumentCaptor<MetadataUpdateProcessUpdate> payloadArgumentCaptor;

  @BeforeEach
  void setup() throws PublishingException {
    when(jobExecution.getExecutionContext()).thenReturn(executionContext);
    when(executionContext.containsKey(PARAM_METADATA_UPDATE_STARTED)).thenReturn(true);
    when(executionContext.getLong(PARAM_METADATA_UPDATE_TOTAL_COMICS)).thenReturn(TEST_TOTAL_COUNT);
    doNothing()
        .when(publishMetadataUpdateProcessStateUpdateAction)
        .publish(payloadArgumentCaptor.capture());
  }

  @Test
  void beforeJob() throws PublishingException {
    when(executionContext.containsKey(PARAM_METADATA_UPDATE_FINISHED)).thenReturn(false);
    when(comicService.findComicsForBatchMetadataUpdateCount()).thenReturn(TEST_TOTAL_COUNT);

    listener.beforeJob(jobExecution);

    final MetadataUpdateProcessUpdate payload = payloadArgumentCaptor.getValue();
    assertNotNull(payload);
    assertEquals(TEST_TOTAL_COUNT, payload.getTotalComics());
    assertEquals(0L, payload.getCompletedComics());
    assertTrue(payload.isActive());

    verify(executionContext).putLong(PARAM_METADATA_UPDATE_TOTAL_COMICS, TEST_TOTAL_COUNT);
    verify(publishMetadataUpdateProcessStateUpdateAction).publish(payload);
  }

  @Test
  void afterJob() throws PublishingException {
    when(executionContext.containsKey(PARAM_METADATA_UPDATE_FINISHED)).thenReturn(true);
    doNothing()
        .when(executionContext)
        .putLong(anyString(), finishedTimestampArgumentCaptor.capture());

    listener.afterJob(jobExecution);

    final Long finishedTimestamp = finishedTimestampArgumentCaptor.getValue();

    final MetadataUpdateProcessUpdate payload = payloadArgumentCaptor.getValue();
    assertNotNull(payload);
    assertEquals(0L, payload.getTotalComics());
    assertEquals(0L, payload.getCompletedComics());
    assertFalse(payload.isActive());

    verify(executionContext).putLong(PARAM_METADATA_UPDATE_FINISHED, finishedTimestamp);
    verify(publishMetadataUpdateProcessStateUpdateAction).publish(payload);
  }
}

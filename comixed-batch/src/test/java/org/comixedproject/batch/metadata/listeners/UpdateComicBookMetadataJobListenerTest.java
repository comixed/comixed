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
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.item.ExecutionContext;

@RunWith(MockitoJUnitRunner.class)
public class UpdateComicBookMetadataJobListenerTest {
  private static final Long TEST_TOTAL_COUNT = 717L;

  @Mock
  protected PublishMetadataUpdateProcessStateUpdateAction
      publishMetadataUpdateProcessStateUpdateAction;

  @InjectMocks private UpdateComicBookMetadataJobListener listener;
  @Mock private ComicBookService comicBookService;
  @Mock private JobExecution jobExecution;
  @Mock private ExecutionContext executionContext;

  @Captor private ArgumentCaptor<Long> finishedTimestampArgumentCaptor;
  @Captor private ArgumentCaptor<MetadataUpdateProcessUpdate> payloadArgumentCaptor;

  @Before
  public void setup() throws PublishingException {
    Mockito.when(jobExecution.getExecutionContext()).thenReturn(executionContext);
    Mockito.when(executionContext.containsKey(PARAM_METADATA_UPDATE_STARTED)).thenReturn(true);
    Mockito.when(executionContext.getLong(PARAM_METADATA_UPDATE_TOTAL_COMICS))
        .thenReturn(TEST_TOTAL_COUNT);
    Mockito.doNothing()
        .when(publishMetadataUpdateProcessStateUpdateAction)
        .publish(payloadArgumentCaptor.capture());
  }

  @Test
  public void testBeforeJob() throws PublishingException {
    Mockito.when(executionContext.containsKey(PARAM_METADATA_UPDATE_FINISHED)).thenReturn(false);
    Mockito.when(comicBookService.findComicsForBatchMetadataUpdateCount())
        .thenReturn(TEST_TOTAL_COUNT);

    listener.beforeJob(jobExecution);

    final MetadataUpdateProcessUpdate payload = payloadArgumentCaptor.getValue();
    assertNotNull(payload);
    assertEquals(TEST_TOTAL_COUNT.longValue(), payload.getTotalComics());
    assertEquals(0L, payload.getCompletedComics());
    assertTrue(payload.isActive());

    Mockito.verify(executionContext, Mockito.times(1))
        .putLong(PARAM_METADATA_UPDATE_TOTAL_COMICS, TEST_TOTAL_COUNT);
    Mockito.verify(publishMetadataUpdateProcessStateUpdateAction, Mockito.times(1))
        .publish(payload);
  }

  @Test
  public void testAfterJob() throws PublishingException {
    Mockito.when(executionContext.containsKey(PARAM_METADATA_UPDATE_FINISHED)).thenReturn(true);
    Mockito.doNothing()
        .when(executionContext)
        .putLong(Mockito.anyString(), finishedTimestampArgumentCaptor.capture());

    listener.afterJob(jobExecution);

    final Long finishedTimestamp = finishedTimestampArgumentCaptor.getValue();

    final MetadataUpdateProcessUpdate payload = payloadArgumentCaptor.getValue();
    assertNotNull(payload);
    assertEquals(0L, payload.getTotalComics());
    assertEquals(0L, payload.getCompletedComics());
    assertFalse(payload.isActive());

    Mockito.verify(executionContext, Mockito.times(1))
        .putLong(PARAM_METADATA_UPDATE_FINISHED, finishedTimestamp);
    Mockito.verify(publishMetadataUpdateProcessStateUpdateAction, Mockito.times(1))
        .publish(payload);
  }
}

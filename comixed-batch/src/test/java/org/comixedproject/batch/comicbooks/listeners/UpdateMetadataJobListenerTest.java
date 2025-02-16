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

import static org.comixedproject.batch.comicbooks.UpdateMetadataConfiguration.UPDATE_METADATA_JOB;

import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.batch.PublishBatchProcessDetailUpdateAction;
import org.comixedproject.model.batch.BatchProcessDetail;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.batch.core.*;

@ExtendWith(MockitoExtension.class)
class UpdateMetadataJobListenerTest {
  @InjectMocks private UpdateMetadataJobListener listener;
  @Mock private JobInstance jobInstance;
  @Mock private JobExecution jobExecution;
  @Mock private PublishBatchProcessDetailUpdateAction publishBatchProcessDetailUpdateAction;
  @Mock private JobParameters jobParameters;

  @Captor ArgumentCaptor<BatchProcessDetail> batchProcessDetailArgumentCaptor;

  @BeforeEach
  public void setUp() throws PublishingException {
    Mockito.when(jobExecution.getJobParameters()).thenReturn(jobParameters);
    Mockito.when(jobInstance.getJobName()).thenReturn(UPDATE_METADATA_JOB);
    Mockito.when(jobExecution.getJobInstance()).thenReturn(jobInstance);
    Mockito.when(jobExecution.getStatus()).thenReturn(BatchStatus.COMPLETED);
    Mockito.when(jobExecution.getExitStatus()).thenReturn(ExitStatus.COMPLETED);

    Mockito.doNothing()
        .when(publishBatchProcessDetailUpdateAction)
        .publish(batchProcessDetailArgumentCaptor.capture());
  }

  @Test
  void beforeJob() throws PublishingException {
    listener.beforeJob(jobExecution);

    final BatchProcessDetail detail = batchProcessDetailArgumentCaptor.getValue();

    Mockito.verify(publishBatchProcessDetailUpdateAction, Mockito.times(1)).publish(detail);
  }

  @Test
  void afterJob() throws PublishingException {
    listener.afterJob(jobExecution);

    final BatchProcessDetail detail = batchProcessDetailArgumentCaptor.getValue();

    Mockito.verify(publishBatchProcessDetailUpdateAction, Mockito.times(1)).publish(detail);
  }
}

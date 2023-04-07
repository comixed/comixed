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
import static org.comixedproject.model.messaging.batch.ProcessComicStatus.*;

import java.util.Date;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.comicbooks.PublishProcessComicsStatusAction;
import org.comixedproject.model.messaging.batch.ProcessComicStatus;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.scope.context.StepContext;
import org.springframework.batch.item.ExecutionContext;

@RunWith(MockitoJUnitRunner.class)
public class ProcessedComicBookChunkListenerTest {
  private static final int TEST_WRITE_COUNT = 328;
  private static final long TEST_TOTAL_COMICS = 77L;
  private static final Date TEST_JOB_STARTED = new Date();
  private static final String TEST_STEP_NAME = "step-name";
  private static final long TEST_PROCESSED_COMICS = 15L;

  @InjectMocks private ProcessedComicChunkListener listener;
  @Mock private ChunkContext chunkContext;
  @Mock private StepContext stepContext;
  @Mock private JobExecution jobExecution;
  @Mock private ExecutionContext executionContext;
  @Mock private StepExecution stepExecution;
  @Mock private PublishProcessComicsStatusAction publishProcessComicsStatusAction;

  @Captor ArgumentCaptor<ProcessComicStatus> processComicStatusArgumentCaptor;

  @Before
  public void setUp() throws PublishingException {
    Mockito.when(chunkContext.getStepContext()).thenReturn(stepContext);
    Mockito.when(stepContext.getStepExecution()).thenReturn(stepExecution);
    Mockito.when(stepExecution.getJobExecution()).thenReturn(jobExecution);
    Mockito.when(jobExecution.getExecutionContext()).thenReturn(executionContext);
    Mockito.when(stepExecution.getWriteCount()).thenReturn(TEST_WRITE_COUNT);
    Mockito.when(executionContext.containsKey(JOB_STARTED)).thenReturn(true);
    Mockito.when(executionContext.containsKey(JOB_FINISHED)).thenReturn(false);
    Mockito.when(executionContext.getLong(JOB_STARTED)).thenReturn(TEST_JOB_STARTED.getTime());
    Mockito.when(executionContext.getString(STEP_NAME)).thenReturn(TEST_STEP_NAME);
    Mockito.when(executionContext.getLong(TOTAL_COMICS)).thenReturn(TEST_TOTAL_COMICS);
    Mockito.when(executionContext.getLong(PROCESSED_COMICS)).thenReturn(TEST_PROCESSED_COMICS);
    Mockito.doNothing()
        .when(publishProcessComicsStatusAction)
        .publish(processComicStatusArgumentCaptor.capture());
  }

  @Test
  public void testBeforeChunk() throws PublishingException {
    Mockito.when(executionContext.containsKey(JOB_STARTED)).thenReturn(true);
    Mockito.when(executionContext.containsKey(JOB_FINISHED)).thenReturn(false);

    listener.beforeChunk(chunkContext);

    final ProcessComicStatus status = processComicStatusArgumentCaptor.getValue();

    assertNotNull(status);
    assertTrue(status.isActive());
    assertEquals(TEST_JOB_STARTED, status.getStarted());
    assertEquals(TEST_STEP_NAME, status.getStepName());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_PROCESSED_COMICS, status.getProcessed());

    Mockito.verify(publishProcessComicsStatusAction, Mockito.times(1)).publish(status);

    Mockito.verify(executionContext, Mockito.times(1)).putLong(PROCESSED_COMICS, TEST_WRITE_COUNT);
  }

  @Test
  public void testAfterChunk() throws PublishingException {
    Mockito.when(executionContext.containsKey(JOB_STARTED)).thenReturn(true);
    Mockito.when(executionContext.containsKey(JOB_FINISHED)).thenReturn(false);

    listener.afterChunk(chunkContext);

    final ProcessComicStatus status = processComicStatusArgumentCaptor.getValue();

    assertNotNull(status);
    assertTrue(status.isActive());
    assertEquals(TEST_JOB_STARTED, status.getStarted());
    assertEquals(TEST_STEP_NAME, status.getStepName());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_PROCESSED_COMICS, status.getProcessed());

    Mockito.verify(publishProcessComicsStatusAction, Mockito.times(1)).publish(status);

    Mockito.verify(executionContext, Mockito.times(1)).putLong(PROCESSED_COMICS, TEST_WRITE_COUNT);
  }

  @Test
  public void testAfterChunkError() throws PublishingException {
    Mockito.when(executionContext.containsKey(JOB_STARTED)).thenReturn(true);
    Mockito.when(executionContext.containsKey(JOB_FINISHED)).thenReturn(false);

    listener.afterChunkError(chunkContext);

    final ProcessComicStatus status = processComicStatusArgumentCaptor.getValue();

    assertNotNull(status);
    assertTrue(status.isActive());
    assertEquals(TEST_JOB_STARTED, status.getStarted());
    assertEquals(TEST_STEP_NAME, status.getStepName());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_PROCESSED_COMICS, status.getProcessed());

    Mockito.verify(publishProcessComicsStatusAction, Mockito.times(1)).publish(status);

    Mockito.verify(executionContext, Mockito.times(1)).putLong(PROCESSED_COMICS, TEST_WRITE_COUNT);
  }

  @Test
  public void testAfterChunkPublishingException() throws PublishingException {
    Mockito.when(executionContext.containsKey(JOB_STARTED)).thenReturn(true);
    Mockito.when(executionContext.containsKey(JOB_FINISHED)).thenReturn(false);
    Mockito.doThrow(PublishingException.class)
        .when(publishProcessComicsStatusAction)
        .publish(processComicStatusArgumentCaptor.capture());

    listener.afterChunk(chunkContext);

    final ProcessComicStatus status = processComicStatusArgumentCaptor.getValue();

    assertNotNull(status);
    assertTrue(status.isActive());
    assertEquals(TEST_JOB_STARTED, status.getStarted());
    assertEquals(TEST_STEP_NAME, status.getStepName());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_PROCESSED_COMICS, status.getProcessed());

    Mockito.verify(executionContext, Mockito.times(1)).putLong(PROCESSED_COMICS, TEST_WRITE_COUNT);
  }
}

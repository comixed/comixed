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
import org.springframework.batch.item.ExecutionContext;

@RunWith(MockitoJUnitRunner.class)
public class ProcessComicsJobListenerTest {
  private static final Date TEST_JOB_STARTED = new Date();
  private static final String TEST_STEP_NAME = "step-name";
  private static final long TEST_TOTAL_COMICS = 27L;
  private static final long TEST_PROCESSED_COMICS = 15L;

  @InjectMocks private ProcessComicsJobListener listener;
  @Mock private JobExecution jobExecution;
  @Mock private ExecutionContext executionContext;
  @Mock private PublishProcessComicsStatusAction publishProcessComicsStatusAction;

  @Captor ArgumentCaptor<Long> timestampArgumentCaptor;
  @Captor ArgumentCaptor<ProcessComicStatus> processComicStatusArgumentCaptor;

  @Before
  public void setUp() throws PublishingException {
    Mockito.when(jobExecution.getExecutionContext()).thenReturn(executionContext);
    Mockito.when(executionContext.getLong(JOB_STARTED)).thenReturn(TEST_JOB_STARTED.getTime());
    Mockito.when(executionContext.getString(STEP_NAME)).thenReturn(TEST_STEP_NAME);
    Mockito.when(executionContext.getLong(TOTAL_COMICS)).thenReturn(TEST_TOTAL_COMICS);
    Mockito.when(executionContext.getLong(PROCESSED_COMICS)).thenReturn(TEST_PROCESSED_COMICS);
    Mockito.doNothing()
        .when(publishProcessComicsStatusAction)
        .publish(processComicStatusArgumentCaptor.capture());
  }

  @Test
  public void testBeforeJob() throws PublishingException {
    Mockito.when(executionContext.containsKey(JOB_STARTED)).thenReturn(true);
    Mockito.when(executionContext.containsKey(JOB_FINISHED)).thenReturn(false);
    Mockito.when(executionContext.getString(STEP_NAME)).thenReturn("");
    Mockito.doNothing()
        .when(executionContext)
        .putLong(Mockito.anyString(), timestampArgumentCaptor.capture());

    listener.beforeJob(jobExecution);

    final Long timestamp = timestampArgumentCaptor.getAllValues().get(0);
    assertNotNull(timestamp);

    final ProcessComicStatus status = processComicStatusArgumentCaptor.getValue();
    assertNotNull(status);
    assertTrue(status.isActive());
    assertEquals(TEST_JOB_STARTED, status.getStarted());
    assertEquals("", status.getStepName());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_PROCESSED_COMICS, status.getProcessed());

    Mockito.verify(executionContext, Mockito.times(1)).putLong(JOB_STARTED, timestamp);
    Mockito.verify(executionContext, Mockito.times(1)).putLong(TOTAL_COMICS, 0L);
    Mockito.verify(executionContext, Mockito.times(1)).putLong(PROCESSED_COMICS, 0L);
    Mockito.verify(publishProcessComicsStatusAction, Mockito.times(1)).publish(status);
  }

  @Test
  public void testBeforeJobPublishingException() throws PublishingException {
    Mockito.when(executionContext.containsKey(JOB_STARTED)).thenReturn(true);
    Mockito.when(executionContext.containsKey(JOB_FINISHED)).thenReturn(false);
    Mockito.when(executionContext.getString(STEP_NAME)).thenReturn("");
    Mockito.doNothing()
        .when(executionContext)
        .putLong(Mockito.anyString(), timestampArgumentCaptor.capture());
    Mockito.doThrow(PublishingException.class)
        .when(publishProcessComicsStatusAction)
        .publish(processComicStatusArgumentCaptor.capture());

    listener.beforeJob(jobExecution);

    final Long timestamp = timestampArgumentCaptor.getAllValues().get(0);
    assertNotNull(timestamp);

    final ProcessComicStatus status = processComicStatusArgumentCaptor.getValue();

    assertNotNull(status);
    assertTrue(status.isActive());
    assertEquals(TEST_JOB_STARTED, status.getStarted());
    assertEquals("", status.getStepName());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_PROCESSED_COMICS, status.getProcessed());

    Mockito.verify(executionContext, Mockito.times(1)).putLong(JOB_STARTED, timestamp);
    Mockito.verify(executionContext, Mockito.times(1)).putLong(TOTAL_COMICS, 0L);
    Mockito.verify(executionContext, Mockito.times(1)).putLong(PROCESSED_COMICS, 0L);
    Mockito.verify(publishProcessComicsStatusAction, Mockito.times(1)).publish(status);
  }

  @Test
  public void testAfterJob() throws PublishingException {
    Mockito.when(executionContext.containsKey(JOB_STARTED)).thenReturn(true);
    Mockito.when(executionContext.containsKey(JOB_FINISHED)).thenReturn(true);

    listener.afterJob(jobExecution);

    final ProcessComicStatus status = processComicStatusArgumentCaptor.getValue();
    assertNotNull(status);
    assertFalse(status.isActive());
    assertEquals(TEST_JOB_STARTED, status.getStarted());
    assertEquals(TEST_STEP_NAME, status.getStepName());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_PROCESSED_COMICS, status.getProcessed());
    Mockito.verify(publishProcessComicsStatusAction, Mockito.times(1)).publish(status);
  }

  @Test
  public void testAfterJobPublishingException() throws PublishingException {
    Mockito.when(executionContext.containsKey(JOB_STARTED)).thenReturn(true);
    Mockito.when(executionContext.containsKey(JOB_FINISHED)).thenReturn(true);
    Mockito.doThrow(PublishingException.class)
        .when(publishProcessComicsStatusAction)
        .publish(processComicStatusArgumentCaptor.capture());

    listener.afterJob(jobExecution);

    final ProcessComicStatus status = processComicStatusArgumentCaptor.getValue();

    assertNotNull(status);
    assertFalse(status.isActive());
    assertEquals(TEST_JOB_STARTED, status.getStarted());
    assertEquals(TEST_STEP_NAME, status.getStepName());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_PROCESSED_COMICS, status.getProcessed());

    Mockito.verify(publishProcessComicsStatusAction, Mockito.times(1)).publish(status);
  }
}

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
import static org.comixedproject.model.messaging.batch.ProcessComicBooksStatus.*;

import java.util.Date;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.comicbooks.PublishProcessComicBooksStatusAction;
import org.comixedproject.model.messaging.batch.ProcessComicBooksStatus;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.item.ExecutionContext;

@RunWith(MockitoJUnitRunner.class)
public class ProcessComicBooksJobListenerTest {
  private static final Date TEST_JOB_STARTED = new Date();
  private static final String TEST_STEP_NAME = "step-name";
  private static final long TEST_TOTAL_COMICS = 27L;
  private static final long TEST_PROCESSED_COMICS = 15L;

  @InjectMocks private ProcessComicBooksJobListener listener;
  @Mock private JobExecution jobExecution;
  @Mock private ExecutionContext executionContext;
  @Mock private PublishProcessComicBooksStatusAction publishProcessComicBooksStatusAction;

  @Captor ArgumentCaptor<Long> timestampArgumentCaptor;
  @Captor ArgumentCaptor<ProcessComicBooksStatus> processComicStatusArgumentCaptor;

  @Before
  public void setUp() throws PublishingException {
    Mockito.when(jobExecution.getExecutionContext()).thenReturn(executionContext);
    Mockito.when(executionContext.getLong(PROCESS_COMIC_BOOKS_JOB_STARTED))
        .thenReturn(TEST_JOB_STARTED.getTime());
    Mockito.when(executionContext.getString(PROCESS_COMIC_BOOKS_STEP_NAME))
        .thenReturn(TEST_STEP_NAME);
    Mockito.when(executionContext.getLong(PROCESS_COMIC_BOOKS_TOTAL_COMICS))
        .thenReturn(TEST_TOTAL_COMICS);
    Mockito.when(executionContext.getLong(PROCESS_COMIC_BOOKS_PROCESSED_COMICS))
        .thenReturn(TEST_PROCESSED_COMICS);
    Mockito.doNothing()
        .when(publishProcessComicBooksStatusAction)
        .publish(processComicStatusArgumentCaptor.capture());
  }

  @Test
  public void testBeforeJob() throws PublishingException {
    Mockito.when(executionContext.containsKey(PROCESS_COMIC_BOOKS_JOB_STARTED)).thenReturn(true);
    Mockito.when(executionContext.containsKey(PROCESS_COMIC_BOOKS_JOB_FINISHED)).thenReturn(false);
    Mockito.when(executionContext.getString(PROCESS_COMIC_BOOKS_STEP_NAME)).thenReturn("");
    Mockito.doNothing()
        .when(executionContext)
        .putLong(Mockito.anyString(), timestampArgumentCaptor.capture());

    listener.beforeJob(jobExecution);

    final Long timestamp = timestampArgumentCaptor.getAllValues().get(0);
    assertNotNull(timestamp);

    final ProcessComicBooksStatus status = processComicStatusArgumentCaptor.getValue();
    assertNotNull(status);
    assertTrue(status.isActive());
    assertEquals(TEST_JOB_STARTED, status.getStarted());
    assertEquals("", status.getStepName());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_PROCESSED_COMICS, status.getProcessed());

    Mockito.verify(executionContext, Mockito.times(1))
        .putLong(PROCESS_COMIC_BOOKS_JOB_STARTED, timestamp);
    Mockito.verify(executionContext, Mockito.times(1))
        .putLong(PROCESS_COMIC_BOOKS_TOTAL_COMICS, 0L);
    Mockito.verify(executionContext, Mockito.times(1))
        .putLong(PROCESS_COMIC_BOOKS_PROCESSED_COMICS, 0L);
    Mockito.verify(publishProcessComicBooksStatusAction, Mockito.times(1)).publish(status);
  }

  @Test
  public void testBeforeJobPublishingException() throws PublishingException {
    Mockito.when(executionContext.containsKey(PROCESS_COMIC_BOOKS_JOB_STARTED)).thenReturn(true);
    Mockito.when(executionContext.containsKey(PROCESS_COMIC_BOOKS_JOB_FINISHED)).thenReturn(false);
    Mockito.when(executionContext.getString(PROCESS_COMIC_BOOKS_STEP_NAME)).thenReturn("");
    Mockito.doNothing()
        .when(executionContext)
        .putLong(Mockito.anyString(), timestampArgumentCaptor.capture());
    Mockito.doThrow(PublishingException.class)
        .when(publishProcessComicBooksStatusAction)
        .publish(processComicStatusArgumentCaptor.capture());

    listener.beforeJob(jobExecution);

    final Long timestamp = timestampArgumentCaptor.getAllValues().get(0);
    assertNotNull(timestamp);

    final ProcessComicBooksStatus status = processComicStatusArgumentCaptor.getValue();

    assertNotNull(status);
    assertTrue(status.isActive());
    assertEquals(TEST_JOB_STARTED, status.getStarted());
    assertEquals("", status.getStepName());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_PROCESSED_COMICS, status.getProcessed());

    Mockito.verify(executionContext, Mockito.times(1))
        .putLong(PROCESS_COMIC_BOOKS_JOB_STARTED, timestamp);
    Mockito.verify(executionContext, Mockito.times(1))
        .putLong(PROCESS_COMIC_BOOKS_TOTAL_COMICS, 0L);
    Mockito.verify(executionContext, Mockito.times(1))
        .putLong(PROCESS_COMIC_BOOKS_PROCESSED_COMICS, 0L);
    Mockito.verify(publishProcessComicBooksStatusAction, Mockito.times(1)).publish(status);
  }

  @Test
  public void testAfterJob() throws PublishingException {
    Mockito.when(executionContext.containsKey(PROCESS_COMIC_BOOKS_JOB_STARTED)).thenReturn(true);
    Mockito.when(executionContext.containsKey(PROCESS_COMIC_BOOKS_JOB_FINISHED)).thenReturn(true);

    listener.afterJob(jobExecution);

    final ProcessComicBooksStatus status = processComicStatusArgumentCaptor.getValue();
    assertNotNull(status);
    assertFalse(status.isActive());
    assertEquals(TEST_JOB_STARTED, status.getStarted());
    assertEquals(TEST_STEP_NAME, status.getStepName());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_PROCESSED_COMICS, status.getProcessed());
    Mockito.verify(publishProcessComicBooksStatusAction, Mockito.times(1)).publish(status);
  }

  @Test
  public void testAfterJobPublishingException() throws PublishingException {
    Mockito.when(executionContext.containsKey(PROCESS_COMIC_BOOKS_JOB_STARTED)).thenReturn(true);
    Mockito.when(executionContext.containsKey(PROCESS_COMIC_BOOKS_JOB_FINISHED)).thenReturn(true);
    Mockito.doThrow(PublishingException.class)
        .when(publishProcessComicBooksStatusAction)
        .publish(processComicStatusArgumentCaptor.capture());

    listener.afterJob(jobExecution);

    final ProcessComicBooksStatus status = processComicStatusArgumentCaptor.getValue();

    assertNotNull(status);
    assertFalse(status.isActive());
    assertEquals(TEST_JOB_STARTED, status.getStarted());
    assertEquals(TEST_STEP_NAME, status.getStepName());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_PROCESSED_COMICS, status.getProcessed());

    Mockito.verify(publishProcessComicBooksStatusAction, Mockito.times(1)).publish(status);
  }
}

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

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertTrue;
import static org.comixedproject.model.messaging.batch.AddComicBooksStatus.*;

import java.util.Date;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.comicbooks.PublishAddComicBooksStatusAction;
import org.comixedproject.model.messaging.batch.AddComicBooksStatus;
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
public class AddedComicBookChunkListenerTest {
  private static final Date TEST_JOB_STARTED = new Date();
  private static final long TEST_WRITE_COUNT = 129L;
  private static final long TEST_TOTAL_COMICS = TEST_WRITE_COUNT * 2L;

  @InjectMocks private AddedComicBookChunkListener listener;
  @Mock private PublishAddComicBooksStatusAction publishAddComicBooksStatusAction;
  @Mock private ChunkContext chunkContext;
  @Mock private StepContext stepContext;
  @Mock private StepExecution stepExecution;
  @Mock private JobExecution jobExecution;
  @Mock private ExecutionContext executionContext;

  @Captor ArgumentCaptor<AddComicBooksStatus> addComicBooksStatusArgumentCaptor;

  @Before
  public void setUp() throws PublishingException {
    Mockito.when(chunkContext.getStepContext()).thenReturn(stepContext);
    Mockito.when(stepContext.getStepExecution()).thenReturn(stepExecution);
    Mockito.when(stepExecution.getJobExecution()).thenReturn(jobExecution);
    Mockito.when(stepExecution.getWriteCount()).thenReturn(TEST_WRITE_COUNT);
    Mockito.when(executionContext.containsKey(ADD_COMIC_BOOKS_JOB_STARTED)).thenReturn(true);
    Mockito.when(executionContext.getLong(ADD_COMIC_BOOKS_JOB_STARTED))
        .thenReturn(TEST_JOB_STARTED.getTime());
    Mockito.when(executionContext.containsKey(ADD_COMIC_BOOKS_JOB_FINISHED)).thenReturn(false);
    Mockito.when(executionContext.getLong(ADD_COMIC_BOOKS_TOTAL_COMICS))
        .thenReturn(TEST_TOTAL_COMICS);
    Mockito.when(executionContext.getLong(ADD_COMIC_BOOKS_PROCESSED_COMICS))
        .thenReturn(TEST_WRITE_COUNT);
    Mockito.when(jobExecution.getExecutionContext()).thenReturn(executionContext);
    Mockito.doNothing()
        .when(publishAddComicBooksStatusAction)
        .publish(addComicBooksStatusArgumentCaptor.capture());
  }

  @Test
  public void testBeforeChunk() throws PublishingException {
    listener.beforeChunk(chunkContext);

    final AddComicBooksStatus status = addComicBooksStatusArgumentCaptor.getValue();
    assertTrue(status.isActive());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_WRITE_COUNT, status.getProcessed());

    Mockito.verify(executionContext, Mockito.times(1))
        .putLong(ADD_COMIC_BOOKS_PROCESSED_COMICS, TEST_WRITE_COUNT);
    Mockito.verify(publishAddComicBooksStatusAction, Mockito.times(1)).publish(status);
  }

  @Test
  public void testAfterChunkError() throws PublishingException {
    listener.afterChunkError(chunkContext);

    final AddComicBooksStatus status = addComicBooksStatusArgumentCaptor.getValue();
    assertTrue(status.isActive());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_WRITE_COUNT, status.getProcessed());

    Mockito.verify(executionContext, Mockito.times(1))
        .putLong(ADD_COMIC_BOOKS_PROCESSED_COMICS, TEST_WRITE_COUNT);
    Mockito.verify(publishAddComicBooksStatusAction, Mockito.times(1)).publish(status);
  }

  @Test
  public void testBeforeChunkPublishingException() throws PublishingException {
    Mockito.doThrow(PublishingException.class)
        .when(publishAddComicBooksStatusAction)
        .publish(Mockito.any());

    listener.beforeChunk(chunkContext);

    Mockito.verify(executionContext, Mockito.times(1))
        .putLong(ADD_COMIC_BOOKS_PROCESSED_COMICS, TEST_WRITE_COUNT);
    Mockito.verify(publishAddComicBooksStatusAction, Mockito.times(1)).publish(Mockito.any());
  }

  @Test
  public void testAfterStep() throws PublishingException {
    listener.afterChunk(chunkContext);

    final AddComicBooksStatus status = addComicBooksStatusArgumentCaptor.getValue();
    assertTrue(status.isActive());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_WRITE_COUNT, status.getProcessed());

    Mockito.verify(publishAddComicBooksStatusAction, Mockito.times(1)).publish(status);
  }

  @Test
  public void testAfterStepPublisingException() throws PublishingException {
    Mockito.doThrow(PublishingException.class)
        .when(publishAddComicBooksStatusAction)
        .publish(Mockito.any());

    listener.afterChunk(chunkContext);

    Mockito.verify(publishAddComicBooksStatusAction, Mockito.times(1)).publish(Mockito.any());
  }
}

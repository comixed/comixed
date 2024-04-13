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
import static org.comixedproject.model.messaging.batch.AddComicBooksStatus.*;

import java.util.Date;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.comicbooks.PublishAddComicBooksStatusAction;
import org.comixedproject.model.messaging.batch.AddComicBooksStatus;
import org.comixedproject.service.comicfiles.ComicFileService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.item.ExecutionContext;

@RunWith(MockitoJUnitRunner.class)
public class AddedComicBookJobListenerTest {
  private static final Date TEST_JOB_STARTED = new Date();
  private static final long TEST_TOTAL_COMICS = 27L;
  private static final long TEST_PROCESSED_COMICS = 15L;
  private static final Long TEST_TOTAL_DESCRIPTORS = 717L;

  @InjectMocks private AddedComicBookJobListener listener;
  @Mock private ComicFileService comicFileService;
  @Mock private JobExecution jobExecution;
  @Mock private ExecutionContext executionContext;
  @Mock private PublishAddComicBooksStatusAction publishAddComicBooksStatusAction;

  @Captor ArgumentCaptor<Long> timestampArgumentCaptor;
  @Captor ArgumentCaptor<AddComicBooksStatus> addComicStatusArgumentCaptor;

  @Before
  public void setUp() throws PublishingException {
    Mockito.when(jobExecution.getExecutionContext()).thenReturn(executionContext);
    Mockito.when(executionContext.getLong(ADD_COMIC_BOOKS_JOB_STARTED))
        .thenReturn(TEST_JOB_STARTED.getTime());
    Mockito.when(executionContext.getLong(ADD_COMIC_BOOKS_TOTAL_COMICS))
        .thenReturn(TEST_TOTAL_COMICS);
    Mockito.when(executionContext.getLong(ADD_COMIC_BOOKS_PROCESSED_COMICS))
        .thenReturn(TEST_PROCESSED_COMICS);
    Mockito.doNothing()
        .when(publishAddComicBooksStatusAction)
        .publish(addComicStatusArgumentCaptor.capture());

    Mockito.when(comicFileService.getComicFileDescriptorCount()).thenReturn(TEST_TOTAL_DESCRIPTORS);
  }

  @Test
  public void testBeforeJob() throws PublishingException {
    Mockito.when(executionContext.containsKey(ADD_COMIC_BOOKS_JOB_STARTED)).thenReturn(true);
    Mockito.when(executionContext.containsKey(ADD_COMIC_BOOKS_JOB_FINISHED)).thenReturn(false);
    Mockito.doNothing()
        .when(executionContext)
        .putLong(Mockito.anyString(), timestampArgumentCaptor.capture());

    listener.beforeJob(jobExecution);

    final Long timestamp = timestampArgumentCaptor.getAllValues().get(0);
    assertNotNull(timestamp);

    final AddComicBooksStatus status = addComicStatusArgumentCaptor.getValue();
    assertNotNull(status);
    assertTrue(status.isActive());
    assertEquals(TEST_JOB_STARTED, status.getStarted());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_PROCESSED_COMICS, status.getProcessed());

    Mockito.verify(executionContext, Mockito.times(1))
        .putLong(ADD_COMIC_BOOKS_JOB_STARTED, timestamp);
    Mockito.verify(executionContext, Mockito.times(1))
        .putLong(ADD_COMIC_BOOKS_TOTAL_COMICS, TEST_TOTAL_DESCRIPTORS);
    Mockito.verify(executionContext, Mockito.times(1))
        .putLong(ADD_COMIC_BOOKS_PROCESSED_COMICS, 0L);
    Mockito.verify(publishAddComicBooksStatusAction, Mockito.times(1)).publish(status);
  }

  @Test
  public void testBeforeJobPublishingException() throws PublishingException {
    Mockito.when(executionContext.containsKey(ADD_COMIC_BOOKS_JOB_STARTED)).thenReturn(true);
    Mockito.when(executionContext.containsKey(ADD_COMIC_BOOKS_JOB_FINISHED)).thenReturn(false);
    Mockito.doNothing()
        .when(executionContext)
        .putLong(Mockito.anyString(), timestampArgumentCaptor.capture());
    Mockito.doThrow(PublishingException.class)
        .when(publishAddComicBooksStatusAction)
        .publish(addComicStatusArgumentCaptor.capture());

    listener.beforeJob(jobExecution);

    final Long timestamp = timestampArgumentCaptor.getAllValues().get(0);
    assertNotNull(timestamp);

    final AddComicBooksStatus status = addComicStatusArgumentCaptor.getValue();

    assertNotNull(status);
    assertTrue(status.isActive());
    assertEquals(TEST_JOB_STARTED, status.getStarted());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_PROCESSED_COMICS, status.getProcessed());

    Mockito.verify(executionContext, Mockito.times(1))
        .putLong(ADD_COMIC_BOOKS_JOB_STARTED, timestamp);
    Mockito.verify(executionContext, Mockito.times(1))
        .putLong(ADD_COMIC_BOOKS_TOTAL_COMICS, TEST_TOTAL_DESCRIPTORS);
    Mockito.verify(executionContext, Mockito.times(1))
        .putLong(ADD_COMIC_BOOKS_PROCESSED_COMICS, 0L);
    Mockito.verify(publishAddComicBooksStatusAction, Mockito.times(1)).publish(status);
  }

  @Test
  public void testAfterJob() throws PublishingException {
    Mockito.when(executionContext.containsKey(ADD_COMIC_BOOKS_JOB_STARTED)).thenReturn(true);
    Mockito.when(executionContext.containsKey(ADD_COMIC_BOOKS_JOB_FINISHED)).thenReturn(false);

    listener.afterJob(jobExecution);

    final AddComicBooksStatus status = addComicStatusArgumentCaptor.getValue();
    assertNotNull(status);
    assertTrue(status.isActive());
    assertEquals(TEST_JOB_STARTED, status.getStarted());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_PROCESSED_COMICS, status.getProcessed());
    Mockito.verify(publishAddComicBooksStatusAction, Mockito.times(1)).publish(status);
  }

  @Test
  public void testAfterJobPublishingException() throws PublishingException {
    Mockito.when(executionContext.containsKey(ADD_COMIC_BOOKS_JOB_STARTED)).thenReturn(true);
    Mockito.when(executionContext.containsKey(ADD_COMIC_BOOKS_JOB_FINISHED)).thenReturn(false);
    Mockito.doThrow(PublishingException.class)
        .when(publishAddComicBooksStatusAction)
        .publish(addComicStatusArgumentCaptor.capture());

    listener.afterJob(jobExecution);

    final AddComicBooksStatus status = addComicStatusArgumentCaptor.getValue();

    assertNotNull(status);
    assertTrue(status.isActive());
    assertEquals(TEST_JOB_STARTED, status.getStarted());
    assertEquals(TEST_TOTAL_COMICS, status.getTotal());
    assertEquals(TEST_PROCESSED_COMICS, status.getProcessed());

    Mockito.verify(publishAddComicBooksStatusAction, Mockito.times(1)).publish(status);
  }
}

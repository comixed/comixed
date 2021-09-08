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

package org.comixedproject.service.library;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertNotNull;

import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.library.PublishImportCountAction;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.state.messaging.ImportCountMessage;
import org.comixedproject.service.comicbooks.ComicService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ImportCountMonitorTest {
  private static final int TEST_ADDED_COUNT = 23;
  private static final int TEST_IMPORTING_COUNT = 72;

  @InjectMocks private ImportCountMonitor monitor;
  @Mock private ComicService comicService;
  @Mock private PublishImportCountAction publishImportCountAction;

  @Captor private ArgumentCaptor<ImportCountMessage> importCountMessageArgumentCaptor;

  @Test
  public void testRunMonitor() throws PublishingException {
    Mockito.when(comicService.getCountForState(ComicState.ADDED)).thenReturn(TEST_ADDED_COUNT);
    Mockito.when(comicService.getCountForState(ComicState.UNPROCESSED))
        .thenReturn(TEST_IMPORTING_COUNT);
    Mockito.doNothing()
        .when(publishImportCountAction)
        .publish(importCountMessageArgumentCaptor.capture());

    monitor.runMonitor();

    final ImportCountMessage message = importCountMessageArgumentCaptor.getValue();
    assertNotNull(message);
    assertEquals(TEST_ADDED_COUNT, message.getAddCount());
    assertEquals(TEST_IMPORTING_COUNT, message.getProcessingCount());

    Mockito.verify(comicService, Mockito.times(1)).getCountForState(ComicState.ADDED);
    Mockito.verify(comicService, Mockito.times(1)).getCountForState(ComicState.UNPROCESSED);
    Mockito.verify(publishImportCountAction, Mockito.times(1)).publish(message);
  }

  @Test
  public void testRunMonitorPublishingException() throws PublishingException {
    Mockito.when(comicService.getCountForState(ComicState.ADDED)).thenReturn(TEST_ADDED_COUNT);
    Mockito.when(comicService.getCountForState(ComicState.UNPROCESSED))
        .thenReturn(TEST_IMPORTING_COUNT);
    Mockito.doThrow(PublishingException.class)
        .when(publishImportCountAction)
        .publish(importCountMessageArgumentCaptor.capture());

    monitor.runMonitor();

    final ImportCountMessage message = importCountMessageArgumentCaptor.getValue();
    assertNotNull(message);
    assertEquals(TEST_ADDED_COUNT, message.getAddCount());
    assertEquals(TEST_IMPORTING_COUNT, message.getProcessingCount());

    Mockito.verify(comicService, Mockito.times(1)).getCountForState(ComicState.ADDED);
    Mockito.verify(comicService, Mockito.times(1)).getCountForState(ComicState.UNPROCESSED);
    Mockito.verify(publishImportCountAction, Mockito.times(1)).publish(message);
  }
}

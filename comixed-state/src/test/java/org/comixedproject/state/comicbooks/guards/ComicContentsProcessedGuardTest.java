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

package org.comixedproject.state.comicbooks.guards;

import static junit.framework.TestCase.assertFalse;
import static junit.framework.TestCase.assertTrue;

import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicFileDetails;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.messaging.MessageHeaders;
import org.springframework.statemachine.StateContext;

@RunWith(MockitoJUnitRunner.class)
public class ComicContentsProcessedGuardTest {
  @InjectMocks private ComicContentsProcessedGuard guard;
  @Mock private StateContext<ComicState, ComicEvent> context;
  @Mock private MessageHeaders messageHeaders;
  @Mock private Comic comic;
  @Mock private ComicFileDetails fileDetails;

  @Before
  public void setUp() {
    Mockito.when(context.getMessageHeaders()).thenReturn(messageHeaders);
    Mockito.when(messageHeaders.get(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(comic);
  }

  @Test
  public void testEvaluateNoFileDetailsPresent() {
    Mockito.when(comic.getFileDetails()).thenReturn(null);

    final boolean result = guard.evaluate(context);

    assertFalse(result);
  }

  @Test
  public void testEvaluateFileContentsNotLoaded() {
    Mockito.when(comic.getFileDetails()).thenReturn(fileDetails);
    Mockito.when(comic.isFileContentsLoaded()).thenReturn(false);

    final boolean result = guard.evaluate(context);

    assertFalse(result);
  }

  @Test
  public void testEvaluateBlockedPagesNotProcessed() {
    Mockito.when(comic.getFileDetails()).thenReturn(fileDetails);
    Mockito.when(comic.isFileContentsLoaded()).thenReturn(true);
    Mockito.when(comic.isBlockedPagesMarked()).thenReturn(false);

    final boolean result = guard.evaluate(context);

    assertFalse(result);
  }

  @Test
  public void testEvaluate() {
    Mockito.when(comic.getFileDetails()).thenReturn(fileDetails);
    Mockito.when(comic.isFileContentsLoaded()).thenReturn(true);
    Mockito.when(comic.isBlockedPagesMarked()).thenReturn(true);

    final boolean result = guard.evaluate(context);

    assertTrue(result);
  }
}

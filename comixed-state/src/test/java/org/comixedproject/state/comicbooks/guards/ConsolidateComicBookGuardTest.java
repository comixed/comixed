/*
 * ComiXed - A digital comicBook book library management application.
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

import static junit.framework.TestCase.assertTrue;
import static org.comixedproject.state.comicbooks.ComicStateHandler.*;
import static org.junit.Assert.assertFalse;

import java.io.File;
import org.comixedproject.adaptors.comicbooks.ComicFileAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
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
public class ConsolidateComicBookGuardTest {
  private static final String TEST_TARGET_DIRECTORY = "/Users/comixed/Documents/old";
  private static final String TEST_RENAMING_RULE = "The renaming rule";
  private static final String TEST_OLD_FILENAME = "The old filename";
  private static final String TEST_NEW_FILENAME = "The new filename";

  @InjectMocks private ConsolidateComicGuard guard;
  @Mock private StateContext<ComicState, ComicEvent> context;
  @Mock private MessageHeaders messageHeaders;
  @Mock private ComicBook comicBook;
  @Mock private ComicDetail comicDetail;
  @Mock private ComicFileAdaptor comicFileAdaptor;

  @Before
  public void setUp() {
    Mockito.when(context.getMessageHeaders()).thenReturn(messageHeaders);
    Mockito.when(messageHeaders.get(HEADER_COMIC, ComicBook.class)).thenReturn(comicBook);
    Mockito.when(messageHeaders.get(HEADER_TARGET_DIRECTORY, String.class))
        .thenReturn(TEST_TARGET_DIRECTORY);
    Mockito.when(messageHeaders.get(HEADER_RENAMING_RULE, String.class))
        .thenReturn(TEST_RENAMING_RULE);
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(comicDetail.getFile())
        .thenReturn(new File(TEST_TARGET_DIRECTORY, TEST_OLD_FILENAME));
  }

  @Test
  public void testEvaluate() {
    Mockito.when(
            comicFileAdaptor.createFilenameFromRule(
                Mockito.any(ComicBook.class), Mockito.anyString()))
        .thenReturn(TEST_NEW_FILENAME);

    final boolean result = guard.evaluate(context);

    assertTrue(result);

    Mockito.verify(comicFileAdaptor, Mockito.times(1))
        .createFilenameFromRule(comicBook, TEST_RENAMING_RULE);
  }

  @Test
  public void testEvaluateNotChanged() {
    Mockito.when(
            comicFileAdaptor.createFilenameFromRule(
                Mockito.any(ComicBook.class), Mockito.anyString()))
        .thenReturn(TEST_OLD_FILENAME);

    final boolean result = guard.evaluate(context);

    assertFalse(result);

    Mockito.verify(comicFileAdaptor, Mockito.times(1))
        .createFilenameFromRule(comicBook, TEST_RENAMING_RULE);
  }
}

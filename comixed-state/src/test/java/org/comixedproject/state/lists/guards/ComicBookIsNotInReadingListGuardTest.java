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

package org.comixedproject.state.lists.guards;

import static org.comixedproject.state.comicbooks.ComicStateHandler.HEADER_COMIC;
import static org.comixedproject.state.lists.ReadingListStateHandler.HEADER_READING_LIST;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.util.HashSet;
import java.util.Set;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.model.lists.ReadingListState;
import org.comixedproject.state.lists.ReadingListEvent;
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
public class ComicBookIsNotInReadingListGuardTest {
  @InjectMocks private ComicIsNotInReadingListGuard guard;
  @Mock private StateContext<ReadingListState, ReadingListEvent> context;
  @Mock private MessageHeaders messageHeaders;
  @Mock private ReadingList readingList;
  @Mock private ComicBook comicBook;

  private Set<ReadingList> readingLists = new HashSet<>();

  @Before
  public void setUp() {
    Mockito.when(context.getMessageHeaders()).thenReturn(messageHeaders);
    Mockito.when(messageHeaders.get(HEADER_READING_LIST, ReadingList.class))
        .thenReturn(readingList);
    Mockito.when(messageHeaders.get(HEADER_COMIC, ComicBook.class)).thenReturn(comicBook);
    Mockito.when(comicBook.getReadingLists()).thenReturn(readingLists);
  }

  @Test
  public void testEvaluateComicInList() {
    readingLists.add(readingList);

    final boolean result = guard.evaluate(context);

    assertFalse(result);
  }

  @Test
  public void testEvaluate() {
    final boolean result = guard.evaluate(context);

    assertTrue(result);
  }
}

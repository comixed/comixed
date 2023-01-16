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

import static junit.framework.TestCase.assertFalse;
import static junit.framework.TestCase.assertTrue;
import static org.comixedproject.state.comicbooks.ComicStateHandler.HEADER_COMIC;
import static org.comixedproject.state.lists.ReadingListStateHandler.HEADER_READING_LIST;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
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
public class ComicBookIsInReadingListGuardTest {
  @InjectMocks private ComicIsInReadingListGuard guard;
  @Mock private StateContext<ReadingListState, ReadingListEvent> context;
  @Mock private MessageHeaders messageHeaders;
  @Mock private ReadingList readingList;
  @Mock private ComicBook comicBook;
  @Mock private ComicDetail comicDetail;

  private List<ComicDetail> comicDetailList = new ArrayList<>();

  @Before
  public void setUp() {
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(context.getMessageHeaders()).thenReturn(messageHeaders);
    Mockito.when(messageHeaders.get(HEADER_READING_LIST, ReadingList.class))
        .thenReturn(readingList);
    Mockito.when(messageHeaders.get(HEADER_COMIC, ComicBook.class)).thenReturn(comicBook);
    Mockito.when(readingList.getEntries()).thenReturn(comicDetailList);
  }

  @Test
  public void testEvaluateComicNotInList() {
    comicDetailList.clear();

    final boolean result = guard.evaluate(context);

    assertFalse(result);
  }

  @Test
  public void testEvaluateComicInList() {
    comicDetailList.add(comicDetail);

    final boolean result = guard.evaluate(context);

    assertTrue(result);
  }
}

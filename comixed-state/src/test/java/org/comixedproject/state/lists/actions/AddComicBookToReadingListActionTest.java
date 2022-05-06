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

package org.comixedproject.state.lists.actions;

import static org.comixedproject.state.comicbooks.ComicStateHandler.HEADER_COMIC;
import static org.comixedproject.state.lists.ReadingListStateHandler.HEADER_READING_LIST;

import java.util.List;
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
public class AddComicBookToReadingListActionTest {
  @InjectMocks private AddComicToReadingListAction action;
  @Mock private StateContext<ReadingListState, ReadingListEvent> context;
  @Mock private MessageHeaders messageHeaders;
  @Mock private ReadingList readingList;
  @Mock private ComicBook comicBook;
  @Mock private List<ComicBook> readingListEntries;

  @Before
  public void setUp() {
    Mockito.when(context.getMessageHeaders()).thenReturn(messageHeaders);
    Mockito.when(messageHeaders.get(HEADER_READING_LIST, ReadingList.class))
        .thenReturn(readingList);
    Mockito.when(messageHeaders.get(HEADER_COMIC, ComicBook.class)).thenReturn(comicBook);
    Mockito.when(readingList.getComicBooks()).thenReturn(readingListEntries);
  }

  @Test
  public void testExecute() {
    action.execute(context);

    Mockito.verify(readingListEntries, Mockito.times(1)).add(comicBook);
  }
}

/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.model.lists.ReadingListState;
import org.comixedproject.state.lists.ReadingListEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.MessageHeaders;
import org.springframework.statemachine.StateContext;

@ExtendWith(MockitoExtension.class)
class ComicIsInReadingListGuardTest {
  private static final Long TEST_COMIC_ID = 717L;

  @InjectMocks private ComicIsInReadingListGuard guard;
  @Mock private StateContext<ReadingListState, ReadingListEvent> context;
  @Mock private MessageHeaders messageHeaders;
  @Mock private ReadingList readingList;
  @Mock private ComicBook comicBook;

  private List<Long> entryIdList = new ArrayList<>();

  @BeforeEach
  void setUp() {
    Mockito.when(comicBook.getComicBookId()).thenReturn(TEST_COMIC_ID);
    Mockito.when(context.getMessageHeaders()).thenReturn(messageHeaders);
    Mockito.when(messageHeaders.get(HEADER_READING_LIST, ReadingList.class))
        .thenReturn(readingList);
    Mockito.when(messageHeaders.get(HEADER_COMIC, ComicBook.class)).thenReturn(comicBook);
    Mockito.when(readingList.getEntryIds()).thenReturn(entryIdList);
  }

  @Test
  void evaluate_comicNotInList() {
    entryIdList.clear();

    final boolean result = guard.evaluate(context);

    assertFalse(result);
  }

  @Test
  void evaluate_comicInList() {
    entryIdList.add(TEST_COMIC_ID);

    final boolean result = guard.evaluate(context);

    assertTrue(result);
  }
}

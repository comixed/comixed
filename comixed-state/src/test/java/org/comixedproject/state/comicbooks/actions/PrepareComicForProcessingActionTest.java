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

package org.comixedproject.state.comicbooks.actions;

import java.util.List;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.state.comicbooks.ComicEvent;
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
class PrepareComicForProcessingActionTest {
  @InjectMocks private PrepareComicForProcessingAction action;
  @Mock private StateContext<ComicState, ComicEvent> context;
  @Mock private MessageHeaders messageHeaders;
  @Mock private ComicBook comicBook;
  @Mock private List<ComicPage> pageList;

  @BeforeEach
  void setUp() {
    Mockito.when(context.getMessageHeaders()).thenReturn(messageHeaders);
    Mockito.when(messageHeaders.get(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(comicBook);
  }

  @Test
  void execute() {
    Mockito.when(comicBook.getPages()).thenReturn(pageList);

    action.execute(context);

    Mockito.verify(pageList, Mockito.times(1)).clear();
    Mockito.verify(comicBook, Mockito.times(1)).setFileContentsLoaded(false);
  }
}

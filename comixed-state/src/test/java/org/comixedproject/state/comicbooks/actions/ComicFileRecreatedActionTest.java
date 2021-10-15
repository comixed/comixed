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

package org.comixedproject.state.comicbooks.actions;

import java.util.List;
import java.util.Set;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicFileEntry;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.comicpages.Page;
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
public class ComicFileRecreatedActionTest {
  @InjectMocks private ComicFileRecreatedAction action;
  @Mock private StateContext<ComicState, ComicEvent> context;
  @Mock private MessageHeaders messageHeaders;
  @Mock private Comic comic;
  @Mock private Set<ComicFileEntry> fileEntrySet;
  @Mock private List<Page> pageList;

  @Before
  public void setUp() {
    Mockito.when(context.getMessageHeaders()).thenReturn(messageHeaders);
    Mockito.when(messageHeaders.get(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(comic);
  }

  @Test
  public void testExecute() {
    Mockito.when(comic.getFileEntries()).thenReturn(fileEntrySet);
    Mockito.when(comic.getPages()).thenReturn(pageList);

    action.execute(context);

    Mockito.verify(comic, Mockito.times(1)).setRecreating(false);
    Mockito.verify(comic, Mockito.times(1)).setFileDetails(null);
    Mockito.verify(fileEntrySet, Mockito.times(1)).clear();
    Mockito.verify(pageList, Mockito.times(1)).clear();
    Mockito.verify(comic, Mockito.times(1)).setFileContentsLoaded(false);
    Mockito.verify(comic, Mockito.times(1)).setBlockedPagesMarked(false);
  }
}

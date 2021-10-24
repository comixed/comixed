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

import static org.comixedproject.state.comicbooks.ComicStateHandler.HEADER_COMIC;
import static org.comixedproject.state.comicbooks.ComicStateHandler.HEADER_USER;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.library.LastRead;
import org.comixedproject.model.user.ComiXedUser;
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
public class ComicAlreadyReadByUserGuardTest {
  @InjectMocks private ComicAlreadyReadByUserGuard guard;
  @Mock private StateContext<ComicState, ComicEvent> context;
  @Mock private MessageHeaders messageHeaders;
  @Mock private Comic comic;
  @Mock private ComiXedUser user;
  @Mock private LastRead lastRead;

  private List<LastRead> lastReadList = new ArrayList<>();

  @Before
  public void setUp() {
    Mockito.when(context.getMessageHeaders()).thenReturn(messageHeaders);
    Mockito.when(messageHeaders.get(HEADER_COMIC, Comic.class)).thenReturn(comic);
    Mockito.when(messageHeaders.get(HEADER_USER, ComiXedUser.class)).thenReturn(user);
    Mockito.when(comic.getLastReads()).thenReturn(lastReadList);
    Mockito.when(lastRead.getUser()).thenReturn(user);
  }

  @Test
  public void testEvaluateNotAlreadyRead() {
    final boolean result = guard.evaluate(context);

    assertFalse(result);
  }

  @Test
  public void testEvaluate() {
    lastReadList.add(lastRead);

    final boolean result = guard.evaluate(context);

    assertTrue(result);
  }
}

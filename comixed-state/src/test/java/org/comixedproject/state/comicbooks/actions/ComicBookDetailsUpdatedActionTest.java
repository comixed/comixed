package org.comixedproject.state.comicbooks.actions;

import static org.junit.Assert.*;

import org.comixedproject.model.comicbooks.ComicBook;
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
public class ComicBookDetailsUpdatedActionTest {
  @InjectMocks private ComicBookDetailsUpdatedAction action;
  @Mock private StateContext<ComicState, ComicEvent> context;
  @Mock private MessageHeaders messageHeaders;
  @Mock private ComicBook comicBook;

  @Before
  public void setUp() {
    Mockito.when(context.getMessageHeaders()).thenReturn(messageHeaders);
    Mockito.when(messageHeaders.get(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(comicBook);
  }

  @Test
  public void testExecute() {
    action.execute(context);

    Mockito.verify(comicBook, Mockito.times(1)).setEditDetails(false);
  }
}

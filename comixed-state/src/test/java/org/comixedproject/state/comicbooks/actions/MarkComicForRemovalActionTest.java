package org.comixedproject.state.comicbooks.actions;

import static junit.framework.TestCase.assertNotNull;

import java.util.Date;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.messaging.MessageHeaders;
import org.springframework.statemachine.StateContext;

@RunWith(MockitoJUnitRunner.class)
public class MarkComicForRemovalActionTest {
  @InjectMocks private MarkComicForRemovalAction action;
  @Mock private StateContext<ComicState, ComicEvent> context;
  @Mock private MessageHeaders messageHeaders;
  @Mock private Comic comic;

  @Captor private ArgumentCaptor<Date> deletedDateCaptor;

  @Before
  public void setUp() {
    Mockito.when(context.getMessageHeaders()).thenReturn(messageHeaders);
    Mockito.when(messageHeaders.get(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(comic);
  }

  @Test
  public void testExecute() {
    Mockito.doNothing().when(comic).setDateDeleted(deletedDateCaptor.capture());

    action.execute(context);

    assertNotNull(deletedDateCaptor.getValue());

    Mockito.verify(comic, Mockito.times(1)).setDateDeleted(deletedDateCaptor.getValue());
  }
}

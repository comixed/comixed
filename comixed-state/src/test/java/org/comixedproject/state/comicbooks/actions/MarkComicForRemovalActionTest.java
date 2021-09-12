package org.comixedproject.state.comicbooks.actions;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;
import static org.comixedproject.state.comicbooks.ComicStateHandler.HEADER_COMIC;

import java.util.Date;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.lists.ReadingListEvent;
import org.comixedproject.state.lists.ReadingListStateHandler;
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
  @Mock private ReadingList readingList;
  @Mock private ReadingListStateHandler readingListStateHandler;

  @Captor private ArgumentCaptor<Date> deletedDateCaptor;
  @Captor private ArgumentCaptor<Map<String, ?>> headersArgumentCaptor;

  private Set<ReadingList> readingLists = new HashSet<>();

  @Before
  public void setUp() {
    Mockito.when(context.getMessageHeaders()).thenReturn(messageHeaders);
    Mockito.when(messageHeaders.get(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(comic);
    Mockito.when(comic.getReadingLists()).thenReturn(readingLists);
    readingLists.add(readingList);
  }

  @Test
  public void testExecute() {
    Mockito.doNothing().when(comic).setDateDeleted(deletedDateCaptor.capture());
    Mockito.doNothing()
        .when(readingListStateHandler)
        .fireEvent(
            Mockito.any(ReadingList.class),
            Mockito.any(ReadingListEvent.class),
            headersArgumentCaptor.capture());

    action.execute(context);

    final Map<String, ?> headers = headersArgumentCaptor.getAllValues().get(0);
    assertSame(comic, headers.get(HEADER_COMIC));

    assertNotNull(deletedDateCaptor.getValue());

    Mockito.verify(comic, Mockito.times(1)).setDateDeleted(deletedDateCaptor.getValue());
    readingLists.forEach(
        readingList ->
            Mockito.verify(readingListStateHandler, Mockito.times(1))
                .fireEvent(readingList, ReadingListEvent.comicRemoved, headers));
  }
}

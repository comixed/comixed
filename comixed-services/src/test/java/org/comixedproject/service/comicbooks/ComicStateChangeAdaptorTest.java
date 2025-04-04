package org.comixedproject.service.comicbooks;

import java.util.Date;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.comicbooks.PublishComicBookRemovalAction;
import org.comixedproject.messaging.comicbooks.PublishComicBookUpdateAction;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHeaders;
import org.springframework.statemachine.state.State;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ComicStateChangeAdaptorTest {
  private static final ComicState TEST_STATE = ComicState.CHANGED;

  @InjectMocks private ComicStateChangeAdaptor adaptor;
  @Mock private ComicStateHandler comicStateHandler;
  @Mock private ComicBookService comicBookService;
  @Mock private PublishComicBookUpdateAction comicUpdatePublishAction;
  @Mock private PublishComicBookRemovalAction comicRemovalPublishAction;
  @Mock private State<ComicState, ComicEvent> state;
  @Mock private Message<ComicEvent> message;
  @Mock private MessageHeaders messageHeaders;
  @Mock private ComicBook comicBook;
  @Mock private ComicBook comicBookRecord;
  @Mock private ComicDetail comicDetail;

  @BeforeEach
  public void setUp() {
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
  }

  @Test
  void afterPropertiesSet() throws Exception {
    adaptor.afterPropertiesSet();

    Mockito.verify(comicStateHandler, Mockito.times(1)).addListener(adaptor);
  }

  @Test
  void onComicStateChange_purgeEvent() throws PublishingException {
    Mockito.when(message.getHeaders()).thenReturn(messageHeaders);
    Mockito.when(messageHeaders.get(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(comicBook);
    Mockito.when(state.getId()).thenReturn(ComicState.REMOVED);

    adaptor.onComicStateChange(state, message);

    Mockito.verify(comicRemovalPublishAction, Mockito.times(1)).publish(comicBook);
  }

  @Test
  void onComicStateChange_purgeEventPublishingException() throws PublishingException {
    Mockito.when(message.getHeaders()).thenReturn(messageHeaders);
    Mockito.when(messageHeaders.get(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(comicBook);
    Mockito.when(state.getId()).thenReturn(ComicState.REMOVED);
    Mockito.doThrow(PublishingException.class)
        .when(comicRemovalPublishAction)
        .publish(Mockito.any(ComicBook.class));

    adaptor.onComicStateChange(state, message);

    Mockito.verify(comicRemovalPublishAction, Mockito.times(1)).publish(comicBook);
  }

  @Test
  void onComicStateChange() throws PublishingException {
    Mockito.when(message.getHeaders()).thenReturn(messageHeaders);
    Mockito.when(messageHeaders.get(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(comicBook);
    Mockito.when(state.getId()).thenReturn(TEST_STATE);
    Mockito.when(comicBookService.save(Mockito.any(ComicBook.class))).thenReturn(comicBookRecord);

    adaptor.onComicStateChange(state, message);

    Mockito.verify(comicDetail, Mockito.times(1)).setComicState(TEST_STATE);
    Mockito.verify(comicBook, Mockito.times(1)).setLastModifiedOn(Mockito.any(Date.class));
    Mockito.verify(comicBookService, Mockito.times(1)).save(comicBook);
    Mockito.verify(comicUpdatePublishAction, Mockito.times(1)).publish(comicBookRecord);
  }

  @Test
  void onComicStateChange_publishingError() throws PublishingException {
    Mockito.when(message.getHeaders()).thenReturn(messageHeaders);
    Mockito.when(messageHeaders.get(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(comicBook);
    Mockito.when(state.getId()).thenReturn(TEST_STATE);
    Mockito.when(comicBookService.save(Mockito.any(ComicBook.class))).thenReturn(comicBookRecord);
    Mockito.doThrow(PublishingException.class)
        .when(comicUpdatePublishAction)
        .publish(Mockito.any(ComicBook.class));

    adaptor.onComicStateChange(state, message);

    Mockito.verify(comicDetail, Mockito.times(1)).setComicState(TEST_STATE);
    Mockito.verify(comicBook, Mockito.times(1)).setLastModifiedOn(Mockito.any(Date.class));
    Mockito.verify(comicBookService, Mockito.times(1)).save(comicBook);
    Mockito.verify(comicUpdatePublishAction, Mockito.times(1)).publish(comicBookRecord);
  }
}

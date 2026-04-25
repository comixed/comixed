package org.comixedproject.service.comicbooks;

import static junit.framework.TestCase.assertNotNull;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.comicbooks.PublishComicBookRemovalAction;
import org.comixedproject.messaging.comicbooks.PublishComicBookUpdateAction;
import org.comixedproject.model.comicbooks.*;
import org.comixedproject.model.library.DisplayableComic;
import org.comixedproject.service.library.DisplayableComicService;
import org.comixedproject.state.comicbooks.ComicBookStateAdaptor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ComicStateChangeAdaptorTest {
  private static final ComicState TEST_STATE = ComicState.CHANGED;

  @InjectMocks private ComicStateChangeAdaptor adaptor;
  @Mock private ComicBookStateAdaptor comicBookStateAdaptor;
  @Mock private ComicBookService comicBookService;
  @Mock private DisplayableComicService displayableComicService;
  @Mock private PublishComicBookUpdateAction comicUpdatePublishAction;
  @Mock private PublishComicBookRemovalAction comicRemovalPublishAction;
  @Mock private ComicBook comicBook;
  @Mock private ComicBook comicBookRecord;
  @Mock private ComicDetail comicDetail;
  @Mock private DisplayableComic displayableComicBook;

  @Captor private ArgumentCaptor<ComicBookData> comicBookDataArgumentCaptor;

  private Set<ComicTag> comicTagList = new HashSet<>();

  @BeforeEach
  void setUp() {
    Mockito.when(comicDetail.getTags()).thenReturn(comicTagList);
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(comicBookRecord.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(displayableComicService.getForComicBookId(Mockito.anyLong()))
        .thenReturn(displayableComicBook);
  }

  @Test
  void afterPropertiesSet() throws Exception {
    adaptor.afterPropertiesSet();

    Mockito.verify(comicBookStateAdaptor, Mockito.times(1)).addListener(adaptor);
  }

  @Test
  void onComicStateChange_purgeEvent() throws PublishingException {
    Mockito.when(comicBook.getState()).thenReturn(ComicState.REMOVED);

    adaptor.onComicStateChanged(comicBook);

    Mockito.verify(comicRemovalPublishAction, Mockito.times(1)).publish(comicBook);
  }

  @Test
  void onComicStateChange_purgeEventPublishingException() throws PublishingException {
    Mockito.when(comicBook.getState()).thenReturn(ComicState.REMOVED);
    Mockito.doThrow(PublishingException.class)
        .when(comicRemovalPublishAction)
        .publish(Mockito.any(ComicBook.class));
    Mockito.doNothing()
        .when(comicUpdatePublishAction)
        .publish(comicBookDataArgumentCaptor.capture());

    adaptor.onComicStateChanged(comicBook);

    Mockito.verify(comicRemovalPublishAction, Mockito.times(1)).publish(comicBook);
  }

  @Test
  void onComicStateChange() throws PublishingException {
    Mockito.when(comicBook.getState()).thenReturn(TEST_STATE);
    Mockito.when(comicBookService.save(Mockito.any(ComicBook.class))).thenReturn(comicBookRecord);
    Mockito.doNothing()
        .when(comicUpdatePublishAction)
        .publish(comicBookDataArgumentCaptor.capture());

    adaptor.onComicStateChanged(comicBook);

    final ComicBookData comicBookData = comicBookDataArgumentCaptor.getValue();
    assertNotNull(comicBookData);

    Mockito.verify(comicBook, Mockito.times(1)).setLastModifiedOn(Mockito.any(Date.class));
    Mockito.verify(comicBookService, Mockito.times(1)).save(comicBook);
    Mockito.verify(comicUpdatePublishAction, Mockito.times(1)).publish(comicBookData);
  }

  @Test
  void onComicStateChange_publishingError() throws PublishingException {
    Mockito.when(comicBook.getState()).thenReturn(TEST_STATE);
    Mockito.when(comicBookService.save(Mockito.any(ComicBook.class))).thenReturn(comicBookRecord);
    Mockito.doThrow(PublishingException.class)
        .when(comicUpdatePublishAction)
        .publish(comicBookDataArgumentCaptor.capture());

    adaptor.onComicStateChanged(comicBook);

    final ComicBookData comicBookData = comicBookDataArgumentCaptor.getValue();
    assertNotNull(comicBookData);

    Mockito.verify(comicBook, Mockito.times(1)).setLastModifiedOn(Mockito.any(Date.class));
    Mockito.verify(comicBookService, Mockito.times(1)).save(comicBook);
    Mockito.verify(comicUpdatePublishAction, Mockito.times(1)).publish(comicBookData);
  }
}

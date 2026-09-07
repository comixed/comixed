package org.comixedproject.service.comicbooks;

import static junit.framework.TestCase.assertNotNull;
import static org.mockito.Mockito.*;

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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ComicStateChangeAdaptorTest {
  private static final ComicState TEST_STATE = ComicState.CHANGED;
  private static final long TEST_COMIC_BOOK_ID = 710129L;

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

  @Test
  void afterPropertiesSet() throws Exception {
    adaptor.afterPropertiesSet();

    verify(comicBookStateAdaptor).addListener(adaptor);
  }

  @Test
  void onComicStateChange_comicDeleted() throws PublishingException, ComicBookException {
    when(comicBook.getState()).thenReturn(ComicState.REMOVED);
    when(comicBook.getComicBookId()).thenReturn(TEST_COMIC_BOOK_ID);
    when(displayableComicService.getForComicBookId(anyLong())).thenReturn(displayableComicBook);

    adaptor.onComicStateChanged(comicBook);

    verify(displayableComicService).getForComicBookId(TEST_COMIC_BOOK_ID);
    verify(comicRemovalPublishAction).publish(displayableComicBook);
  }

  @Test
  void onComicStateChange_comicDeleted_publishingException()
      throws PublishingException, ComicBookException {
    when(comicBook.getState()).thenReturn(ComicState.REMOVED);
    when(comicBook.getComicBookId()).thenReturn(TEST_COMIC_BOOK_ID);
    when(displayableComicService.getForComicBookId(anyLong())).thenReturn(displayableComicBook);
    doThrow(PublishingException.class)
        .when(comicRemovalPublishAction)
        .publish(any(DisplayableComic.class));

    adaptor.onComicStateChanged(comicBook);

    verify(displayableComicService).getForComicBookId(TEST_COMIC_BOOK_ID);
    verify(comicRemovalPublishAction).publish(displayableComicBook);
  }

  @Test
  void onComicStateChange() throws PublishingException {
    when(comicBook.getState()).thenReturn(TEST_STATE);
    when(comicBookService.save(any(ComicBook.class))).thenReturn(comicBookRecord);
    when(comicBookRecord.getComicDetail()).thenReturn(comicDetail);
    when(comicDetail.getTags()).thenReturn(comicTagList);
    doNothing().when(comicUpdatePublishAction).publish(comicBookDataArgumentCaptor.capture());

    adaptor.onComicStateChanged(comicBook);

    final ComicBookData comicBookData = comicBookDataArgumentCaptor.getValue();
    assertNotNull(comicBookData);

    verify(comicBook).setLastModifiedOn(any(Date.class));
    verify(comicBookService).save(comicBook);
    verify(comicUpdatePublishAction).publish(comicBookData);
  }

  @Test
  void onComicStateChange_publishingError() throws PublishingException {
    when(comicBook.getState()).thenReturn(TEST_STATE);
    when(comicBookService.save(any(ComicBook.class))).thenReturn(comicBookRecord);
    when(comicBookRecord.getComicDetail()).thenReturn(comicDetail);
    when(comicDetail.getTags()).thenReturn(comicTagList);
    doThrow(PublishingException.class)
        .when(comicUpdatePublishAction)
        .publish(comicBookDataArgumentCaptor.capture());

    adaptor.onComicStateChanged(comicBook);

    final ComicBookData comicBookData = comicBookDataArgumentCaptor.getValue();
    assertNotNull(comicBookData);

    verify(comicBook).setLastModifiedOn(any(Date.class));
    verify(comicBookService).save(comicBook);
    verify(comicUpdatePublishAction).publish(comicBookData);
  }
}

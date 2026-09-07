package org.comixedproject.service.comicbooks;

import static junit.framework.TestCase.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.*;

import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.comicbooks.PublishComicBookRemovalAction;
import org.comixedproject.messaging.comicbooks.PublishComicBookUpdateAction;
import org.comixedproject.model.comicbooks.*;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.library.DisplayableComic;
import org.comixedproject.service.library.DisplayableComicService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ComicStateChangeAdaptorTest {
  private static final ComicState TEST_STATE = ComicState.CHANGED;
  private static final long TEST_COMIC_BOOK_ID = 710129L;

  @InjectMocks private ComicStateChangeAdaptor adaptor;
  @Mock private org.comixedproject.state.comicbooks.ComicStateAdaptor comicStateAdaptor;
  @Mock private ComicBookService comicBookService;
  @Mock private ComicDetailService comicDetailService;
  @Mock private DisplayableComicService displayableComicService;
  @Mock private PublishComicBookUpdateAction comicUpdatePublishAction;
  @Mock private PublishComicBookRemovalAction comicRemovalPublishAction;
  @Mock private ComicBook comicBook;
  @Mock private ComicBook comicBookRecord;
  @Mock private ComicDetail comicDetail;
  @Mock private ComicDetail savedComic;
  @Mock private DisplayableComic displayableComicBook;
  @Mock private ComicMetadataSource comicMetadataSource;
  @Mock private List<ComicPage> pageList;

  @Captor private ArgumentCaptor<ComicBookData> comicBookDataArgumentCaptor;

  private Set<ComicTag> comicTagList = new HashSet<>();

  @Test
  void afterPropertiesSet() throws Exception {
    adaptor.afterPropertiesSet();

    verify(comicStateAdaptor).addListener(adaptor);
  }

  @Test
  void onComicStateChange_comicDeleted() throws PublishingException, ComicBookException {
    when(comicDetail.getState()).thenReturn(ComicState.REMOVED);
    when(comicDetail.getComicId()).thenReturn(TEST_COMIC_BOOK_ID);
    when(displayableComicService.getForComicBookId(anyLong())).thenReturn(displayableComicBook);

    adaptor.onComicStateChanged(comicDetail);

    verify(displayableComicService).getForComicBookId(TEST_COMIC_BOOK_ID);
    verify(comicRemovalPublishAction).publish(displayableComicBook);
  }

  @Test
  void onComicStateChange_comicDeleted_publishingException()
      throws PublishingException, ComicBookException {
    when(comicDetail.getState()).thenReturn(ComicState.REMOVED);
    when(comicDetail.getComicId()).thenReturn(TEST_COMIC_BOOK_ID);
    when(displayableComicService.getForComicBookId(anyLong())).thenReturn(displayableComicBook);
    doThrow(PublishingException.class)
        .when(comicRemovalPublishAction)
        .publish(any(DisplayableComic.class));

    adaptor.onComicStateChanged(comicDetail);

    verify(displayableComicService).getForComicBookId(TEST_COMIC_BOOK_ID);
    verify(comicRemovalPublishAction).publish(displayableComicBook);
  }

  @Test
  void onComicStateChange() throws PublishingException, ComicBookException {
    when(comicDetail.getState()).thenReturn(TEST_STATE);
    when(comicDetailService.save(any(ComicDetail.class))).thenReturn(savedComic);
    when(displayableComicService.getForComicBookId(anyLong())).thenReturn(displayableComicBook);
    when(savedComic.getComicId()).thenReturn(TEST_COMIC_BOOK_ID);
    when(savedComic.getMetadata()).thenReturn(comicMetadataSource);
    when(savedComic.getPages()).thenReturn(pageList);
    when(savedComic.getTags()).thenReturn(comicTagList);
    doNothing().when(comicUpdatePublishAction).publish(comicBookDataArgumentCaptor.capture());

    adaptor.onComicStateChanged(comicDetail);

    final ComicBookData comicBookData = comicBookDataArgumentCaptor.getValue();
    assertNotNull(comicBookData);

    verify(comicDetail).setLastModifiedDate(any(Date.class));
    verify(comicDetailService).save(comicDetail);
    verify(comicUpdatePublishAction).publish(comicBookData);
  }

  @Test
  void onComicStateChange_publishingError() throws PublishingException, ComicBookException {
    when(comicDetail.getState()).thenReturn(TEST_STATE);
    when(comicDetailService.save(any(ComicDetail.class))).thenReturn(savedComic);
    when(displayableComicService.getForComicBookId(anyLong())).thenReturn(displayableComicBook);
    when(savedComic.getComicId()).thenReturn(TEST_COMIC_BOOK_ID);
    when(savedComic.getMetadata()).thenReturn(comicMetadataSource);
    when(savedComic.getPages()).thenReturn(pageList);
    when(savedComic.getTags()).thenReturn(comicTagList);
    doThrow(PublishingException.class)
        .when(comicUpdatePublishAction)
        .publish(comicBookDataArgumentCaptor.capture());

    adaptor.onComicStateChanged(comicDetail);

    final ComicBookData comicBookData = comicBookDataArgumentCaptor.getValue();
    assertNotNull(comicBookData);
    assertSame(displayableComicBook, comicBookData.getDetail());
    assertSame(comicMetadataSource, comicBookData.getMetadata());
    assertSame(pageList, comicBookData.getPages());
    assertEquals(comicTagList.stream().toList(), comicBookData.getTags());

    verify(comicDetail).setLastModifiedDate(any(Date.class));
    verify(comicDetailService).save(comicDetail);
    verify(comicUpdatePublishAction).publish(comicBookData);
  }
}

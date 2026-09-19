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
import org.comixedproject.messaging.comicbooks.PublishComicRemovalAction;
import org.comixedproject.messaging.comicbooks.PublishComicUpdateAction;
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
  private static final long TEST_COMIC_ID = 710129L;

  @InjectMocks private ComicStateChangeAdaptor adaptor;
  @Mock private org.comixedproject.state.comicbooks.ComicStateAdaptor comicStateAdaptor;
  @Mock private ComicService comicService;
  @Mock private DisplayableComicService displayableComicService;
  @Mock private PublishComicUpdateAction comicUpdatePublishAction;
  @Mock private PublishComicRemovalAction comicRemovalPublishAction;
  @Mock private Comic comic;
  @Mock private Comic savedComic;
  @Mock private DisplayableComic displayableComicBook;
  @Mock private ComicMetadataSource comicMetadataSource;
  @Mock private List<ComicPage> pageList;

  @Captor private ArgumentCaptor<ComicDataSet> comicDataArgumentCaptor;

  private Set<ComicTag> comicTagList = new HashSet<>();

  @Test
  void afterPropertiesSet() throws Exception {
    adaptor.afterPropertiesSet();

    verify(comicStateAdaptor).addListener(adaptor);
  }

  @Test
  void onComicStateChange_comicDeleted() throws PublishingException, ComicException {
    when(comic.getState()).thenReturn(ComicState.REMOVED);
    when(comic.getComicId()).thenReturn(TEST_COMIC_ID);
    when(displayableComicService.getForComicBookId(anyLong())).thenReturn(displayableComicBook);

    adaptor.onComicStateChanged(comic);

    verify(displayableComicService).getForComicBookId(TEST_COMIC_ID);
    verify(comicRemovalPublishAction).publish(displayableComicBook);
  }

  @Test
  void onComicStateChange_comicDeleted_publishingException()
      throws PublishingException, ComicException {
    when(comic.getState()).thenReturn(ComicState.REMOVED);
    when(comic.getComicId()).thenReturn(TEST_COMIC_ID);
    when(displayableComicService.getForComicBookId(anyLong())).thenReturn(displayableComicBook);
    doThrow(PublishingException.class)
        .when(comicRemovalPublishAction)
        .publish(any(DisplayableComic.class));

    adaptor.onComicStateChanged(comic);

    verify(displayableComicService).getForComicBookId(TEST_COMIC_ID);
    verify(comicRemovalPublishAction).publish(displayableComicBook);
  }

  @Test
  void onComicStateChange() throws PublishingException, ComicException {
    when(comic.getState()).thenReturn(TEST_STATE);
    when(comicService.save(any(Comic.class))).thenReturn(savedComic);
    when(displayableComicService.getForComicBookId(anyLong())).thenReturn(displayableComicBook);
    when(savedComic.getComicId()).thenReturn(TEST_COMIC_ID);
    when(savedComic.getMetadata()).thenReturn(comicMetadataSource);
    when(savedComic.getPages()).thenReturn(pageList);
    when(savedComic.getTags()).thenReturn(comicTagList);
    doNothing().when(comicUpdatePublishAction).publish(comicDataArgumentCaptor.capture());

    adaptor.onComicStateChanged(comic);

    final ComicDataSet comicDataSet = comicDataArgumentCaptor.getValue();
    assertNotNull(comicDataSet);

    verify(comic).setLastModifiedDate(any(Date.class));
    verify(comicService).save(comic);
    verify(comicUpdatePublishAction).publish(comicDataSet);
  }

  @Test
  void onComicStateChange_publishingError() throws PublishingException, ComicException {
    when(comic.getState()).thenReturn(TEST_STATE);
    when(comicService.save(any(Comic.class))).thenReturn(savedComic);
    when(displayableComicService.getForComicBookId(anyLong())).thenReturn(displayableComicBook);
    when(savedComic.getComicId()).thenReturn(TEST_COMIC_ID);
    when(savedComic.getMetadata()).thenReturn(comicMetadataSource);
    when(savedComic.getPages()).thenReturn(pageList);
    when(savedComic.getTags()).thenReturn(comicTagList);
    doThrow(PublishingException.class)
        .when(comicUpdatePublishAction)
        .publish(comicDataArgumentCaptor.capture());

    adaptor.onComicStateChanged(comic);

    final ComicDataSet comicDataSet = comicDataArgumentCaptor.getValue();
    assertNotNull(comicDataSet);
    assertSame(displayableComicBook, comicDataSet.getComic());
    assertSame(comicMetadataSource, comicDataSet.getMetadata());
    assertSame(pageList, comicDataSet.getPages());
    assertEquals(comicTagList.stream().toList(), comicDataSet.getTags());

    verify(comic).setLastModifiedDate(any(Date.class));
    verify(comicService).save(comic);
    verify(comicUpdatePublishAction).publish(comicDataSet);
  }
}

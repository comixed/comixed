package org.comixedproject.service.comicpages;

import static org.comixedproject.state.comicpages.ComicPageStateHandler.HEADER_PAGE;

import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.comicpages.ComicPageState;
import org.comixedproject.state.comicpages.ComicPageEvent;
import org.comixedproject.state.comicpages.ComicPageStateHandler;
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
class ComicPageStateChangeAdaptorTest {
  private static final ComicPageState TEST_STATE = ComicPageState.STABLE;

  @InjectMocks private ComicPageStateChangeAdaptor adaptor;
  @Mock private ComicPageService comicPageService;
  @Mock private ComicPageStateHandler comicPageStateHandler;
  @Mock private State<ComicPageState, ComicPageEvent> state;
  @Mock private Message<ComicPageEvent> message;
  @Mock private MessageHeaders messageHeaders;
  @Mock private ComicPage page;
  @Mock private ComicPage savedPage;

  @BeforeEach
  public void setUp() {
    Mockito.when(message.getHeaders()).thenReturn(messageHeaders);
    Mockito.when(messageHeaders.get(HEADER_PAGE, ComicPage.class)).thenReturn(page);
    Mockito.when(state.getId()).thenReturn(TEST_STATE);
  }

  @Test
  void afterPropertiesSet() throws Exception {
    adaptor.afterPropertiesSet();

    Mockito.verify(comicPageStateHandler, Mockito.times(1)).addListener(adaptor);
  }

  @Test
  void onPageStateChange_pageIsNull() throws ComicPageException {
    Mockito.when(messageHeaders.get(HEADER_PAGE, ComicPage.class)).thenReturn(null);

    adaptor.onPageStateChange(state, message);

    Mockito.verify(page, Mockito.never()).setPageState(Mockito.any());
    Mockito.verify(comicPageService, Mockito.never()).save(Mockito.any());
  }

  @Test
  void onPageStateChange_saveThrowsException() throws ComicPageException {
    Mockito.when(comicPageService.save(Mockito.any(ComicPage.class)))
        .thenThrow(ComicPageException.class);

    adaptor.onPageStateChange(state, message);

    Mockito.verify(page, Mockito.times(1)).setPageState(TEST_STATE);
    Mockito.verify(comicPageService, Mockito.times(1)).save(page);
  }

  @Test
  void onPageStateChange() throws ComicPageException {
    Mockito.when(comicPageService.save(Mockito.any(ComicPage.class))).thenReturn(savedPage);

    adaptor.onPageStateChange(state, message);

    Mockito.verify(page, Mockito.times(1)).setPageState(TEST_STATE);
    Mockito.verify(comicPageService, Mockito.times(1)).save(page);
  }
}

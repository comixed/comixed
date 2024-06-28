package org.comixedproject.service.comicpages;

import static org.comixedproject.state.comicpages.ComicPageStateHandler.HEADER_PAGE;

import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.comicpages.ComicPageState;
import org.comixedproject.state.comicpages.ComicPageEvent;
import org.comixedproject.state.comicpages.ComicPageStateHandler;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHeaders;
import org.springframework.statemachine.state.State;

@RunWith(MockitoJUnitRunner.class)
public class ComicPageStateChangeAdaptorTest {
  private static final ComicPageState TEST_STATE = ComicPageState.STABLE;

  @InjectMocks private ComicPageStateChangeAdaptor adaptor;
  @Mock private ComicPageService comicPageService;
  @Mock private ComicPageStateHandler comicPageStateHandler;
  @Mock private State<ComicPageState, ComicPageEvent> state;
  @Mock private Message<ComicPageEvent> message;
  @Mock private MessageHeaders messageHeaders;
  @Mock private ComicPage page;
  @Mock private ComicPage savedPage;

  @Before
  public void setUp() {
    Mockito.when(message.getHeaders()).thenReturn(messageHeaders);
    Mockito.when(messageHeaders.get(HEADER_PAGE, ComicPage.class)).thenReturn(page);
    Mockito.when(state.getId()).thenReturn(TEST_STATE);
  }

  @Test
  public void testAfterPropertiesSet() throws Exception {
    adaptor.afterPropertiesSet();

    Mockito.verify(comicPageStateHandler, Mockito.times(1)).addListener(adaptor);
  }

  @Test
  public void testOnPageStateChangePageIsNull() throws ComicPageException {
    Mockito.when(messageHeaders.get(HEADER_PAGE, ComicPage.class)).thenReturn(null);

    adaptor.onPageStateChange(state, message);

    Mockito.verify(page, Mockito.never()).setPageState(Mockito.any());
    Mockito.verify(comicPageService, Mockito.never()).save(Mockito.any());
  }

  @Test
  public void testOnPageStateChangeSaveThrowsException() throws ComicPageException {
    Mockito.when(comicPageService.save(Mockito.any(ComicPage.class)))
        .thenThrow(ComicPageException.class);

    adaptor.onPageStateChange(state, message);

    Mockito.verify(page, Mockito.times(1)).setPageState(TEST_STATE);
    Mockito.verify(comicPageService, Mockito.times(1)).save(page);
  }

  @Test
  public void testOnPageStateChange() throws ComicPageException {
    Mockito.when(comicPageService.save(Mockito.any(ComicPage.class))).thenReturn(savedPage);

    adaptor.onPageStateChange(state, message);

    Mockito.verify(page, Mockito.times(1)).setPageState(TEST_STATE);
    Mockito.verify(comicPageService, Mockito.times(1)).save(page);
  }
}

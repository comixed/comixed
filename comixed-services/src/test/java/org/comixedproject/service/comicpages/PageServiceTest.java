/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject.service.comicpages;

import static org.comixedproject.state.comicpages.PageStateHandler.HEADER_PAGE;
import static org.junit.Assert.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicpages.Page;
import org.comixedproject.model.comicpages.PageState;
import org.comixedproject.repositories.comicpages.PageRepository;
import org.comixedproject.service.comicbooks.ComicException;
import org.comixedproject.service.comicbooks.ComicService;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.comixedproject.state.comicpages.PageEvent;
import org.comixedproject.state.comicpages.PageStateHandler;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHeaders;
import org.springframework.statemachine.state.State;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class PageServiceTest {
  private static final long TEST_PAGE_ID = 129;
  private static final long TEST_COMIC_ID = 1002L;
  private static final int TEST_PAGE_INDEX = 7;
  private static final String TEST_PAGE_HASH = "1234567890ABCDEF";
  private static final PageState TEST_STATE = PageState.STABLE;

  @InjectMocks private PageService service;
  @Mock private PageRepository pageRepository;
  @Mock private ComicService comicService;
  @Mock private PageStateHandler pageStateHandler;
  @Mock private ComicStateHandler comicStateHandler;
  @Mock private Page page;
  @Mock private Page savedPage;
  @Mock private Page pageRecord;
  @Mock private Comic comic;
  @Mock private State<PageState, PageEvent> state;
  @Mock private Message<PageEvent> message;
  @Mock private MessageHeaders messageHeaders;

  private List<Page> pageList = new ArrayList<>();
  private List<Long> idList = new ArrayList<>();

  @Before
  public void setUp() {
    Mockito.when(message.getHeaders()).thenReturn(messageHeaders);
    Mockito.when(messageHeaders.get(HEADER_PAGE, Page.class)).thenReturn(page);
    Mockito.when(state.getId()).thenReturn(TEST_STATE);
  }

  @Test
  public void testAfterPropertiesSet() throws Exception {
    service.afterPropertiesSet();

    Mockito.verify(pageStateHandler, Mockito.times(1)).addListener(service);
  }

  @Test
  public void testOnPageStateChange() throws PublishingException {
    Mockito.when(pageRepository.save(Mockito.any(Page.class))).thenReturn(savedPage);
    Mockito.when(savedPage.getComic()).thenReturn(comic);

    service.onPageStateChange(state, message);

    Mockito.verify(page, Mockito.times(1)).setPageState(TEST_STATE);
    Mockito.verify(pageRepository, Mockito.times(1)).save(page);
    Mockito.verify(comicStateHandler, Mockito.times(1)).fireEvent(comic, ComicEvent.detailsUpdated);
  }

  @Test
  public void testGetOneForHash() {
    pageList.add(page);

    Mockito.when(pageRepository.findByHash(Mockito.anyString())).thenReturn(pageList);

    final Page result = service.getOneForHash(TEST_PAGE_HASH);

    assertNotNull(result);
    assertSame(page, result);

    Mockito.verify(pageRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
  }

  @Test
  public void testGetOneForHashNoneFound() {
    Mockito.when(pageRepository.findByHash(Mockito.anyString()))
        .thenReturn(Collections.emptyList());

    final Page result = service.getOneForHash(TEST_PAGE_HASH);

    assertNull(result);

    Mockito.verify(pageRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
  }

  @Test(expected = ComicException.class)
  public void testGetPageInComicByIndexForMissingComic() throws ComicException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenThrow(ComicException.class);

    try {
      service.getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX);
    } finally {
      Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    }
  }

  @Test
  public void testGetPageInComicByIndexOutOfBounds() throws ComicException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(comic.getPageCount()).thenReturn(TEST_PAGE_INDEX - 1);

    final Page result = service.getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX);

    assertNull(result);

    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(comic, Mockito.atLeast(1)).getPageCount();
  }

  @Test
  public void testGetImageInComicByIndex() throws ComicException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(comic.getPageCount()).thenReturn(TEST_PAGE_INDEX + 1);
    Mockito.when(comic.getPage(Mockito.anyInt())).thenReturn(page);

    Page result = service.getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX);

    assertNotNull(result);
    assertSame(page, result);

    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(comic, Mockito.atLeast(1)).getPageCount();
    Mockito.verify(comic, Mockito.times(1)).getPage(TEST_PAGE_INDEX);
  }

  @Test(expected = PageException.class)
  public void testGetPageByIdWithInvalidId() throws PageException {
    Mockito.when(pageRepository.findById(Mockito.anyLong())).thenReturn(Optional.empty());

    try {
      service.getForId(TEST_PAGE_ID);
    } finally {
      Mockito.verify(pageRepository, Mockito.times(1)).findById(TEST_PAGE_ID);
    }
  }

  @Test
  public void testGetPageById() throws PageException {
    Mockito.when(pageRepository.findById(Mockito.anyLong())).thenReturn(Optional.of(page));

    final Page result = service.getForId(TEST_PAGE_ID);

    assertNotNull(result);
    assertSame(page, result);

    Mockito.verify(pageRepository, Mockito.times(1)).findById(TEST_PAGE_ID);
  }

  @Test
  public void testSave() throws PageException {
    Mockito.when(page.getId()).thenReturn(TEST_PAGE_ID);
    Mockito.when(pageRepository.findById(Mockito.anyLong())).thenReturn(Optional.of(pageRecord));

    final Page result = service.save(page);

    assertNotNull(result);
    assertSame(pageRecord, result);

    Mockito.verify(pageStateHandler, Mockito.times(1)).fireEvent(page, PageEvent.savePage);
    Mockito.verify(pageRepository, Mockito.times(1)).findById(TEST_PAGE_ID);
  }

  @Test
  public void testGetWithHashForDeletion() {
    Mockito.when(
            pageRepository.findByHashAndPageState(
                Mockito.anyString(), Mockito.any(PageState.class)))
        .thenReturn(pageList);

    final List<Page> result = service.getUnmarkedWithHash(TEST_PAGE_HASH);

    assertNotNull(result);
    assertSame(pageList, result);

    Mockito.verify(pageRepository, Mockito.times(1))
        .findByHashAndPageState(TEST_PAGE_HASH, PageState.STABLE);
  }

  @Test
  public void testGetWithHashMarkedForDeletion() {
    Mockito.when(
            pageRepository.findByHashAndPageState(
                Mockito.anyString(), Mockito.any(PageState.class)))
        .thenReturn(pageList);

    final List<Page> result = service.getMarkedWithHash(TEST_PAGE_HASH);

    assertNotNull(result);
    assertSame(pageList, result);

    Mockito.verify(pageRepository, Mockito.times(1))
        .findByHashAndPageState(TEST_PAGE_HASH, PageState.DELETED);
  }

  @Test
  public void testMarkPagesDeleted() {
    idList.add(TEST_PAGE_ID);

    Mockito.when(pageRepository.getById(Mockito.anyLong())).thenReturn(page);

    service.updatePageDeletion(idList, true);

    Mockito.verify(pageStateHandler, Mockito.times(idList.size()))
        .fireEvent(page, PageEvent.markForDeletion);
  }

  @Test
  public void testMarkPagesUndeleted() {
    idList.add(TEST_PAGE_ID);

    Mockito.when(pageRepository.getById(Mockito.anyLong())).thenReturn(page);

    service.updatePageDeletion(idList, false);

    Mockito.verify(pageStateHandler, Mockito.times(idList.size()))
        .fireEvent(page, PageEvent.unmarkForDeletion);
  }
}

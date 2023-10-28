/*
 * ComiXed - A digital comicBook book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

package org.comixedproject.service.library;

import static junit.framework.TestCase.*;
import static org.comixedproject.state.comicbooks.ComicStateHandler.HEADER_COMIC;
import static org.comixedproject.state.comicbooks.ComicStateHandler.HEADER_USER;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.library.PublishLastReadRemovedAction;
import org.comixedproject.messaging.library.PublishLastReadUpdatedAction;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.library.LastRead;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.library.LastReadRepository;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHeaders;
import org.springframework.statemachine.state.State;

@RunWith(MockitoJUnitRunner.class)
public class LastReadServiceTest {
  private static final String TEST_EMAIL = "reader@domain.org";
  private static final long TEST_THRESHOLD = 717L;
  private static final int TEST_MAXIMUM = 101;
  private static final long TEST_COMIC_ID = 27L;

  @InjectMocks private LastReadService service;
  @Mock private ComicStateHandler comicStateHandler;
  @Mock private LastReadRepository lastReadRepository;
  @Mock private PublishLastReadUpdatedAction publishLastReadUpdatedAction;
  @Mock private PublishLastReadRemovedAction publishLastReadRemovedAction;
  @Mock private UserService userService;
  @Mock private ComicBookService comicBookService;
  @Mock private ComiXedUser user;
  @Mock private List<LastRead> lastReadEntries;
  @Mock private ComicBook comicBook;
  @Mock private ComicDetail comicDetail;
  @Mock private LastRead savedLastReadEntry;
  @Mock private State<ComicState, ComicEvent> state;
  @Mock private Message<ComicEvent> message;
  @Mock private MessageHeaders messageHeaders;

  @Captor private ArgumentCaptor<PageRequest> pageRequestArgumentCaptor;
  @Captor private ArgumentCaptor<LastRead> lastReadArgumentCaptor;

  private List<Long> comicIdList = new ArrayList<>();
  private List<LastRead> lastReadList = new ArrayList<>();

  @Before
  public void setUp() throws ComiXedUserException {
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(message.getHeaders()).thenReturn(messageHeaders);
    Mockito.when(messageHeaders.get(HEADER_COMIC, ComicBook.class)).thenReturn(comicBook);
    Mockito.when(messageHeaders.get(HEADER_USER, ComiXedUser.class)).thenReturn(user);
    Mockito.when(lastReadRepository.save(lastReadArgumentCaptor.capture()))
        .thenReturn(savedLastReadEntry);
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
    comicIdList.add(TEST_COMIC_ID);
  }

  @Test
  public void testAfterPropertiesSet() throws Exception {
    service.afterPropertiesSet();

    Mockito.verify(comicStateHandler, Mockito.times(1)).addListener(service);
  }

  @Test(expected = LastReadException.class)
  public void testGetLastReadEntriesUserException() throws ComiXedUserException, LastReadException {
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      service.getLastReadEntries(TEST_EMAIL, TEST_THRESHOLD, TEST_MAXIMUM);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    }
  }

  @Test
  public void testGetLastReadEntries() throws ComiXedUserException, LastReadException {
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(
            lastReadRepository.loadEntriesForUser(
                Mockito.any(ComiXedUser.class),
                Mockito.anyLong(),
                pageRequestArgumentCaptor.capture()))
        .thenReturn(lastReadEntries);

    final List<LastRead> result =
        service.getLastReadEntries(TEST_EMAIL, TEST_THRESHOLD, TEST_MAXIMUM);

    assertNotNull(result);
    assertSame(lastReadEntries, result);
    assertEquals(0, pageRequestArgumentCaptor.getValue().getPageNumber());
    assertEquals(TEST_MAXIMUM, pageRequestArgumentCaptor.getValue().getPageSize());

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(lastReadRepository, Mockito.times(1))
        .loadEntriesForUser(user, TEST_THRESHOLD, pageRequestArgumentCaptor.getValue());
  }

  @Test
  public void testOnComicStateChangeMarkedAsRead() throws PublishingException {
    Mockito.when(message.getPayload()).thenReturn(ComicEvent.markAsRead);

    service.onComicStateChange(state, message);

    final LastRead record = lastReadArgumentCaptor.getValue();
    assertNotNull(record);
    assertSame(comicDetail, record.getComicDetail());
    assertSame(user, record.getUser());

    Mockito.verify(publishLastReadUpdatedAction, Mockito.times(1)).publish(savedLastReadEntry);
  }

  @Test
  public void testOnComicStateChangeMarkedAsReadPublishingException() throws PublishingException {
    Mockito.when(message.getPayload()).thenReturn(ComicEvent.markAsRead);
    Mockito.doThrow(PublishingException.class)
        .when(publishLastReadUpdatedAction)
        .publish(Mockito.any(LastRead.class));

    service.onComicStateChange(state, message);

    final LastRead record = lastReadArgumentCaptor.getValue();
    assertNotNull(record);
    assertSame(comicDetail, record.getComicDetail());
    assertSame(user, record.getUser());

    Mockito.verify(publishLastReadUpdatedAction, Mockito.times(1)).publish(savedLastReadEntry);
  }

  @Test
  public void testOnComicStateChangeMarkedAsUnread() throws PublishingException {
    Mockito.when(message.getPayload()).thenReturn(ComicEvent.markAsUnread);
    Mockito.when(
            lastReadRepository.loadEntryForComicAndUser(
                Mockito.any(ComicDetail.class), Mockito.any(ComiXedUser.class)))
        .thenReturn(savedLastReadEntry);

    service.onComicStateChange(state, message);

    Mockito.verify(lastReadRepository, Mockito.times(1))
        .loadEntryForComicAndUser(comicDetail, user);
    Mockito.verify(lastReadRepository, Mockito.times(1)).delete(savedLastReadEntry);
    Mockito.verify(publishLastReadRemovedAction, Mockito.times(1)).publish(savedLastReadEntry);
  }

  @Test
  public void testOnComicStateChangeMarkedAsUnreadPublishingError() throws PublishingException {
    Mockito.when(message.getPayload()).thenReturn(ComicEvent.markAsUnread);
    Mockito.when(
            lastReadRepository.loadEntryForComicAndUser(
                Mockito.any(ComicDetail.class), Mockito.any(ComiXedUser.class)))
        .thenReturn(savedLastReadEntry);
    Mockito.doThrow(PublishingException.class)
        .when(publishLastReadRemovedAction)
        .publish(Mockito.any(LastRead.class));

    service.onComicStateChange(state, message);

    Mockito.verify(lastReadRepository, Mockito.times(1))
        .loadEntryForComicAndUser(comicDetail, user);
    Mockito.verify(lastReadRepository, Mockito.times(1)).delete(savedLastReadEntry);
    Mockito.verify(publishLastReadRemovedAction, Mockito.times(1)).publish(savedLastReadEntry);
  }

  @Test(expected = LastReadException.class)
  public void testMarkComicBookAsReadNoSuchUser() throws LastReadException, ComiXedUserException {
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      service.markComicBookAsRead(TEST_EMAIL, TEST_COMIC_ID);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    }
  }

  @Test(expected = LastReadException.class)
  public void testMarkComicBookAsReadNoSuchComicBook()
      throws LastReadException, ComiXedUserException, ComicBookException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenThrow(ComicBookException.class);

    try {
      service.markComicBookAsRead(TEST_EMAIL, TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    }
  }

  @Test
  public void testMarkComicBookAsRead()
      throws ComiXedUserException, ComicBookException, LastReadException {
    service.markComicBookAsRead(TEST_EMAIL, TEST_COMIC_ID);

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
  }

  @Test(expected = LastReadException.class)
  public void testMarkComicBookAsUnreadNoSuchUser() throws LastReadException, ComiXedUserException {
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      service.markComicBookAsUnread(TEST_EMAIL, TEST_COMIC_ID);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    }
  }

  @Test(expected = LastReadException.class)
  public void testMarkComicBookAsUnreadNoSuchComicBook()
      throws LastReadException, ComiXedUserException, ComicBookException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenThrow(ComicBookException.class);

    try {
      service.markComicBookAsUnread(TEST_EMAIL, TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    }
  }

  @Test(expected = LastReadException.class)
  public void testMarkComicBooksAsReadNoSuchUser() throws ComiXedUserException, LastReadException {
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      service.markComicBooksAsRead(TEST_EMAIL, comicIdList);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    }
  }

  @Test
  public void testMarkComicBookAsUnread()
      throws ComiXedUserException, ComicBookException, LastReadException {
    service.markComicBookAsUnread(TEST_EMAIL, TEST_COMIC_ID);

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
  }

  @Test
  public void testMarkComicBooksAsReadNoSuchComic()
      throws ComiXedUserException, LastReadException, ComicBookException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenThrow(ComicBookException.class);

    try {
      service.markComicBooksAsRead(TEST_EMAIL, comicIdList);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
      Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    }
  }

  @Test
  public void testMarkComicBooksAsRead()
      throws ComiXedUserException, LastReadException, ComicBookException {
    Mockito.when(lastReadRepository.loadEntriesForUser(Mockito.any(ComiXedUser.class)))
        .thenReturn(lastReadList);
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);

    service.markComicBooksAsRead(TEST_EMAIL, comicIdList);

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
  }

  @Test
  public void testMarkComicBooksAsUnread() throws ComiXedUserException, LastReadException {
    Mockito.when(lastReadRepository.loadEntriesForUser(Mockito.any(ComiXedUser.class)))
        .thenReturn(lastReadList);

    service.markComicBooksAsUnread(TEST_EMAIL, comicIdList);

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(lastReadRepository, Mockito.times(1)).loadEntriesForUser(user);
  }

  @Test(expected = LastReadException.class)
  public void testMarkComicBooksAsUnreadNoSuchUser()
      throws ComiXedUserException, LastReadException, ComicBookException {
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      service.markComicBooksAsUnread(TEST_EMAIL, comicIdList);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    }
  }
}

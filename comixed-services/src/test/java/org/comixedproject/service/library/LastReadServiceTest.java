/*
 * ComiXed - A digital comic book library management application.
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

import java.util.Date;
import java.util.List;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.library.PublishLastReadRemovedAction;
import org.comixedproject.messaging.library.PublishLastReadUpdateAction;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.library.LastRead;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.library.LastReadRepository;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.data.domain.PageRequest;

@RunWith(MockitoJUnitRunner.class)
public class LastReadServiceTest {
  private static final String TEST_EMAIL = "reader@domain.org";
  private static final long TEST_THRESHOLD = 717L;
  private static final int TEST_MAXIMUM = 101;
  private static final long TEST_COMIC_ID = 27L;

  @InjectMocks private LastReadService service;
  @Mock private LastReadRepository lastReadRepository;
  @Mock private PublishLastReadUpdateAction publishLastReadUpdateAction;
  @Mock private PublishLastReadRemovedAction publishLastReadRemovedAction;
  @Mock private UserService userService;
  @Mock private ComicService comicService;
  @Mock private ComiXedUser user;
  @Mock private List<LastRead> lastReadEntries;
  @Mock private Comic comic;
  @Mock private LastRead savedLastReadEntry;
  @Mock private LastRead lastReadEntry;

  @Captor private ArgumentCaptor<PageRequest> pageRequestArgumentCaptor;
  @Captor private ArgumentCaptor<LastRead> lastReadArgumentCaptor;

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
            lastReadRepository.getEntriesForUser(
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
        .getEntriesForUser(user, TEST_THRESHOLD, pageRequestArgumentCaptor.getValue());
  }

  @Test(expected = LastReadException.class)
  public void testSetLastReadStateAsReadNoSuchUser()
      throws ComiXedUserException, LastReadException {
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      service.setLastReadState(TEST_EMAIL, TEST_COMIC_ID, true);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    }
  }

  @Test(expected = LastReadException.class)
  public void testSetLastReadStateAsReadNoSuchComic()
      throws ComiXedUserException, LastReadException, ComicException {
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenThrow(ComicException.class);

    try {
      service.setLastReadState(TEST_EMAIL, TEST_COMIC_ID, true);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
      Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    }
  }

  @Test
  public void testSetLastReadStateAsReadExistingEntryPublishingException()
      throws ComiXedUserException, LastReadException, ComicException, PublishingException {
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(
            lastReadRepository.findEntryForUserAndComic(
                Mockito.any(ComiXedUser.class), Mockito.any(Comic.class)))
        .thenReturn(lastReadEntry);
    Mockito.when(lastReadRepository.save(Mockito.any(LastRead.class)))
        .thenReturn(savedLastReadEntry);
    Mockito.doThrow(PublishingException.class)
        .when(publishLastReadUpdateAction)
        .publish(Mockito.any(LastRead.class));

    final LastRead result = service.setLastReadState(TEST_EMAIL, TEST_COMIC_ID, true);

    assertNotNull(result);
    assertSame(savedLastReadEntry, result);

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(lastReadRepository, Mockito.times(1)).findEntryForUserAndComic(user, comic);
    Mockito.verify(lastReadEntry, Mockito.times(1)).setLastRead(Mockito.any(Date.class));
    Mockito.verify(lastReadRepository, Mockito.times(1)).save(lastReadEntry);
    Mockito.verify(publishLastReadUpdateAction, Mockito.times(1)).publish(savedLastReadEntry);
  }

  @Test
  public void testSetLastReadStateAsReadExistingEntry()
      throws ComiXedUserException, LastReadException, ComicException, PublishingException {
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(
            lastReadRepository.findEntryForUserAndComic(
                Mockito.any(ComiXedUser.class), Mockito.any(Comic.class)))
        .thenReturn(lastReadEntry);
    Mockito.when(lastReadRepository.save(Mockito.any(LastRead.class)))
        .thenReturn(savedLastReadEntry);

    final LastRead result = service.setLastReadState(TEST_EMAIL, TEST_COMIC_ID, true);

    assertNotNull(result);
    assertSame(savedLastReadEntry, result);

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(lastReadRepository, Mockito.times(1)).findEntryForUserAndComic(user, comic);
    Mockito.verify(lastReadEntry, Mockito.times(1)).setLastRead(Mockito.any(Date.class));
    Mockito.verify(lastReadRepository, Mockito.times(1)).save(lastReadEntry);
    Mockito.verify(publishLastReadUpdateAction, Mockito.times(1)).publish(savedLastReadEntry);
  }

  @Test
  public void testSetLastReadStateAsReadPublishingException()
      throws ComiXedUserException, LastReadException, ComicException, PublishingException {
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(
            lastReadRepository.findEntryForUserAndComic(
                Mockito.any(ComiXedUser.class), Mockito.any(Comic.class)))
        .thenReturn(null);
    Mockito.when(lastReadRepository.save(lastReadArgumentCaptor.capture()))
        .thenReturn(savedLastReadEntry);
    Mockito.doThrow(PublishingException.class)
        .when(publishLastReadUpdateAction)
        .publish(Mockito.any(LastRead.class));

    final LastRead result = service.setLastReadState(TEST_EMAIL, TEST_COMIC_ID, true);

    assertNotNull(result);
    assertSame(savedLastReadEntry, result);

    assertSame(user, lastReadArgumentCaptor.getValue().getUser());
    assertSame(comic, lastReadArgumentCaptor.getValue().getComic());

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(lastReadRepository, Mockito.times(1)).save(lastReadArgumentCaptor.getValue());
    Mockito.verify(publishLastReadUpdateAction, Mockito.times(1)).publish(savedLastReadEntry);
  }

  @Test
  public void testSetLastReadStateAsRead()
      throws ComiXedUserException, LastReadException, ComicException, PublishingException {
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(
            lastReadRepository.findEntryForUserAndComic(
                Mockito.any(ComiXedUser.class), Mockito.any(Comic.class)))
        .thenReturn(null);
    Mockito.when(lastReadRepository.save(lastReadArgumentCaptor.capture()))
        .thenReturn(savedLastReadEntry);

    final LastRead result = service.setLastReadState(TEST_EMAIL, TEST_COMIC_ID, true);

    assertNotNull(result);
    assertSame(savedLastReadEntry, result);

    assertSame(user, lastReadArgumentCaptor.getValue().getUser());
    assertSame(comic, lastReadArgumentCaptor.getValue().getComic());

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(lastReadRepository, Mockito.times(1)).save(lastReadArgumentCaptor.getValue());
    Mockito.verify(publishLastReadUpdateAction, Mockito.times(1)).publish(savedLastReadEntry);
  }

  @Test(expected = LastReadException.class)
  public void testSetLastReadStateAsUnreadNoSuchUser()
      throws ComiXedUserException, LastReadException {
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      service.setLastReadState(TEST_EMAIL, TEST_COMIC_ID, false);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    }
  }

  @Test(expected = LastReadException.class)
  public void testSetLastReadStateAsUnreadNoSuchComic()
      throws ComiXedUserException, LastReadException, ComicException {
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenThrow(ComicException.class);

    try {
      service.setLastReadState(TEST_EMAIL, TEST_COMIC_ID, false);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
      Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    }
  }

  @Test(expected = LastReadException.class)
  public void testSetLastReadStateAsUnreadNoSuchUnreadEntry()
      throws ComiXedUserException, LastReadException, ComicException {
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(
            lastReadRepository.findEntryForUserAndComic(
                Mockito.any(ComiXedUser.class), Mockito.any(Comic.class)))
        .thenReturn(null);

    try {
      service.setLastReadState(TEST_EMAIL, TEST_COMIC_ID, false);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
      Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
      Mockito.verify(lastReadRepository, Mockito.times(1)).findEntryForUserAndComic(user, comic);
    }
  }

  @Test
  public void testSetLastReadStateAsUnreadPublishingException()
      throws ComiXedUserException, LastReadException, ComicException, PublishingException {
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(
            lastReadRepository.findEntryForUserAndComic(
                Mockito.any(ComiXedUser.class), Mockito.any(Comic.class)))
        .thenReturn(lastReadEntry);
    Mockito.doNothing().when(lastReadRepository).delete(Mockito.any());
    Mockito.doThrow(PublishingException.class)
        .when(publishLastReadRemovedAction)
        .publish(Mockito.any(LastRead.class));

    final LastRead result = service.setLastReadState(TEST_EMAIL, TEST_COMIC_ID, false);

    assertNotNull(result);
    assertSame(lastReadEntry, result);

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(lastReadRepository, Mockito.times(1)).findEntryForUserAndComic(user, comic);
    Mockito.verify(lastReadRepository, Mockito.times(1)).delete(lastReadEntry);
    Mockito.verify(publishLastReadRemovedAction, Mockito.times(1)).publish(lastReadEntry);
  }

  @Test
  public void testSetLastReadStateAsUnread()
      throws ComiXedUserException, LastReadException, ComicException, PublishingException {
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(
            lastReadRepository.findEntryForUserAndComic(
                Mockito.any(ComiXedUser.class), Mockito.any(Comic.class)))
        .thenReturn(lastReadEntry);
    Mockito.doNothing().when(lastReadRepository).delete(Mockito.any());

    final LastRead result = service.setLastReadState(TEST_EMAIL, TEST_COMIC_ID, false);

    assertNotNull(result);
    assertSame(lastReadEntry, result);

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(lastReadRepository, Mockito.times(1)).findEntryForUserAndComic(user, comic);
    Mockito.verify(lastReadRepository, Mockito.times(1)).delete(lastReadEntry);
    Mockito.verify(publishLastReadRemovedAction, Mockito.times(1)).publish(lastReadEntry);
  }
}

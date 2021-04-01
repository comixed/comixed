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

package org.comixedproject.service.comic;

import static junit.framework.TestCase.*;

import java.util.Date;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.model.user.LastReadDate;
import org.comixedproject.repositories.library.LastReadDatesRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class LastReadServiceTest {
  @InjectMocks private LastReadService lastReadService;
  @Mock private LastReadDatesRepository lastReadDatesRepository;
  @Mock private Comic comic;
  @Mock private ComiXedUser user;
  @Mock private LastReadDate lastReadDate;
  @Mock private LastReadDate lastReadDateSaved;
  @Mock private Date dateLastRead;

  @Captor private ArgumentCaptor<LastReadDate> lastReadDateArgumentCaptor;

  @Test
  public void testGetLastReadForComicAndUserNotRead() {
    Mockito.when(
            lastReadDatesRepository.getForComicAndUser(
                Mockito.any(Comic.class), Mockito.any(ComiXedUser.class)))
        .thenReturn(null);

    final Date result = lastReadService.getLastReadForComicAndUser(comic, user);

    assertNull(result);

    Mockito.verify(lastReadDatesRepository, Mockito.times(1)).getForComicAndUser(comic, user);
  }

  @Test
  public void testGetLastReadForComicAndUser() {
    Mockito.when(
            lastReadDatesRepository.getForComicAndUser(
                Mockito.any(Comic.class), Mockito.any(ComiXedUser.class)))
        .thenReturn(lastReadDate);
    Mockito.when(lastReadDate.getLastRead()).thenReturn(dateLastRead);

    final Date result = lastReadService.getLastReadForComicAndUser(comic, user);

    assertNotNull(result);
    assertSame(dateLastRead, result);

    Mockito.verify(lastReadDatesRepository, Mockito.times(1)).getForComicAndUser(comic, user);
  }

  @Test
  public void testMarkComicAsReadWhenAlreadyRead() {
    Mockito.when(
            lastReadDatesRepository.getForComicAndUser(
                Mockito.any(Comic.class), Mockito.any(ComiXedUser.class)))
        .thenReturn(lastReadDate);
    Mockito.when(lastReadDatesRepository.save(Mockito.any(LastReadDate.class)))
        .thenReturn(lastReadDateSaved);

    final LastReadDate result = lastReadService.markComicAsRead(comic, user);

    assertNotNull(result);
    assertSame(lastReadDateSaved, result);

    Mockito.verify(lastReadDatesRepository, Mockito.times(1)).getForComicAndUser(comic, user);
    Mockito.verify(lastReadDate, Mockito.times(1)).setLastRead(Mockito.any(Date.class));
    Mockito.verify(lastReadDatesRepository, Mockito.times(1)).save(lastReadDate);
  }

  @Test
  public void testMarkComicAsRead() {
    Mockito.when(
            lastReadDatesRepository.getForComicAndUser(
                Mockito.any(Comic.class), Mockito.any(ComiXedUser.class)))
        .thenReturn(null);
    Mockito.when(lastReadDatesRepository.save(lastReadDateArgumentCaptor.capture()))
        .thenReturn(lastReadDateSaved);

    final LastReadDate result = lastReadService.markComicAsRead(comic, user);

    assertNotNull(result);
    assertSame(lastReadDateSaved, result);

    assertNotNull(lastReadDateArgumentCaptor.getValue());
    assertSame(comic, lastReadDateArgumentCaptor.getValue().getComic());
    assertSame(user, lastReadDateArgumentCaptor.getValue().getUser());
    assertNotNull(lastReadDateArgumentCaptor.getValue().getLastRead());

    Mockito.verify(lastReadDatesRepository, Mockito.times(1)).getForComicAndUser(comic, user);
    Mockito.verify(lastReadDatesRepository, Mockito.times(1))
        .save(lastReadDateArgumentCaptor.getValue());
  }

  @Test
  public void testMarkComicAsUnreadNeverRead() {
    Mockito.when(
            lastReadDatesRepository.getForComicAndUser(
                Mockito.any(Comic.class), Mockito.any(ComiXedUser.class)))
        .thenReturn(null);

    lastReadService.markComicAsUnread(comic, user);

    Mockito.verify(lastReadDatesRepository, Mockito.never()).delete(Mockito.any());
  }

  @Test
  public void testMarkComicAsUnread() {
    Mockito.when(
            lastReadDatesRepository.getForComicAndUser(
                Mockito.any(Comic.class), Mockito.any(ComiXedUser.class)))
        .thenReturn(lastReadDate);

    lastReadService.markComicAsUnread(comic, user);

    Mockito.verify(lastReadDatesRepository, Mockito.times(1)).delete(lastReadDate);
  }
}

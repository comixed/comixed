/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

package org.comixedproject.service.user;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.comixedproject.model.user.ComiXedUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ReadComicsServiceTest {
  private static final String TEST_EMAIL = "reader@comixedproject.org";
  private static final Long TEST_COMIC_ID = 717L;

  @InjectMocks private ReadComicsService service;
  @Mock private UserService userService;
  @Mock private ComiXedUser user;
  @Mock private Set<Long> readComicBookList;

  private List<Long> comicIdList = new ArrayList<>();

  @BeforeEach
  void setUp() throws ComiXedUserException {
    when(user.getReadComicBooks()).thenReturn(readComicBookList);
    when(userService.findByEmail(anyString())).thenReturn(user);
  }

  @Test
  void markComicBookAsRead_noSuchUser() throws ComiXedUserException {
    when(userService.findByEmail(anyString())).thenThrow(ComiXedUserException.class);

    assertThrows(
        ReadComicsException.class, () -> service.markComicBookAsRead(TEST_EMAIL, TEST_COMIC_ID));
  }

  @Test
  void markComicBookAsRead() throws ReadComicsException, ComiXedUserException {
    service.markComicBookAsRead(TEST_EMAIL, TEST_COMIC_ID);

    verify(userService).findByEmail(TEST_EMAIL);
    verify(user).getReadComicBooks();
    verify(readComicBookList).add(TEST_COMIC_ID);
  }

  @Test
  void unmarkComicBookAsRead_noSuchUser() throws ComiXedUserException {
    when(userService.findByEmail(anyString())).thenThrow(ComiXedUserException.class);

    assertThrows(
        ReadComicsException.class, () -> service.unmarkComicBookAsRead(TEST_EMAIL, TEST_COMIC_ID));
  }

  @Test
  void unmarkComicBookAsRead() throws ReadComicsException, ComiXedUserException {
    service.unmarkComicBookAsRead(TEST_EMAIL, TEST_COMIC_ID);

    verify(userService).findByEmail(TEST_EMAIL);
    verify(user).getReadComicBooks();
    verify(readComicBookList).remove(TEST_COMIC_ID);
  }

  @Test
  void markSelectedAsRead() throws ReadComicsException, ComiXedUserException {
    service.markSelectionsAsRead(TEST_EMAIL, comicIdList);

    verify(userService).findByEmail(TEST_EMAIL);
    verify(user).getReadComicBooks();
    verify(readComicBookList).addAll(comicIdList);
  }

  @Test
  void unmarkSelectedAsRead_noSuchUser() throws ComiXedUserException {
    when(userService.findByEmail(anyString())).thenThrow(ComiXedUserException.class);

    assertThrows(
        ReadComicsException.class, () -> service.unmarkSelectionsAsRead(TEST_EMAIL, comicIdList));
  }

  @Test
  void unmarkSelectedAsRead() throws ReadComicsException, ComiXedUserException {
    service.unmarkSelectionsAsRead(TEST_EMAIL, comicIdList);

    verify(userService).findByEmail(TEST_EMAIL);
    verify(user).getReadComicBooks();
    verify(readComicBookList).removeAll(comicIdList);
  }
}

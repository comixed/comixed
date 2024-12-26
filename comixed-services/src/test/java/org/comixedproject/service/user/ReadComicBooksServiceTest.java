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

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.comixedproject.model.user.ComiXedUser;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ReadComicBooksServiceTest {
  private static final String TEST_EMAIL = "reader@comixedproject.org";
  private static final Long TEST_COMIC_BOOK_ID = 717L;

  @InjectMocks private ReadComicBooksService service;
  @Mock private UserService userService;
  @Mock private ComiXedUser user;
  @Mock private Set<Long> readComicBookList;

  private List<Long> comicDetailIdList = new ArrayList<>();

  @Before
  public void setUp() throws ComiXedUserException {
    Mockito.when(user.getReadComicBooks()).thenReturn(readComicBookList);
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
  }

  @Test(expected = ReadComicBooksException.class)
  public void testMarkComicBookAsRead_noSuchUser()
      throws ReadComicBooksException, ComiXedUserException {
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      service.markComicBookAsRead(TEST_EMAIL, TEST_COMIC_BOOK_ID);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    }
  }

  @Test
  public void testMarkComicBookAsRead() throws ReadComicBooksException, ComiXedUserException {
    service.markComicBookAsRead(TEST_EMAIL, TEST_COMIC_BOOK_ID);

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(user, Mockito.times(1)).getReadComicBooks();
    Mockito.verify(readComicBookList, Mockito.times(1)).add(TEST_COMIC_BOOK_ID);
  }

  @Test(expected = ReadComicBooksException.class)
  public void testUnmarkComicBookAsRead_noSuchUser()
      throws ReadComicBooksException, ComiXedUserException {
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      service.unmarkComicBookAsRead(TEST_EMAIL, TEST_COMIC_BOOK_ID);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    }
  }

  @Test
  public void testUnmarkComicBookAsRead() throws ReadComicBooksException, ComiXedUserException {
    service.unmarkComicBookAsRead(TEST_EMAIL, TEST_COMIC_BOOK_ID);

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(user, Mockito.times(1)).getReadComicBooks();
    Mockito.verify(readComicBookList, Mockito.times(1)).remove(TEST_COMIC_BOOK_ID);
  }

  @Test
  public void testMarkSelectedAsRead() throws ReadComicBooksException, ComiXedUserException {
    service.markSelectionsAsRead(TEST_EMAIL, comicDetailIdList);

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(user, Mockito.times(1)).getReadComicBooks();
    Mockito.verify(readComicBookList, Mockito.times(1)).addAll(comicDetailIdList);
  }

  @Test(expected = ReadComicBooksException.class)
  public void testUnmarkSelectedAsRead_noSuchUser()
      throws ReadComicBooksException, ComiXedUserException {
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      service.unmarkSelectionsAsRead(TEST_EMAIL, comicDetailIdList);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    }
  }

  @Test
  public void testUnmarkSelectedAsRead() throws ReadComicBooksException, ComiXedUserException {
    service.unmarkSelectionsAsRead(TEST_EMAIL, comicDetailIdList);

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(user, Mockito.times(1)).getReadComicBooks();
    Mockito.verify(readComicBookList, Mockito.times(1)).removeAll(comicDetailIdList);
  }
}

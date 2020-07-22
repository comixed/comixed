/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

package org.comixedproject.controller.opds;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import java.security.Principal;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.library.ReadingList;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.comic.ComicRepository;
import org.comixedproject.service.library.NoSuchReadingListException;
import org.comixedproject.service.library.ReadingListService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class OPDSControllerTest {
  private static final String TEST_USER_EMAIL = "reader@local";
  private static final Long TEST_ID = 1000L;

  @InjectMocks private OPDSController controller;
  @Mock private Principal principal;
  @Mock private ComiXedUser user;
  @Mock private ComicRepository comicRepository;
  @Mock private SecurityContext securityContext;
  @Mock private Authentication autentication;
  @Mock private ReadingListService readingListService;

  private List<ReadingList> readingLists = new ArrayList<>();
  private List<Comic> comicList = new ArrayList<>();
  private ReadingList readingList = new ReadingList();

  @Test
  public void testGetNavigationFeed() throws ParseException {
    OPDSFeed result = controller.getNavigationFeed();

    assertNotNull(result);
  }

  @Test
  public void testGetAllComics() throws ParseException {
    Mockito.when(comicRepository.findAll()).thenReturn(comicList);

    OPDSFeed result = controller.getAllComics();

    assertNotNull(result);
    assertEquals(comicList, result.getEntries());

    Mockito.verify(comicRepository, Mockito.times(1)).findAll();
  }

  @Test
  public void testGetAllLists() throws ParseException {
    Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
    Mockito.when(
            readingListService.getReadingListsForUser(Mockito.anyString(), Mockito.any(Date.class)))
        .thenReturn(readingLists);

    OPDSFeed result = controller.getAllLists(principal);

    assertNotNull(result);
  }

  @Test
  public void testGetList() throws ParseException, NoSuchReadingListException {
    Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
    Mockito.when(readingListService.getReadingListForUser(TEST_USER_EMAIL, TEST_ID))
        .thenReturn(readingList);

    OPDSFeed result = controller.getList(principal, TEST_ID);

    assertNotNull(result);
  }
}

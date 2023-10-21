/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

package org.comixedproject.service.comicbooks;

import static junit.framework.TestCase.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.comicbooks.PublishComicBookSelectionStateAction;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicSelection;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.users.ComicSelectionRepository;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.data.domain.Example;

@RunWith(MockitoJUnitRunner.class)
public class ComicSelectionServiceTest {
  private static final String TEST_EMAIL = "comixedreader@localhost";
  private static final Long TEST_COMIC_BOOK_ID = 717L;
  private final Set<Long> selectedIdSet = new HashSet<>();
  private final List<ComicDetail> comicDetailList = new ArrayList<>();
  @InjectMocks private ComicSelectionService service;
  @Mock private ComicDetailService comicDetailService;
  @Mock private ComicBookService comicBookService;
  @Mock private UserService userService;
  @Mock private ComicSelectionRepository comicSelectionRepository;
  @Mock private Example<ComicDetail> example;
  @Mock private ComicDetailExampleBuilder exampleBuilder;
  @Mock private ObjectFactory<ComicDetailExampleBuilder> exampleBuilderObjectFactory;
  @Mock private PublishComicBookSelectionStateAction publishComicBookSelectionStateAction;
  @Mock private ComiXedUser user;
  @Mock private ComicBook comicBook;
  @Mock private ComicSelection newComicSelection;
  @Mock private ComicDetail comicDetail;

  @Captor private ArgumentCaptor<ComicSelection> saveSelectionArgumentCaptor;

  @Before
  public void setUp() throws ComiXedUserException, ComicBookException {
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(comicSelectionRepository.save(saveSelectionArgumentCaptor.capture()))
        .thenReturn(newComicSelection);
    Mockito.when(comicSelectionRepository.getAllForUser(Mockito.any(ComiXedUser.class)))
        .thenReturn(selectedIdSet);

    Mockito.when(exampleBuilder.build()).thenReturn(example);
    Mockito.when(exampleBuilderObjectFactory.getObject()).thenReturn(exampleBuilder);

    Mockito.when(comicBook.getId()).thenReturn(TEST_COMIC_BOOK_ID);
    Mockito.when(comicDetail.getComicBook()).thenReturn(comicBook);
    comicDetailList.add(comicDetail);
    Mockito.when(comicDetailService.findAllByExample(Mockito.any(Example.class)))
        .thenReturn(comicDetailList);

    Mockito.when(
            comicSelectionRepository.getIdForUserAndComic(
                Mockito.any(ComiXedUser.class), Mockito.any(ComicBook.class)))
        .thenReturn(TEST_COMIC_BOOK_ID);
  }

  @Test(expected = ComicSelectionException.class)
  public void testAddComicSelectionForInvalidUser()
      throws ComiXedUserException, ComicSelectionException {
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      service.addComicSelectionForUser(TEST_EMAIL, TEST_COMIC_BOOK_ID);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    }
  }

  @Test(expected = ComicSelectionException.class)
  public void testAddComicSelectionForInvalidComicBook()
      throws ComicSelectionException, ComicBookException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenThrow(ComicBookException.class);

    try {
      service.addComicSelectionForUser(TEST_EMAIL, TEST_COMIC_BOOK_ID);
    } finally {
      Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_BOOK_ID);
    }
  }

  @Test
  public void testAddComicSelectionAlreadySelected()
      throws ComicSelectionException, PublishingException {
    Mockito.when(
            comicSelectionRepository.existsForUserAndComicBook(
                Mockito.any(ComiXedUser.class), Mockito.any(ComicBook.class)))
        .thenReturn(true);

    service.addComicSelectionForUser(TEST_EMAIL, TEST_COMIC_BOOK_ID);

    Mockito.verify(comicSelectionRepository, Mockito.never())
        .save(Mockito.any(ComicSelection.class));
    Mockito.verify(publishComicBookSelectionStateAction, Mockito.never()).publish(Mockito.anySet());
  }

  @Test
  public void testAddComicSelection() throws ComicSelectionException, PublishingException {
    Mockito.when(
            comicSelectionRepository.existsForUserAndComicBook(
                Mockito.any(ComiXedUser.class), Mockito.any(ComicBook.class)))
        .thenReturn(false);

    service.addComicSelectionForUser(TEST_EMAIL, TEST_COMIC_BOOK_ID);

    final ComicSelection selection = saveSelectionArgumentCaptor.getValue();
    assertNotNull(selection);
    assertSame(user, selection.getUser());
    assertSame(comicBook, selection.getComicBook());

    Mockito.verify(comicSelectionRepository, Mockito.times(1))
        .existsForUserAndComicBook(user, comicBook);
    Mockito.verify(comicSelectionRepository, Mockito.times(1)).save(selection);
    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(selectedIdSet);
  }

  @Test
  public void testAddComicSelectionPublishingException()
      throws ComicSelectionException, PublishingException {
    Mockito.doThrow(PublishingException.class)
        .when(publishComicBookSelectionStateAction)
        .publish(Mockito.anySet());

    service.addComicSelectionForUser(TEST_EMAIL, TEST_COMIC_BOOK_ID);

    final ComicSelection selection = saveSelectionArgumentCaptor.getValue();
    assertNotNull(selection);
    assertSame(user, selection.getUser());
    assertSame(comicBook, selection.getComicBook());

    Mockito.verify(comicSelectionRepository, Mockito.times(1))
        .existsForUserAndComicBook(user, comicBook);
    Mockito.verify(comicSelectionRepository, Mockito.times(1)).save(selection);
    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(selectedIdSet);
  }

  @Test(expected = ComicSelectionException.class)
  public void testRemoveComicSelectionFromInvalidUser()
      throws ComiXedUserException, ComicSelectionException {
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      service.removeComicSelectionFromUser(TEST_EMAIL, TEST_COMIC_BOOK_ID);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    }
  }

  @Test(expected = ComicSelectionException.class)
  public void testRemoveComicSelectionForInvalidComicBook()
      throws ComicSelectionException, ComicBookException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenThrow(ComicBookException.class);

    try {
      service.removeComicSelectionFromUser(TEST_EMAIL, TEST_COMIC_BOOK_ID);
    } finally {
      Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_BOOK_ID);
    }
  }

  @Test
  public void testRemoveComicSelectionNotSelected()
      throws ComicSelectionException, PublishingException {
    Mockito.when(
            comicSelectionRepository.existsForUserAndComicBook(
                Mockito.any(ComiXedUser.class), Mockito.any(ComicBook.class)))
        .thenReturn(false);

    service.removeComicSelectionFromUser(TEST_EMAIL, TEST_COMIC_BOOK_ID);

    Mockito.verify(comicSelectionRepository, Mockito.times(1))
        .existsForUserAndComicBook(user, comicBook);
    Mockito.verify(comicSelectionRepository, Mockito.never())
        .delete(Mockito.any(ComicSelection.class));
    Mockito.verify(publishComicBookSelectionStateAction, Mockito.never()).publish(Mockito.anySet());
  }

  @Test
  public void testRemoveComicSelection() throws ComicSelectionException, PublishingException {
    Mockito.when(
            comicSelectionRepository.existsForUserAndComicBook(
                Mockito.any(ComiXedUser.class), Mockito.any(ComicBook.class)))
        .thenReturn(true);

    service.removeComicSelectionFromUser(TEST_EMAIL, TEST_COMIC_BOOK_ID);

    Mockito.verify(comicSelectionRepository, Mockito.times(1))
        .existsForUserAndComicBook(user, comicBook);
    Mockito.verify(comicSelectionRepository, Mockito.times(1))
        .getIdForUserAndComic(user, comicBook);
    Mockito.verify(comicSelectionRepository, Mockito.times(1)).deleteById(TEST_COMIC_BOOK_ID);
    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(selectedIdSet);
  }

  @Test
  public void testRemoveComicSelectionPublishingException()
      throws ComicSelectionException, PublishingException {
    Mockito.when(
            comicSelectionRepository.existsForUserAndComicBook(
                Mockito.any(ComiXedUser.class), Mockito.any(ComicBook.class)))
        .thenReturn(true);
    Mockito.doThrow(PublishingException.class)
        .when(publishComicBookSelectionStateAction)
        .publish(Mockito.anySet());

    service.removeComicSelectionFromUser(TEST_EMAIL, TEST_COMIC_BOOK_ID);

    Mockito.verify(comicSelectionRepository, Mockito.times(1))
        .existsForUserAndComicBook(user, comicBook);
    Mockito.verify(comicSelectionRepository, Mockito.times(1))
        .getIdForUserAndComic(user, comicBook);
    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(selectedIdSet);
  }

  @Test
  public void testAddingMultipleComics() throws PublishingException, ComicSelectionException {
    Mockito.when(
            comicSelectionRepository.existsForUserAndComicBook(
                Mockito.any(ComiXedUser.class), Mockito.any(ComicBook.class)))
        .thenReturn(false);

    service.selectMultipleComicBooks(
        TEST_EMAIL, null, null, null, null, null, false, false, null, true);

    final ComicSelection selection = saveSelectionArgumentCaptor.getValue();
    assertNotNull(selection);

    Mockito.verify(comicSelectionRepository, Mockito.times(comicDetailList.size()))
        .existsForUserAndComicBook(user, comicBook);
    Mockito.verify(comicSelectionRepository, Mockito.times(comicDetailList.size())).save(selection);
    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(comicDetailList.size()))
        .publish(selectedIdSet);
  }

  @Test
  public void testRemovingMultipleComics() throws PublishingException, ComicSelectionException {
    Mockito.when(
            comicSelectionRepository.existsForUserAndComicBook(
                Mockito.any(ComiXedUser.class), Mockito.any(ComicBook.class)))
        .thenReturn(true);

    service.selectMultipleComicBooks(
        TEST_EMAIL, null, null, null, null, null, false, false, null, false);

    Mockito.verify(comicSelectionRepository, Mockito.times(comicDetailList.size()))
        .getIdForUserAndComic(user, comicBook);
    Mockito.verify(comicSelectionRepository, Mockito.times(comicDetailList.size()))
        .deleteById(TEST_COMIC_BOOK_ID);
    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(selectedIdSet);
  }

  @Test
  public void tesClearSelectedComicBooks() throws PublishingException, ComicSelectionException {
    service.clearSelectedComicBooks(TEST_EMAIL);

    Mockito.verify(comicSelectionRepository, Mockito.times(1)).deleteAllById(selectedIdSet);
    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(selectedIdSet);
  }

  @Test(expected = ComicSelectionException.class)
  public void testGetAllForInvalidEmail() throws ComicSelectionException, ComiXedUserException {
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);
    try {
      service.getAllForEmail(TEST_EMAIL);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    }
  }

  @Test
  public void testGetAllForEmail() throws ComicSelectionException {
    final Set<Long> result = service.getAllForEmail(TEST_EMAIL);

    assertNotNull(result);
    assertSame(selectedIdSet, result);

    Mockito.verify(comicSelectionRepository, Mockito.times(1)).getAllForUser(user);
  }
}

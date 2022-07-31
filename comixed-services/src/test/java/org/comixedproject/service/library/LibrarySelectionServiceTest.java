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

package org.comixedproject.service.library;

import static junit.framework.TestCase.*;

import java.util.HashSet;
import java.util.Set;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.comicbooks.ComicException;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class LibrarySelectionServiceTest {
  private static final Long TEST_INCOMING_COMIC_ID = 717L;
  private static final Long TEST_EXISTING_COMIC_ID = 129L;

  @InjectMocks private LibrarySelectionService service;
  @Mock private ComicBookService comicBookService;
  @Mock private ComicBook comicBook;

  private Set<Long> incomingIds = new HashSet<>();
  private Set<Long> existingIds = new HashSet<>();

  @Before
  public void setUp() {
    Mockito.when(comicBook.getId()).thenReturn(TEST_INCOMING_COMIC_ID);
  }

  @Test
  public void testSelectComicsNullExisting() throws LibrarySelectionException, ComicException {
    incomingIds.add(TEST_INCOMING_COMIC_ID);

    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);

    final Set<Long> result = service.selectComics(null, incomingIds, true);

    assertNotNull(result);
    assertTrue(result.contains(TEST_INCOMING_COMIC_ID));

    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_INCOMING_COMIC_ID);
  }

  @Test(expected = LibrarySelectionException.class)
  public void testSelectComicsAddingSelectionInvalidComicBook()
      throws LibrarySelectionException, ComicException {
    incomingIds.add(TEST_INCOMING_COMIC_ID);

    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenThrow(ComicException.class);

    try {
      service.selectComics(existingIds, incomingIds, true);
    } finally {
      Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_INCOMING_COMIC_ID);
    }
  }

  @Test
  public void testSelectComicsAddingSelection() throws LibrarySelectionException, ComicException {
    existingIds.add(TEST_EXISTING_COMIC_ID);
    incomingIds.add(TEST_INCOMING_COMIC_ID);

    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);

    final Set<Long> result = service.selectComics(existingIds, incomingIds, true);

    assertNotNull(result);
    assertSame(existingIds, result);
    assertTrue(result.contains(TEST_INCOMING_COMIC_ID));
    assertTrue(result.contains(TEST_EXISTING_COMIC_ID));

    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_INCOMING_COMIC_ID);
  }

  @Test
  public void testSelectComicsRemovingSelection() throws LibrarySelectionException, ComicException {
    existingIds.add(TEST_EXISTING_COMIC_ID);
    existingIds.add(TEST_INCOMING_COMIC_ID);
    incomingIds.add(TEST_INCOMING_COMIC_ID);

    final Set<Long> result = service.selectComics(existingIds, incomingIds, false);

    assertNotNull(result);
    assertSame(existingIds, result);
    assertTrue(result.contains(TEST_EXISTING_COMIC_ID));
    assertFalse(result.contains(TEST_INCOMING_COMIC_ID));

    Mockito.verify(comicBookService, Mockito.never()).getComic(Mockito.anyLong());
  }

  @Test
  public void testSelectComicsRemovingSelectionWithNullExistingSelections()
      throws LibrarySelectionException, ComicException {
    incomingIds.add(TEST_INCOMING_COMIC_ID);

    final Set<Long> result = service.selectComics(null, incomingIds, false);

    assertNull(result);

    Mockito.verify(comicBookService, Mockito.never()).getComic(Mockito.anyLong());
  }

  @Test
  public void testSelectComicsRemovingSelectionWithNoExistingSelections()
      throws LibrarySelectionException, ComicException {
    existingIds.clear();
    incomingIds.add(TEST_INCOMING_COMIC_ID);

    final Set<Long> result = service.selectComics(existingIds, incomingIds, false);

    assertNotNull(result);
    assertSame(existingIds, result);

    Mockito.verify(comicBookService, Mockito.never()).getComic(Mockito.anyLong());
  }
}

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

package org.comixedproject.rest.library;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;
import static org.comixedproject.rest.library.LibrarySelectionsController.LIBRARY_SELECTIONS;

import java.util.Set;
import javax.servlet.http.HttpSession;
import org.comixedproject.model.net.library.SelectComicBooksRequest;
import org.comixedproject.service.library.LibrarySelectionException;
import org.comixedproject.service.library.LibrarySelectionService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class LibrarySelectionsControllerTest {
  @InjectMocks private LibrarySelectionsController controller;
  @Mock private HttpSession httpSession;
  @Mock private LibrarySelectionService librarySelectionService;
  @Mock private Set<Long> selectedComicIds;
  @Mock private Set<Long> incomingComicBookIds;
  @Mock private Set<Long> existingSelections;

  @Test(expected = LibrarySelectionException.class)
  public void testSelectComicsSelectionServiceException() throws LibrarySelectionException {
    Mockito.when(httpSession.getAttribute(Mockito.anyString())).thenReturn(null);
    Mockito.when(
            librarySelectionService.selectComics(
                Mockito.nullable(Set.class), Mockito.anySet(), Mockito.anyBoolean()))
        .thenThrow(LibrarySelectionException.class);

    try {
      controller.selectComicBooks(
          httpSession, new SelectComicBooksRequest(incomingComicBookIds, true));
    } finally {
      Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
      Mockito.verify(librarySelectionService, Mockito.times(1))
          .selectComics(null, incomingComicBookIds, true);
    }
  }

  @Test
  public void testSelectComics() throws LibrarySelectionException {
    Mockito.when(httpSession.getAttribute(Mockito.anyString())).thenReturn(null);
    Mockito.when(
            librarySelectionService.selectComics(
                Mockito.nullable(Set.class), Mockito.anySet(), Mockito.anyBoolean()))
        .thenReturn(selectedComicIds);

    final Set<Long> result =
        controller.selectComicBooks(
            httpSession, new SelectComicBooksRequest(incomingComicBookIds, true));

    assertNotNull(result);
    assertSame(selectedComicIds, result);

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(librarySelectionService, Mockito.times(1))
        .selectComics(null, incomingComicBookIds, true);
  }

  @Test
  public void testSelectComicsExistingSelections() throws LibrarySelectionException {
    Mockito.when(httpSession.getAttribute(Mockito.anyString())).thenReturn(existingSelections);
    Mockito.when(
            librarySelectionService.selectComics(
                Mockito.anySet(), Mockito.anySet(), Mockito.anyBoolean()))
        .thenReturn(selectedComicIds);

    final Set<Long> result =
        controller.selectComicBooks(
            httpSession, new SelectComicBooksRequest(incomingComicBookIds, true));

    assertNotNull(result);
    assertSame(selectedComicIds, result);

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(librarySelectionService, Mockito.times(1))
        .selectComics(existingSelections, incomingComicBookIds, true);
  }

  @Test
  public void testClearSelectedComics() {
    controller.clearSelections(httpSession);

    Mockito.verify(httpSession, Mockito.times(1)).setAttribute(LIBRARY_SELECTIONS, null);
  }
}

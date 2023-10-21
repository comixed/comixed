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

package org.comixedproject.rest.comicbooks;

import static junit.framework.TestCase.*;
import static org.comixedproject.rest.comicbooks.ComicBookSelectionController.LIBRARY_SELECTIONS;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.http.HttpSession;
import org.comixedproject.model.net.comicbooks.MultipleComicBooksSelectionRequest;
import org.comixedproject.service.comicbooks.ComicSelectionException;
import org.comixedproject.service.comicbooks.ComicSelectionService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ComicBookSelectionControllerTest {
  private static final String TEST_ENCODED_SELECTIONS = "This is the encoded selection set";
  private static final String TEST_REENCODED_SELECTIONS = "This is the selection set re-encoded";
  private static final String TEST_EMAIL = "comixedreader@localhost";
  private static final Long TEST_COMIC_BOOK_ID = 17L;

  @InjectMocks private ComicBookSelectionController controller;
  @Mock private ComicSelectionService comicSelectionService;
  @Mock private ObjectMapper objectMapper;
  @Mock private HttpSession session;
  @Mock private List selectionIdList;

  private List selections = new ArrayList();

  @Before
  public void setUp() throws JsonProcessingException {
    Mockito.when(session.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTIONS);
    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(selections);
    Mockito.when(objectMapper.writeValueAsString(Mockito.any()))
        .thenReturn(TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testGetAllSelectionsNoneFound() throws ComicSelectionException {
    Mockito.when(session.getAttribute(LIBRARY_SELECTIONS)).thenReturn(null);

    final List result = controller.getAllSelections(session);

    assertNotNull(result);
    assertTrue(selections.isEmpty());

    Mockito.verify(session, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(session, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testGetAllSelections() throws ComicSelectionException {
    final List result = controller.getAllSelections(session);

    assertNotNull(result);
    assertEquals(selections, result);

    Mockito.verify(session, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
  }

  @Test
  public void testAddSingleSelection() throws ComicSelectionException, JsonProcessingException {
    controller.addSingleSelection(session, TEST_COMIC_BOOK_ID);

    Mockito.verify(comicSelectionService, Mockito.times(1))
        .addComicSelectionForUser(selections, TEST_COMIC_BOOK_ID);
    Mockito.verify(session, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(objectMapper, Mockito.times(1)).writeValueAsString(selections);
    Mockito.verify(session, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testRemoveSingleSelection() throws ComicSelectionException, JsonProcessingException {
    controller.deleteSingleSelection(session, TEST_COMIC_BOOK_ID);

    Mockito.verify(comicSelectionService, Mockito.times(1))
        .removeComicSelectionFromUser(selections, TEST_COMIC_BOOK_ID);
    Mockito.verify(session, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(objectMapper, Mockito.times(1)).writeValueAsString(selections);
    Mockito.verify(session, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testSelectMultipleComicWithAdded()
      throws ComicSelectionException, JsonProcessingException {
    controller.selectMultipleComicBooks(
        session,
        new MultipleComicBooksSelectionRequest(
            null, null, null, null, null, false, false, null, true));

    Mockito.verify(comicSelectionService, Mockito.times(1))
        .selectMultipleComicBooks(
            selections, null, null, null, null, null, false, false, null, true);
    Mockito.verify(session, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(objectMapper, Mockito.times(1)).writeValueAsString(selections);
    Mockito.verify(session, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testSelectMultipleComicWithRemoving()
      throws ComicSelectionException, JsonProcessingException {
    controller.selectMultipleComicBooks(
        session,
        new MultipleComicBooksSelectionRequest(
            null, null, null, null, null, false, false, null, false));

    Mockito.verify(comicSelectionService, Mockito.times(1))
        .selectMultipleComicBooks(
            selections, null, null, null, null, null, false, false, null, false);
    Mockito.verify(session, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(objectMapper, Mockito.times(1)).writeValueAsString(selections);
    Mockito.verify(session, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testClearSelections() throws ComicSelectionException, JsonProcessingException {
    controller.clearSelections(session);

    Mockito.verify(session, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(objectMapper, Mockito.times(1)).writeValueAsString(selections);
    Mockito.verify(session, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }
}

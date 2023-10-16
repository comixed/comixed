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

import java.util.Set;
import javax.servlet.http.HttpSession;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.comicbooks.ComicType;
import org.comixedproject.model.net.comicbooks.MultipleComicBooksSelectionRequest;
import org.comixedproject.model.net.comicbooks.SingleComicBookSelectionRequest;
import org.comixedproject.service.comicbooks.ComicBookSelectionService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ComicBookSelectionControllerTest {
  private static final Long TEST_COMIC_BOOK_ID = 17L;
  private static final Integer TEST_COVER_YEAR = RandomUtils.nextInt(50) + 1970;
  private static final Integer TEST_COVER_MONTH = RandomUtils.nextInt(12);
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CB7;
  private static final ComicType TEST_COMIC_TYPE = ComicType.ISSUE;
  private static final ComicState TEST_COMIC_STATE = ComicState.REMOVED;
  private static final Boolean TEST_READ_STATE = RandomUtils.nextBoolean();
  private static final Boolean TEST_UNSCRAPED_STATE = RandomUtils.nextBoolean();
  private static final String TEST_SEARCH_TEXT = "The search text";
  private static final Boolean TEST_SELECT = RandomUtils.nextBoolean();

  @InjectMocks private ComicBookSelectionController controller;
  @Mock private HttpSession httpSession;
  @Mock private ComicBookSelectionService comicBookSelectionService;
  @Mock private Set<Long> selectedComicIds;
  @Mock private Set<Long> existingSelections;

  @Test
  public void testLoadComicBookSelectionsNoneExisting() {
    Mockito.when(httpSession.getAttribute(Mockito.anyString())).thenReturn(null);

    final Set<Long> result = controller.loadComicBookSelections(httpSession);

    assertNotNull(result);
    assertTrue(result.isEmpty());

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
  }

  @Test
  public void testLoadComicBookSelections() {
    Mockito.when(httpSession.getAttribute(Mockito.anyString())).thenReturn(selectedComicIds);

    final Set<Long> result = controller.loadComicBookSelections(httpSession);

    assertNotNull(result);
    assertSame(selectedComicIds, result);

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
  }

  @Test
  public void testSingleComicBookSelection() {
    Mockito.when(httpSession.getAttribute(Mockito.anyString())).thenReturn(null);
    Mockito.when(
            comicBookSelectionService.selectSingleComicBook(
                Mockito.nullable(Set.class), Mockito.anyLong(), Mockito.anyBoolean()))
        .thenReturn(selectedComicIds);

    controller.selectSingleComicBook(
        httpSession, new SingleComicBookSelectionRequest(TEST_COMIC_BOOK_ID, TEST_SELECT));

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(comicBookSelectionService, Mockito.times(1))
        .selectSingleComicBook(null, TEST_COMIC_BOOK_ID, TEST_SELECT);
  }

  @Test
  public void testSingleComicBookSelectionExistingSelections() {
    Mockito.when(httpSession.getAttribute(Mockito.anyString())).thenReturn(existingSelections);
    Mockito.when(
            comicBookSelectionService.selectSingleComicBook(
                Mockito.anySet(), Mockito.anyLong(), Mockito.anyBoolean()))
        .thenReturn(selectedComicIds);

    controller.selectSingleComicBook(
        httpSession, new SingleComicBookSelectionRequest(TEST_COMIC_BOOK_ID, TEST_SELECT));

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(comicBookSelectionService, Mockito.times(1))
        .selectSingleComicBook(existingSelections, TEST_COMIC_BOOK_ID, TEST_SELECT);
  }

  @Test
  public void testMultipleComicBookSelection() {
    Mockito.when(httpSession.getAttribute(Mockito.anyString())).thenReturn(null);
    Mockito.when(
            comicBookSelectionService.selectMultipleComicBooks(
                Mockito.nullable(Set.class),
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.any(ArchiveType.class),
                Mockito.any(ComicType.class),
                Mockito.any(ComicState.class),
                Mockito.anyBoolean(),
                Mockito.anyBoolean(),
                Mockito.anyString(),
                Mockito.anyBoolean()))
        .thenReturn(selectedComicIds);

    controller.selectMultipleComicBooks(
        httpSession,
        new MultipleComicBooksSelectionRequest(
            TEST_COVER_YEAR,
            TEST_COVER_MONTH,
            TEST_ARCHIVE_TYPE,
            TEST_COMIC_TYPE,
            TEST_COMIC_STATE,
            TEST_READ_STATE,
            TEST_UNSCRAPED_STATE,
            TEST_SEARCH_TEXT,
            TEST_SELECT));

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(comicBookSelectionService, Mockito.times(1))
        .selectMultipleComicBooks(
            null,
            TEST_COVER_YEAR,
            TEST_COVER_MONTH,
            TEST_ARCHIVE_TYPE,
            TEST_COMIC_TYPE,
            TEST_COMIC_STATE,
            TEST_READ_STATE,
            TEST_UNSCRAPED_STATE,
            TEST_SEARCH_TEXT,
            TEST_SELECT);
  }

  @Test
  public void testMultipleComicBookSelectionExistingSelections() {
    Mockito.when(httpSession.getAttribute(Mockito.anyString())).thenReturn(existingSelections);
    Mockito.when(
            comicBookSelectionService.selectMultipleComicBooks(
                Mockito.nullable(Set.class),
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.any(ArchiveType.class),
                Mockito.any(ComicType.class),
                Mockito.any(ComicState.class),
                Mockito.anyBoolean(),
                Mockito.anyBoolean(),
                Mockito.anyString(),
                Mockito.anyBoolean()))
        .thenReturn(selectedComicIds);

    controller.selectMultipleComicBooks(
        httpSession,
        new MultipleComicBooksSelectionRequest(
            TEST_COVER_YEAR,
            TEST_COVER_MONTH,
            TEST_ARCHIVE_TYPE,
            TEST_COMIC_TYPE,
            TEST_COMIC_STATE,
            TEST_READ_STATE,
            TEST_UNSCRAPED_STATE,
            TEST_SEARCH_TEXT,
            TEST_SELECT));

    Mockito.verify(httpSession, Mockito.times(1)).getAttribute(LIBRARY_SELECTIONS);
    Mockito.verify(comicBookSelectionService, Mockito.times(1))
        .selectMultipleComicBooks(
            existingSelections,
            TEST_COVER_YEAR,
            TEST_COVER_MONTH,
            TEST_ARCHIVE_TYPE,
            TEST_COMIC_TYPE,
            TEST_COMIC_STATE,
            TEST_READ_STATE,
            TEST_UNSCRAPED_STATE,
            TEST_SEARCH_TEXT,
            TEST_SELECT);
  }

  @Test
  public void testClearSelectedComics() {
    Mockito.when(comicBookSelectionService.clearSelectedComicBooks()).thenReturn(selectedComicIds);

    controller.clearSelections(httpSession);

    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, selectedComicIds);
  }
}

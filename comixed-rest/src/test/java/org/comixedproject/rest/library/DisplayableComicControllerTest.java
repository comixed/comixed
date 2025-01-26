/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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

import static junit.framework.TestCase.*;
import static org.comixedproject.rest.comicbooks.ComicBookSelectionController.LIBRARY_SELECTIONS;

import jakarta.servlet.http.HttpSession;
import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.comicbooks.ComicType;
import org.comixedproject.model.library.DisplayableComic;
import org.comixedproject.model.net.library.*;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.service.comicbooks.ComicBookSelectionException;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.comicbooks.ComicSelectionService;
import org.comixedproject.service.library.DisplayableComicService;
import org.comixedproject.service.library.LibraryException;
import org.comixedproject.service.lists.ReadingListException;
import org.comixedproject.service.lists.ReadingListService;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class DisplayableComicControllerTest {
  private static final Integer TEST_PAGE_SIZE = 25;
  private static final Integer TEST_PAGE_INDEX = 3;
  private static final Integer TEST_COVER_YEAR = 2025;
  private static final Integer TEST_COVER_MONTH = 3;
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CBZ;
  private static final ComicType TEST_COMIC_TYPE = ComicType.MANGA;
  private static final ComicState TEST_COMIC_STATE = ComicState.STABLE;
  private static final Boolean TEST_UNSCRAPED_STATE = RandomUtils.nextBoolean();
  private static final String TEST_SEARCH_TEXT = "The search text";
  private static final String TEST_PUBLISHER = "The Publisher";
  private static final String TEST_SERIES = "The Series";
  private static final String TEST_VOLUME = "2025";
  private static final String TEST_SORT_BY = "series";
  private static final String TEST_SORT_DIRECTION = "asc";
  private static final long TEST_FILTERED_COUNT = 3237L;
  private static final long TEST_COMIC_COUNT = 32567L;
  private static final Object TEST_ENCODED_SELECTIONS = "The encoded selection ids";
  private static final int TEST_SELECTED_SIZE = 9237;
  private static final ComicTagType TEST_TAG_TYPE =
      ComicTagType.values()[RandomUtils.nextInt(ComicTagType.values().length)];
  private static final String TEST_TAG_VALUE = "tag.value";
  private static final String TEST_EMAIL = "reader@comixedproject.org";
  private static final int TEST_READ_COMIC_COUNT = 275;
  private static final long TEST_READING_LIST_ID = 293L;

  @InjectMocks private DisplayableComicController controller;
  @Mock private DisplayableComicService displayableComicService;
  @Mock private ComicBookService comicBookService;
  @Mock private ComicSelectionService comicSelectionService;
  @Mock private UserService userService;
  @Mock private ReadingListService readingListService;

  @Mock private LoadComicsRequest filteredRequest;
  @Mock private List<DisplayableComic> comicList;
  @Mock private List<Integer> coverYears;
  @Mock private List<Integer> coverMonths;
  @Mock private LoadSelectedComicsRequest selectedRequest;
  @Mock private HttpSession session;
  @Mock private List<Long> selectedIdList;
  @Mock private Principal principal;
  @Mock private ComiXedUser user;
  @Mock private Set<Long> comicBooksRead;

  @Before
  public void setUp() throws ComicBookSelectionException, ComiXedUserException {
    Mockito.when(filteredRequest.getPageSize()).thenReturn(TEST_PAGE_SIZE);
    Mockito.when(filteredRequest.getPageIndex()).thenReturn(TEST_PAGE_INDEX);
    Mockito.when(filteredRequest.getCoverYear()).thenReturn(TEST_COVER_YEAR);
    Mockito.when(filteredRequest.getCoverMonth()).thenReturn(TEST_COVER_MONTH);
    Mockito.when(filteredRequest.getArchiveType()).thenReturn(TEST_ARCHIVE_TYPE);
    Mockito.when(filteredRequest.getComicType()).thenReturn(TEST_COMIC_TYPE);
    Mockito.when(filteredRequest.getComicState()).thenReturn(TEST_COMIC_STATE);
    Mockito.when(filteredRequest.getUnscrapedState()).thenReturn(TEST_UNSCRAPED_STATE);
    Mockito.when(filteredRequest.getSearchText()).thenReturn(TEST_SEARCH_TEXT);
    Mockito.when(filteredRequest.getPublisher()).thenReturn(TEST_PUBLISHER);
    Mockito.when(filteredRequest.getSeries()).thenReturn(TEST_SERIES);
    Mockito.when(filteredRequest.getVolume()).thenReturn(TEST_VOLUME);
    Mockito.when(filteredRequest.getSortBy()).thenReturn(TEST_SORT_BY);
    Mockito.when(filteredRequest.getSortDirection()).thenReturn(TEST_SORT_DIRECTION);

    Mockito.when(selectedRequest.getPageSize()).thenReturn(TEST_PAGE_SIZE);
    Mockito.when(selectedRequest.getPageIndex()).thenReturn(TEST_PAGE_INDEX);
    Mockito.when(selectedRequest.getSortBy()).thenReturn(TEST_SORT_BY);
    Mockito.when(selectedRequest.getSortDirection()).thenReturn(TEST_SORT_DIRECTION);

    Mockito.when(session.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTIONS);
    Mockito.when(comicSelectionService.decodeSelections(Mockito.any())).thenReturn(selectedIdList);

    Mockito.when(selectedIdList.size()).thenReturn(TEST_SELECTED_SIZE);

    Mockito.when(comicBookService.getComicBookCount()).thenReturn(TEST_COMIC_COUNT);
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
    Mockito.when(comicBooksRead.size()).thenReturn(TEST_READ_COMIC_COUNT);
    Mockito.when(user.getReadComicBooks()).thenReturn(comicBooksRead);
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
  }

  @Test
  public void testLoadComicsByFilter() {
    Mockito.when(
            displayableComicService.loadComicsByFilter(
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.any(ArchiveType.class),
                Mockito.any(ComicType.class),
                Mockito.any(ComicState.class),
                Mockito.anyBoolean(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString()))
        .thenReturn(comicList);
    Mockito.when(
            displayableComicService.getCoverYearsForFilter(
                Mockito.any(ArchiveType.class),
                Mockito.any(ComicType.class),
                Mockito.any(ComicState.class),
                Mockito.anyBoolean(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString()))
        .thenReturn(coverYears);
    Mockito.when(
            displayableComicService.getCoverMonthsForFilter(
                Mockito.any(ArchiveType.class),
                Mockito.any(ComicType.class),
                Mockito.any(ComicState.class),
                Mockito.anyBoolean(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString()))
        .thenReturn(coverMonths);
    Mockito.when(
            displayableComicService.getComicCountForFilter(
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.any(ArchiveType.class),
                Mockito.any(ComicType.class),
                Mockito.any(ComicState.class),
                Mockito.anyBoolean(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString()))
        .thenReturn(TEST_FILTERED_COUNT);
    Mockito.when(comicBookService.getComicBookCount()).thenReturn(TEST_COMIC_COUNT);

    final LoadComicsResponse result = controller.loadComicsByFilter(filteredRequest);

    assertNotNull(result);
    assertSame(comicList, result.getComics());
    assertSame(coverYears, result.getCoverYears());
    assertSame(coverMonths, result.getCoverMonths());
    assertEquals(TEST_FILTERED_COUNT, result.getFilteredCount());
    assertEquals(TEST_COMIC_COUNT, result.getTotalCount());

    Mockito.verify(displayableComicService, Mockito.times(1))
        .loadComicsByFilter(
            TEST_PAGE_SIZE,
            TEST_PAGE_INDEX,
            TEST_COVER_YEAR,
            TEST_COVER_MONTH,
            TEST_ARCHIVE_TYPE,
            TEST_COMIC_TYPE,
            TEST_COMIC_STATE,
            TEST_UNSCRAPED_STATE,
            TEST_SEARCH_TEXT,
            TEST_PUBLISHER,
            TEST_SERIES,
            TEST_VOLUME,
            TEST_SORT_BY,
            TEST_SORT_DIRECTION);
  }

  @Test
  public void testLoadComicsBySelectedState() throws ComicBookSelectionException {
    Mockito.when(
            displayableComicService.loadComicsById(
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyList()))
        .thenReturn(comicList);

    final LoadComicsResponse result =
        controller.loadComicsBySelectedState(session, selectedRequest);

    assertNotNull(result);
    assertSame(comicList, result.getComics());
    assertSame(Collections.emptyList(), result.getCoverYears());
    assertSame(Collections.emptyList(), result.getCoverMonths());
    assertEquals(TEST_SELECTED_SIZE, result.getFilteredCount());
    assertEquals(TEST_SELECTED_SIZE, result.getTotalCount());

    Mockito.verify(displayableComicService, Mockito.times(1))
        .loadComicsById(
            TEST_PAGE_SIZE, TEST_PAGE_INDEX, TEST_SORT_BY, TEST_SORT_DIRECTION, selectedIdList);
  }

  @Test
  public void testLoadComicsByTagTypeAndValue() {
    Mockito.when(
            displayableComicService.loadComicsByTagTypeAndValue(
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.any(ComicTagType.class),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString()))
        .thenReturn(comicList);
    Mockito.when(
            displayableComicService.getCoverYearsForTagTypeAndValue(
                Mockito.any(ComicTagType.class), Mockito.anyString()))
        .thenReturn(coverYears);
    Mockito.when(
            displayableComicService.getCoverMonthsForTagTypeAndValue(
                Mockito.any(ComicTagType.class), Mockito.anyString()))
        .thenReturn(coverMonths);
    Mockito.when(
            displayableComicService.getComicCountForTagTypeAndValue(
                Mockito.any(ComicTagType.class), Mockito.anyString()))
        .thenReturn(TEST_FILTERED_COUNT);

    final LoadComicsResponse result =
        controller.loadComicsByTagTypeAndValue(
            new LoadComicsForCollectionRequest(
                TEST_PAGE_SIZE, TEST_PAGE_INDEX, TEST_SORT_BY, TEST_SORT_DIRECTION),
            TEST_TAG_TYPE,
            TEST_TAG_VALUE);

    assertNotNull(result);
    assertSame(comicList, result.getComics());
    assertSame(coverYears, result.getCoverYears());
    assertSame(coverMonths, result.getCoverMonths());
    assertEquals(TEST_FILTERED_COUNT, result.getFilteredCount());
    assertEquals(TEST_FILTERED_COUNT, result.getTotalCount());

    Mockito.verify(displayableComicService, Mockito.times(1))
        .loadComicsByTagTypeAndValue(
            TEST_PAGE_SIZE,
            TEST_PAGE_INDEX,
            TEST_TAG_TYPE,
            TEST_TAG_VALUE,
            TEST_SORT_BY,
            TEST_SORT_DIRECTION);
    Mockito.verify(displayableComicService, Mockito.times(1))
        .getCoverYearsForTagTypeAndValue(TEST_TAG_TYPE, TEST_TAG_VALUE);
    Mockito.verify(displayableComicService, Mockito.times(1))
        .getCoverYearsForTagTypeAndValue(TEST_TAG_TYPE, TEST_TAG_VALUE);
    Mockito.verify(displayableComicService, Mockito.times(1))
        .getComicCountForTagTypeAndValue(TEST_TAG_TYPE, TEST_TAG_VALUE);
  }

  @Test
  public void testLoadUnreadComics() throws ComiXedUserException {
    Mockito.when(
            displayableComicService.loadUnreadComics(
                Mockito.any(ComiXedUser.class),
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.anyString(),
                Mockito.anyString()))
        .thenReturn(comicList);

    final LoadComicsResponse result =
        controller.loadUnreadComics(
            principal,
            new LoadComicsByReadStateRequest(
                TEST_PAGE_SIZE, TEST_PAGE_INDEX, TEST_SORT_BY, TEST_SORT_DIRECTION));

    assertNotNull(result);
    assertSame(comicList, result.getComics());
    assertSame(Collections.emptyList(), result.getCoverYears());
    assertSame(Collections.emptyList(), result.getCoverMonths());
    assertEquals(TEST_COMIC_COUNT - TEST_READ_COMIC_COUNT, result.getFilteredCount());
    assertEquals(TEST_COMIC_COUNT - TEST_READ_COMIC_COUNT, result.getTotalCount());

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(displayableComicService, Mockito.times(1))
        .loadUnreadComics(user, TEST_PAGE_SIZE, TEST_PAGE_INDEX, TEST_SORT_BY, TEST_SORT_DIRECTION);
  }

  @Test(expected = ComiXedUserException.class)
  public void testLoadUnreadComics_userNotFound() throws ComiXedUserException {
    Mockito.when(userService.findByEmail(TEST_EMAIL)).thenThrow(ComiXedUserException.class);

    try {
      controller.loadUnreadComics(
          principal,
          new LoadComicsByReadStateRequest(
              TEST_PAGE_SIZE, TEST_PAGE_INDEX, TEST_SORT_BY, TEST_SORT_DIRECTION));
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    }
  }

  @Test
  public void testLoadReadComics() throws ComiXedUserException {
    Mockito.when(
            displayableComicService.loadReadComics(
                Mockito.any(ComiXedUser.class),
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.anyString(),
                Mockito.anyString()))
        .thenReturn(comicList);

    final LoadComicsResponse result =
        controller.loadReadComics(
            principal,
            new LoadComicsByReadStateRequest(
                TEST_PAGE_SIZE, TEST_PAGE_INDEX, TEST_SORT_BY, TEST_SORT_DIRECTION));

    assertNotNull(result);
    assertSame(comicList, result.getComics());
    assertSame(Collections.emptyList(), result.getCoverYears());
    assertSame(Collections.emptyList(), result.getCoverMonths());
    assertEquals(TEST_READ_COMIC_COUNT, result.getFilteredCount());
    assertEquals(TEST_READ_COMIC_COUNT, result.getTotalCount());

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(displayableComicService, Mockito.times(1))
        .loadReadComics(user, TEST_PAGE_SIZE, TEST_PAGE_INDEX, TEST_SORT_BY, TEST_SORT_DIRECTION);
  }

  @Test(expected = ComiXedUserException.class)
  public void testLoadReadComics_userNotFound() throws ComiXedUserException {
    Mockito.when(userService.findByEmail(TEST_EMAIL)).thenThrow(ComiXedUserException.class);

    try {
      controller.loadReadComics(
          principal,
          new LoadComicsByReadStateRequest(
              TEST_PAGE_SIZE, TEST_PAGE_INDEX, TEST_SORT_BY, TEST_SORT_DIRECTION));
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    }
  }

  @Test(expected = ReadingListException.class)
  public void testLoadComicsForList_readingListException()
      throws ReadingListException, LibraryException {
    Mockito.when(readingListService.getEntryCount(Mockito.anyLong()))
        .thenThrow(ReadingListException.class);

    try {
      controller.loadComicsForList(
          principal,
          new LoadComicForListRequest(
              TEST_PAGE_SIZE, TEST_PAGE_INDEX, TEST_SORT_BY, TEST_SORT_DIRECTION),
          TEST_READING_LIST_ID);
    } finally {
      Mockito.verify(readingListService, Mockito.times(1)).getEntryCount(TEST_READING_LIST_ID);
    }
  }

  @Test
  public void testLoadComicsForList() throws ReadingListException, LibraryException {
    Mockito.when(
            displayableComicService.loadComicsForList(
                Mockito.anyString(),
                Mockito.anyLong(),
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.anyString(),
                Mockito.anyString()))
        .thenReturn(comicList);
    Mockito.when(readingListService.getEntryCount(Mockito.anyLong()))
        .thenReturn(TEST_FILTERED_COUNT);

    final LoadComicsResponse result =
        controller.loadComicsForList(
            principal,
            new LoadComicForListRequest(
                TEST_PAGE_SIZE, TEST_PAGE_INDEX, TEST_SORT_BY, TEST_SORT_DIRECTION),
            TEST_READING_LIST_ID);

    assertNotNull(result);
    assertSame(comicList, result.getComics());
    assertEquals(TEST_FILTERED_COUNT, result.getFilteredCount());
    assertEquals(TEST_FILTERED_COUNT, result.getTotalCount());

    Mockito.verify(displayableComicService, Mockito.times(1))
        .loadComicsForList(
            TEST_EMAIL,
            TEST_READING_LIST_ID,
            TEST_PAGE_SIZE,
            TEST_PAGE_INDEX,
            TEST_SORT_BY,
            TEST_SORT_DIRECTION);
    Mockito.verify(readingListService, Mockito.times(1)).getEntryCount(TEST_READING_LIST_ID);
  }

  @Test
  public void testLoadDuplicateComics() {
    Mockito.when(
            displayableComicService.loadDuplicateComics(
                Mockito.anyInt(), Mockito.anyInt(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(comicList);
    Mockito.when(displayableComicService.getDuplicateComicCount()).thenReturn(TEST_FILTERED_COUNT);

    final LoadComicsResponse result =
        controller.loadDuplicateComics(
            new LoadDuplicateComicsRequest(
                TEST_PAGE_SIZE, TEST_PAGE_INDEX, TEST_SORT_BY, TEST_SORT_DIRECTION));

    assertNotNull(result);
    assertSame(comicList, result.getComics());
    assertEquals(Collections.emptyList(), result.getCoverYears());
    assertEquals(Collections.emptyList(), result.getCoverMonths());
    assertEquals(TEST_FILTERED_COUNT, result.getFilteredCount());
    assertEquals(TEST_FILTERED_COUNT, result.getTotalCount());

    Mockito.verify(displayableComicService, Mockito.times(1))
        .loadDuplicateComics(TEST_PAGE_SIZE, TEST_PAGE_INDEX, TEST_SORT_BY, TEST_SORT_DIRECTION);
    Mockito.verify(displayableComicService, Mockito.times(1)).getDuplicateComicCount();
  }
}

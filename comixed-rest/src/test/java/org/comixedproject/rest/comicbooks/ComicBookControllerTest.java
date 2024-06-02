/*
 * ComiXed - A digital comicBook book library management application.
 * Copyright (C) 2018, The ComiXed Project.
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

import static org.comixedproject.rest.comicbooks.ComicBookController.MISSING_COMIC_COVER;
import static org.comixedproject.rest.comicbooks.ComicBookSelectionController.LIBRARY_SELECTIONS;
import static org.junit.Assert.*;

import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.security.Principal;
import java.util.*;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.*;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.library.LastRead;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.model.net.comicbooks.*;
import org.comixedproject.service.comicbooks.*;
import org.comixedproject.service.comicpages.ComicPageException;
import org.comixedproject.service.comicpages.PageCacheService;
import org.comixedproject.service.library.LastReadException;
import org.comixedproject.service.library.LastReadService;
import org.comixedproject.service.lists.ReadingListException;
import org.comixedproject.service.lists.ReadingListService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ComicBookControllerTest {
  private static final long TEST_COMIC_ID = 129;
  private static final int TEST_PAGE_SIZE = 10;
  private static final int TEST_PAGE_INDEX = RandomUtils.nextInt(100);
  private static final Integer TEST_COVER_YEAR = RandomUtils.nextInt(50) + 1970;
  private static final Integer TEST_COVER_MONTH = RandomUtils.nextInt(12);
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CB7;
  private static final ComicType TEST_COMIC_TYPE = ComicType.ISSUE;
  private static final ComicState TEST_COMIC_STATE = ComicState.REMOVED;
  private static final Boolean TEST_UNSCRAPED_STATE = RandomUtils.nextBoolean();
  private static final String TEST_SEARCH_TEXT = "The search text";
  private static final String TEST_PUBLISHER = "THe Publisher Name";
  private static final String TEST_SERIES = "The Series Name";
  private static final String TEST_VOLUME = "2023";
  private static final String TEST_SORT_FIELD = "added-date";
  private static final String TEST_SORT_DIRECTION = "asc";
  private static final long TEST_TOTAL_COMIC_COUNT = Math.abs(RandomUtils.nextLong() * 30000L);
  private static final long TEST_FILTER_COUNT = Math.abs(RandomUtils.nextLong() * 30000L);

  private static final long TEST_COMIC_BOOK_COUNT = TEST_TOTAL_COMIC_COUNT * 2L;
  private static final ComicTagType TEST_TAG_TYPE =
      ComicTagType.values()[RandomUtils.nextInt(ComicTagType.values().length)];
  private static final String TEST_TAG_VALUE = "The tag value";
  private static final Object TEST_ENCODED_SELECTIONS = "The encoded selection ids";
  private static final String TEST_REENCODED_SELECTIONS = "The re-encoded selection ids";
  private static final String TEST_EMAIL = "comixedreader@localhost";
  private static final long TEST_UNREAD_COMIC_COUNT = 804L;
  private static final long TEST_READING_LIST_ID = 501L;
  private static final Long TEST_PAGE_ID = 129L;

  @InjectMocks private ComicBookController controller;
  @Mock private ComicBookService comicBookService;
  @Mock private ComicDetailService comicDetailService;
  @Mock private PageCacheService pageCacheService;
  @Mock private ComicBookSelectionService comicBookSelectionService;
  @Mock private ReadingListService readingListService;
  @Mock private ComicBook comicBook;
  @Mock private LastReadService lastReadService;
  @Mock private ComicPage page;
  @Mock private List<PageOrderEntry> pageOrderEntrylist;
  @Mock private List<ComicDetail> comicDetailList;
  @Mock private List<Integer> coverYearList;
  @Mock private List<Integer> coverMonthList;
  @Mock private HttpSession httpSession;
  @Mock private Principal principal;
  @Mock private List<LastRead> lastReadEntryList;
  @Mock private DownloadDocument comicBookContent;
  @Mock private ResponseEntity<byte[]> responseEntity;

  private List<Long> selectedIdList = new ArrayList<>();
  private final Set<Long> comicBookIdSet = new HashSet<>();
  private List<ComicPage> pageList = new ArrayList<>();

  @Before
  public void setUp() throws ComicBookSelectionException, ComicBookException {
    Mockito.when(page.getId()).thenReturn(TEST_PAGE_ID);
    pageList.add(page);
    Mockito.when(comicBook.getPages()).thenReturn(pageList);
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);
    comicBookIdSet.add(TEST_COMIC_ID);
    Mockito.when(comicBookService.getComicBookCount()).thenReturn(TEST_COMIC_BOOK_COUNT);
    Mockito.when(httpSession.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTIONS);
    Mockito.when(comicBookSelectionService.decodeSelections(Mockito.any()))
        .thenReturn(selectedIdList);
    Mockito.when(comicBookSelectionService.encodeSelections(selectedIdList))
        .thenReturn(TEST_REENCODED_SELECTIONS);
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
    for (long index = 0L; index < 100L; index++) {
      selectedIdList.add(index);
    }
  }

  @Test
  public void testGetComicForNonexistentComic() throws ComicBookException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(null);

    ComicBook result = controller.getComic(TEST_COMIC_ID);

    assertNull(result);

    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
  }

  @Test
  public void testGetComic() throws ComicBookException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);

    ComicBook result = controller.getComic(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
  }

  @Test
  public void testUpdateComic() throws ComicBookException {
    Mockito.when(comicBookService.updateComic(Mockito.anyLong(), Mockito.any(ComicBook.class)))
        .thenReturn(comicBook);

    final ComicBook result = controller.updateComic(TEST_COMIC_ID, comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookService, Mockito.times(1)).updateComic(TEST_COMIC_ID, comicBook);
  }

  @Test
  public void testDeleteComicBook() throws ComicBookException {
    Mockito.when(comicBookService.deleteComicBook(Mockito.anyLong())).thenReturn(comicBook);

    final ComicBook result = controller.deleteComicBook(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookService, Mockito.times(1)).deleteComicBook(TEST_COMIC_ID);
  }

  @Test(expected = ComicBookException.class)
  public void testDeleteComicBookFails() throws ComicBookException {
    Mockito.when(comicBookService.deleteComicBook(Mockito.anyLong()))
        .thenThrow(ComicBookException.class);

    try {
      controller.deleteComicBook(TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicBookService, Mockito.times(1)).deleteComicBook(TEST_COMIC_ID);
    }
  }

  @Test
  public void testUndeleteComicBook() throws ComicBookException {
    Mockito.when(comicBookService.undeleteComicBook(Mockito.anyLong())).thenReturn(comicBook);

    final ComicBook result = controller.undeleteComicBook(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookService, Mockito.times(1)).undeleteComicBook(TEST_COMIC_ID);
  }

  @Test(expected = ComicBookException.class)
  public void testUndeleteComicBookFails() throws ComicBookException {
    Mockito.when(comicBookService.undeleteComicBook(Mockito.anyLong()))
        .thenThrow(ComicBookException.class);

    try {
      controller.undeleteComicBook(TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicBookService, Mockito.times(1)).undeleteComicBook(TEST_COMIC_ID);
    }
  }

  @Test
  public void testDeleteSelectedComicBooks() throws ComicBookException {
    Mockito.doNothing().when(comicBookService).deleteComicBooksById(selectedIdList);

    controller.deleteSelectedComicBooks(httpSession);

    Mockito.verify(comicBookService, Mockito.times(1)).deleteComicBooksById(this.selectedIdList);
  }

  @Test
  public void testUndeleteSelectedComicBooks() throws Exception {
    Mockito.doNothing().when(comicBookService).undeleteComicBooksById(selectedIdList);

    controller.undeleteSelectedComicBooks(httpSession);

    Mockito.verify(comicBookSelectionService, Mockito.times(1))
        .decodeSelections(TEST_ENCODED_SELECTIONS);
    Mockito.verify(comicBookService, Mockito.times(1)).undeleteComicBooksById(selectedIdList);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(selectedIdList);
    Mockito.verify(httpSession, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test(expected = ComicBookException.class)
  public void testDownloadComicFileServiceException() throws IOException, ComicBookException {
    Mockito.when(comicBookService.getComicContent(Mockito.anyLong()))
        .thenThrow(ComicBookException.class);

    try {
      controller.downloadComic(TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicBookService, Mockito.times(1)).getComicContent(TEST_COMIC_ID);
    }
  }

  @Test
  public void testDownloadComic() throws IOException, ComicBookException {
    Mockito.when(comicBookService.getComicContent(Mockito.anyLong())).thenReturn(comicBookContent);

    final DownloadDocument result = controller.downloadComic(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(comicBookContent, result);

    Mockito.verify(comicBookService, Mockito.times(1)).getComicContent(TEST_COMIC_ID);
  }

  @Test(expected = ComicBookException.class)
  public void testGetCachedCoverImageForInvalidComicBook() throws ComicBookException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenThrow(ComicBookException.class);

    try {
      controller.getCoverImage(TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    }
  }

  @Test(expected = ComicBookException.class)
  public void testGetCachedCoverImageNoPageContent() throws ComicBookException, ComicPageException {
    Mockito.when(pageCacheService.getPageContent(Mockito.anyLong(), Mockito.anyString()))
        .thenThrow(ComicPageException.class);

    try {
      controller.getCoverImage(TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
      Mockito.verify(pageCacheService, Mockito.times(1))
          .getPageContent(TEST_PAGE_ID, MISSING_COMIC_COVER);
    }
  }

  @Test
  public void testGetCachedCoverImage() throws ComicBookException, ComicPageException {
    Mockito.when(pageCacheService.getPageContent(Mockito.anyLong(), Mockito.anyString()))
        .thenReturn(responseEntity);

    final ResponseEntity<byte[]> result = controller.getCoverImage(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(responseEntity, result);

    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(pageCacheService, Mockito.times(1))
        .getPageContent(TEST_PAGE_ID, MISSING_COMIC_COVER);
  }

  @Test
  public void testDeleteMetadata() throws ComicBookException {
    Mockito.when(comicBookService.deleteMetadata(Mockito.anyLong())).thenReturn(comicBook);

    final ComicBook result = controller.deleteMetadata(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookService, Mockito.times(1)).deleteMetadata(TEST_COMIC_ID);
  }

  @Test(expected = ComicBookException.class)
  public void testSavePageOrderServiceException() throws ComicBookException {
    Mockito.doThrow(ComicBookException.class)
        .when(comicBookService)
        .savePageOrder(Mockito.anyLong(), Mockito.anyList());

    try {
      controller.savePageOrder(TEST_COMIC_ID, new SavePageOrderRequest(pageOrderEntrylist));
    } finally {
      Mockito.verify(comicBookService, Mockito.times(1))
          .savePageOrder(TEST_COMIC_ID, pageOrderEntrylist);
    }
  }

  @Test
  public void testSavePageOrder() throws ComicBookException {
    controller.savePageOrder(TEST_COMIC_ID, new SavePageOrderRequest(pageOrderEntrylist));

    Mockito.verify(comicBookService, Mockito.times(1))
        .savePageOrder(TEST_COMIC_ID, pageOrderEntrylist);
  }

  @Test
  public void testLoadComicDetailList() throws LastReadException, ComicBookSelectionException {
    Mockito.when(
            comicDetailService.loadComicDetailList(
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
                TEST_SORT_FIELD,
                TEST_SORT_DIRECTION))
        .thenReturn(comicDetailList);
    Mockito.when(
            comicDetailService.getCoverYears(
                TEST_COVER_YEAR,
                TEST_COVER_MONTH,
                TEST_ARCHIVE_TYPE,
                TEST_COMIC_TYPE,
                TEST_COMIC_STATE,
                TEST_UNSCRAPED_STATE,
                TEST_SEARCH_TEXT,
                TEST_PUBLISHER,
                TEST_SERIES,
                TEST_VOLUME))
        .thenReturn(coverYearList);
    Mockito.when(
            comicDetailService.getCoverMonths(
                TEST_COVER_YEAR,
                TEST_COVER_MONTH,
                TEST_ARCHIVE_TYPE,
                TEST_COMIC_TYPE,
                TEST_COMIC_STATE,
                TEST_UNSCRAPED_STATE,
                TEST_SEARCH_TEXT,
                TEST_PUBLISHER,
                TEST_SERIES,
                TEST_VOLUME))
        .thenReturn(coverMonthList);
    Mockito.when(
            comicDetailService.loadComicDetailList(
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
                TEST_SORT_FIELD,
                TEST_SORT_DIRECTION))
        .thenReturn(comicDetailList);
    Mockito.when(
            comicDetailService.getFilterCount(
                TEST_COVER_YEAR,
                TEST_COVER_MONTH,
                TEST_ARCHIVE_TYPE,
                TEST_COMIC_TYPE,
                TEST_COMIC_STATE,
                TEST_UNSCRAPED_STATE,
                TEST_SEARCH_TEXT,
                TEST_PUBLISHER,
                TEST_SERIES,
                TEST_VOLUME))
        .thenReturn(TEST_TOTAL_COMIC_COUNT);

    final LoadComicDetailsResponse result =
        controller.loadComicDetailList(
            httpSession,
            principal,
            new LoadComicDetailsRequest(
                TEST_PAGE_SIZE,
                TEST_PAGE_INDEX,
                TEST_COVER_YEAR,
                TEST_COVER_MONTH,
                TEST_ARCHIVE_TYPE,
                TEST_COMIC_TYPE,
                TEST_COMIC_STATE,
                false,
                TEST_UNSCRAPED_STATE,
                TEST_SEARCH_TEXT,
                TEST_PUBLISHER,
                TEST_SERIES,
                TEST_VOLUME,
                TEST_SORT_FIELD,
                TEST_SORT_DIRECTION));

    assertNotNull(result);
    assertSame(comicDetailList, result.getComicDetails());
    assertSame(coverYearList, result.getCoverYears());
    assertSame(coverMonthList, result.getCoverMonths());
    assertEquals(TEST_COMIC_BOOK_COUNT, result.getTotalCount());
    assertEquals(TEST_TOTAL_COMIC_COUNT, result.getFilteredCount());
  }

  @Test
  public void testLoadSelectedComicDetailList()
      throws LastReadException, ComicBookSelectionException {
    Mockito.when(
            comicDetailService.loadComicDetailList(
                TEST_PAGE_SIZE,
                TEST_PAGE_INDEX,
                TEST_SORT_FIELD,
                TEST_SORT_DIRECTION,
                selectedIdList))
        .thenReturn(comicDetailList);

    final LoadComicDetailsResponse result =
        controller.loadComicDetailList(
            httpSession,
            principal,
            new LoadComicDetailsRequest(
                TEST_PAGE_SIZE,
                TEST_PAGE_INDEX,
                TEST_COVER_YEAR,
                TEST_COVER_MONTH,
                TEST_ARCHIVE_TYPE,
                TEST_COMIC_TYPE,
                TEST_COMIC_STATE,
                true,
                TEST_UNSCRAPED_STATE,
                TEST_SEARCH_TEXT,
                TEST_PUBLISHER,
                TEST_SERIES,
                TEST_VOLUME,
                TEST_SORT_FIELD,
                TEST_SORT_DIRECTION));

    assertNotNull(result);
    assertSame(comicDetailList, result.getComicDetails());
    assertSame(Collections.emptyList(), result.getCoverYears());
    assertSame(Collections.emptyList(), result.getCoverMonths());
    assertEquals(selectedIdList.size(), result.getTotalCount());
    assertEquals(comicDetailList.size(), result.getFilteredCount());
  }

  @Test
  public void testLoadComicDetailsById() throws LastReadException {
    Mockito.when(comicDetailService.loadComicDetailListById(Mockito.anySet()))
        .thenReturn(comicDetailList);
    Mockito.when(comicDetailService.getCoverYears(Mockito.anySet())).thenReturn(coverYearList);
    Mockito.when(comicDetailService.getCoverMonths(Mockito.anySet())).thenReturn(coverMonthList);

    final LoadComicDetailsResponse result =
        controller.loadComicDetailListById(
            principal, new LoadComicDetailsByIdRequest(comicBookIdSet));

    assertNotNull(result);
    assertSame(comicDetailList, result.getComicDetails());
    assertSame(coverYearList, result.getCoverYears());
    assertSame(coverMonthList, result.getCoverMonths());
    assertEquals(comicBookIdSet.size(), result.getTotalCount());
    assertEquals(comicBookIdSet.size(), result.getFilteredCount());

    Mockito.verify(comicDetailService, Mockito.times(1)).loadComicDetailListById(comicBookIdSet);
  }

  @Test
  public void testLoadComicDetailsForTag() throws LastReadException {
    Mockito.when(
            comicDetailService.loadComicDetailListForTagType(
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.any(ComicTagType.class),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString()))
        .thenReturn(comicDetailList);
    Mockito.when(
            comicDetailService.getCoverYears(Mockito.any(ComicTagType.class), Mockito.anyString()))
        .thenReturn(coverYearList);
    Mockito.when(
            comicDetailService.getCoverMonths(Mockito.any(ComicTagType.class), Mockito.anyString()))
        .thenReturn(coverMonthList);
    Mockito.when(
            comicDetailService.getFilterCount(Mockito.any(ComicTagType.class), Mockito.anyString()))
        .thenReturn(TEST_FILTER_COUNT);

    final LoadComicDetailsResponse result =
        controller.loadComicDetailListForTag(
            principal,
            new LoadComicDetailsForTagRequest(
                TEST_PAGE_SIZE,
                TEST_PAGE_INDEX,
                TEST_TAG_TYPE.getValue(),
                TEST_TAG_VALUE,
                TEST_SORT_FIELD,
                TEST_SORT_DIRECTION));

    assertNotNull(result);
    assertSame(comicDetailList, result.getComicDetails());
    assertSame(coverYearList, result.getCoverYears());
    assertSame(coverMonthList, result.getCoverMonths());
    assertEquals(TEST_COMIC_BOOK_COUNT, result.getTotalCount());
    assertEquals(TEST_FILTER_COUNT, result.getFilteredCount());

    Mockito.verify(comicDetailService, Mockito.times(1))
        .loadComicDetailListForTagType(
            TEST_PAGE_SIZE,
            TEST_PAGE_INDEX,
            TEST_TAG_TYPE,
            TEST_TAG_VALUE,
            TEST_SORT_FIELD,
            TEST_SORT_DIRECTION);
    Mockito.verify(comicDetailService, Mockito.times(1))
        .getCoverYears(TEST_TAG_TYPE, TEST_TAG_VALUE);
    Mockito.verify(comicDetailService, Mockito.times(1))
        .getCoverMonths(TEST_TAG_TYPE, TEST_TAG_VALUE);
    Mockito.verify(comicDetailService, Mockito.times(1))
        .getFilterCount(TEST_TAG_TYPE, TEST_TAG_VALUE);
  }

  @Test
  public void testLoadUnreadComicDetails() throws LastReadException {
    Mockito.when(
            comicDetailService.loadUnreadComicDetails(
                Mockito.anyString(),
                Mockito.anyBoolean(),
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.anyString(),
                Mockito.anyString()))
        .thenReturn(comicDetailList);
    Mockito.when(lastReadService.getUnreadCountForUser(Mockito.anyString()))
        .thenReturn(TEST_UNREAD_COMIC_COUNT);

    final LoadComicDetailsResponse result =
        controller.loadUnreadComicDetailList(
            principal,
            new LoadUnreadComicDetailsRequest(
                true, TEST_PAGE_SIZE, TEST_PAGE_INDEX, TEST_SORT_FIELD, TEST_SORT_DIRECTION));

    assertNotNull(result);
    assertSame(comicDetailList, result.getComicDetails());
    assertTrue(result.getCoverYears().isEmpty());
    assertTrue(result.getCoverMonths().isEmpty());
    assertEquals(TEST_COMIC_BOOK_COUNT, result.getTotalCount());
    assertEquals(TEST_COMIC_BOOK_COUNT - TEST_UNREAD_COMIC_COUNT, result.getFilteredCount());

    Mockito.verify(comicDetailService, Mockito.times(1))
        .loadUnreadComicDetails(
            TEST_EMAIL,
            true,
            TEST_PAGE_SIZE,
            TEST_PAGE_INDEX,
            TEST_SORT_FIELD,
            TEST_SORT_DIRECTION);
    Mockito.verify(lastReadService, Mockito.times(1)).getUnreadCountForUser(TEST_EMAIL);
  }

  @Test
  public void testLoadReadComicDetails() throws LastReadException {
    Mockito.when(
            comicDetailService.loadUnreadComicDetails(
                Mockito.anyString(),
                Mockito.anyBoolean(),
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.anyString(),
                Mockito.anyString()))
        .thenReturn(comicDetailList);
    Mockito.when(comicBookService.getComicBookCount()).thenReturn(TEST_COMIC_BOOK_COUNT);
    Mockito.when(lastReadService.getUnreadCountForUser(Mockito.anyString()))
        .thenReturn(TEST_UNREAD_COMIC_COUNT);

    final LoadComicDetailsResponse result =
        controller.loadUnreadComicDetailList(
            principal,
            new LoadUnreadComicDetailsRequest(
                false, TEST_PAGE_SIZE, TEST_PAGE_INDEX, TEST_SORT_FIELD, TEST_SORT_DIRECTION));

    assertNotNull(result);
    assertSame(comicDetailList, result.getComicDetails());
    assertTrue(result.getCoverYears().isEmpty());
    assertTrue(result.getCoverMonths().isEmpty());
    assertEquals(TEST_COMIC_BOOK_COUNT, result.getTotalCount());
    assertEquals(TEST_UNREAD_COMIC_COUNT, result.getFilteredCount());

    Mockito.verify(comicDetailService, Mockito.times(1))
        .loadUnreadComicDetails(
            TEST_EMAIL,
            false,
            TEST_PAGE_SIZE,
            TEST_PAGE_INDEX,
            TEST_SORT_FIELD,
            TEST_SORT_DIRECTION);
    Mockito.verify(comicBookService, Mockito.times(1)).getComicBookCount();
    Mockito.verify(lastReadService, Mockito.times(1)).getUnreadCountForUser(TEST_EMAIL);
  }

  @Test
  public void testLoadForReadingList()
      throws ReadingListException, LastReadException, ComicDetailException {
    Mockito.when(readingListService.getEntryCount(Mockito.anyLong()))
        .thenReturn(TEST_COMIC_BOOK_COUNT);
    Mockito.when(
            comicDetailService.loadComicDetailsForReadingList(
                Mockito.anyString(),
                Mockito.anyLong(),
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.anyString(),
                Mockito.anyString()))
        .thenReturn(comicDetailList);

    final LoadComicDetailsResponse result =
        controller.loadComicDetailsForReadingList(
            principal,
            new LoadComicDetailsForReadingListRequest(
                TEST_PAGE_SIZE, TEST_PAGE_INDEX, TEST_SORT_FIELD, TEST_SORT_DIRECTION),
            TEST_READING_LIST_ID);

    assertNotNull(result);
    assertSame(comicDetailList, result.getComicDetails());
    assertTrue(result.getCoverYears().isEmpty());
    assertTrue(result.getCoverMonths().isEmpty());
    assertEquals(TEST_COMIC_BOOK_COUNT, result.getTotalCount());
    assertEquals(TEST_COMIC_BOOK_COUNT, result.getFilteredCount());

    Mockito.verify(comicDetailService, Mockito.times(1))
        .loadComicDetailsForReadingList(
            TEST_EMAIL,
            TEST_READING_LIST_ID,
            TEST_PAGE_SIZE,
            TEST_PAGE_INDEX,
            TEST_SORT_FIELD,
            TEST_SORT_DIRECTION);
    Mockito.verify(readingListService, Mockito.times(2)).getEntryCount(TEST_READING_LIST_ID);
  }
}

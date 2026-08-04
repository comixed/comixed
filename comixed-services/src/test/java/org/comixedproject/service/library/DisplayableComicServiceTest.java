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

package org.comixedproject.service.library;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Stream;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.comicbooks.ComicType;
import org.comixedproject.model.library.DisplayableComic;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.library.DisplayableComicRepository;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.comixedproject.service.lists.ReadingListException;
import org.comixedproject.service.lists.ReadingListService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class DisplayableComicServiceTest {
  private static final Integer TEST_PAGE_SIZE = 25;
  private static final Integer TEST_PAGE_INDEX = 3;
  private static final Integer TEST_COVER_YEAR = 2025;
  private static final Integer TEST_COVER_MONTH = 3;
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CBZ;
  private static final ComicType TEST_COMIC_TYPE = ComicType.MANGA;
  private static final ComicState TEST_COMIC_STATE = ComicState.STABLE;
  private static final Boolean TEST_UNSCRAPED_STATE = RandomUtils.nextBoolean();
  private static final Boolean TEST_MISSING_STATE = RandomUtils.nextBoolean();
  private static final String TEST_SEARCH_TEXT = "The search text";
  private static final String TEST_PUBLISHER = "The Publisher";
  private static final String TEST_SERIES = "The Series";
  private static final String TEST_VOLUME = "2025";
  private static final String TEST_ISSUE_NUMBER = "129";
  private static final Date TEST_COVER_DATE = new Date();
  private static final Integer TEST_PAGE_COUNT = 77;
  private static final String TEST_SORT_BY = "series";
  private static final String TEST_SORT_DIRECTION = "asc";
  private static final long TEST_COMIC_COUNT = 32567L;
  private static final ComicTagType TEST_TAG_TYPE =
      ComicTagType.values()[RandomUtils.nextInt(ComicTagType.values().length)];
  private static final String TEST_TAG_VALUE = "tag.value";
  private static final String TEST_EMAIL = "reader@comixedproject.org";
  private static final long TEST_READING_LIST_ID = 293L;
  private static final long TEST_COMIC_BOOK_ID = 717L;

  @InjectMocks private DisplayableComicService service;
  @Mock private DisplayableComicRepository displayableComicRepository;
  @Mock private ObjectFactory<DisplayableComicExampleBuilder> exampleBuilderObjectFactory;
  @Mock private ReadingListService readingListService;
  @Mock private DisplayableComicExampleBuilder exampleBuilder;
  @Mock private Example<DisplayableComic> displayableComicExample;
  @Mock private Stream<DisplayableComic> displayableComicStream;
  @Mock private Stream<Integer> distinctIntegerStream;
  @Mock private Stream<Integer> integerStream;
  @Mock private Page<DisplayableComic> displayableComicPage;
  @Mock private List<DisplayableComic> comicList;
  @Mock private List<Long> idList;
  @Mock private Stream<DisplayableComic> comicListStream;
  @Mock private List<Integer> yearList;
  @Mock private List<Integer> monthList;
  @Mock private Set<Long> readComicBookList;
  @Mock private ComiXedUser user;
  @Mock private ReadingList readingList;
  @Mock private DisplayableComic displayableComic;

  @Captor private ArgumentCaptor<Pageable> pageableArgumentCaptor;

  @BeforeEach
  void setUp() throws ReadingListException {
    when(exampleBuilderObjectFactory.getObject()).thenReturn(exampleBuilder);
    when(exampleBuilder.build()).thenReturn(displayableComicExample);
    when(displayableComicStream.toList()).thenReturn(comicList);
    when(displayableComicPage.stream()).thenReturn(displayableComicStream);
    when(integerStream.distinct()).thenReturn(distinctIntegerStream);
    when(comicListStream.map(Mockito.any(Function.class))).thenReturn(integerStream);
    when(comicList.stream()).thenReturn(comicListStream);

    when(user.getReadComicBooks()).thenReturn(readComicBookList);

    when(readingList.getReadingListId()).thenReturn(TEST_READING_LIST_ID);
    when(readingListService.loadReadingListForUser(Mockito.anyString(), Mockito.anyLong()))
        .thenReturn(readingList);
  }

  @Test
  void LoadComicsByFilter() {
    when(displayableComicRepository.findAll(
            Mockito.any(Example.class), pageableArgumentCaptor.capture()))
        .thenReturn(displayableComicPage);

    final List<DisplayableComic> result =
        service.loadComicsByFilter(
            TEST_PAGE_SIZE,
            TEST_PAGE_INDEX,
            TEST_COVER_YEAR,
            TEST_COVER_MONTH,
            TEST_ARCHIVE_TYPE,
            TEST_COMIC_TYPE,
            TEST_COMIC_STATE,
            TEST_UNSCRAPED_STATE,
            TEST_MISSING_STATE,
            TEST_SEARCH_TEXT,
            TEST_PUBLISHER,
            TEST_SERIES,
            TEST_VOLUME,
            TEST_PAGE_COUNT,
            TEST_SORT_BY,
            TEST_SORT_DIRECTION);

    assertNotNull(result);
    assertSame(comicList, result);

    final Pageable pageable = pageableArgumentCaptor.getValue();
    assertEquals(TEST_PAGE_INDEX, pageable.getPageNumber());
    assertEquals(TEST_PAGE_SIZE, pageable.getPageSize());

    verify(displayableComicRepository).findAll(displayableComicExample, pageable);
  }

  @Test
  void LoadComicsByFilter_noPageSizeOrIndex() {
    when(displayableComicRepository.findAll(Mockito.any(Example.class))).thenReturn(comicList);

    final List<DisplayableComic> result =
        service.loadComicsByFilter(
            null,
            TEST_PAGE_INDEX,
            TEST_COVER_YEAR,
            TEST_COVER_MONTH,
            TEST_ARCHIVE_TYPE,
            TEST_COMIC_TYPE,
            TEST_COMIC_STATE,
            TEST_UNSCRAPED_STATE,
            TEST_MISSING_STATE,
            TEST_SEARCH_TEXT,
            TEST_PUBLISHER,
            TEST_SERIES,
            TEST_VOLUME,
            TEST_PAGE_COUNT,
            TEST_SORT_BY,
            TEST_SORT_DIRECTION);

    assertNotNull(result);
    assertSame(comicList, result);

    verify(displayableComicRepository).findAll(displayableComicExample);
  }

  @Test
  void LoadComicsByFilter_noPageIndex() {
    when(displayableComicRepository.findAll(Mockito.any(Example.class))).thenReturn(comicList);

    final List<DisplayableComic> result =
        service.loadComicsByFilter(
            TEST_PAGE_SIZE,
            null,
            TEST_COVER_YEAR,
            TEST_COVER_MONTH,
            TEST_ARCHIVE_TYPE,
            TEST_COMIC_TYPE,
            TEST_COMIC_STATE,
            TEST_UNSCRAPED_STATE,
            TEST_MISSING_STATE,
            TEST_SEARCH_TEXT,
            TEST_PUBLISHER,
            TEST_SERIES,
            TEST_VOLUME,
            TEST_PAGE_COUNT,
            TEST_SORT_BY,
            TEST_SORT_DIRECTION);

    assertNotNull(result);
    assertSame(comicList, result);

    verify(displayableComicRepository).findAll(displayableComicExample);
  }

  @Test
  void GetCoverYearsForFilter() {
    when(displayableComicRepository.findAll(Mockito.any(Example.class))).thenReturn(comicList);
    when(distinctIntegerStream.toList()).thenReturn(yearList);

    final List<Integer> result =
        service.getCoverYearsForFilter(
            TEST_ARCHIVE_TYPE,
            TEST_COMIC_TYPE,
            TEST_COMIC_STATE,
            TEST_UNSCRAPED_STATE,
            TEST_MISSING_STATE,
            TEST_SEARCH_TEXT,
            TEST_PUBLISHER,
            TEST_SERIES,
            TEST_VOLUME,
            TEST_PAGE_COUNT);

    assertNotNull(result);
    assertSame(yearList, result);

    verify(displayableComicRepository).findAll(displayableComicExample);
  }

  @Test
  void GetCoverMonthsForFilter() {
    when(displayableComicRepository.findAll(Mockito.any(Example.class))).thenReturn(comicList);
    when(distinctIntegerStream.toList()).thenReturn(monthList);

    final List<Integer> result =
        service.getCoverMonthsForFilter(
            TEST_ARCHIVE_TYPE,
            TEST_COMIC_TYPE,
            TEST_COMIC_STATE,
            TEST_UNSCRAPED_STATE,
            TEST_MISSING_STATE,
            TEST_SEARCH_TEXT,
            TEST_PUBLISHER,
            TEST_SERIES,
            TEST_VOLUME,
            TEST_PAGE_COUNT);

    assertNotNull(result);
    assertSame(monthList, result);

    verify(displayableComicRepository).findAll(displayableComicExample);
  }

  @Test
  void GetComicCountForFilter() {
    when(displayableComicRepository.count(Mockito.any(Example.class))).thenReturn(TEST_COMIC_COUNT);

    final long result =
        service.getComicCountForFilter(
            TEST_COVER_YEAR,
            TEST_COVER_MONTH,
            TEST_ARCHIVE_TYPE,
            TEST_COMIC_TYPE,
            TEST_COMIC_STATE,
            TEST_UNSCRAPED_STATE,
            TEST_MISSING_STATE,
            TEST_SEARCH_TEXT,
            TEST_PUBLISHER,
            TEST_SERIES,
            TEST_VOLUME,
            TEST_PAGE_COUNT);

    assertEquals(TEST_COMIC_COUNT, result);

    verify(displayableComicRepository).count(displayableComicExample);
  }

  @Test
  void LoadComicsById() {
    when(displayableComicRepository.loadComicsById(Mockito.any(), pageableArgumentCaptor.capture()))
        .thenReturn(comicList);

    final List<DisplayableComic> result =
        service.loadComicsById(
            TEST_PAGE_SIZE, TEST_PAGE_INDEX, TEST_SORT_BY, TEST_SORT_DIRECTION, idList);

    assertNotNull(result);
    assertSame(comicList, result);

    final Pageable pageable = pageableArgumentCaptor.getValue();
    assertEquals(TEST_PAGE_INDEX, pageable.getPageNumber());
    assertEquals(TEST_PAGE_SIZE, pageable.getPageSize());

    verify(displayableComicRepository).loadComicsById(idList, pageable);
  }

  @Test
  void LoadComicsByTagTypeAndValue() {
    when(displayableComicRepository.loadComicsByTagTypeAndValue(
            Mockito.any(ComicTagType.class), Mockito.anyString(), pageableArgumentCaptor.capture()))
        .thenReturn(comicList);

    final List<DisplayableComic> result =
        service.loadComicsByTagTypeAndValue(
            TEST_PAGE_SIZE,
            TEST_PAGE_INDEX,
            TEST_TAG_TYPE,
            TEST_TAG_VALUE,
            TEST_SORT_BY,
            TEST_SORT_DIRECTION);

    assertNotNull(result);
    assertSame(comicList, result);

    final Pageable pageable = pageableArgumentCaptor.getValue();
    assertEquals(TEST_PAGE_INDEX, pageable.getPageNumber());
    assertEquals(TEST_PAGE_SIZE, pageable.getPageSize());

    verify(displayableComicRepository)
        .loadComicsByTagTypeAndValue(TEST_TAG_TYPE, TEST_TAG_VALUE, pageable);
  }

  @Test
  void GetIdsByPublisher() {
    when(displayableComicRepository.getIdsByPublisher(Mockito.anyString())).thenReturn(idList);

    final List<Long> result = service.getIdsByPublisher(TEST_PUBLISHER);

    assertNotNull(result);
    assertSame(idList, result);

    verify(displayableComicRepository).getIdsByPublisher(TEST_PUBLISHER);
  }

  @Test
  void GetIdsByPublisherAndSeriesAndVolume() {
    when(displayableComicRepository.getIdsByPublisherSeriesAndVolume(
            Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(idList);

    final List<Long> result =
        service.getIdsByPublisherSeriesAndVolume(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME);

    assertNotNull(result);
    assertSame(idList, result);

    verify(displayableComicRepository)
        .getIdsByPublisherSeriesAndVolume(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME);
  }

  @Test
  void GetCoverYearsForTagTypeAndValue() {
    when(displayableComicRepository.getCoverYearsForTagTypeAndValue(
            Mockito.any(ComicTagType.class), Mockito.anyString()))
        .thenReturn(yearList);

    final List<Integer> result =
        service.getCoverYearsForTagTypeAndValue(TEST_TAG_TYPE, TEST_TAG_VALUE);

    assertNotNull(result);
    assertSame(yearList, result);

    verify(displayableComicRepository)
        .getCoverYearsForTagTypeAndValue(TEST_TAG_TYPE, TEST_TAG_VALUE);
  }

  @Test
  void GetCoverMonthForTagTypeAndValue() {
    when(displayableComicRepository.getCoverMonthsForTagTypeAndValue(
            Mockito.any(ComicTagType.class), Mockito.anyString()))
        .thenReturn(monthList);

    final List<Integer> result =
        service.getCoverMonthsForTagTypeAndValue(TEST_TAG_TYPE, TEST_TAG_VALUE);

    assertNotNull(result);
    assertSame(monthList, result);

    verify(displayableComicRepository)
        .getCoverMonthsForTagTypeAndValue(TEST_TAG_TYPE, TEST_TAG_VALUE);
  }

  @Test
  void GetComicCountForTagTypeAndValue() {
    when(displayableComicRepository.getComicCountForTagTypeAndValue(
            Mockito.any(ComicTagType.class), Mockito.anyString()))
        .thenReturn(TEST_COMIC_COUNT);

    final long result = service.getComicCountForTagTypeAndValue(TEST_TAG_TYPE, TEST_TAG_VALUE);

    assertEquals(TEST_COMIC_COUNT, result);

    verify(displayableComicRepository)
        .getComicCountForTagTypeAndValue(TEST_TAG_TYPE, TEST_TAG_VALUE);
  }

  @Test
  void LoadUnreadComics() {
    when(displayableComicRepository.loadUnreadComics(
            Mockito.anySet(), pageableArgumentCaptor.capture()))
        .thenReturn(comicList);

    final List<DisplayableComic> result =
        service.loadUnreadComics(
            user, TEST_PAGE_SIZE, TEST_PAGE_INDEX, TEST_SORT_BY, TEST_SORT_DIRECTION);

    assertNotNull(result);
    assertSame(comicList, result);

    final Pageable pageable = pageableArgumentCaptor.getValue();
    assertEquals(TEST_PAGE_INDEX, pageable.getPageNumber());
    assertEquals(TEST_PAGE_SIZE, pageable.getPageSize());

    verify(displayableComicRepository).loadUnreadComics(readComicBookList, pageable);
  }

  @Test
  void LoadReadComics() {
    when(displayableComicRepository.loadReadComics(
            Mockito.anySet(), pageableArgumentCaptor.capture()))
        .thenReturn(comicList);

    final List<DisplayableComic> result =
        service.loadReadComics(
            user, TEST_PAGE_SIZE, TEST_PAGE_INDEX, TEST_SORT_BY, TEST_SORT_DIRECTION);

    assertNotNull(result);
    assertSame(comicList, result);

    final Pageable pageable = pageableArgumentCaptor.getValue();
    assertEquals(TEST_PAGE_INDEX, pageable.getPageNumber());
    assertEquals(TEST_PAGE_SIZE, pageable.getPageSize());

    verify(displayableComicRepository).loadReadComics(readComicBookList, pageable);
  }

  @Test
  void LoadComicsForList() throws LibraryException, ReadingListException {
    when(displayableComicRepository.loadComicsForList(
            Mockito.anyLong(), pageableArgumentCaptor.capture()))
        .thenReturn(comicList);

    final List<DisplayableComic> result =
        service.loadComicsForList(
            TEST_EMAIL,
            TEST_READING_LIST_ID,
            TEST_PAGE_SIZE,
            TEST_PAGE_INDEX,
            TEST_SORT_BY,
            TEST_SORT_DIRECTION);

    assertNotNull(result);
    assertSame(comicList, result);

    final Pageable pageable = pageableArgumentCaptor.getValue();
    assertEquals(TEST_PAGE_INDEX, pageable.getPageNumber());
    assertEquals(TEST_PAGE_SIZE, pageable.getPageSize());

    verify(readingListService).loadReadingListForUser(TEST_EMAIL, TEST_READING_LIST_ID);
    verify(readingList).getReadingListId();
    verify(displayableComicRepository).loadComicsForList(TEST_READING_LIST_ID, pageable);
  }

  @Test
  void loadComicsForList_noSuchList() throws ReadingListException {
    when(readingListService.loadReadingListForUser(Mockito.anyString(), Mockito.anyLong()))
        .thenThrow(ReadingListException.class);

    assertThrows(
        LibraryException.class,
        () ->
            service.loadComicsForList(
                TEST_EMAIL,
                TEST_READING_LIST_ID,
                TEST_PAGE_SIZE,
                TEST_PAGE_INDEX,
                TEST_SORT_BY,
                TEST_SORT_DIRECTION));
  }

  @Test
  void loadComics() {
    when(displayableComicRepository.loadComics(
            Mockito.anyString(),
            Mockito.anyString(),
            Mockito.anyString(),
            Mockito.anyString(),
            pageableArgumentCaptor.capture()))
        .thenReturn(comicList);

    final List<DisplayableComic> result =
        service.loadComics(
            TEST_PUBLISHER,
            TEST_SERIES,
            TEST_VOLUME,
            TEST_ISSUE_NUMBER,
            TEST_COVER_DATE,
            TEST_PAGE_INDEX,
            TEST_PAGE_SIZE,
            TEST_SORT_BY,
            TEST_SORT_DIRECTION);

    assertNotNull(result);
    assertSame(comicList, result);

    final Pageable pageable = pageableArgumentCaptor.getValue();
    assertEquals(TEST_PAGE_INDEX, pageable.getPageNumber());
    assertEquals(TEST_PAGE_SIZE, pageable.getPageSize());

    verify(displayableComicRepository)
        .loadComics(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER, pageable);
  }

  @Test
  void getComicCount() {
    when(displayableComicRepository.getComicCount(
            Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(TEST_COMIC_COUNT);

    final long result =
        service.getComicCount(
            TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER, TEST_COVER_DATE);

    assertEquals(TEST_COMIC_COUNT, result);

    verify(displayableComicRepository)
        .getComicCount(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER);
  }

  @Test
  void createExample() {

    final Example<DisplayableComic> result =
        service.doCreateExample(
            TEST_COVER_YEAR,
            TEST_COVER_MONTH,
            TEST_ARCHIVE_TYPE,
            TEST_COMIC_TYPE,
            TEST_COMIC_STATE,
            TEST_UNSCRAPED_STATE,
            TEST_MISSING_STATE,
            TEST_SEARCH_TEXT,
            TEST_PUBLISHER,
            TEST_SERIES,
            TEST_VOLUME,
            TEST_PAGE_COUNT);

    assertNotNull(result);
    assertSame(displayableComicExample, result);

    verify(exampleBuilder).setCoverYear(TEST_COVER_YEAR);
    verify(exampleBuilder).setCoverMonth(TEST_COVER_MONTH);
    verify(exampleBuilder).setArchiveType(TEST_ARCHIVE_TYPE);
    verify(exampleBuilder).setComicType(TEST_COMIC_TYPE);
    verify(exampleBuilder).setComicState(TEST_COMIC_STATE);
    verify(exampleBuilder).setUnscrapedState(TEST_UNSCRAPED_STATE);
    verify(exampleBuilder).setSearchText(TEST_SEARCH_TEXT);
    verify(exampleBuilder).setPublisher(TEST_PUBLISHER);
    verify(exampleBuilder).setSeries(TEST_SERIES);
    verify(exampleBuilder).setVolume(TEST_VOLUME);
  }

  @Test
  void createSort_noFields() {
    final Sort result = service.doCreateSort(null, null);

    assertSame(Sort.unsorted(), result);
  }

  @Test
  void createSort() {
    final String[][] fields =
        new String[][] {
          {"unknown", "comicDetailId"},
          {"archive-type", "archiveType"},
          {"comic-state", "comicState"},
          {"comic-type", "comicType"},
          {"publisher", "publisher"},
          {"series", "series"},
          {"volume", "volume"},
          {"issue-number", "sortableIssueNumber"},
          {"page-count", "pageCount"},
          {"added-date", "addedDate"},
          {"cover-date", "coverDate"},
          {"comic-count", "comicCount"},
          {"tag-value", "value"}
        };

    for (String[] field : fields) {
      // ascending
      Sort result = service.doCreateSort(field[0], "asc");

      assertNotNull(result);
      assertEquals(String.format("%s: ASC", field[1]), result.toString());

      // descending
      result = service.doCreateSort(field[0], "desc");

      assertNotNull(result);
      assertEquals(String.format("%s: DESC", field[1]), result.toString());
    }
  }

  @Test
  void getForComicBookId_notFound() {
    when(displayableComicRepository.getByComicBookId(TEST_COMIC_BOOK_ID)).thenReturn(null);

    assertThrows(ComicBookException.class, () -> service.getForComicBookId(TEST_COMIC_BOOK_ID));

    verify(displayableComicRepository).getByComicBookId(TEST_COMIC_BOOK_ID);
  }

  @Test
  void getForComicBookId() throws ComicBookException {
    when(displayableComicRepository.getByComicBookId(TEST_COMIC_BOOK_ID))
        .thenReturn(displayableComic);

    final DisplayableComic result = service.getForComicBookId(TEST_COMIC_BOOK_ID);

    assertNotNull(result);
    assertSame(displayableComic, result);

    verify(displayableComicRepository).getByComicBookId(TEST_COMIC_BOOK_ID);
  }
}

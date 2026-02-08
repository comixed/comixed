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

  @InjectMocks private DisplayableComicService service;
  @Mock private DisplayableComicRepository displayableComicRepository;
  @Mock private ObjectFactory<DisplayableComicExampleBuilder> exampleBuilderObjectFactory;
  @Mock private ReadingListService readingListService;
  @Mock private DisplayableComicExampleBuilder exampleBuilder;
  @Mock private Example<DisplayableComic> displayableComicExample;
  @Mock private Stream<DisplayableComic> displayableComicStream;
  @Mock private Stream<Integer> distinctIntegerStream;
  @Mock private Stream<Integer> integerStream;
  @Mock private Stream<Long> longStream;
  @Mock private Page<DisplayableComic> displayableComicPage;
  @Mock private List<DisplayableComic> comicList;
  @Mock private List<Long> idList;
  @Mock private Stream<DisplayableComic> comicListStream;
  @Mock private List<Integer> yearList;
  @Mock private List<Integer> monthList;
  @Mock private Set<Long> readComicBookList;
  @Mock private ComiXedUser user;
  @Mock private ReadingList readingList;

  @Captor private ArgumentCaptor<Pageable> pageableArgumentCaptor;

  @BeforeEach
  public void setUp() throws ReadingListException {
    Mockito.when(exampleBuilderObjectFactory.getObject()).thenReturn(exampleBuilder);
    Mockito.when(exampleBuilder.build()).thenReturn(displayableComicExample);
    Mockito.when(displayableComicStream.toList()).thenReturn(comicList);
    Mockito.when(displayableComicPage.stream()).thenReturn(displayableComicStream);
    Mockito.when(integerStream.distinct()).thenReturn(distinctIntegerStream);
    Mockito.when(comicListStream.map(Mockito.any(Function.class))).thenReturn(integerStream);
    Mockito.when(comicList.stream()).thenReturn(comicListStream);

    Mockito.when(user.getReadComicBooks()).thenReturn(readComicBookList);

    Mockito.when(readingList.getReadingListId()).thenReturn(TEST_READING_LIST_ID);
    Mockito.when(readingListService.loadReadingListForUser(Mockito.anyString(), Mockito.anyLong()))
        .thenReturn(readingList);
  }

  @Test
  void LoadComicsByFilter() {
    Mockito.when(
            displayableComicRepository.findAll(
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

    Mockito.verify(displayableComicRepository, Mockito.times(1))
        .findAll(displayableComicExample, pageable);
  }

  @Test
  void LoadComicsByFilter_noPageSizeOrIndex() {
    Mockito.when(displayableComicRepository.findAll(Mockito.any(Example.class)))
        .thenReturn(comicList);

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

    Mockito.verify(displayableComicRepository, Mockito.times(1)).findAll(displayableComicExample);
  }

  @Test
  void LoadComicsByFilter_noPageIndex() {
    Mockito.when(displayableComicRepository.findAll(Mockito.any(Example.class)))
        .thenReturn(comicList);

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

    Mockito.verify(displayableComicRepository, Mockito.times(1)).findAll(displayableComicExample);
  }

  @Test
  void GetCoverYearsForFilter() {
    Mockito.when(displayableComicRepository.findAll(Mockito.any(Example.class)))
        .thenReturn(comicList);
    Mockito.when(distinctIntegerStream.toList()).thenReturn(yearList);

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

    Mockito.verify(displayableComicRepository, Mockito.times(1)).findAll(displayableComicExample);
  }

  @Test
  void GetCoverMonthsForFilter() {
    Mockito.when(displayableComicRepository.findAll(Mockito.any(Example.class)))
        .thenReturn(comicList);
    Mockito.when(distinctIntegerStream.toList()).thenReturn(monthList);

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

    Mockito.verify(displayableComicRepository, Mockito.times(1)).findAll(displayableComicExample);
  }

  @Test
  void GetComicCountForFilter() {
    Mockito.when(displayableComicRepository.count(Mockito.any(Example.class)))
        .thenReturn(TEST_COMIC_COUNT);

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

    Mockito.verify(displayableComicRepository, Mockito.times(1)).count(displayableComicExample);
  }

  @Test
  void LoadComicsById() {
    Mockito.when(
            displayableComicRepository.loadComicsById(
                Mockito.any(), pageableArgumentCaptor.capture()))
        .thenReturn(comicList);

    final List<DisplayableComic> result =
        service.loadComicsById(
            TEST_PAGE_SIZE, TEST_PAGE_INDEX, TEST_SORT_BY, TEST_SORT_DIRECTION, idList);

    assertNotNull(result);
    assertSame(comicList, result);

    final Pageable pageable = pageableArgumentCaptor.getValue();
    assertEquals(TEST_PAGE_INDEX, pageable.getPageNumber());
    assertEquals(TEST_PAGE_SIZE, pageable.getPageSize());

    Mockito.verify(displayableComicRepository, Mockito.times(1)).loadComicsById(idList, pageable);
  }

  @Test
  void LoadComicsByTagTypeAndValue() {
    Mockito.when(
            displayableComicRepository.loadComicsByTagTypeAndValue(
                Mockito.any(ComicTagType.class),
                Mockito.anyString(),
                pageableArgumentCaptor.capture()))
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

    Mockito.verify(displayableComicRepository, Mockito.times(1))
        .loadComicsByTagTypeAndValue(TEST_TAG_TYPE, TEST_TAG_VALUE, pageable);
  }

  @Test
  void GetIdsByPublisher() {
    Mockito.when(displayableComicRepository.getIdsByPublisher(Mockito.anyString()))
        .thenReturn(idList);

    final List<Long> result = service.getIdsByPublisher(TEST_PUBLISHER);

    assertNotNull(result);
    assertSame(idList, result);

    Mockito.verify(displayableComicRepository, Mockito.times(1)).getIdsByPublisher(TEST_PUBLISHER);
  }

  @Test
  void GetIdsByPublisherAndSeriesAndVolume() {
    Mockito.when(
            displayableComicRepository.getIdsByPublisherSeriesAndVolume(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(idList);

    final List<Long> result =
        service.getIdsByPublisherSeriesAndVolume(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME);

    assertNotNull(result);
    assertSame(idList, result);

    Mockito.verify(displayableComicRepository, Mockito.times(1))
        .getIdsByPublisherSeriesAndVolume(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME);
  }

  @Test
  void GetCoverYearsForTagTypeAndValue() {
    Mockito.when(
            displayableComicRepository.getCoverYearsForTagTypeAndValue(
                Mockito.any(ComicTagType.class), Mockito.anyString()))
        .thenReturn(yearList);

    final List<Integer> result =
        service.getCoverYearsForTagTypeAndValue(TEST_TAG_TYPE, TEST_TAG_VALUE);

    assertNotNull(result);
    assertSame(yearList, result);

    Mockito.verify(displayableComicRepository, Mockito.times(1))
        .getCoverYearsForTagTypeAndValue(TEST_TAG_TYPE, TEST_TAG_VALUE);
  }

  @Test
  void GetCoverMonthForTagTypeAndValue() {
    Mockito.when(
            displayableComicRepository.getCoverMonthsForTagTypeAndValue(
                Mockito.any(ComicTagType.class), Mockito.anyString()))
        .thenReturn(monthList);

    final List<Integer> result =
        service.getCoverMonthsForTagTypeAndValue(TEST_TAG_TYPE, TEST_TAG_VALUE);

    assertNotNull(result);
    assertSame(monthList, result);

    Mockito.verify(displayableComicRepository, Mockito.times(1))
        .getCoverMonthsForTagTypeAndValue(TEST_TAG_TYPE, TEST_TAG_VALUE);
  }

  @Test
  void GetComicCountForTagTypeAndValue() {
    Mockito.when(
            displayableComicRepository.getComicCountForTagTypeAndValue(
                Mockito.any(ComicTagType.class), Mockito.anyString()))
        .thenReturn(TEST_COMIC_COUNT);

    final long result = service.getComicCountForTagTypeAndValue(TEST_TAG_TYPE, TEST_TAG_VALUE);

    assertEquals(TEST_COMIC_COUNT, result);

    Mockito.verify(displayableComicRepository, Mockito.times(1))
        .getComicCountForTagTypeAndValue(TEST_TAG_TYPE, TEST_TAG_VALUE);
  }

  @Test
  void LoadUnreadComics() {
    Mockito.when(
            displayableComicRepository.loadUnreadComics(
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

    Mockito.verify(displayableComicRepository, Mockito.times(1))
        .loadUnreadComics(readComicBookList, pageable);
  }

  @Test
  void LoadReadComics() {
    Mockito.when(
            displayableComicRepository.loadReadComics(
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

    Mockito.verify(displayableComicRepository, Mockito.times(1))
        .loadReadComics(readComicBookList, pageable);
  }

  @Test
  void LoadComicsForList() throws LibraryException, ReadingListException {
    Mockito.when(
            displayableComicRepository.loadComicsForList(
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

    Mockito.verify(readingListService, Mockito.times(1))
        .loadReadingListForUser(TEST_EMAIL, TEST_READING_LIST_ID);
    Mockito.verify(readingList, Mockito.times(1)).getReadingListId();
    Mockito.verify(displayableComicRepository, Mockito.times(1))
        .loadComicsForList(TEST_READING_LIST_ID, pageable);
  }

  @Test
  void loadComicsForList_noSuchList() throws ReadingListException {
    Mockito.when(readingListService.loadReadingListForUser(Mockito.anyString(), Mockito.anyLong()))
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
    Mockito.when(
            displayableComicRepository.loadComics(
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

    Mockito.verify(displayableComicRepository, Mockito.times(1))
        .loadComics(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER, pageable);
  }

  @Test
  void getComicCount() {
    Mockito.when(
            displayableComicRepository.getComicCount(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(TEST_COMIC_COUNT);

    final long result =
        service.getComicCount(
            TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER, TEST_COVER_DATE);

    assertEquals(TEST_COMIC_COUNT, result);

    Mockito.verify(displayableComicRepository, Mockito.times(1))
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

    Mockito.verify(exampleBuilder, Mockito.times(1)).setCoverYear(TEST_COVER_YEAR);
    Mockito.verify(exampleBuilder, Mockito.times(1)).setCoverMonth(TEST_COVER_MONTH);
    Mockito.verify(exampleBuilder, Mockito.times(1)).setArchiveType(TEST_ARCHIVE_TYPE);
    Mockito.verify(exampleBuilder, Mockito.times(1)).setComicType(TEST_COMIC_TYPE);
    Mockito.verify(exampleBuilder, Mockito.times(1)).setComicState(TEST_COMIC_STATE);
    Mockito.verify(exampleBuilder, Mockito.times(1)).setUnscrapedState(TEST_UNSCRAPED_STATE);
    Mockito.verify(exampleBuilder, Mockito.times(1)).setSearchText(TEST_SEARCH_TEXT);
    Mockito.verify(exampleBuilder, Mockito.times(1)).setPublisher(TEST_PUBLISHER);
    Mockito.verify(exampleBuilder, Mockito.times(1)).setSeries(TEST_SERIES);
    Mockito.verify(exampleBuilder, Mockito.times(1)).setVolume(TEST_VOLUME);
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
}

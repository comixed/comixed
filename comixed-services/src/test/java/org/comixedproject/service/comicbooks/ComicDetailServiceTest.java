/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project.
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
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.text.ParseException;
import java.util.*;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.adaptors.comicbooks.ComicFileAdaptor;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.collections.CollectionEntry;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.repositories.comicbooks.ComicDetailRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Pageable;
import org.springframework.util.StringUtils;

@ExtendWith(MockitoExtension.class)
class ComicDetailServiceTest {
  private static final String TEST_EMAIL = "reader@comixedproject.org";
  private static final String TEST_PUBLISHER = "THe Publisher Name";
  private static final String TEST_SERIES = "The Series Name";
  private static final String TEST_VOLUME = "2023";
  private static final ComicTagType TEST_TAG_TYPE = ComicTagType.CHARACTER;
  private static final String TEST_FILTER_TEXT = "The filtering text";
  private static final int TEST_YEAR = 2023;
  private static final int TEST_WEEK = 17;
  private static final String TEST_SEARCH_TERM = "Random text...";
  private static final String TEST_TAG_VALUE = "tag value";
  private static final int TEST_PAGE_SIZE = 10;
  private static final int TEST_PAGE_INDEX = RandomUtils.nextInt(100);
  private static final long TEST_TOTAL_COMIC_COUNT = RandomUtils.nextLong() * 30000L;
  private static final String TEST_SORT_DIRECTION = "asc";
  private static final String TEST_COMIC_FILENAME = "src/test/resources/example.cbz";
  private static final String TEST_STANDARDIZED_FILENAME = "the-standardized-filename";
  private static final String TEST_COVER_DATE = "2026-01-17";
  private static final int TEST_MAXIMUM_COMICS = 100;

  private final Set<Date> weeksList = new HashSet<>();
  private final List<String> sortFieldNames = new ArrayList<>();
  private final List<ComicDetail> comicDetailList = new ArrayList<>();

  @InjectMocks private ComicDetailService service;
  @Mock private ComicDetailRepository comicDetailRepository;
  @Mock private ComicFileAdaptor comicFileAdaptor;
  @Mock private ApplicationEventPublisher applicationEventPublisher;
  @Mock private Set<String> publisherList;
  @Mock private Set<String> seriesList;
  @Mock private Set<String> volumeList;
  @Mock private Set<String> tagSet;
  @Mock private Set<Integer> yearsList;
  @Mock private Set<Long> comicBookIdSet;
  @Mock private Example<ComicDetail> example;
  @Mock private CollectionEntry collectionEntry;
  @Mock private ComicBook comicBook;
  @Mock private ArchiveType targetArchiveType;

  @Captor private ArgumentCaptor<Pageable> pageableArgumentCaptor;
  @Captor private ArgumentCaptor<Date> startDateArgumentCaptor;
  @Captor private ArgumentCaptor<Date> endDateArgumentCaptor;

  private List<CollectionEntry> collectionEntryList = new ArrayList<>();
  private final List<Long> idList = new ArrayList<>();
  private final List<ComicBook> comicBookList = new ArrayList<>();
  private Set<Date> coverDateSet = new HashSet<>();

  @BeforeEach
  void setUp() throws ParseException {
    weeksList.add(new Date());

    coverDateSet.add(service.coverDateFormat.parse(TEST_COVER_DATE));

    sortFieldNames.add("archive-type");
    sortFieldNames.add("comic-state");
    sortFieldNames.add("comic-type");
    sortFieldNames.add("publisher");
    sortFieldNames.add("series");
    sortFieldNames.add("volume");
    sortFieldNames.add("issue-number");
    sortFieldNames.add("added-date");
    sortFieldNames.add("cover-date");
    sortFieldNames.add("tag-value");
    sortFieldNames.add("page-count");
    sortFieldNames.add("id");
  }

  @Test
  void filenameFound_caseInsensitive() {
    when(comicFileAdaptor.standardizeFilename(anyString())).thenReturn(TEST_STANDARDIZED_FILENAME);
    when(comicFileAdaptor.isCaseSensitiveFilenames()).thenReturn(false);

    when(comicDetailRepository.existsByFilenameIgnoreCase(anyString())).thenReturn(true);

    assertTrue(service.filenameFound(TEST_COMIC_FILENAME));

    verify(comicFileAdaptor).standardizeFilename(TEST_COMIC_FILENAME);
    verify(comicDetailRepository).existsByFilenameIgnoreCase(TEST_STANDARDIZED_FILENAME);
  }

  @Test
  void filenameFound_caseSensitive() {
    when(comicFileAdaptor.standardizeFilename(anyString())).thenReturn(TEST_STANDARDIZED_FILENAME);
    when(comicFileAdaptor.isCaseSensitiveFilenames()).thenReturn(true);

    when(comicDetailRepository.existsByFilename(anyString())).thenReturn(true);

    assertTrue(service.filenameFound(TEST_COMIC_FILENAME));

    verify(comicFileAdaptor).standardizeFilename(TEST_COMIC_FILENAME);
    verify(comicDetailRepository).existsByFilename(TEST_STANDARDIZED_FILENAME);
  }

  @Test
  void getAllCoverDates() {
    when(comicDetailRepository.getAllCoverDates()).thenReturn(coverDateSet);

    final Set<String> result = service.getAllCoverDates(TEST_EMAIL, false);

    assertNotNull(result);
    assertEquals(
        TEST_COVER_DATE, service.coverDateFormat.format(coverDateSet.stream().toList().get(0)));

    verify(comicDetailRepository).getAllCoverDates();
  }

  @Test
  void getAllCoverDates_unread() {
    when(comicDetailRepository.getAllUnreadCoverDates(anyString())).thenReturn(coverDateSet);

    final Set<String> result = service.getAllCoverDates(TEST_EMAIL, true);

    assertNotNull(result);
    assertEquals(
        TEST_COVER_DATE, service.coverDateFormat.format(coverDateSet.stream().toList().get(0)));

    verify(comicDetailRepository).getAllUnreadCoverDates(TEST_EMAIL);
  }

  @Test
  void getAllComicsForCoverDate() throws ParseException {
    when(comicDetailRepository.getAllComicsForCoverDate(any(Date.class)))
        .thenReturn(comicDetailList);

    final List<ComicDetail> result =
        service.getAllComicsForCoverDate(TEST_COVER_DATE, TEST_EMAIL, false);

    assertNotNull(result);
    assertSame(comicDetailList, result);

    verify(comicDetailRepository)
        .getAllComicsForCoverDate(service.coverDateFormat.parse(TEST_COVER_DATE));
  }

  @Test
  void getAllComicsForCoverDate_unread() throws ParseException {
    when(comicDetailRepository.getAllUnreadComicsForCoverDate(any(Date.class), anyString()))
        .thenReturn(comicDetailList);

    final List<ComicDetail> result =
        service.getAllComicsForCoverDate(TEST_COVER_DATE, TEST_EMAIL, true);

    assertNotNull(result);
    assertSame(comicDetailList, result);

    verify(comicDetailRepository)
        .getAllUnreadComicsForCoverDate(service.coverDateFormat.parse(TEST_COVER_DATE), TEST_EMAIL);
  }

  @Test
  void getAllPublishers_withUnread() {
    when(comicDetailRepository.getAllUnreadPublishers(anyString())).thenReturn(publisherList);

    final Set<String> result = service.getAllPublishers(TEST_EMAIL, true);

    assertNotNull(result);
    assertSame(publisherList, result);

    verify(comicDetailRepository).getAllUnreadPublishers(TEST_EMAIL);
  }

  @Test
  void getAllPublishers() {
    when(comicDetailRepository.getAllPublishers()).thenReturn(publisherList);

    final Set<String> result = service.getAllPublishers(TEST_EMAIL, false);

    assertNotNull(result);
    assertSame(publisherList, result);

    verify(comicDetailRepository).getAllPublishers();
  }

  @Test
  void getAllSeriesForPublisher_withUnread() {
    when(comicDetailRepository.getAllUnreadSeriesForPublisher(anyString(), anyString()))
        .thenReturn(seriesList);

    final Set<String> result = service.getAllSeriesForPublisher(TEST_PUBLISHER, TEST_EMAIL, true);

    assertNotNull(result);
    assertSame(seriesList, result);

    verify(comicDetailRepository).getAllUnreadSeriesForPublisher(TEST_PUBLISHER, TEST_EMAIL);
  }

  @Test
  void getAllSeriesForPublishers() {
    when(comicDetailRepository.getAllSeriesForPublisher(anyString())).thenReturn(seriesList);

    final Set<String> result = service.getAllSeriesForPublisher(TEST_PUBLISHER, TEST_EMAIL, false);

    assertNotNull(result);
    assertSame(seriesList, result);

    verify(comicDetailRepository).getAllSeriesForPublisher(TEST_PUBLISHER);
  }

  @Test
  void getAllVolumesForPublisherAndSeries_withUnread() {
    when(comicDetailRepository.getAllUnreadVolumesForPublisherAndSeries(
            anyString(), anyString(), anyString()))
        .thenReturn(volumeList);

    final Set<String> result =
        service.getAllVolumesForPublisherAndSeries(TEST_PUBLISHER, TEST_SERIES, TEST_EMAIL, true);

    assertNotNull(result);
    assertSame(volumeList, result);

    verify(comicDetailRepository)
        .getAllUnreadVolumesForPublisherAndSeries(TEST_PUBLISHER, TEST_SERIES, TEST_EMAIL);
  }

  @Test
  void getAllVolumesForPublisherAndSeries() {
    when(comicDetailRepository.getAllVolumesForPublisherAndSeries(anyString(), anyString()))
        .thenReturn(volumeList);

    final Set<String> result =
        service.getAllVolumesForPublisherAndSeries(TEST_PUBLISHER, TEST_SERIES, TEST_EMAIL, false);

    assertNotNull(result);
    assertSame(volumeList, result);

    verify(comicDetailRepository).getAllVolumesForPublisherAndSeries(TEST_PUBLISHER, TEST_SERIES);
  }

  @Test
  void getAllSeries() {
    when(comicDetailRepository.getAllSeries()).thenReturn(seriesList);

    final Set<String> result = service.getAllSeries();

    assertNotNull(result);
    assertSame(seriesList, result);

    verify(comicDetailRepository).getAllSeries();
  }

  @Test
  void getAllSeriesAsTopLevel_withUnread() {
    when(comicDetailRepository.getAllUnreadSeries(anyString())).thenReturn(volumeList);

    final Set<String> result = service.getAllSeries(TEST_EMAIL, true);

    assertNotNull(result);
    assertSame(volumeList, result);

    verify(comicDetailRepository).getAllUnreadSeries(TEST_EMAIL);
  }

  @Test
  void getAllSeriesAsTopLevel() {
    when(comicDetailRepository.getAllSeries()).thenReturn(volumeList);

    final Set<String> result = service.getAllSeries(TEST_EMAIL, false);

    assertNotNull(result);
    assertSame(volumeList, result);

    verify(comicDetailRepository).getAllSeries();
  }

  @Test
  void getAllPublishersForSeries_withUnread() {
    when(comicDetailRepository.getAllUnreadPublishersForSeries(anyString(), anyString()))
        .thenReturn(publisherList);

    final Set<String> result = service.getAllPublishersForSeries(TEST_SERIES, TEST_EMAIL, true);

    assertNotNull(result);
    assertSame(publisherList, result);

    verify(comicDetailRepository).getAllUnreadPublishersForSeries(TEST_SERIES, TEST_EMAIL);
  }

  @Test
  void getAllPublishersForSeries() {
    when(comicDetailRepository.getAllPublishersForSeries(anyString())).thenReturn(publisherList);

    final Set<String> result = service.getAllPublishersForSeries(TEST_SERIES, TEST_EMAIL, false);

    assertNotNull(result);
    assertSame(publisherList, result);

    verify(comicDetailRepository).getAllPublishersForSeries(TEST_SERIES);
  }

  @Test
  void getAllComicBooksForPublisherAndSeriesAndVolume_withUnread() {
    when(comicDetailRepository.getAllUnreadForPublisherAndSeriesAndVolume(
            anyString(), anyString(), anyString(), anyString()))
        .thenReturn(comicDetailList);

    final List<ComicDetail> result =
        service.getAllComicBooksForPublisherAndSeriesAndVolume(
            TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_EMAIL, true);

    assertNotNull(result);
    assertSame(comicDetailList, result);

    verify(comicDetailRepository)
        .getAllUnreadForPublisherAndSeriesAndVolume(
            TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_EMAIL);
  }

  @Test
  void getAllComicBooksForPublisherAndSeriesAndVolume() {
    when(comicDetailRepository.getAllForPublisherAndSeriesAndVolume(
            anyString(), anyString(), anyString()))
        .thenReturn(comicDetailList);

    final List<ComicDetail> result =
        service.getAllComicBooksForPublisherAndSeriesAndVolume(
            TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_EMAIL, false);

    assertNotNull(result);
    assertSame(comicDetailList, result);

    verify(comicDetailRepository)
        .getAllForPublisherAndSeriesAndVolume(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME);
  }

  @Test
  void getAllValuesForTags_withUnread() {
    when(comicDetailRepository.getAllUnreadValuesForTagType(any(ComicTagType.class), anyString()))
        .thenReturn(tagSet);

    final Set<String> result = service.getAllValuesForTag(TEST_TAG_TYPE, TEST_EMAIL, true);

    assertNotNull(result);
    assertSame(tagSet, result);

    verify(comicDetailRepository).getAllUnreadValuesForTagType(TEST_TAG_TYPE, TEST_EMAIL);
  }

  @Test
  void getAllValuesForTags() {
    when(comicDetailRepository.getAllValuesForTagType(any(ComicTagType.class))).thenReturn(tagSet);

    final Set<String> result = service.getAllValuesForTag(TEST_TAG_TYPE, TEST_EMAIL, false);

    assertNotNull(result);
    assertSame(tagSet, result);

    verify(comicDetailRepository).getAllValuesForTagType(TEST_TAG_TYPE);
  }

  @Test
  void getAllYears_withUnread() {
    when(comicDetailRepository.getAllUnreadYears(anyString())).thenReturn(yearsList);

    final Set<Integer> result = service.getAllYears(TEST_EMAIL, true);

    assertNotNull(result);
    assertSame(yearsList, result);

    verify(comicDetailRepository).getAllUnreadYears(TEST_EMAIL);
  }

  @Test
  void getAllYears() {
    when(comicDetailRepository.getAllYears()).thenReturn(yearsList);

    final Set<Integer> result = service.getAllYears(TEST_EMAIL, false);

    assertNotNull(result);
    assertSame(yearsList, result);

    verify(comicDetailRepository).getAllYears();
  }

  @Test
  void getAllWeeksForYear_withUnread() {
    when(comicDetailRepository.getAllUnreadWeeksForYear(anyInt(), anyString()))
        .thenReturn(weeksList);

    final Set<Integer> result = service.getAllWeeksForYear(TEST_YEAR, TEST_EMAIL, true);

    assertNotNull(result);
    assertFalse(result.isEmpty());

    verify(comicDetailRepository).getAllUnreadWeeksForYear(TEST_YEAR, TEST_EMAIL);
  }

  @Test
  void getAllWeeksForYear() {
    when(comicDetailRepository.getAllWeeksForYear(anyInt())).thenReturn(weeksList);

    final Set<Integer> result = service.getAllWeeksForYear(TEST_YEAR, TEST_EMAIL, false);

    assertNotNull(result);
    assertFalse(result.isEmpty());

    verify(comicDetailRepository).getAllWeeksForYear(TEST_YEAR);
  }

  @Test
  void getComicsForYearAndWeek_withUnread() {
    when(comicDetailRepository.getAllUnreadForYearAndWeek(
            startDateArgumentCaptor.capture(), endDateArgumentCaptor.capture(), anyString()))
        .thenReturn(comicDetailList);

    final List<ComicDetail> result =
        service.getComicsForYearAndWeek(TEST_YEAR, TEST_WEEK, TEST_EMAIL, true);

    assertNotNull(result);
    assertSame(comicDetailList, result);

    final Date startDate = startDateArgumentCaptor.getValue();
    final Date endDate = endDateArgumentCaptor.getValue();
    assertTrue(endDate.after(startDate));

    verify(comicDetailRepository).getAllUnreadForYearAndWeek(startDate, endDate, TEST_EMAIL);
  }

  @Test
  void getComicsForYearAndWeek() {
    when(comicDetailRepository.getAllForYearAndWeek(
            startDateArgumentCaptor.capture(), endDateArgumentCaptor.capture()))
        .thenReturn(comicDetailList);

    final List<ComicDetail> result =
        service.getComicsForYearAndWeek(TEST_YEAR, TEST_WEEK, TEST_EMAIL, false);

    assertNotNull(result);
    assertSame(comicDetailList, result);

    final Date startDate = startDateArgumentCaptor.getValue();
    final Date endDate = endDateArgumentCaptor.getValue();
    assertTrue(endDate.after(startDate));

    verify(comicDetailRepository).getAllForYearAndWeek(startDate, endDate);
  }

  @Test
  void getComicsForSearchTerm() {
    when(comicDetailRepository.getForSearchTerm(anyString())).thenReturn(comicDetailList);

    final List<ComicDetail> result = service.getComicForSearchTerm(TEST_SEARCH_TERM);

    assertNotNull(result);
    assertSame(comicDetailList, result);

    verify(comicDetailRepository).getForSearchTerm(TEST_SEARCH_TERM);
  }

  @Test
  void getComicsForTag_withUnread() {
    when(comicDetailRepository.getAllUnreadComicsForTagType(
            any(ComicTagType.class), anyString(), anyString()))
        .thenReturn(comicDetailList);

    final List<ComicDetail> result =
        service.getAllComicsForTag(TEST_TAG_TYPE, TEST_TAG_VALUE, TEST_EMAIL, true);

    assertNotNull(result);
    assertSame(comicDetailList, result);

    verify(comicDetailRepository)
        .getAllUnreadComicsForTagType(TEST_TAG_TYPE, TEST_TAG_VALUE, TEST_EMAIL);
  }

  @Test
  void getComicsForTag() {
    when(comicDetailRepository.getAllComicsForTagType(any(ComicTagType.class), anyString()))
        .thenReturn(comicDetailList);

    final List<ComicDetail> result =
        service.getAllComicsForTag(TEST_TAG_TYPE, TEST_TAG_VALUE, TEST_EMAIL, false);

    assertNotNull(result);
    assertSame(comicDetailList, result);

    verify(comicDetailRepository).getAllComicsForTagType(TEST_TAG_TYPE, TEST_TAG_VALUE);
  }

  @Test
  void findAllByExample() {
    when(comicDetailRepository.findAll(any(Example.class))).thenReturn(comicDetailList);

    final List<ComicDetail> result = service.findAllByExample(example);

    assertNotNull(result);
    assertSame(comicDetailList, result);

    verify(comicDetailRepository).findAll(example);
  }

  @Test
  void loadComicDetailsById() {
    when(comicDetailRepository.findAllById(anySet())).thenReturn(comicDetailList);

    final List<ComicDetail> result = service.loadComicDetailListById(comicBookIdSet);

    assertNotNull(result);
    assertSame(comicDetailList, result);

    verify(comicDetailRepository).findAllById(comicBookIdSet);
  }

  @Test
  void loadCollectionEntries_unsorted() {
    collectionEntryList.add(collectionEntry);

    when(comicDetailRepository.loadCollectionEntries(
            any(ComicTagType.class), pageableArgumentCaptor.capture()))
        .thenReturn(collectionEntryList);

    doCollectionEntriesTest("");
  }

  @Test
  void loadCollectionEntries_tagValueSort() {
    collectionEntryList.add(collectionEntry);

    when(comicDetailRepository.loadCollectionEntries(
            any(ComicTagType.class), pageableArgumentCaptor.capture()))
        .thenReturn(collectionEntryList);

    doCollectionEntriesTest("tag-value");
  }

  @Test
  void loadCollectionEntries_comicCountSort() {
    collectionEntryList.add(collectionEntry);

    when(comicDetailRepository.loadCollectionEntries(
            any(ComicTagType.class), pageableArgumentCaptor.capture()))
        .thenReturn(collectionEntryList);

    doCollectionEntriesTest("comic-count");
  }

  private void doCollectionEntriesTest(final String sortBy) {
    final List<CollectionEntry> result =
        service.loadCollectionEntries(
            TEST_TAG_TYPE, "", TEST_PAGE_SIZE, TEST_PAGE_INDEX, sortBy, TEST_SORT_DIRECTION);

    assertNotNull(result);
    assertFalse(result.isEmpty());

    final Pageable pageable = pageableArgumentCaptor.getValue();
    assertEquals(TEST_PAGE_SIZE, pageable.getPageSize());
    assertEquals(TEST_PAGE_INDEX, pageable.getPageNumber());
    if (StringUtils.hasLength(sortBy)) {
      assertFalse(pageable.getSort().stream().toList().isEmpty());
    }

    verify(comicDetailRepository).loadCollectionEntries(TEST_TAG_TYPE, pageable);
  }

  @Test
  void loadCollectionEntries_unsorted_withFiltering() {
    collectionEntryList.add(collectionEntry);

    when(comicDetailRepository.loadCollectionEntriesWithFiltering(
            any(ComicTagType.class), anyString(), pageableArgumentCaptor.capture()))
        .thenReturn(collectionEntryList);

    doCollectionEntriesTestWithFiltering("");
  }

  @Test
  void loadCollectionEntries_tagValueSort_withFiltering() {
    collectionEntryList.add(collectionEntry);

    when(comicDetailRepository.loadCollectionEntriesWithFiltering(
            any(ComicTagType.class), anyString(), pageableArgumentCaptor.capture()))
        .thenReturn(collectionEntryList);

    doCollectionEntriesTestWithFiltering("tag-value");
  }

  private void doCollectionEntriesTestWithFiltering(final String sortBy) {
    final List<CollectionEntry> result =
        service.loadCollectionEntries(
            TEST_TAG_TYPE,
            TEST_FILTER_TEXT,
            TEST_PAGE_SIZE,
            TEST_PAGE_INDEX,
            sortBy,
            TEST_SORT_DIRECTION);

    assertNotNull(result);
    assertFalse(result.isEmpty());

    final Pageable pageable = pageableArgumentCaptor.getValue();
    assertEquals(TEST_PAGE_SIZE, pageable.getPageSize());
    assertEquals(TEST_PAGE_INDEX, pageable.getPageNumber());
    if (StringUtils.hasLength(sortBy)) {
      assertFalse(pageable.getSort().stream().toList().isEmpty());
    }

    verify(comicDetailRepository)
        .loadCollectionEntriesWithFiltering(TEST_TAG_TYPE, "%" + TEST_FILTER_TEXT + "%", pageable);
  }

  @Test
  void loadCollectionEntries_comicCountSort_withFiltering() {
    collectionEntryList.add(collectionEntry);

    when(comicDetailRepository.loadCollectionEntriesWithFiltering(
            any(ComicTagType.class), anyString(), pageableArgumentCaptor.capture()))
        .thenReturn(collectionEntryList);

    doCollectionEntriesTestWithFiltering("comic-count");
  }

  @Test
  void loadCollectionTotalEntries() {
    when(comicDetailRepository.getFilterCount(any(ComicTagType.class)))
        .thenReturn(TEST_TOTAL_COMIC_COUNT);

    final long result = service.loadCollectionTotalEntries(TEST_TAG_TYPE, "");

    assertEquals(TEST_TOTAL_COMIC_COUNT, result);

    verify(comicDetailRepository).getFilterCount(TEST_TAG_TYPE);
  }

  @Test
  void loadCollectionTotalEntries_withFiltering() {
    when(comicDetailRepository.getFilterCountWithFiltering(any(ComicTagType.class), anyString()))
        .thenReturn(TEST_TOTAL_COMIC_COUNT);

    final long result = service.loadCollectionTotalEntries(TEST_TAG_TYPE, TEST_FILTER_TEXT);

    assertEquals(TEST_TOTAL_COMIC_COUNT, result);

    verify(comicDetailRepository)
        .getFilterCountWithFiltering(TEST_TAG_TYPE, "%" + TEST_FILTER_TEXT + "%");
  }

  @Test
  void getAllIds() {
    comicBookList.add(comicBook);
    when(comicDetailRepository.getAllIds()).thenReturn(idList);

    final List<Long> result = service.getAllIds();

    assertNotNull(result);
    assertSame(idList, result);

    verify(comicDetailRepository).getAllIds();
  }

  @Test
  void prepareForMetadataUpdate() {
    service.prepareForMetadataUpdate(idList);

    verify(comicDetailRepository).prepareForMetadataUpdate(idList);
  }

  @Test
  void getBatchScrapingCount() {
    when(comicDetailRepository.getBatchScrapingCount()).thenReturn(TEST_TOTAL_COMIC_COUNT);

    final long result = service.getBatchScrapingCount();

    assertEquals(TEST_TOTAL_COMIC_COUNT, result);

    verify(comicDetailRepository).getBatchScrapingCount();
  }

  @Test
  void findBatchScrapingComics() {
    when(comicDetailRepository.findBatchScrapingComics(pageableArgumentCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.findBatchScrapingComics(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicBookList, result);

    final Pageable pageable = pageableArgumentCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    verify(comicDetailRepository).findBatchScrapingComics(pageable);
  }

  @Test
  void markComicBooksForBatchScraping() {
    service.markComicBooksForBatchScraping(idList);

    verify(comicDetailRepository).prepareForBatchScraping(idList);
  }

  @Test
  void prepareForRecreation() {
    service.prepareForRecreation(idList, targetArchiveType);

    verify(comicDetailRepository).markForRecreationById(idList, targetArchiveType);
  }

  @Test
  void getRecreatingCount() {
    when(comicDetailRepository.getRecreatingCount()).thenReturn(TEST_TOTAL_COMIC_COUNT);

    final long result = service.getRecreatingCount();

    assertEquals(TEST_TOTAL_COMIC_COUNT, result);

    verify(comicDetailRepository).getRecreatingCount();
  }
}

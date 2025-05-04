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

package org.comixedproject.service.collections;

import static junit.framework.TestCase.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;
import org.comixedproject.model.collections.Issue;
import org.comixedproject.model.collections.SeriesDetail;
import org.comixedproject.model.collections.SeriesDetailId;
import org.comixedproject.repositories.collections.SeriesDetailsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class SeriesDetailServiceTest {
  private static final int TEST_PAGE_INDEX = 3;
  private static final int TEST_PAGE_SIZE = 25;
  private static final String TEST_SORT_BY = "name";
  private static final String TEST_PUBLISHER = "The publisher";
  private static final String TEST_SERIES = "The series";
  private static final String TEST_VOLUME = "2022";
  private static final Long TEST_ISSUE_COUNT = 29L;
  private static final int TEST_SERIES_COUNT = 237;
  private static final String TEST_FILTER_TEXT = "some text";

  @InjectMocks private SeriesDetailService service;
  @Mock private SeriesDetailsRepository seriesDetailsRepository;
  @Mock private IssueService issueService;
  @Mock private Stream<SeriesDetail> seriesDetailStream;
  @Mock private Page<SeriesDetail> seriesDetailPage;
  @Mock private List<Issue> issueList;

  @Captor private ArgumentCaptor<Pageable> pageableArgumentCaptor;

  private List<SeriesDetail> seriesDetailList = new ArrayList<>();

  @BeforeEach
  public void setUp() {
    Mockito.when(seriesDetailPage.stream()).thenReturn(seriesDetailStream);
    Mockito.when(seriesDetailStream.toList()).thenReturn(seriesDetailList);
    seriesDetailList.add(
        new SeriesDetail(
            new SeriesDetailId(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME), TEST_ISSUE_COUNT));
  }

  @Test
  void loadSeriesList_sortedByPublisher() {
    Mockito.when(seriesDetailsRepository.findAll(pageableArgumentCaptor.capture()))
        .thenReturn(seriesDetailPage);

    doLoadSeriesList_sorted("publisher");
  }

  @Test
  void loadSeriesList_sortedByName() {
    Mockito.when(seriesDetailsRepository.findAll(pageableArgumentCaptor.capture()))
        .thenReturn(seriesDetailPage);

    doLoadSeriesList_sorted("name");
  }

  @Test
  void loadSeriesList_sortedByVolume() {
    Mockito.when(seriesDetailsRepository.findAll(pageableArgumentCaptor.capture()))
        .thenReturn(seriesDetailPage);

    doLoadSeriesList_sorted("volume");
  }

  @Test
  void loadSeriesList_sortedByLibraryCount() {
    Mockito.when(seriesDetailsRepository.findAll(pageableArgumentCaptor.capture()))
        .thenReturn(seriesDetailPage);

    doLoadSeriesList_sorted("in-library");
  }

  @Test
  void loadSeriesList_sortedByTotalComics() {
    Mockito.when(seriesDetailsRepository.findAll(pageableArgumentCaptor.capture()))
        .thenReturn(seriesDetailPage);

    doLoadSeriesList_sorted("total-comics");
  }

  @Test
  void loadSeriesList_sortedByUnknown() {
    Mockito.when(seriesDetailsRepository.findAll(pageableArgumentCaptor.capture()))
        .thenReturn(seriesDetailPage);

    doLoadSeriesList_sorted("farkle");
  }

  private void doLoadSeriesList_sorted(final String publisher) {
    for (int index = 0; index < 2; index++) {
      final List<SeriesDetail> result =
          service.getSeriesList(
              "", TEST_PAGE_INDEX, TEST_PAGE_SIZE, publisher, index == 0 ? "asc" : "desc");

      assertNotNull(result);
      assertSame(seriesDetailList, result);

      final Pageable pageRequest = pageableArgumentCaptor.getValue();
      assertEquals(TEST_PAGE_INDEX, pageRequest.getPageNumber());
      assertEquals(TEST_PAGE_SIZE, pageRequest.getPageSize());
      assertTrue(TEST_SORT_BY, pageRequest.getSort().isSorted());

      Mockito.verify(seriesDetailsRepository, Mockito.times(1)).findAll(pageRequest);
    }
  }

  @Test
  void loadSeriesList_unsorted() {
    Mockito.when(seriesDetailsRepository.findAll(pageableArgumentCaptor.capture()))
        .thenReturn(seriesDetailPage);

    final List<SeriesDetail> result =
        service.getSeriesList("", TEST_PAGE_INDEX, TEST_PAGE_SIZE, "", "");

    assertNotNull(result);
    assertSame(seriesDetailList, result);

    final Pageable pageRequest = pageableArgumentCaptor.getValue();
    assertEquals(TEST_PAGE_INDEX, pageRequest.getPageNumber());
    assertEquals(TEST_PAGE_SIZE, pageRequest.getPageSize());
    assertFalse(TEST_SORT_BY, pageRequest.getSort().isSorted());

    Mockito.verify(seriesDetailsRepository, Mockito.times(1)).findAll(pageRequest);
  }

  @Test
  void loadSeriesCount() {
    Mockito.when(seriesDetailsRepository.getSeriesCount()).thenReturn(TEST_SERIES_COUNT);

    final int result = service.getSeriesCount("");

    assertEquals(TEST_SERIES_COUNT, result);

    Mockito.verify(seriesDetailsRepository, Mockito.times(1)).getSeriesCount();
  }

  @Test
  void loadSeriesCount_withFilter() {
    Mockito.when(seriesDetailsRepository.getFilteredSeriesCount(Mockito.anyString()))
        .thenReturn(TEST_SERIES_COUNT);

    final int result = service.getSeriesCount(TEST_FILTER_TEXT);

    assertEquals(TEST_SERIES_COUNT, result);

    Mockito.verify(seriesDetailsRepository, Mockito.times(1))
        .getFilteredSeriesCount(String.format("%%%s%%", TEST_FILTER_TEXT));
  }

  @Test
  void loadSeriesDetail() {
    Mockito.when(issueService.getAll(Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(issueList);

    final List<Issue> result = service.loadSeriesDetail(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME);

    assertNotNull(result);
    assertSame(issueList, result);

    Mockito.verify(issueService, Mockito.times(1)).getAll(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME);
  }
}

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

package org.comixedproject.rest.collections;

import static junit.framework.TestCase.*;

import java.util.List;
import org.comixedproject.model.collections.PublisherDetail;
import org.comixedproject.model.collections.SeriesDetail;
import org.comixedproject.model.net.collections.LoadPublisherDetailRequest;
import org.comixedproject.model.net.collections.LoadPublisherDetailResponse;
import org.comixedproject.model.net.collections.LoadPublisherListRequest;
import org.comixedproject.model.net.collections.LoadPublisherListResponse;
import org.comixedproject.service.collections.PublisherDetailService;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class PublisherDetailControllerTest {
  private static final String TEST_PUBLISHER_NAME = "The publisher name";
  private static final int TEST_PAGE_NUMBER = 72;
  private static final int TEST_PAGE_SIZE = 25;
  private static final String TEST_SORT_BY = "publisher-name";
  private static final String TEST_SORT_DIRECTION = "asc";
  private static final long TEST_SERIES_COUNT = 921L;
  private static final long TEST_PUBLISHER_COUNT = 73L;
  private static final String TEST_FILTER_TEXT = "The filter text";

  @InjectMocks private PublisherDetailController controller;
  @Mock private ComicBookService comicBookService;
  @Mock private PublisherDetailService publisherDetailService;
  @Mock private List<SeriesDetail> seriesDetailList;
  @Mock private List<PublisherDetail> publisherDetailList;

  @Test
  public void testLoadPublisherList() {
    Mockito.when(
            publisherDetailService.getAllPublishers(
                TEST_FILTER_TEXT, TEST_PAGE_NUMBER, TEST_PAGE_SIZE, "name", "asc"))
        .thenReturn(publisherDetailList);
    Mockito.when(publisherDetailService.getPublisherCount(TEST_FILTER_TEXT))
        .thenReturn(TEST_PUBLISHER_COUNT);

    final LoadPublisherListResponse result =
        controller.loadPublisherList(
            new LoadPublisherListRequest(
                TEST_FILTER_TEXT, TEST_PAGE_NUMBER, TEST_PAGE_SIZE, "name", "asc"));

    assertNotNull(result);
    assertSame(publisherDetailList, result.getPublishers());
    assertEquals(TEST_PUBLISHER_COUNT, result.getTotal());

    Mockito.verify(publisherDetailService, Mockito.times(1))
        .getAllPublishers(TEST_FILTER_TEXT, TEST_PAGE_NUMBER, TEST_PAGE_SIZE, "name", "asc");
    Mockito.verify(publisherDetailService, Mockito.times(1)).getPublisherCount(TEST_FILTER_TEXT);
  }

  @Test
  public void testGetPublisherDetail() {
    Mockito.when(comicBookService.getSeriesCountForPublisher(Mockito.anyString()))
        .thenReturn(TEST_SERIES_COUNT);
    Mockito.when(
            comicBookService.getPublisherDetail(
                Mockito.anyString(),
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.anyString(),
                Mockito.anyString()))
        .thenReturn(seriesDetailList);

    final LoadPublisherDetailResponse result =
        controller.getPublisherDetail(
            TEST_PUBLISHER_NAME,
            new LoadPublisherDetailRequest(
                TEST_PAGE_NUMBER, TEST_PAGE_SIZE, TEST_SORT_BY, TEST_SORT_DIRECTION));

    assertNotNull(result);
    assertEquals(TEST_SERIES_COUNT, result.getTotalSeries());
    assertSame(seriesDetailList, result.getEntries());

    Mockito.verify(comicBookService, Mockito.times(1))
        .getSeriesCountForPublisher(TEST_PUBLISHER_NAME);
    Mockito.verify(comicBookService, Mockito.times(1))
        .getPublisherDetail(
            TEST_PUBLISHER_NAME,
            TEST_PAGE_NUMBER,
            TEST_PAGE_SIZE,
            TEST_SORT_BY,
            TEST_SORT_DIRECTION);
  }
}

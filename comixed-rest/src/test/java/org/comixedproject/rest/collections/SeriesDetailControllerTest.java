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

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;

import java.util.List;
import org.comixedproject.model.collections.Issue;
import org.comixedproject.model.collections.SeriesDetail;
import org.comixedproject.model.net.collections.LoadSeriesDetailRequest;
import org.comixedproject.model.net.collections.LoadSeriesListResponse;
import org.comixedproject.service.collections.SeriesDetailService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class SeriesDetailControllerTest {
  private static final String TEST_PUBLISHER = "Publisher Name";
  private static final String TEST_SERIES = "SeriesDetail Name";
  private static final String TEST_VOLUME = "2022";

  @InjectMocks private SeriesDetailController controller;
  @Mock private SeriesDetailService seriesDetailService;
  @Mock private List<SeriesDetail> seriesDetailList;
  @Mock private List<Issue> seriesDetail;

  @Test
  public void testLoadSeriesList() {
    Mockito.when(seriesDetailService.getSeriesList()).thenReturn(seriesDetailList);

    final LoadSeriesListResponse result = controller.loadSeriesList();

    assertNotNull(result);
    assertSame(seriesDetailList, result.getSeriesDetails());

    Mockito.verify(seriesDetailService, Mockito.times(1)).getSeriesList();
  }

  @Test
  public void testLoadSeriesDetail() {
    Mockito.when(
            seriesDetailService.loadSeriesDetail(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(seriesDetail);

    List<Issue> result =
        controller.loadSeriesDetail(
            new LoadSeriesDetailRequest(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME));

    assertNotNull(result);
    assertSame(seriesDetail, result);

    Mockito.verify(seriesDetailService, Mockito.times(1))
        .loadSeriesDetail(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME);
  }
}

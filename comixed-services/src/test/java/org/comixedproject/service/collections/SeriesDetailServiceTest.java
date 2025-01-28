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

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.collections.Issue;
import org.comixedproject.model.collections.SeriesDetail;
import org.comixedproject.model.collections.SeriesDetailId;
import org.comixedproject.repositories.collections.SeriesDetailsRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class SeriesDetailServiceTest {
  private static final String TEST_PUBLISHER = "The publisher";
  private static final String TEST_SERIES = "The series";
  private static final String TEST_VOLUME = "2022";
  private static final Long TEST_ISSUE_COUNT = 29L;

  @InjectMocks private SeriesDetailService service;
  @Mock private SeriesDetailsRepository seriesDetailsRepository;
  @Mock private IssueService issueService;
  @Mock private List<Issue> issueList;

  private List<SeriesDetail> seriesDetailList = new ArrayList<>();

  @Before
  public void setUp() {
    seriesDetailList.add(
        new SeriesDetail(
            new SeriesDetailId(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME), TEST_ISSUE_COUNT));
  }

  @Test
  public void testLoadSeriesList() {
    Mockito.when(seriesDetailsRepository.findAll()).thenReturn(seriesDetailList);

    final List<SeriesDetail> result = service.getSeriesList();

    assertNotNull(result);
    assertSame(seriesDetailList, result);

    Mockito.verify(seriesDetailsRepository, Mockito.times(1)).findAll();
  }

  @Test
  public void testLoadSeriesDetail() {
    Mockito.when(issueService.getAll(Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(issueList);

    final List<Issue> result = service.loadSeriesDetail(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME);

    assertNotNull(result);
    assertSame(issueList, result);

    Mockito.verify(issueService, Mockito.times(1)).getAll(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME);
  }
}

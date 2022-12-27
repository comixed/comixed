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

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertFalse;
import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.comixedproject.model.collections.Issue;
import org.comixedproject.model.collections.Series;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.library.CollectionException;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class SeriesServiceTest {
  private static final String TEST_PUBLISHER = "The publisher";
  private static final String TEST_SERIES = "The series";
  private static final String TEST_VOLUME = "2022";
  private static final Long TEST_ISSUE_COUNT = 29L;
  private static final Long TEST_TOTAL_ISSUES = 79L;

  @InjectMocks private SeriesService service;
  @Mock private ComicBookService comicBookService;
  @Mock private IssueService issueService;
  @Mock private List<Issue> issueList;

  private List<Series> seriesList = new ArrayList<>();

  @Before
  public void setUp() {
    seriesList.add(new Series(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_COUNT));
  }

  @Test
  public void testLoadSeriesList() {
    Mockito.when(comicBookService.getAllSeriesAndVolumes()).thenReturn(seriesList);
    Mockito.when(issueService.getCountForSeriesAndVolume(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(TEST_TOTAL_ISSUES);

    final List<Series> result = service.getSeriesList();

    assertNotNull(result);
    assertFalse(result.isEmpty());

    assertEquals(TEST_PUBLISHER, result.get(0).getPublisher());
    assertEquals(TEST_SERIES, result.get(0).getName());
    assertEquals(TEST_VOLUME, result.get(0).getVolume());
    assertEquals(TEST_ISSUE_COUNT, result.get(0).getInLibrary());
    assertEquals(TEST_TOTAL_ISSUES, result.get(0).getTotalIssues());

    Mockito.verify(comicBookService, Mockito.times(1)).getAllSeriesAndVolumes();
    Mockito.verify(issueService, Mockito.times(seriesList.size()))
        .getCountForSeriesAndVolume(TEST_SERIES, TEST_VOLUME);
  }

  @Test(expected = CollectionException.class)
  public void testLoadSeriesDetailNotFound() throws CollectionException {
    Mockito.when(issueService.getAll(Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(Collections.emptyList());

    try {
      service.loadSeriesDetail(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME);
    } finally {
      Mockito.verify(issueService, Mockito.times(1))
          .getAll(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME);
    }
  }

  @Test
  public void testLoadSeriesDetail() throws CollectionException {
    Mockito.when(issueService.getAll(Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(issueList);

    final List<Issue> result = service.loadSeriesDetail(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME);

    assertNotNull(result);
    assertSame(issueList, result);

    Mockito.verify(issueService, Mockito.times(1)).getAll(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME);
  }
}

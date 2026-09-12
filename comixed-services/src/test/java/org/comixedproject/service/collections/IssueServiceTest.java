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
import org.comixedproject.model.collections.Issue;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.repositories.collections.IssueRepository;
import org.comixedproject.service.comicbooks.ComicService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class IssueServiceTest {
  private static final String TEST_PUBLISHER = "The Publisher Name";
  private static final String TEST_SERIES = "The Series Name";
  private static final String TEST_VOLUME = "2022";
  private static final String TEST_ISSUE_NUMBER = "237";
  private static final long TEST_COUNT = 417L;

  @InjectMocks private IssueService service;
  @Mock private IssueRepository issueRepository;
  @Mock private ComicService comicService;
  @Mock private List<Issue> savedIssueList;
  @Mock private Comic comic;

  private List<Issue> issueList = new ArrayList<>();
  private List<Comic> comicList = new ArrayList<>();

  @BeforeEach
  void setUp() {
    final Issue issue = new Issue();
    issue.setSeries(TEST_SERIES);
    issue.setVolume(TEST_VOLUME);
    issueList.add(issue);

    Mockito.when(comic.getPublisher()).thenReturn(TEST_PUBLISHER);
    Mockito.when(comic.getSeries()).thenReturn(TEST_SERIES);
    Mockito.when(comic.getVolume()).thenReturn(TEST_VOLUME);
    Mockito.when(comic.getIssueNumber()).thenReturn(TEST_ISSUE_NUMBER);
    comicList.add(comic);
  }

  @Test
  void getCountForSeriesAndVolume() {
    Mockito.when(
            issueRepository.getCountForSeriesAndVolume(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(TEST_COUNT);

    final long result = service.getCountForSeriesAndVolume(TEST_SERIES, TEST_VOLUME);

    assertEquals(TEST_COUNT, result);

    Mockito.verify(issueRepository, Mockito.times(1))
        .getCountForSeriesAndVolume(TEST_SERIES, TEST_VOLUME);
  }

  @Test
  void getAllForSeriesAndVolume() {
    Mockito.when(
            issueRepository.getAll(Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(issueList);

    final List<Issue> result = service.getAll(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME);

    assertNotNull(result);
    assertSame(issueList, result);

    Mockito.verify(issueRepository, Mockito.times(1))
        .getAll(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME);
  }

  @Test
  void getAllForSeriesAndVolume_noneFound() {
    Mockito.when(
            issueRepository.getAll(Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(new ArrayList<>());
    Mockito.when(
            comicService.getAllComicBooksForPublisherAndSeriesAndVolume(
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyBoolean()))
        .thenReturn(comicList);

    final List<Issue> result = service.getAll(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(TEST_PUBLISHER, result.get(0).getPublisher());
    assertEquals(TEST_SERIES, result.get(0).getSeries());
    assertEquals(TEST_VOLUME, result.get(0).getVolume());
    assertEquals(TEST_ISSUE_NUMBER, result.get(0).getIssueNumber());

    Mockito.verify(issueRepository, Mockito.times(1))
        .getAll(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME);
    Mockito.verify(comicService, Mockito.times(1))
        .getAllComicBooksForPublisherAndSeriesAndVolume(
            TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, "", false);
  }

  @Test
  void saveIssues() {
    Mockito.doNothing()
        .when(issueRepository)
        .deleteSeriesAndVolume(Mockito.anyString(), Mockito.anyString());
    Mockito.when(issueRepository.saveAll(Mockito.anyList())).thenReturn(savedIssueList);

    final List<Issue> result = service.saveAll(issueList);

    assertNotNull(result);
    assertSame(savedIssueList, result);

    Mockito.verify(issueRepository, Mockito.times(1))
        .deleteSeriesAndVolume(TEST_SERIES, TEST_VOLUME);
    Mockito.verify(issueRepository, Mockito.times(1)).saveAll(issueList);
  }

  @Test
  void deleteForSeriesAndVolume() {
    Mockito.doNothing()
        .when(issueRepository)
        .deleteSeriesAndVolume(Mockito.anyString(), Mockito.anyString());

    service.deleteSeriesAndVolume(TEST_SERIES, TEST_VOLUME);

    Mockito.verify(issueRepository, Mockito.times(1))
        .deleteSeriesAndVolume(TEST_SERIES, TEST_VOLUME);
  }
}

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

package org.comixedproject.rest.library;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Date;
import java.util.List;
import org.comixedproject.model.library.DisplayableComic;
import org.comixedproject.model.library.DuplicateComic;
import org.comixedproject.model.net.library.LoadComicsResponse;
import org.comixedproject.model.net.library.LoadDuplicateComicsListRequest;
import org.comixedproject.model.net.library.LoadDuplicateComicsListResponse;
import org.comixedproject.model.net.library.LoadDuplicateComicsRequest;
import org.comixedproject.service.library.DisplayableComicService;
import org.comixedproject.service.library.DuplicateComicService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DuplicateComicControllerTest {
  private static final Long TEST_DUPLICATE_COMIC_COUNT = 717L;
  private static final int TEST_PAGE_SIZE = 25;
  private static final int TEST_PAGE_INDEX = 3;
  private static final String TEST_SORT_FIELD = "publisher";
  private static final String TEST_SORT_DIRECTION = "asc";
  private static final String TEST_PUBLISHER = "The Publisher";
  private static final String TEST_SERIES = "The Series";
  private static final String TEST_VOLUME = "2025";
  private static final String TEST_ISSUE_NUMBER = "23";
  private static final Date TEST_COVER_DATE = new Date();

  @InjectMocks private DuplicateComicController controller;
  @Mock private DuplicateComicService duplicateComicService;
  @Mock private DisplayableComicService displayableComicService;
  @Mock private List<DuplicateComic> duplicateComicList;
  @Mock private List<DisplayableComic> displayableComicList;

  @Test
  void loadDuplicateComicsList() {
    Mockito.when(
            duplicateComicService.loadDuplicateComicsList(
                Mockito.anyInt(), Mockito.anyInt(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(duplicateComicList);
    Mockito.when(duplicateComicService.getDuplicateComicBookCount())
        .thenReturn(TEST_DUPLICATE_COMIC_COUNT);

    final LoadDuplicateComicsListResponse result =
        controller.loadDuplicateComicsList(
            new LoadDuplicateComicsListRequest(
                TEST_PAGE_SIZE, TEST_PAGE_INDEX, TEST_SORT_FIELD, TEST_SORT_DIRECTION));

    assertNotNull(result);
    assertSame(duplicateComicList, result.getComics());
    assertEquals(TEST_DUPLICATE_COMIC_COUNT, result.getTotalCount());

    Mockito.verify(duplicateComicService, Mockito.times(1))
        .loadDuplicateComicsList(
            TEST_PAGE_SIZE, TEST_PAGE_INDEX, TEST_SORT_FIELD, TEST_SORT_DIRECTION);
    Mockito.verify(duplicateComicService, Mockito.times(1)).getDuplicateComicBookCount();
  }

  @Test
  void loadDuplicateComics() {
    Mockito.when(
            displayableComicService.loadComics(
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.any(Date.class),
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.anyString(),
                Mockito.anyString()))
        .thenReturn(displayableComicList);
    Mockito.when(
            displayableComicService.getComicCount(
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.any(Date.class)))
        .thenReturn(TEST_DUPLICATE_COMIC_COUNT);

    final LoadComicsResponse result =
        controller.loadDuplicateComics(
            new LoadDuplicateComicsRequest(
                TEST_PUBLISHER,
                TEST_SERIES,
                TEST_VOLUME,
                TEST_ISSUE_NUMBER,
                TEST_COVER_DATE,
                TEST_PAGE_INDEX,
                TEST_PAGE_SIZE,
                TEST_SORT_FIELD,
                TEST_SORT_DIRECTION));

    assertNotNull(result);
    assertSame(displayableComicList, result.getComics());
    assertEquals(TEST_DUPLICATE_COMIC_COUNT, result.getTotalCount());
    assertEquals(TEST_DUPLICATE_COMIC_COUNT, result.getFilteredCount());

    Mockito.verify(displayableComicService, Mockito.times(1))
        .loadComics(
            TEST_PUBLISHER,
            TEST_SERIES,
            TEST_VOLUME,
            TEST_ISSUE_NUMBER,
            TEST_COVER_DATE,
            TEST_PAGE_INDEX,
            TEST_PAGE_SIZE,
            TEST_SORT_FIELD,
            TEST_SORT_DIRECTION);
    Mockito.verify(displayableComicService, Mockito.times(1))
        .getComicCount(
            TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER, TEST_COVER_DATE);
  }
}

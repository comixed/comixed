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

import java.util.List;
import java.util.stream.Stream;
import org.comixedproject.model.library.DuplicateComic;
import org.comixedproject.repositories.library.DuplicateComicRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

@ExtendWith(MockitoExtension.class)
class DuplicateComicServiceTest {
  private static final Long TEST_TOTAL_COMIC_COUNT = 925L;
  private static final int TEST_PAGE_NUMBER = 33;
  private static final int TEST_PAGE_SIZE = 25;

  @InjectMocks private DuplicateComicService service;
  @Mock private DuplicateComicRepository duplicateComicRepository;
  @Mock private Page<DuplicateComic> duplicateComicPage;
  @Mock private Stream<DuplicateComic> duplicatePageStream;
  @Mock private List<DuplicateComic> duplicatePageList;

  @Captor private ArgumentCaptor<PageRequest> pageRequestArgumentCaptor;

  @Test
  void loadDuplicateComics() {
    doLoadDuplicateComics("publisher");
    doLoadDuplicateComics("series");
    doLoadDuplicateComics("volume");
    doLoadDuplicateComics("issue-number");
    doLoadDuplicateComics("cover-date");
    doLoadDuplicateComics("comic-count");
    doLoadDuplicateComics("farkle");
    doLoadDuplicateComics("");
  }

  private void doLoadDuplicateComics(final String sortField) {
    for (int sort = 0; sort < 3; sort++) {
      String sortDirection;
      switch (sort) {
        case 0 -> sortDirection = "asc";
        case 1 -> sortDirection = "desc";
        default -> sortDirection = "";
      }

      Mockito.when(duplicateComicRepository.findAll(pageRequestArgumentCaptor.capture()))
          .thenReturn(duplicateComicPage);
      Mockito.when(duplicateComicPage.stream()).thenReturn(duplicatePageStream);
      Mockito.when(duplicatePageStream.toList()).thenReturn(duplicatePageList);

      final List<DuplicateComic> result =
          service.loadDuplicateComics(TEST_PAGE_SIZE, TEST_PAGE_NUMBER, sortField, sortDirection);

      assertSame(duplicatePageList, result);

      final PageRequest pageRequest = pageRequestArgumentCaptor.getValue();
      assertEquals(TEST_PAGE_NUMBER, pageRequest.getPageNumber());
      assertEquals(TEST_PAGE_SIZE, pageRequest.getPageSize());

      assertNotNull(pageRequest);
    }
  }

  @Test
  void getDuplicateComicBookCount() {
    Mockito.when(duplicateComicRepository.count()).thenReturn(TEST_TOTAL_COMIC_COUNT);

    final long result = service.getDuplicateComicBookCount();

    assertEquals(TEST_TOTAL_COMIC_COUNT, result);

    Mockito.verify(duplicateComicRepository, Mockito.times(1)).count();
  }
}

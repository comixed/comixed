/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

import static junit.framework.TestCase.*;
import static org.junit.Assert.assertThrows;

import java.util.List;
import org.comixedproject.model.library.DuplicatePage;
import org.comixedproject.model.net.library.LoadDuplicatePageListRequest;
import org.comixedproject.model.net.library.LoadDuplicatePageListResponse;
import org.comixedproject.service.library.DuplicatePageException;
import org.comixedproject.service.library.DuplicatePageService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DuplicatePageControllerTest {
  private static final String TEST_PAGE_HASH = "0123456789ABCDEF0123456789ABCDEF";
  private static final int TEST_PAGE_NUMBER = 74;
  private static final int TEST_PAGE_SIZE = 25;
  private static final String TEST_SORT_BY = "hash";
  private static final String TEST_SORT_DIRECTION = "desc";
  private static final long TEST_DUPLICATE_PAGE_COUNT = 238L;

  @InjectMocks private DuplicatePageController controller;
  @Mock private DuplicatePageService duplicatePageService;
  @Mock private DuplicatePage duplicatePage;
  @Mock private List<DuplicatePage> duplicatePageList;
  @Mock private LoadDuplicatePageListResponse duplicatePageListResponse;

  @Test
  void getDuplicatePageList() {
    Mockito.when(
            duplicatePageService.getDuplicatePages(
                Mockito.anyInt(), Mockito.anyInt(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(duplicatePageList);
    Mockito.when(duplicatePageService.getDuplicatePageCount())
        .thenReturn(TEST_DUPLICATE_PAGE_COUNT);

    final LoadDuplicatePageListResponse result =
        controller.getDuplicatePageList(
            new LoadDuplicatePageListRequest(
                TEST_PAGE_NUMBER, TEST_PAGE_SIZE, TEST_SORT_BY, TEST_SORT_DIRECTION));

    assertNotNull(result);
    assertSame(duplicatePageList, result.getPages());
    assertEquals(TEST_DUPLICATE_PAGE_COUNT, result.getTotal());

    Mockito.verify(duplicatePageService, Mockito.times(1))
        .getDuplicatePages(TEST_PAGE_NUMBER, TEST_PAGE_SIZE, TEST_SORT_BY, TEST_SORT_DIRECTION);
  }

  @Test
  void getPageForHashServiceException() throws DuplicatePageException {
    Mockito.when(duplicatePageService.getForHash(Mockito.anyString()))
        .thenThrow(DuplicatePageException.class);

    assertThrows(DuplicatePageException.class, () -> controller.getForHash(TEST_PAGE_HASH));
  }

  @Test
  void getPageForHash() throws DuplicatePageException {
    Mockito.when(duplicatePageService.getForHash(Mockito.anyString())).thenReturn(duplicatePage);

    final DuplicatePage result = controller.getForHash(TEST_PAGE_HASH);

    assertNotNull(result);
    assertSame(duplicatePage, result);

    Mockito.verify(duplicatePageService, Mockito.times(1)).getForHash(TEST_PAGE_HASH);
  }
}

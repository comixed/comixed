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

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.library.DuplicatePage;
import org.comixedproject.service.library.DuplicatePageException;
import org.comixedproject.service.library.DuplicatePageService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class DuplicatePageControllerTest {
  private static final String TEST_PAGE_HASH = "0123456789ABCDEF0123456789ABCDEF";

  @InjectMocks private DuplicatePageController controller;
  @Mock private DuplicatePageService duplicatePageService;
  @Mock private DuplicatePage duplicatePage;

  private List<DuplicatePage> duplicatePageList = new ArrayList<>();

  @Test
  public void testGetDuplicatePageList() {
    Mockito.when(duplicatePageService.getDuplicatePages()).thenReturn(duplicatePageList);

    final List<DuplicatePage> result = controller.getDuplicatePageList();

    assertNotNull(result);
    assertSame(duplicatePageList, result);

    Mockito.verify(duplicatePageService, Mockito.times(1)).getDuplicatePages();
  }

  @Test(expected = DuplicatePageException.class)
  public void testGetPageForHashServiceException() throws DuplicatePageException {
    Mockito.when(duplicatePageService.getForHash(Mockito.anyString()))
        .thenThrow(DuplicatePageException.class);

    try {
      controller.getForHash(TEST_PAGE_HASH);
    } finally {
      Mockito.verify(duplicatePageService, Mockito.times(1)).getForHash(TEST_PAGE_HASH);
    }
  }

  @Test
  public void testGetPageForHash() throws DuplicatePageException {
    Mockito.when(duplicatePageService.getForHash(Mockito.anyString())).thenReturn(duplicatePage);

    final DuplicatePage result = controller.getForHash(TEST_PAGE_HASH);

    assertNotNull(result);
    assertSame(duplicatePage, result);

    Mockito.verify(duplicatePageService, Mockito.times(1)).getForHash(TEST_PAGE_HASH);
  }
}

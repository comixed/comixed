/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

import java.util.List;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class DuplicateComicControllerTest {
  @InjectMocks private DuplicateComicController controller;
  @Mock private ComicBookService comicBookService;
  @Mock private List<ComicDetail> comicDetailList;

  @Test
  public void testGetDuplicateComics() {
    Mockito.when(comicBookService.findDuplicateComics()).thenReturn(comicDetailList);

    final List<ComicDetail> result = controller.getDuplicateComics();

    assertNotNull(result);
    assertSame(comicDetailList, result);

    Mockito.verify(comicBookService, Mockito.times(1)).findDuplicateComics();
  }
}

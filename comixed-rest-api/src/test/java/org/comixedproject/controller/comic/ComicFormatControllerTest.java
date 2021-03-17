/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project.
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

package org.comixedproject.controller.comic;

import java.util.List;
import org.comixedproject.model.comic.ComicFormat;
import org.comixedproject.service.comic.ComicFormatService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ComicFormatControllerTest {
  @InjectMocks private ComicFormatController controller;
  @Mock private ComicFormatService comicFormatService;
  @Mock private List<ComicFormat> comicFormatList;

  @Test
  public void testGetAll() {
    Mockito.when(comicFormatService.getAll()).thenReturn(comicFormatList);

    controller.getAll();

    Mockito.verify(comicFormatService, Mockito.times(1)).getAll();
  }
}

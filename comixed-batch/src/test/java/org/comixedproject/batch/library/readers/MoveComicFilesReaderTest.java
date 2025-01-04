/*
 * ComiXed - A digital comicBook book library management application.
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

package org.comixedproject.batch.library.readers;

import static junit.framework.TestCase.*;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.library.OrganizingComic;
import org.comixedproject.service.library.OrganizingComicService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class MoveComicFilesReaderTest {
  private static final int MAX_RECORDS = 25;

  @InjectMocks private MoveComicFilesReader reader;
  @Mock private OrganizingComicService organizingComicService;
  @Mock private OrganizingComic organizingComic;

  private List<OrganizingComic> organzingComicList = new ArrayList<>();

  @Test
  public void testRead_noneLoaded_manyFound() {
    for (int index = 0; index < MAX_RECORDS; index++) organzingComicList.add(organizingComic);

    Mockito.when(organizingComicService.loadComics(Mockito.anyInt()))
        .thenReturn(organzingComicList);

    final OrganizingComic result = reader.read();

    assertNotNull(result);
    assertSame(organizingComic, result);
    assertFalse(organzingComicList.isEmpty());
    assertEquals(MAX_RECORDS - 1, organzingComicList.size());

    Mockito.verify(organizingComicService, Mockito.times(1)).loadComics(reader.getChunkSize());
  }

  @Test
  public void testRead_noneLoaded_noneFound() {
    Mockito.when(organizingComicService.loadComics(Mockito.anyInt()))
        .thenReturn(organzingComicList);

    final OrganizingComic result = reader.read();

    assertNull(result);

    Mockito.verify(organizingComicService, Mockito.times(1)).loadComics(reader.getChunkSize());
  }
}

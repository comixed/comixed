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

package org.comixedproject.batch.comicbooks.readers;

import static junit.framework.TestCase.*;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.service.comic.ComicService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class LoadFileDetailsReaderTest {
  private static final int MAX_RECORDS = 25;

  @InjectMocks private LoadFileDetailsReader reader;
  @Mock private ComicService comicService;
  @Mock private Comic comic;

  private List<Comic> comicList = new ArrayList<>();

  @Test
  public void testReadNoneLoadedManyFound() {
    for (int index = 0; index < MAX_RECORDS; index++) comicList.add(comic);

    Mockito.when(comicService.findUnprocessedComicsWithoutFileDetails()).thenReturn(comicList);

    final Comic result = reader.read();

    assertNotNull(result);
    assertSame(comic, result);
    assertFalse(comicList.isEmpty());
    assertEquals(MAX_RECORDS - 1, comicList.size());

    Mockito.verify(comicService, Mockito.times(1)).findUnprocessedComicsWithoutFileDetails();
  }

  @Test
  public void testReadNoneRemaining() {
    reader.comicList = comicList;

    final Comic result = reader.read();

    assertNull(result);
    assertNull(reader.comicList);

    Mockito.verify(comicService, Mockito.never()).findUnprocessedComicsWithoutFileDetails();
  }

  @Test
  public void testReadNoneLoadedNoneFound() {
    Mockito.when(comicService.findUnprocessedComicsWithoutFileDetails()).thenReturn(comicList);

    final Comic result = reader.read();

    assertNull(result);
    assertNull(reader.comicList);

    Mockito.verify(comicService, Mockito.times(1)).findUnprocessedComicsWithoutFileDetails();
  }
}

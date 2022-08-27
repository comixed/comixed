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

package org.comixedproject.batch.metadata.readers;

import static junit.framework.TestCase.*;
import static junit.framework.TestCase.assertNull;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ScrapeComicBookReaderTest {
  private static final int MAX_RECORDS = 25;

  @InjectMocks private ScrapeComicBookReader reader;
  @Mock private ComicBookService comicBookService;
  @Mock private ComicBook comicBook;

  private List<ComicBook> comicBookList = new ArrayList<>();

  @Test
  public void testReadNoneLoadedManyFound() {
    for (int index = 0; index < MAX_RECORDS; index++) comicBookList.add(comicBook);

    Mockito.when(comicBookService.findComicsForBatchMetadataUpdate(Mockito.anyInt()))
        .thenReturn(comicBookList);

    final ComicBook result = reader.read();

    assertNotNull(result);
    assertSame(comicBook, result);
    assertFalse(comicBookList.isEmpty());
    assertEquals(MAX_RECORDS - 1, comicBookList.size());

    Mockito.verify(comicBookService, Mockito.times(1))
        .findComicsForBatchMetadataUpdate(reader.getBatchChunkSize());
  }

  @Test
  public void testReadNoneRemaining() {
    Mockito.when(comicBookService.findComicsForBatchMetadataUpdate(Mockito.anyInt()))
        .thenReturn(comicBookList);

    reader.setComicBookList(comicBookList);

    final ComicBook result = reader.read();

    assertNull(result);
    assertNull(reader.getComicBookList());

    Mockito.verify(comicBookService, Mockito.times(1))
        .findComicsForBatchMetadataUpdate(reader.getBatchChunkSize());
  }

  @Test
  public void testReadNoneLoadedNoneFound() {
    Mockito.when(comicBookService.findComicsForBatchMetadataUpdate(Mockito.anyInt()))
        .thenReturn(comicBookList);

    final ComicBook result = reader.read();

    assertNull(result);
    assertNull(reader.getComicBookList());

    Mockito.verify(comicBookService, Mockito.times(1))
        .findComicsForBatchMetadataUpdate(reader.getBatchChunkSize());
  }
}

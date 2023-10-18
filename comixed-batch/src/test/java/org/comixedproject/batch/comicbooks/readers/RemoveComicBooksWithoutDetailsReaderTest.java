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

package org.comixedproject.batch.comicbooks.readers;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertFalse;
import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertNull;
import static junit.framework.TestCase.assertSame;
import static org.junit.Assert.*;

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
public class RemoveComicBooksWithoutDetailsReaderTest {
  private static final int MAX_RECORDS = 25;

  @InjectMocks private RemoveComicBooksWithoutDetailsReader reader;
  @Mock private ComicBookService comicBookService;
  @Mock private ComicBook comicBook;

  private final List<ComicBook> comicBookList = new ArrayList<>();

  @Test
  public void testReadNoneLoadedManyFound() {
    for (int index = 0; index < MAX_RECORDS; index++) comicBookList.add(comicBook);

    Mockito.when(comicBookService.getComicBooksWithoutDetails(Mockito.anyInt()))
        .thenReturn(comicBookList);

    final ComicBook result = reader.read();

    assertNotNull(result);
    assertSame(comicBook, result);
    assertFalse(comicBookList.isEmpty());
    assertEquals(MAX_RECORDS - 1, comicBookList.size());

    Mockito.verify(comicBookService, Mockito.times(1))
        .getComicBooksWithoutDetails(reader.getBatchChunkSize());
  }

  @Test
  public void testReadNoneRemaining() {
    Mockito.when(comicBookService.getComicBooksWithoutDetails(Mockito.anyInt()))
        .thenReturn(comicBookList);

    reader.comicBookList = comicBookList;

    final ComicBook result = reader.read();

    assertNull(result);
    assertNull(reader.comicBookList);

    Mockito.verify(comicBookService, Mockito.times(1))
        .getComicBooksWithoutDetails(reader.getBatchChunkSize());
  }

  @Test
  public void testReadNoneLoadedNoneFound() {
    Mockito.when(comicBookService.getComicBooksWithoutDetails(Mockito.anyInt()))
        .thenReturn(comicBookList);

    final ComicBook result = reader.read();

    assertNull(result);
    assertNull(reader.comicBookList);

    Mockito.verify(comicBookService, Mockito.times(1))
        .getComicBooksWithoutDetails(reader.getBatchChunkSize());
  }
}

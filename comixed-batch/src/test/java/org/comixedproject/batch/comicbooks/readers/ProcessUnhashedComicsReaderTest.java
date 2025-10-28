/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ProcessUnhashedComicsReaderTest {
  private static final int MAX_RECORDS = 25;

  @InjectMocks private ProcessUnhashedComicsReader reader;
  @Mock private ComicBookService comicBookService;
  @Mock private ComicDetail comicDetail;
  @Mock private ComicBook comicBook;

  private List<ComicBook> comicBookList = new ArrayList<>();

  @BeforeEach
  void setUp() {
    Mockito.when(comicDetail.isMissing()).thenReturn(false);
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
  }

  @Test
  void read_noneLoaded() {
    Mockito.when(comicBookService.findComicsWithUnhashedPages(Mockito.anyInt()))
        .thenReturn(comicBookList);

    reader.comicBookList = null;

    final ComicBook result = reader.read();

    assertNull(result);

    Mockito.verify(comicBookService, Mockito.times(1))
        .findComicsWithUnhashedPages(reader.getChunkSize());
  }

  @Test
  void read_comicMissing() {
    comicBookList.add(comicBook);
    Mockito.when(comicDetail.isMissing()).thenReturn(true);

    Mockito.when(comicBookService.findComicsWithUnhashedPages(Mockito.anyInt()))
        .thenReturn(comicBookList);

    reader.comicBookList = null;

    final ComicBook result = reader.read();

    assertNull(result);

    Mockito.verify(comicBookService, Mockito.times(1))
        .findComicsWithUnhashedPages(reader.getChunkSize());
  }

  @Test
  void read_noneRemaining() {
    Mockito.when(comicBookService.findComicsWithUnhashedPages(Mockito.anyInt()))
        .thenReturn(comicBookList);

    reader.comicBookList = new ArrayList<>();

    final ComicBook result = reader.read();

    assertNull(result);

    Mockito.verify(comicBookService, Mockito.times(1))
        .findComicsWithUnhashedPages(reader.getChunkSize());
  }

  @Test
  void read_someRemaining() {
    for (int index = 0; index < MAX_RECORDS; index++) comicBookList.add(comicBook);

    reader.comicBookList = comicBookList;

    final ComicBook result = reader.read();

    assertNotNull(result);
    assertSame(comicBook, result);
    assertFalse(comicBookList.isEmpty());
    assertEquals(MAX_RECORDS - 1, comicBookList.size());

    Mockito.verify(comicBookService, Mockito.never()).findComicsWithUnhashedPages(Mockito.anyInt());
  }

  @Test
  void read_noneLoaded_noneFound() {
    Mockito.when(comicBookService.findComicsWithUnhashedPages(Mockito.anyInt()))
        .thenReturn(comicBookList);

    final ComicBook result = reader.read();

    assertNull(result);
    assertNull(reader.comicBookList);

    Mockito.verify(comicBookService, Mockito.times(1))
        .findComicsWithUnhashedPages(reader.getChunkSize());
  }
}

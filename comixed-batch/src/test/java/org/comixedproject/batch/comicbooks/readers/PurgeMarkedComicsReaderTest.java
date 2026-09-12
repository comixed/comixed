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

package org.comixedproject.batch.comicbooks.readers;

import static junit.framework.TestCase.*;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.service.comicbooks.ComicService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PurgeMarkedComicsReaderTest {
  private static final int MAX_RECORDS = 25;

  @InjectMocks private PurgeMarkedComicsReader reader;
  @Mock private ComicService comicService;
  @Mock private Comic comic;

  private final List<Comic> comicBookList = new ArrayList<>();

  @Test
  void read_noneLoaded_manyFound() {
    for (int index = 0; index < MAX_RECORDS; index++) comicBookList.add(comic);

    when(comicService.findComicBooksToBePurged(anyInt())).thenReturn(comicBookList);

    final Comic result = reader.read();

    assertNotNull(result);
    assertSame(comic, result);
    assertFalse(comicBookList.isEmpty());
    assertEquals(MAX_RECORDS - 1, comicBookList.size());

    verify(comicService).findComicBooksToBePurged(reader.getChunkSize());
  }

  @Test
  void read_noneRemaining() {
    when(comicService.findComicBooksToBePurged(anyInt())).thenReturn(comicBookList);

    reader.comicBookList = comicBookList;

    final Comic result = reader.read();

    assertNull(result);
    assertNull(reader.comicBookList);

    verify(comicService).findComicBooksToBePurged(reader.getChunkSize());
  }

  @Test
  void read_noneLoaded_noneFound() {
    when(comicService.findComicBooksToBePurged(anyInt())).thenReturn(comicBookList);

    final Comic result = reader.read();

    assertNull(result);
    assertNull(reader.comicBookList);

    verify(comicService).findComicBooksToBePurged(reader.getChunkSize());
  }
}

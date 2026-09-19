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

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertFalse;
import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertNull;
import static junit.framework.TestCase.assertSame;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.service.comicbooks.ComicService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ScrapeMetadataReaderTest {
  private static final int MAX_RECORDS = 25;

  @InjectMocks private ScrapeMetadataReader reader;
  @Mock private ComicService comicService;
  @Mock private Comic comic;

  private List<Comic> comicList = new ArrayList<>();

  @Test
  void read_noneLoaded_manyFound() {
    for (int index = 0; index < MAX_RECORDS; index++) comicList.add(comic);

    when(comicService.findBatchScrapingComics(Mockito.anyInt())).thenReturn(comicList);

    final Comic result = reader.read();

    assertNotNull(result);
    assertSame(comic, result);
    assertFalse(comicList.isEmpty());
    assertEquals(MAX_RECORDS - 1, comicList.size());

    verify(comicService).findBatchScrapingComics(reader.getChunkSize());
  }

  @Test
  void read_noneRemaining() {
    when(comicService.findBatchScrapingComics(Mockito.anyInt())).thenReturn(comicList);

    reader.comicList = comicList;

    final Comic result = reader.read();

    assertNull(result);
    assertNull(reader.comicList);

    verify(comicService).findBatchScrapingComics(reader.getChunkSize());
  }

  @Test
  void read_noneLoaded_noneFound() {
    when(comicService.findBatchScrapingComics(Mockito.anyInt())).thenReturn(comicList);

    final Comic result = reader.read();

    assertNull(result);
    assertNull(reader.comicList);

    verify(comicService).findBatchScrapingComics(reader.getChunkSize());
  }
}

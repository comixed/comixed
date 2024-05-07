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

package org.comixedproject.service.batch;

import static org.junit.Assert.*;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.batch.ComicBatch;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.repositories.batch.ComicBatchRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ComicBatchServiceTest {
  private static final String TEST_BATCH_NAME = "batch-name";
  private static final int TEST_INDEX = 12;

  @InjectMocks private ComicBatchService service;
  @Mock private ComicBatchRepository comicBatchRepository;
  @Mock private ComicBatch savedComicBatch;
  @Mock private ComicBatch incomingComicBatch;

  @Captor private ArgumentCaptor<ComicBatch> comicBatchArgumentCaptor;

  private List<ComicBook> comicBookList = new ArrayList<>();

  @Before
  public void setUp() {
    for (int index = 0; index < 25; index++) comicBookList.add(Mockito.mock(ComicBook.class));
    Mockito.when(comicBatchRepository.save(comicBatchArgumentCaptor.capture()))
        .thenReturn(savedComicBatch);
    Mockito.when(comicBatchRepository.getByName(Mockito.anyString())).thenReturn(savedComicBatch);
  }

  @Test
  public void testCreateProcessComicBatchGroup() {
    service.createProcessComicBooksGroup(comicBookList, TEST_INDEX);

    final ComicBatch comicBatchArgument = comicBatchArgumentCaptor.getValue();
    assertNotNull(comicBatchArgument);
    assertNotNull(comicBatchArgument.getName());
    assertArrayEquals(
        comicBookList.toArray(),
        comicBatchArgument.getEntries().stream().map(entry -> entry.getComicBook()).toArray());

    Mockito.verify(comicBatchRepository, Mockito.times(1)).save(comicBatchArgument);
  }

  @Test
  public void testSave() {
    final ComicBatch result = service.save(incomingComicBatch);

    assertNotNull(result);
    assertSame(savedComicBatch, result);

    Mockito.verify(comicBatchRepository, Mockito.times(1)).save(incomingComicBatch);
  }

  @Test
  public void testDeleteBatch() {
    service.deleteBatch(incomingComicBatch);

    Mockito.verify(comicBatchRepository, Mockito.times(1)).delete(incomingComicBatch);
  }

  @Test
  public void testGetByName() {
    Mockito.when(comicBatchRepository.getByName(Mockito.anyString())).thenReturn(savedComicBatch);

    final ComicBatch result = service.getByName(TEST_BATCH_NAME);

    assertNotNull(result);
    assertSame(savedComicBatch, result);

    Mockito.verify(comicBatchRepository, Mockito.times(1)).getByName(TEST_BATCH_NAME);
  }

  @Test
  public void testDeleteByNameNotFound() {
    Mockito.when(comicBatchRepository.getByName(Mockito.anyString())).thenReturn(null);

    service.deleteBatchByName(TEST_BATCH_NAME);

    Mockito.verify(comicBatchRepository, Mockito.times(1)).getByName(TEST_BATCH_NAME);
    Mockito.verify(comicBatchRepository, Mockito.never()).delete(Mockito.any());
  }

  @Test
  public void testDeleteByName() {
    service.deleteBatchByName(TEST_BATCH_NAME);

    Mockito.verify(comicBatchRepository, Mockito.times(1)).getByName(TEST_BATCH_NAME);
    Mockito.verify(comicBatchRepository, Mockito.times(1)).delete(savedComicBatch);
  }
}

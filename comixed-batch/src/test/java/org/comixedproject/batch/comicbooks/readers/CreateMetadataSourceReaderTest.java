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

package org.comixedproject.batch.comicbooks.readers;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertFalse;
import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertNull;
import static junit.framework.TestCase.assertSame;
import static org.comixedproject.batch.comicbooks.ProcessComicBooksConfiguration.JOB_PROCESS_COMIC_BOOKS_BATCH_NAME;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.StepExecution;

@RunWith(MockitoJUnitRunner.class)
public class CreateMetadataSourceReaderTest {
  private static final int MAX_RECORDS = 25;
  private static final String TEST_BATCH_NAME = "The batch name";

  @InjectMocks private CreateMetadataSourceReader reader;
  @Mock private ComicBookService comicBookService;
  @Mock private ComicBook comicBook;
  @Mock private JobParameters jobParameters;
  @Mock private JobExecution jobExecution;
  @Mock private StepExecution stepExecution;

  private List<ComicBook> comicBookList = new ArrayList<>();

  @Before
  public void setUp() {
    Mockito.when(jobParameters.getString(JOB_PROCESS_COMIC_BOOKS_BATCH_NAME))
        .thenReturn(TEST_BATCH_NAME);
    Mockito.when(jobExecution.getJobParameters()).thenReturn(jobParameters);
    Mockito.when(stepExecution.getJobExecution()).thenReturn(jobExecution);
    reader.batchName = TEST_BATCH_NAME;
  }

  @Test
  public void testBeforeStep() {
    reader.batchName = null;

    reader.beforeStep(stepExecution);

    assertNotNull(reader.getBatchName());
    assertEquals(TEST_BATCH_NAME, reader.getBatchName());
  }

  @Test
  public void testReadNoneLoadedManyFound() {
    for (int index = 0; index < MAX_RECORDS; index++) comicBookList.add(comicBook);

    Mockito.when(
            comicBookService.findComicsWithCreateMetadataFlagSet(
                Mockito.anyString(), Mockito.anyInt()))
        .thenReturn(comicBookList);

    final ComicBook result = reader.read();

    assertNotNull(result);
    assertSame(comicBook, result);
    assertFalse(comicBookList.isEmpty());
    assertEquals(MAX_RECORDS - 1, comicBookList.size());

    Mockito.verify(comicBookService, Mockito.times(1))
        .findComicsWithCreateMetadataFlagSet(TEST_BATCH_NAME, reader.getBatchChunkSize());
  }

  @Test
  public void testReadNoneRemaining() {
    Mockito.when(
            comicBookService.findComicsWithCreateMetadataFlagSet(
                Mockito.anyString(), Mockito.anyInt()))
        .thenReturn(comicBookList);

    reader.comicBookList = comicBookList;

    final ComicBook result = reader.read();

    assertNull(result);
    assertNull(reader.comicBookList);

    Mockito.verify(comicBookService, Mockito.times(1))
        .findComicsWithCreateMetadataFlagSet(TEST_BATCH_NAME, reader.getBatchChunkSize());
  }

  @Test
  public void testReadNoneLoadedNoneFound() {
    Mockito.when(
            comicBookService.findComicsWithCreateMetadataFlagSet(
                Mockito.anyString(), Mockito.anyInt()))
        .thenReturn(comicBookList);

    final ComicBook result = reader.read();

    assertNull(result);
    assertNull(reader.comicBookList);

    Mockito.verify(comicBookService, Mockito.times(1))
        .findComicsWithCreateMetadataFlagSet(TEST_BATCH_NAME, reader.getBatchChunkSize());
  }
}

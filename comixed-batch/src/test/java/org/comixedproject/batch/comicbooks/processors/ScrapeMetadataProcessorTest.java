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

package org.comixedproject.batch.comicbooks.processors;

import static org.comixedproject.batch.comicbooks.ScrapeMetadataConfiguration.SCRAPE_METADATA_JOB_ERROR_THRESHOLD;
import static org.junit.Assert.*;

import org.comixedproject.batch.ComicCheckOutManager;
import org.comixedproject.metadata.MetadataException;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicMetadataSource;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.metadata.MetadataService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.item.ExecutionContext;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ScrapeMetadataProcessorTest {
  private static final long TEST_METADATA_SOURCE_ID = 4L;
  private static final long TEST_COMIC_BOOK_ID = 717L;
  private static final String TEST_REFERENCE_NUMBER = "91732";
  private static final long TEST_ERROR_COUNT = 25;
  private static final long TEST_ERROR_THRESHOLD = TEST_ERROR_COUNT * 2;

  @InjectMocks private ScrapeMetadataProcessor processor;
  @Mock private ComicCheckOutManager comicCheckOutManager;
  @Mock private MetadataService metadataService;
  @Mock private ComicBookService comicBookService;
  @Mock private MetadataSource metadataSource;
  @Mock private ComicMetadataSource metadata;
  @Mock private ComicBook comicBook;
  @Mock private ExecutionContext executionContext;
  @Mock private JobExecution jobExecutionContext;
  @Mock private JobParameters jobParameters;
  @Mock private StepExecution stepExecution;
  @Mock private ComicBook savedComicBook;

  @BeforeEach
  public void setUp() {
    processor.errorThreshold = TEST_ERROR_THRESHOLD;

    Mockito.when(stepExecution.getSkipCount()).thenReturn(TEST_ERROR_COUNT - 1);
    Mockito.when(metadataSource.getMetadataSourceId()).thenReturn(TEST_METADATA_SOURCE_ID);
    Mockito.when(metadata.getMetadataSource()).thenReturn(metadataSource);
    Mockito.when(metadata.getReferenceId()).thenReturn(TEST_REFERENCE_NUMBER);
    Mockito.when(comicBook.getMetadata()).thenReturn(metadata);
    Mockito.when(comicBook.getComicBookId()).thenReturn(TEST_COMIC_BOOK_ID);
    Mockito.when(jobExecutionContext.getJobParameters()).thenReturn(jobParameters);
    Mockito.when(stepExecution.getJobExecution()).thenReturn(jobExecutionContext);
    Mockito.when(comicBookService.save(Mockito.any(ComicBook.class))).thenReturn(savedComicBook);
  }

  @Test
  void process() throws MetadataException {
    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(metadataService, Mockito.times(1))
        .scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_BOOK_ID, TEST_REFERENCE_NUMBER, false);
  }

  @Test
  void process_errorThresholdExceeded() throws MetadataException {
    Mockito.when(stepExecution.getSkipCount()).thenReturn(TEST_ERROR_COUNT + 1);
    processor.errorThreshold = TEST_ERROR_COUNT;

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(metadataService, Mockito.never())
        .scrapeComic(
            Mockito.anyLong(), Mockito.anyLong(), Mockito.anyString(), Mockito.anyBoolean());
  }

  @Test
  void process_errorOccurs() throws MetadataException {
    Mockito.when(
            metadataService.scrapeComic(
                Mockito.anyLong(), Mockito.anyLong(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenThrow(MetadataException.class);
    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(metadataService, Mockito.times(1))
        .scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_BOOK_ID, TEST_REFERENCE_NUMBER, false);
  }

  @Test
  void beforeStep() {
    Mockito.when(jobParameters.getLong(SCRAPE_METADATA_JOB_ERROR_THRESHOLD))
        .thenReturn(TEST_ERROR_THRESHOLD);

    processor.beforeStep(stepExecution);

    assertEquals(TEST_ERROR_THRESHOLD, processor.errorThreshold);
    assertSame(stepExecution, processor.stepExecution);
  }

  @Test
  void afterStep() {
    final ExitStatus result = processor.afterStep(stepExecution);

    assertNull(result);

    Mockito.verify(stepExecution, Mockito.times(1)).getSkipCount();
  }

  @Test
  void afterStep_belowThreshold() {
    Mockito.when(stepExecution.getSkipCount()).thenReturn(TEST_ERROR_THRESHOLD - 1);

    final ExitStatus result = processor.afterStep(stepExecution);

    assertNull(result);

    Mockito.verify(stepExecution, Mockito.times(1)).getSkipCount();
  }

  @Test
  void afterStep_processSkipCountMeetsThreshold() {
    Mockito.when(stepExecution.getSkipCount()).thenReturn(TEST_ERROR_THRESHOLD);

    final ExitStatus result = processor.afterStep(stepExecution);

    assertNotNull(result);
    assertEquals(ExitStatus.FAILED, result);

    Mockito.verify(stepExecution, Mockito.times(1)).getSkipCount();
  }

  @Test
  void afterStep_processSkipCountExceedsThreshold() {
    Mockito.when(stepExecution.getSkipCount()).thenReturn(TEST_ERROR_THRESHOLD + 1);

    final ExitStatus result = processor.afterStep(stepExecution);

    assertNotNull(result);
    assertEquals(ExitStatus.FAILED, result);

    Mockito.verify(stepExecution, Mockito.times(1)).getSkipCount();
  }
}

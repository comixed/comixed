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
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import org.comixedproject.metadata.MetadataException;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicMetadataSource;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.service.comicbooks.ComicService;
import org.comixedproject.service.metadata.MetadataService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.job.JobExecution;
import org.springframework.batch.core.job.parameters.JobParameters;
import org.springframework.batch.core.step.StepExecution;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ScrapeMetadataProcessorTest {
  private static final long TEST_METADATA_SOURCE_ID = 4L;
  private static final long TEST_COMIC_ID = 717L;
  private static final String TEST_REFERENCE_NUMBER = "91732";
  private static final long TEST_ERROR_COUNT = 25;
  private static final long TEST_ERROR_THRESHOLD = TEST_ERROR_COUNT * 2;

  @InjectMocks private ScrapeMetadataProcessor processor;
  @Mock private MetadataService metadataService;
  @Mock private ComicService comicService;
  @Mock private MetadataSource metadataSource;
  @Mock private ComicMetadataSource metadata;
  @Mock private JobExecution jobExecutionContext;
  @Mock private JobParameters jobParameters;
  @Mock private StepExecution stepExecution;
  @Mock private Comic comic;
  @Mock private Comic savedComic;

  @BeforeEach
  void setUp() {
    processor.errorThreshold = TEST_ERROR_THRESHOLD;

    when(stepExecution.getSkipCount()).thenReturn(TEST_ERROR_COUNT - 1);
    when(metadataSource.getMetadataSourceId()).thenReturn(TEST_METADATA_SOURCE_ID);
    when(metadata.getMetadataSource()).thenReturn(metadataSource);
    when(metadata.getReferenceId()).thenReturn(TEST_REFERENCE_NUMBER);
    when(comic.getMetadata()).thenReturn(metadata);
    when(comic.getComicId()).thenReturn(TEST_COMIC_ID);
    when(comic.isLoadingFileContents()).thenReturn(false);
    when(comic.isPurging()).thenReturn(false);
    when(jobExecutionContext.getJobParameters()).thenReturn(jobParameters);
    when(stepExecution.getJobExecution()).thenReturn(jobExecutionContext);
    when(comicService.save(any(Comic.class))).thenReturn(savedComic);
  }

  @Test
  void process() throws MetadataException {
    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    verify(metadataService)
        .scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_REFERENCE_NUMBER, false);
  }

  @Test
  void process_fileContentsNotLoaded() {
    when(comic.isLoadingFileContents()).thenReturn(true);

    assertNull(processor.process(comic));
  }

  @Test
  void process_isPurging() {
    when(comic.isPurging()).thenReturn(true);

    assertNull(processor.process(comic));
  }

  @Test
  void process_errorThresholdExceeded() throws MetadataException {
    when(stepExecution.getSkipCount()).thenReturn(TEST_ERROR_COUNT + 1);
    processor.errorThreshold = TEST_ERROR_COUNT;

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    verify(metadataService, never()).scrapeComic(anyLong(), anyLong(), anyString(), anyBoolean());
  }

  @Test
  void process_errorOccurs() throws MetadataException {
    when(metadataService.scrapeComic(anyLong(), anyLong(), anyString(), anyBoolean()))
        .thenThrow(MetadataException.class);
    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    verify(metadataService)
        .scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_REFERENCE_NUMBER, false);
  }

  @Test
  void beforeStep() {
    when(jobParameters.getLong(SCRAPE_METADATA_JOB_ERROR_THRESHOLD))
        .thenReturn(TEST_ERROR_THRESHOLD);

    processor.beforeStep(stepExecution);

    assertEquals(TEST_ERROR_THRESHOLD, processor.errorThreshold);
    assertSame(stepExecution, processor.stepExecution);
  }

  @Test
  void afterStep() {
    final ExitStatus result = processor.afterStep(stepExecution);

    assertNull(result);

    verify(stepExecution).getSkipCount();
  }

  @Test
  void afterStep_belowThreshold() {
    when(stepExecution.getSkipCount()).thenReturn(TEST_ERROR_THRESHOLD - 1);

    final ExitStatus result = processor.afterStep(stepExecution);

    assertNull(result);

    verify(stepExecution).getSkipCount();
  }

  @Test
  void afterStep_processSkipCountMeetsThreshold() {
    when(stepExecution.getSkipCount()).thenReturn(TEST_ERROR_THRESHOLD);

    final ExitStatus result = processor.afterStep(stepExecution);

    assertNotNull(result);
    assertEquals(ExitStatus.FAILED, result);

    verify(stepExecution).getSkipCount();
  }

  @Test
  void afterStep_processSkipCountExceedsThreshold() {
    when(stepExecution.getSkipCount()).thenReturn(TEST_ERROR_THRESHOLD + 1);

    final ExitStatus result = processor.afterStep(stepExecution);

    assertNotNull(result);
    assertEquals(ExitStatus.FAILED, result);

    verify(stepExecution).getSkipCount();
  }
}

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

package org.comixedproject.batch.metadata.processors;

import static junit.framework.TestCase.*;
import static org.comixedproject.batch.metadata.MetadataProcessConfiguration.PARAM_SKIP_CACHE;

import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicMetadataSource;
import org.comixedproject.model.metadata.MetadataSource;
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
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.StepExecution;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ScrapeComicBookProcessorTest {
  private static final Long TEST_COMIC_METADATA_SOURCE_ID = 72L;
  private static final Long TEST_COMIC_BOOK_ID = 27L;
  private static final String TEST_METADATA_REFERENCE_ID = "92731";
  private static final Long TEST_METADATA_SOURCE_ID = 717L;
  private static final Boolean TEST_SKIP_CACHE = RandomUtils.nextBoolean();

  @InjectMocks private ScrapeComicBookProcessor processor;
  @Mock private MetadataService metadataService;
  @Mock private ComicBook comicBook;
  @Mock private ComicMetadataSource comicMetadataSource;
  @Mock private ComicBook scrapedComicBook;
  @Mock private MetadataSource metadataSource;
  @Mock private StepExecution stepExecution;
  @Mock private JobParameters jobParameters;

  @BeforeEach
  public void setUp() {
    Mockito.when(comicBook.getComicBookId()).thenReturn(TEST_COMIC_BOOK_ID);
    Mockito.when(comicBook.getMetadata()).thenReturn(comicMetadataSource);
    Mockito.when(comicMetadataSource.getComicMetadataSourceId())
        .thenReturn(TEST_COMIC_METADATA_SOURCE_ID);
    Mockito.when(metadataSource.getMetadataSourceId()).thenReturn(TEST_METADATA_SOURCE_ID);
    Mockito.when(comicMetadataSource.getMetadataSource()).thenReturn(metadataSource);
    Mockito.when(comicMetadataSource.getReferenceId()).thenReturn(TEST_METADATA_REFERENCE_ID);
    Mockito.when(jobParameters.getString(PARAM_SKIP_CACHE))
        .thenReturn(String.valueOf(TEST_SKIP_CACHE));
    Mockito.when(stepExecution.getJobParameters()).thenReturn(jobParameters);
  }

  @Test
  void process_noMetadataSource() throws Exception {
    Mockito.when(comicBook.getMetadata()).thenReturn(null);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBook, Mockito.times(1)).setBatchMetadataUpdate(false);
  }

  @Test
  void process_noMetadataSourceId() throws Exception {
    Mockito.when(comicMetadataSource.getComicMetadataSourceId()).thenReturn(null);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBook, Mockito.times(1)).setBatchMetadataUpdate(false);
  }

  @Test
  void process() throws Exception {
    Mockito.when(
            metadataService.scrapeComic(
                Mockito.anyLong(), Mockito.anyLong(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(scrapedComicBook);

    processor.beforeStep(stepExecution);

    final ComicBook result = processor.process(comicBook);

    assertNotNull(result);
    assertSame(scrapedComicBook, result);

    Mockito.verify(metadataService, Mockito.times(1))
        .scrapeComic(
            TEST_METADATA_SOURCE_ID,
            TEST_COMIC_BOOK_ID,
            TEST_METADATA_REFERENCE_ID,
            TEST_SKIP_CACHE);
    Mockito.verify(scrapedComicBook, Mockito.times(1)).setBatchMetadataUpdate(false);
  }

  @Test
  void afterStep() {
    assertNull(processor.afterStep(stepExecution));
  }
}

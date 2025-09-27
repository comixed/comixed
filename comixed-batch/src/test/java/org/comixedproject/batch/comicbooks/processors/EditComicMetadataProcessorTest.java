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

package org.comixedproject.batch.comicbooks.processors;

import static junit.framework.TestCase.assertNull;
import static org.comixedproject.batch.comicbooks.EditComicBookMetadataConfiguration.*;

import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.batch.ComicCheckOutManager;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.StepExecution;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class EditComicMetadataProcessorTest {
  private static final String TEST_PUBLISHER = "The publisher";
  private static final String TEST_SERIES = "The series";
  private static final String TEST_VOLUME = "2022";
  private static final String TEST_ISSUENO = "723.1";
  private static final String TEST_IMPRINT = "The imprint";
  private static final String TEST_COMIC_TYPE =
      ComicType.values()[RandomUtils.nextInt(ComicType.values().length)].name();

  @InjectMocks private EditComicMetadataProcessor processor;
  @Mock private ComicCheckOutManager comicCheckOutManager;
  @Mock private StepExecution stepExecution;
  @Mock private JobExecution jobExecution;
  @Mock private JobParameters jobParameters;
  @Mock private ComicBook comicBook;
  @Mock private ComicDetail comicDetail;

  @BeforeEach
  void setUp() {
    Mockito.when(comicBook.isFileContentsLoaded()).thenReturn(true);
    Mockito.when(comicBook.isPurging()).thenReturn(false);
    Mockito.when(comicBook.isBatchMetadataUpdate()).thenReturn(false);
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);

    Mockito.when(stepExecution.getJobExecution()).thenReturn(jobExecution);
    Mockito.when(jobExecution.getJobParameters()).thenReturn(jobParameters);
    processor.beforeStep(stepExecution);

    Mockito.when(jobParameters.getString(EDIT_COMIC_METADATA_JOB_PUBLISHER))
        .thenReturn(TEST_PUBLISHER);
    Mockito.when(jobParameters.getString(EDIT_COMIC_METADATA_JOB_SERIES)).thenReturn(TEST_SERIES);
    Mockito.when(jobParameters.getString(EDIT_COMIC_METADATA_JOB_VOLUME)).thenReturn(TEST_VOLUME);
    Mockito.when(jobParameters.getString(EDIT_COMIC_METADATA_JOB_ISSUE_NUMBER))
        .thenReturn(TEST_ISSUENO);
    Mockito.when(jobParameters.getString(EDIT_COMIC_METADATA_JOB_IMPRINT)).thenReturn(TEST_IMPRINT);
    Mockito.when(jobParameters.getString(EDIT_COMIC_METADATA_JOB_COMIC_TYPE))
        .thenReturn(TEST_COMIC_TYPE);
  }

  @Test
  void process_fileContentsNotLoaded() throws Exception {
    Mockito.when(comicBook.isFileContentsLoaded()).thenReturn(false);

    assertNull(processor.process(comicBook));
  }

  @Test
  void process_isPurging() throws Exception {
    Mockito.when(comicBook.isPurging()).thenReturn(true);

    assertNull(processor.process(comicBook));
  }

  @Test
  void process_isBatchMetadataUpdate() throws Exception {
    Mockito.when(comicBook.isBatchMetadataUpdate()).thenReturn(true);

    assertNull(processor.process(comicBook));
  }

  @Test
  void process() throws Exception {
    processor.process(comicBook);

    Mockito.verify(comicDetail, Mockito.times(1)).setPublisher(TEST_PUBLISHER);
    Mockito.verify(comicDetail, Mockito.times(1)).setSeries(TEST_SERIES);
    Mockito.verify(comicDetail, Mockito.times(1)).setVolume(TEST_VOLUME);
    Mockito.verify(comicDetail, Mockito.times(1)).setIssueNumber(TEST_ISSUENO);
    Mockito.verify(comicDetail, Mockito.times(1)).setImprint(TEST_IMPRINT);
  }

  @Test
  void process_noPublisher() throws Exception {
    Mockito.when(jobParameters.getString(EDIT_COMIC_METADATA_JOB_PUBLISHER)).thenReturn(null);

    processor.process(comicBook);

    Mockito.verify(comicDetail, Mockito.never()).setPublisher(Mockito.anyString());
  }

  @Test
  void process_noSeries() throws Exception {
    Mockito.when(jobParameters.getString(EDIT_COMIC_METADATA_JOB_SERIES)).thenReturn(null);

    processor.process(comicBook);

    Mockito.verify(comicDetail, Mockito.never()).setSeries(Mockito.anyString());
  }

  @Test
  void process_noVolume() throws Exception {
    Mockito.when(jobParameters.getString(EDIT_COMIC_METADATA_JOB_VOLUME)).thenReturn(null);

    processor.process(comicBook);

    Mockito.verify(comicDetail, Mockito.never()).setVolume(Mockito.anyString());
  }

  @Test
  void process_noIssueNumber() throws Exception {
    Mockito.when(jobParameters.getString(EDIT_COMIC_METADATA_JOB_ISSUE_NUMBER)).thenReturn(null);

    processor.process(comicBook);

    Mockito.verify(comicDetail, Mockito.never()).setIssueNumber(Mockito.anyString());
  }

  @Test
  void process_noImprint() throws Exception {
    Mockito.when(jobParameters.getString(EDIT_COMIC_METADATA_JOB_IMPRINT)).thenReturn(null);

    processor.process(comicBook);

    Mockito.verify(comicDetail, Mockito.never()).setImprint(Mockito.anyString());
  }

  @Test
  void process_noComicType() throws Exception {
    Mockito.when(jobParameters.getString(EDIT_COMIC_METADATA_JOB_COMIC_TYPE)).thenReturn(null);

    processor.process(comicBook);

    Mockito.verify(comicDetail, Mockito.never()).setComicType(Mockito.any(ComicType.class));
  }

  @Test
  void afterStep() {
    assertNull(processor.afterStep(stepExecution));
  }
}

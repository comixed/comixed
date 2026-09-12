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
import static org.comixedproject.batch.comicbooks.EditComicMetadataConfiguration.*;
import static org.mockito.Mockito.*;

import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.batch.core.job.JobExecution;
import org.springframework.batch.core.job.parameters.JobParameters;
import org.springframework.batch.core.step.StepExecution;

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
  @Mock private StepExecution stepExecution;
  @Mock private JobExecution jobExecution;
  @Mock private JobParameters jobParameters;
  @Mock private Comic comic;

  @BeforeEach
  void setUp() {
    when(comic.isLoadingFileContents()).thenReturn(false);
    when(comic.isPurging()).thenReturn(false);
    when(comic.isBatchUpdatingMetadata()).thenReturn(false);

    when(stepExecution.getJobExecution()).thenReturn(jobExecution);
    when(jobExecution.getJobParameters()).thenReturn(jobParameters);
    processor.beforeStep(stepExecution);

    when(jobParameters.getString(EDIT_COMIC_METADATA_JOB_PUBLISHER)).thenReturn(TEST_PUBLISHER);
    when(jobParameters.getString(EDIT_COMIC_METADATA_JOB_SERIES)).thenReturn(TEST_SERIES);
    when(jobParameters.getString(EDIT_COMIC_METADATA_JOB_VOLUME)).thenReturn(TEST_VOLUME);
    when(jobParameters.getString(EDIT_COMIC_METADATA_JOB_ISSUE_NUMBER)).thenReturn(TEST_ISSUENO);
    when(jobParameters.getString(EDIT_COMIC_METADATA_JOB_IMPRINT)).thenReturn(TEST_IMPRINT);
    when(jobParameters.getString(EDIT_COMIC_METADATA_JOB_COMIC_TYPE)).thenReturn(TEST_COMIC_TYPE);
  }

  @Test
  void process_isLoadingFileContents() throws Exception {
    when(comic.isLoadingFileContents()).thenReturn(true);

    assertNull(processor.process(comic));
  }

  @Test
  void process_isPurging() throws Exception {
    when(comic.isPurging()).thenReturn(true);

    assertNull(processor.process(comic));
  }

  @Test
  void process_isBatchUpdatingMetadata() throws Exception {
    when(comic.isBatchUpdatingMetadata()).thenReturn(true);

    assertNull(processor.process(comic));
  }

  @Test
  void process() throws Exception {
    processor.process(comic);

    verify(comic).setPublisher(TEST_PUBLISHER);
    verify(comic).setSeries(TEST_SERIES);
    verify(comic).setVolume(TEST_VOLUME);
    verify(comic).setIssueNumber(TEST_ISSUENO);
    verify(comic).setImprint(TEST_IMPRINT);
  }

  @Test
  void process_noPublisher() throws Exception {
    when(jobParameters.getString(EDIT_COMIC_METADATA_JOB_PUBLISHER)).thenReturn(null);

    processor.process(comic);

    verify(comic, never()).setPublisher(anyString());
  }

  @Test
  void process_noSeries() throws Exception {
    when(jobParameters.getString(EDIT_COMIC_METADATA_JOB_SERIES)).thenReturn(null);

    processor.process(comic);

    verify(comic, never()).setSeries(anyString());
  }

  @Test
  void process_noVolume() throws Exception {
    when(jobParameters.getString(EDIT_COMIC_METADATA_JOB_VOLUME)).thenReturn(null);

    processor.process(comic);

    verify(comic, never()).setVolume(anyString());
  }

  @Test
  void process_noIssueNumber() throws Exception {
    when(jobParameters.getString(EDIT_COMIC_METADATA_JOB_ISSUE_NUMBER)).thenReturn(null);

    processor.process(comic);

    verify(comic, never()).setIssueNumber(anyString());
  }

  @Test
  void process_noImprint() throws Exception {
    when(jobParameters.getString(EDIT_COMIC_METADATA_JOB_IMPRINT)).thenReturn(null);

    processor.process(comic);

    verify(comic, never()).setImprint(anyString());
  }

  @Test
  void process_noComicType() throws Exception {
    when(jobParameters.getString(EDIT_COMIC_METADATA_JOB_COMIC_TYPE)).thenReturn(null);

    processor.process(comic);

    verify(comic, never()).setComicType(any(ComicType.class));
  }

  @Test
  void afterStep() {
    assertNull(processor.afterStep(stepExecution));
  }
}

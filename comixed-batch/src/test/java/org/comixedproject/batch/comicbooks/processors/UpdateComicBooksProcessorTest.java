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
import static org.comixedproject.batch.comicbooks.UpdateComicBooksConfiguration.JOB_UPDATE_COMICBOOKS_IMPRINT;
import static org.comixedproject.batch.comicbooks.UpdateComicBooksConfiguration.JOB_UPDATE_COMICBOOKS_ISSUENO;
import static org.comixedproject.batch.comicbooks.UpdateComicBooksConfiguration.JOB_UPDATE_COMICBOOKS_PUBLISHER;
import static org.comixedproject.batch.comicbooks.UpdateComicBooksConfiguration.JOB_UPDATE_COMICBOOKS_SERIES;
import static org.comixedproject.batch.comicbooks.UpdateComicBooksConfiguration.JOB_UPDATE_COMICBOOKS_VOLUME;

import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
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
public class UpdateComicBooksProcessorTest {
  private static final String TEST_PUBLISHER = "The publisher";
  private static final String TEST_SERIES = "The series";
  private static final String TEST_VOLUME = "2022";
  private static final String TEST_ISSUENO = "723.1";
  private static final String TEST_IMPRINT = "The imprint";

  @InjectMocks private UpdateComicBooksProcessor processor;
  @Mock private StepExecution stepExecution;
  @Mock private JobExecution jobExecution;
  @Mock private JobParameters jobParameters;
  @Mock private ComicBook comicBook;
  @Mock private ComicDetail comicDetail;

  @Before
  public void setUp() {
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);

    Mockito.when(stepExecution.getJobExecution()).thenReturn(jobExecution);
    Mockito.when(jobExecution.getJobParameters()).thenReturn(jobParameters);
    processor.beforeStep(stepExecution);

    Mockito.when(jobParameters.getString(JOB_UPDATE_COMICBOOKS_PUBLISHER))
        .thenReturn(TEST_PUBLISHER);
    Mockito.when(jobParameters.getString(JOB_UPDATE_COMICBOOKS_SERIES)).thenReturn(TEST_SERIES);
    Mockito.when(jobParameters.getString(JOB_UPDATE_COMICBOOKS_VOLUME)).thenReturn(TEST_VOLUME);
    Mockito.when(jobParameters.getString(JOB_UPDATE_COMICBOOKS_ISSUENO)).thenReturn(TEST_ISSUENO);
    Mockito.when(jobParameters.getString(JOB_UPDATE_COMICBOOKS_IMPRINT)).thenReturn(TEST_IMPRINT);
  }

  @Test
  public void testProcess() throws Exception {
    processor.process(comicBook);

    Mockito.verify(comicDetail, Mockito.times(1)).setPublisher(TEST_PUBLISHER);
    Mockito.verify(comicDetail, Mockito.times(1)).setSeries(TEST_SERIES);
    Mockito.verify(comicDetail, Mockito.times(1)).setVolume(TEST_VOLUME);
    Mockito.verify(comicDetail, Mockito.times(1)).setIssueNumber(TEST_ISSUENO);
    Mockito.verify(comicDetail, Mockito.times(1)).setImprint(TEST_IMPRINT);
  }

  @Test
  public void testProcessNoPublisher() throws Exception {
    Mockito.when(jobParameters.getString(JOB_UPDATE_COMICBOOKS_PUBLISHER)).thenReturn(null);

    processor.process(comicBook);

    Mockito.verify(comicDetail, Mockito.never()).setPublisher(Mockito.anyString());
  }

  @Test
  public void testProcessNoSeries() throws Exception {
    Mockito.when(jobParameters.getString(JOB_UPDATE_COMICBOOKS_SERIES)).thenReturn(null);

    processor.process(comicBook);

    Mockito.verify(comicDetail, Mockito.never()).setSeries(Mockito.anyString());
  }

  @Test
  public void testProcessNoVolume() throws Exception {
    Mockito.when(jobParameters.getString(JOB_UPDATE_COMICBOOKS_VOLUME)).thenReturn(null);

    processor.process(comicBook);

    Mockito.verify(comicDetail, Mockito.never()).setVolume(Mockito.anyString());
  }

  @Test
  public void testProcessNoIssueNumber() throws Exception {
    Mockito.when(jobParameters.getString(JOB_UPDATE_COMICBOOKS_ISSUENO)).thenReturn(null);

    processor.process(comicBook);

    Mockito.verify(comicDetail, Mockito.never()).setIssueNumber(Mockito.anyString());
  }

  @Test
  public void testProcessNoImprint() throws Exception {
    Mockito.when(jobParameters.getString(JOB_UPDATE_COMICBOOKS_IMPRINT)).thenReturn(null);

    processor.process(comicBook);

    Mockito.verify(comicDetail, Mockito.never()).setImprint(Mockito.anyString());
  }

  @Test
  public void testAfterStep() {
    assertNull(processor.afterStep(stepExecution));
  }
}

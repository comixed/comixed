/*
 * ComiXed - A digital comicBook book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

package org.comixedproject.rest.metadata;

import static org.comixedproject.rest.comicbooks.ComicBookSelectionController.LIBRARY_SELECTIONS;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertSame;

import java.util.List;
import javax.servlet.http.HttpSession;
import org.comixedproject.metadata.MetadataException;
import org.comixedproject.metadata.model.IssueMetadata;
import org.comixedproject.metadata.model.VolumeMetadata;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.net.metadata.FetchIssuesForSeriesRequest;
import org.comixedproject.model.net.metadata.LoadIssueMetadataRequest;
import org.comixedproject.model.net.metadata.LoadVolumeMetadataRequest;
import org.comixedproject.model.net.metadata.ScrapeComicRequest;
import org.comixedproject.model.net.metadata.StartMetadataUpdateProcessRequest;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.comixedproject.service.comicbooks.ComicBookSelectionException;
import org.comixedproject.service.comicbooks.ComicBookSelectionService;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.metadata.MetadataCacheService;
import org.comixedproject.service.metadata.MetadataService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class MetadataControllerTest {
  private static final Long TEST_METADATA_SOURCE_ID = 73L;
  private static final String TEST_SERIES_NAME = "Awesome ComicBook";
  private static final Integer TEST_MAX_RECORDS = 37;
  private static final String TEST_VOLUME = "2018";
  private static final String TEST_ISSUE_NUMBER = "15";
  private static final long TEST_COMIC_ID = 213L;
  private static final String TEST_ISSUE_ID = "48132";
  private static final boolean TEST_SKIP_CACHE = true;
  private static final String TEST_ENCODED_SELECTIONS = "The encoded selection id list";
  private static final String TEST_REENCODED_SELECTIONS = "The re-encoded selection id list";

  @InjectMocks private MetadataController controller;
  @Mock private MetadataService metadataService;
  @Mock private MetadataCacheService metadataCacheService;
  @Mock private ComicBookSelectionService comicBookSelectionService;
  @Mock private ComicBookService comicBookService;
  @Mock private List<VolumeMetadata> comicVolumeList;
  @Mock private IssueMetadata comicIssue;
  @Mock private ComicBook comicBook;
  @Mock private List<Long> idList;
  @Mock private JobLauncher jobLauncher;
  @Mock private Job updateComicBookMetadata;
  @Mock private JobExecution jobExecution;
  @Mock private HttpSession session;

  @Captor private ArgumentCaptor<JobParameters> jobParametersArgumentCaptor;

  @Before
  public void setUp() throws ComicBookSelectionException {
    Mockito.when(session.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTIONS);
    Mockito.when(comicBookSelectionService.decodeSelections(TEST_ENCODED_SELECTIONS))
        .thenReturn(idList);
    Mockito.when(comicBookSelectionService.encodeSelections(idList))
        .thenReturn(TEST_REENCODED_SELECTIONS);
  }

  @Test(expected = MetadataException.class)
  public void testLoadScrapingVolumesAdaptorRaisesException() throws MetadataException {
    Mockito.when(
            metadataService.getVolumes(
                Mockito.anyLong(), Mockito.anyString(), Mockito.anyInt(), Mockito.anyBoolean()))
        .thenThrow(MetadataException.class);

    try {
      controller.loadScrapingVolumes(
          TEST_METADATA_SOURCE_ID,
          new LoadVolumeMetadataRequest(TEST_SERIES_NAME, TEST_MAX_RECORDS, false));
    } finally {
      Mockito.verify(metadataService, Mockito.times(1))
          .getVolumes(TEST_METADATA_SOURCE_ID, TEST_SERIES_NAME, TEST_MAX_RECORDS, false);
    }
  }

  @Test
  public void testLoadScrapingVolumes() throws MetadataException {
    Mockito.when(
            metadataService.getVolumes(
                Mockito.anyLong(), Mockito.anyString(), Mockito.anyInt(), Mockito.anyBoolean()))
        .thenReturn(comicVolumeList);

    final List<VolumeMetadata> response =
        controller.loadScrapingVolumes(
            TEST_METADATA_SOURCE_ID,
            new LoadVolumeMetadataRequest(TEST_SERIES_NAME, TEST_MAX_RECORDS, false));

    assertNotNull(response);
    assertSame(comicVolumeList, response);

    Mockito.verify(metadataService, Mockito.times(1))
        .getVolumes(TEST_METADATA_SOURCE_ID, TEST_SERIES_NAME, TEST_MAX_RECORDS, false);
  }

  @Test
  public void testLoadScrapingVolumesSkipCache() throws MetadataException {
    Mockito.when(
            metadataService.getVolumes(
                Mockito.anyLong(), Mockito.anyString(), Mockito.anyInt(), Mockito.anyBoolean()))
        .thenReturn(comicVolumeList);

    final List<VolumeMetadata> response =
        controller.loadScrapingVolumes(
            TEST_METADATA_SOURCE_ID,
            new LoadVolumeMetadataRequest(TEST_SERIES_NAME, TEST_MAX_RECORDS, true));

    assertNotNull(response);
    assertSame(comicVolumeList, response);

    Mockito.verify(metadataService, Mockito.times(1))
        .getVolumes(TEST_METADATA_SOURCE_ID, TEST_SERIES_NAME, TEST_MAX_RECORDS, true);
  }

  @Test(expected = MetadataException.class)
  public void testLoadScrapingIssueAdaptorRaisesException() throws MetadataException {
    Mockito.when(
            metadataService.getIssue(
                Mockito.anyLong(), Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenThrow(MetadataException.class);

    try {
      controller.loadScrapingIssue(
          TEST_METADATA_SOURCE_ID,
          TEST_VOLUME,
          TEST_ISSUE_NUMBER,
          new LoadIssueMetadataRequest(TEST_SKIP_CACHE));
    } finally {
      Mockito.verify(metadataService, Mockito.times(1))
          .getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME, TEST_ISSUE_NUMBER, TEST_SKIP_CACHE);
    }
  }

  @Test
  public void testLoadScrapingIssue() throws MetadataException {
    Mockito.when(
            metadataService.getIssue(
                Mockito.anyLong(), Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(comicIssue);

    IssueMetadata response =
        controller.loadScrapingIssue(
            TEST_METADATA_SOURCE_ID,
            TEST_VOLUME,
            TEST_ISSUE_NUMBER,
            new LoadIssueMetadataRequest(TEST_SKIP_CACHE));

    assertNotNull(response);
    assertSame(comicIssue, response);

    Mockito.verify(metadataService, Mockito.times(1))
        .getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME, TEST_ISSUE_NUMBER, TEST_SKIP_CACHE);
  }

  @Test(expected = MetadataException.class)
  public void testScrapeComicScrapingAdaptorRaisesException() throws MetadataException {
    Mockito.when(
            metadataService.scrapeComic(
                Mockito.anyLong(), Mockito.anyLong(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenThrow(MetadataException.class);

    try {
      controller.scrapeComic(
          TEST_METADATA_SOURCE_ID,
          TEST_COMIC_ID,
          new ScrapeComicRequest(TEST_ISSUE_ID, TEST_SKIP_CACHE));
    } finally {
      Mockito.verify(metadataService, Mockito.times(1))
          .scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, TEST_SKIP_CACHE);
    }
  }

  @Test
  public void testScrapeComic() throws MetadataException {
    Mockito.when(
            metadataService.scrapeComic(
                Mockito.anyLong(), Mockito.anyLong(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(comicBook);

    ComicBook response =
        controller.scrapeComic(
            TEST_METADATA_SOURCE_ID,
            TEST_COMIC_ID,
            new ScrapeComicRequest(TEST_ISSUE_ID, TEST_SKIP_CACHE));

    assertNotNull(response);
    assertSame(comicBook, response);

    Mockito.verify(metadataService, Mockito.times(1))
        .scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, TEST_SKIP_CACHE);
  }

  @Test(expected = ComicBookException.class)
  public void testStartBatchMetadataUpdateComicBookServiceException() throws Exception {
    Mockito.doThrow(ComicBookException.class)
        .when(comicBookService)
        .markComicBooksForBatchMetadataUpdate(Mockito.anyList());
    try {
      controller.startBatchMetadataUpdate(
          session, new StartMetadataUpdateProcessRequest(TEST_SKIP_CACHE));
    } finally {
      Mockito.verify(comicBookSelectionService, Mockito.times(1))
          .decodeSelections(TEST_ENCODED_SELECTIONS);
      Mockito.verify(comicBookService, Mockito.times(1))
          .markComicBooksForBatchMetadataUpdate(idList);
    }
  }

  @Test
  public void testStartBatchMetadataUpdate() throws Exception {
    Mockito.when(jobLauncher.run(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenReturn(jobExecution);

    controller.startBatchMetadataUpdate(
        session, new StartMetadataUpdateProcessRequest(TEST_SKIP_CACHE));

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();

    assertNotNull(jobParameters);

    Mockito.verify(comicBookSelectionService, Mockito.times(1))
        .decodeSelections(TEST_ENCODED_SELECTIONS);
    Mockito.verify(comicBookService, Mockito.times(1)).markComicBooksForBatchMetadataUpdate(idList);
    Mockito.verify(jobLauncher, Mockito.times(1)).run(updateComicBookMetadata, jobParameters);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(idList);
    Mockito.verify(session, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testClearCache() {
    controller.clearCache();

    Mockito.verify(metadataCacheService, Mockito.times(1)).clearCache();
  }

  @Test(expected = MetadataException.class)
  public void testFetchIssuesForSeriesServiceException() throws MetadataException {
    Mockito.doThrow(MetadataException.class)
        .when(metadataService)
        .fetchIssuesForSeries(Mockito.anyLong(), Mockito.anyString());

    try {
      controller.fetchIssuesForSeries(
          TEST_METADATA_SOURCE_ID, new FetchIssuesForSeriesRequest(String.valueOf(TEST_VOLUME)));
    } finally {
      Mockito.verify(metadataService, Mockito.times(1))
          .fetchIssuesForSeries(TEST_METADATA_SOURCE_ID, String.valueOf(TEST_VOLUME));
    }
  }

  @Test
  public void testFetchIssuesForSeries() throws MetadataException {
    controller.fetchIssuesForSeries(
        TEST_METADATA_SOURCE_ID, new FetchIssuesForSeriesRequest(String.valueOf(TEST_VOLUME)));

    Mockito.verify(metadataService, Mockito.times(1))
        .fetchIssuesForSeries(TEST_METADATA_SOURCE_ID, String.valueOf(TEST_VOLUME));
  }
}

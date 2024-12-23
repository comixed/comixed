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

import static junit.framework.TestCase.assertEquals;
import static org.comixedproject.rest.comicbooks.ComicBookSelectionController.LIBRARY_SELECTIONS;
import static org.comixedproject.rest.metadata.ComicBookScrapingController.MULTI_BOOK_SCRAPING_SELECTIONS;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertSame;

import jakarta.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.metadata.MetadataException;
import org.comixedproject.metadata.model.IssueMetadata;
import org.comixedproject.metadata.model.VolumeMetadata;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.net.metadata.*;
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
public class ComicBookScrapingControllerTest {
  private static final Long TEST_METADATA_SOURCE_ID = 73L;
  private static final String TEST_PUBLISHER = "Powerful Publisher";
  private static final String TEST_SERIES_NAME = "Awesome ComicBook";
  private static final Integer TEST_MAX_RECORDS = 37;
  private static final String TEST_VOLUME = "2018";
  private static final String TEST_ISSUE_NUMBER = "15";
  private static final long TEST_COMIC_ID = 213L;
  private static final String TEST_ISSUE_ID = "48132";
  private static final boolean TEST_SKIP_CACHE = true;
  private static final String TEST_ENCODED_SELECTIONS = "The encoded selection id list";
  private static final String TEST_REENCODED_SELECTIONS = "The re-encoded selection id list";
  private static final Object TEST_ENCODED_MULTI_BOOKS = "The encoded multi-book comic list";
  private static final String TEST_REENCODED_MULTI_BOOKS = "The re-encoded multi-book comic list";
  private static final int TEST_PAGE_SIZE = 25;
  private static final int TEST_PAGE_NUMBER = 3;
  private static final Boolean TEST_MATCH_PUBLISHER = RandomUtils.nextBoolean();

  @InjectMocks private ComicBookScrapingController controller;
  @Mock private MetadataService metadataService;
  @Mock private MetadataCacheService metadataCacheService;
  @Mock private ComicBookSelectionService comicBookSelectionService;
  @Mock private ComicBookService comicBookService;
  @Mock private List<VolumeMetadata> comicVolumeList;
  @Mock private IssueMetadata comicIssue;
  @Mock private ComicBook comicBook;
  @Mock private List<Long> selectedIdList;
  @Mock private List multiBookIdList;
  @Mock private JobLauncher jobLauncher;
  @Mock private Job updateComicBookMetadata;
  @Mock private JobExecution jobExecution;
  @Mock private HttpSession session;
  @Mock private List<ComicBook> comicBookList;
  @Mock private ScrapeSeriesResponse scrapeSeriesResponse;

  @Captor private ArgumentCaptor<JobParameters> jobParametersArgumentCaptor;

  @Before
  public void setUp() throws ComicBookSelectionException {
    Mockito.when(session.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTIONS);
    Mockito.when(comicBookSelectionService.decodeSelections(TEST_ENCODED_SELECTIONS))
        .thenReturn(selectedIdList);
    Mockito.when(comicBookSelectionService.encodeSelections(selectedIdList))
        .thenReturn(TEST_REENCODED_SELECTIONS);
    Mockito.when(session.getAttribute(MULTI_BOOK_SCRAPING_SELECTIONS))
        .thenReturn(TEST_ENCODED_MULTI_BOOKS);
    Mockito.when(comicBookSelectionService.decodeSelections(TEST_ENCODED_MULTI_BOOKS))
        .thenReturn(multiBookIdList);
    Mockito.when(comicBookSelectionService.encodeSelections(multiBookIdList))
        .thenReturn(TEST_REENCODED_MULTI_BOOKS);
  }

  @Test(expected = MetadataException.class)
  public void testLoadScrapingVolumes_adaptorRaisesException() throws MetadataException {
    Mockito.when(
            metadataService.getVolumes(
                Mockito.anyLong(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyInt(),
                Mockito.anyBoolean(),
                Mockito.anyBoolean()))
        .thenThrow(MetadataException.class);

    try {
      controller.loadScrapingVolumes(
          TEST_METADATA_SOURCE_ID,
          new LoadVolumeMetadataRequest(
              TEST_PUBLISHER, TEST_SERIES_NAME, TEST_MAX_RECORDS, false, TEST_MATCH_PUBLISHER));
    } finally {
      Mockito.verify(metadataService, Mockito.times(1))
          .getVolumes(
              TEST_METADATA_SOURCE_ID,
              TEST_PUBLISHER,
              TEST_SERIES_NAME,
              TEST_MAX_RECORDS,
              false,
              TEST_MATCH_PUBLISHER);
    }
  }

  @Test
  public void testLoadScrapingVolumes() throws MetadataException {
    Mockito.when(
            metadataService.getVolumes(
                Mockito.anyLong(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyInt(),
                Mockito.anyBoolean(),
                Mockito.anyBoolean()))
        .thenReturn(comicVolumeList);

    final List<VolumeMetadata> response =
        controller.loadScrapingVolumes(
            TEST_METADATA_SOURCE_ID,
            new LoadVolumeMetadataRequest(
                TEST_PUBLISHER, TEST_SERIES_NAME, TEST_MAX_RECORDS, false, TEST_MATCH_PUBLISHER));

    assertNotNull(response);
    assertSame(comicVolumeList, response);

    Mockito.verify(metadataService, Mockito.times(1))
        .getVolumes(
            TEST_METADATA_SOURCE_ID,
            TEST_PUBLISHER,
            TEST_SERIES_NAME,
            TEST_MAX_RECORDS,
            false,
            TEST_MATCH_PUBLISHER);
  }

  @Test
  public void testLoadScrapingVolumes_skipCache() throws MetadataException {
    Mockito.when(
            metadataService.getVolumes(
                Mockito.anyLong(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyInt(),
                Mockito.anyBoolean(),
                Mockito.anyBoolean()))
        .thenReturn(comicVolumeList);

    final List<VolumeMetadata> response =
        controller.loadScrapingVolumes(
            TEST_METADATA_SOURCE_ID,
            new LoadVolumeMetadataRequest(
                TEST_PUBLISHER, TEST_SERIES_NAME, TEST_MAX_RECORDS, true, TEST_MATCH_PUBLISHER));

    assertNotNull(response);
    assertSame(comicVolumeList, response);

    Mockito.verify(metadataService, Mockito.times(1))
        .getVolumes(
            TEST_METADATA_SOURCE_ID,
            TEST_PUBLISHER,
            TEST_SERIES_NAME,
            TEST_MAX_RECORDS,
            true,
            TEST_MATCH_PUBLISHER);
  }

  @Test(expected = MetadataException.class)
  public void testLoadScrapingIssue_adaptorRaisesException() throws MetadataException {
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
  public void testScrapeComic_scrapingAdaptorRaisesException() throws MetadataException {
    Mockito.doThrow(MetadataException.class)
        .when(metadataService)
        .asyncScrapeComic(
            Mockito.anyLong(), Mockito.anyLong(), Mockito.anyString(), Mockito.anyBoolean());

    try {
      controller.scrapeComic(
          TEST_METADATA_SOURCE_ID,
          TEST_COMIC_ID,
          new ScrapeComicRequest(TEST_ISSUE_ID, TEST_SKIP_CACHE, TEST_PAGE_SIZE, TEST_PAGE_NUMBER));
    } finally {
      Mockito.verify(metadataService, Mockito.times(1))
          .asyncScrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, TEST_SKIP_CACHE);
    }
  }

  @Test
  public void testScrapeComic() throws MetadataException {
    controller.scrapeComic(
        TEST_METADATA_SOURCE_ID,
        TEST_COMIC_ID,
        new ScrapeComicRequest(TEST_ISSUE_ID, TEST_SKIP_CACHE, TEST_PAGE_SIZE, TEST_PAGE_NUMBER));

    Mockito.verify(metadataService, Mockito.times(1))
        .asyncScrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, TEST_SKIP_CACHE);
  }

  @Test(expected = ComicBookException.class)
  public void testStartBatchMetadataUpdate_comicBookServiceException() throws Exception {
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
          .markComicBooksForBatchMetadataUpdate(selectedIdList);
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
    Mockito.verify(comicBookService, Mockito.times(1))
        .markComicBooksForBatchMetadataUpdate(selectedIdList);
    Mockito.verify(jobLauncher, Mockito.times(1)).run(updateComicBookMetadata, jobParameters);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(selectedIdList);
    Mockito.verify(session, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  public void testClearCache() {
    controller.clearCache();

    Mockito.verify(metadataCacheService, Mockito.times(1)).clearCache();
  }

  @Test(expected = MetadataException.class)
  public void testScrapeSeries_serviceException() throws MetadataException {
    Mockito.doThrow(MetadataException.class)
        .when(metadataService)
        .scrapeSeries(
            Mockito.anyString(),
            Mockito.anyString(),
            Mockito.anyString(),
            Mockito.anyLong(),
            Mockito.anyString());

    try {
      controller.scrapeSeries(
          TEST_METADATA_SOURCE_ID,
          new ScrapeSeriesRequest(
              TEST_PUBLISHER, TEST_SERIES_NAME, TEST_VOLUME, String.valueOf(TEST_VOLUME)));
    } finally {
      Mockito.verify(metadataService, Mockito.times(1))
          .scrapeSeries(
              TEST_PUBLISHER,
              TEST_SERIES_NAME,
              TEST_VOLUME,
              TEST_METADATA_SOURCE_ID,
              String.valueOf(TEST_VOLUME));
    }
  }

  @Test
  public void testScrapeSeries() throws MetadataException {
    Mockito.when(
            metadataService.scrapeSeries(
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyLong(),
                Mockito.anyString()))
        .thenReturn(scrapeSeriesResponse);

    final ScrapeSeriesResponse result =
        controller.scrapeSeries(
            TEST_METADATA_SOURCE_ID,
            new ScrapeSeriesRequest(
                TEST_PUBLISHER, TEST_SERIES_NAME, TEST_VOLUME, String.valueOf(TEST_VOLUME)));

    assertNotNull(result);
    assertSame(scrapeSeriesResponse, result);

    Mockito.verify(metadataService, Mockito.times(1))
        .scrapeSeries(
            TEST_PUBLISHER,
            TEST_SERIES_NAME,
            TEST_VOLUME,
            TEST_METADATA_SOURCE_ID,
            String.valueOf(TEST_VOLUME));
  }

  @Test(expected = MetadataException.class)
  public void testStartMultiBookScraping_selectionsException()
      throws MetadataException, ComicBookSelectionException {
    Mockito.when(comicBookSelectionService.decodeSelections(Mockito.any()))
        .thenThrow(ComicBookSelectionException.class);

    try {
      controller.startMultiBookScraping(session, new StartMultiBookScrapingRequest(TEST_PAGE_SIZE));
    } finally {
      Mockito.verify(comicBookSelectionService, Mockito.times(1))
          .decodeSelections(TEST_ENCODED_SELECTIONS);
    }
  }

  @Test
  public void testStartMultiBookScraping_hasSelections()
      throws MetadataException, ComicBookSelectionException {
    Mockito.when(selectedIdList.isEmpty()).thenReturn(false);
    Mockito.when(
            comicBookService.loadByComicBookId(
                Mockito.anyList(), Mockito.anyInt(), Mockito.anyInt()))
        .thenReturn(comicBookList);

    final StartMultiBookScrapingResponse result =
        controller.startMultiBookScraping(
            session, new StartMultiBookScrapingRequest(TEST_PAGE_SIZE));

    assertNotNull(result);
    assertSame(comicBookList, result.getComicBooks());

    Mockito.verify(comicBookSelectionService, Mockito.times(1))
        .decodeSelections(TEST_ENCODED_MULTI_BOOKS);
    Mockito.verify(multiBookIdList, Mockito.times(1)).addAll(selectedIdList);
    Mockito.verify(comicBookService, Mockito.times(1))
        .loadByComicBookId(multiBookIdList, TEST_PAGE_SIZE, 0);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(multiBookIdList);
    Mockito.verify(session, Mockito.times(1))
        .setAttribute(MULTI_BOOK_SCRAPING_SELECTIONS, TEST_REENCODED_MULTI_BOOKS);
  }

  @Test
  public void testStartMultiBookScraping_noSelections()
      throws MetadataException, ComicBookSelectionException {
    Mockito.when(selectedIdList.isEmpty()).thenReturn(true);
    Mockito.when(
            comicBookService.loadByComicBookId(
                Mockito.anyList(), Mockito.anyInt(), Mockito.anyInt()))
        .thenReturn(comicBookList);

    final StartMultiBookScrapingResponse result =
        controller.startMultiBookScraping(
            session, new StartMultiBookScrapingRequest(TEST_PAGE_SIZE));

    assertNotNull(result);
    assertSame(comicBookList, result.getComicBooks());

    Mockito.verify(comicBookSelectionService, Mockito.times(1))
        .decodeSelections(TEST_ENCODED_MULTI_BOOKS);
    Mockito.verify(multiBookIdList, Mockito.never()).addAll(selectedIdList);
    Mockito.verify(comicBookService, Mockito.times(1))
        .loadByComicBookId(multiBookIdList, TEST_PAGE_SIZE, 0);
    Mockito.verify(comicBookSelectionService, Mockito.times(1)).encodeSelections(multiBookIdList);
    Mockito.verify(session, Mockito.times(1))
        .setAttribute(MULTI_BOOK_SCRAPING_SELECTIONS, TEST_REENCODED_MULTI_BOOKS);
  }

  @Test
  public void testLoadMultiBookScrapingPage() throws ComicBookSelectionException {
    Mockito.when(
            comicBookService.loadByComicBookId(
                Mockito.anyList(), Mockito.anyInt(), Mockito.anyInt()))
        .thenReturn(comicBookList);

    final LoadMultiBookScrapingResponse result =
        controller.loadMultiBookScrapingPage(
            session, new LoadMultiBookScrapingRequest(TEST_PAGE_SIZE, TEST_PAGE_NUMBER));

    assertNotNull(result);
    assertEquals(TEST_PAGE_SIZE, result.getPageSize());
    assertEquals(TEST_PAGE_NUMBER, result.getPageNumber());
    assertEquals(multiBookIdList.size(), result.getTotalComics());
    assertSame(comicBookList, result.getComicBooks());

    Mockito.verify(comicBookService, Mockito.times(1))
        .loadByComicBookId(multiBookIdList, TEST_PAGE_SIZE, TEST_PAGE_NUMBER);
  }

  @Test(expected = MetadataException.class)
  public void testScrapeMultiBookComic_decodingException()
      throws MetadataException, ComicBookSelectionException {
    Mockito.when(comicBookSelectionService.decodeSelections(TEST_ENCODED_MULTI_BOOKS))
        .thenThrow(ComicBookSelectionException.class);

    try {
      controller.scrapeMultiBookComic(
          session,
          new ScrapeComicRequest(TEST_ISSUE_ID, TEST_SKIP_CACHE, TEST_PAGE_SIZE, TEST_PAGE_NUMBER),
          TEST_METADATA_SOURCE_ID,
          TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicBookSelectionService, Mockito.times(1))
          .decodeSelections(TEST_ENCODED_MULTI_BOOKS);
    }
  }

  @Test
  public void testRemoveMultiBookComic() throws MetadataException, ComicBookSelectionException {
    final List<ComicBook> localComicBookList = new ArrayList<>();
    localComicBookList.add(comicBook);
    Mockito.when(
            comicBookService.loadByComicBookId(
                Mockito.anyList(), Mockito.anyInt(), Mockito.anyInt()))
        .thenReturn(localComicBookList);

    final List<Long> localMultiBookIdList = new ArrayList<>();
    Mockito.when(comicBookSelectionService.decodeSelections(TEST_ENCODED_MULTI_BOOKS))
        .thenReturn(localMultiBookIdList);
    Mockito.when(comicBookSelectionService.encodeSelections(Mockito.anyList()))
        .thenReturn(TEST_REENCODED_MULTI_BOOKS);

    final StartMultiBookScrapingResponse result =
        controller.removeMultiBookComic(session, TEST_COMIC_ID, TEST_PAGE_SIZE);

    assertNotNull(result);

    Mockito.verify(comicBookSelectionService, Mockito.times(1))
        .decodeSelections(TEST_ENCODED_MULTI_BOOKS);
    Mockito.verify(comicBookService, Mockito.times(1))
        .loadByComicBookId(localMultiBookIdList, TEST_PAGE_SIZE, 0);
    Mockito.verify(comicBookSelectionService, Mockito.times(1))
        .encodeSelections(localMultiBookIdList);
    Mockito.verify(session, Mockito.times(1))
        .setAttribute(MULTI_BOOK_SCRAPING_SELECTIONS, TEST_REENCODED_MULTI_BOOKS);
  }

  @Test(expected = MetadataException.class)
  public void testRemoveMultiBookComic_decodingException()
      throws MetadataException, ComicBookSelectionException {
    Mockito.when(comicBookSelectionService.decodeSelections(TEST_ENCODED_MULTI_BOOKS))
        .thenThrow(ComicBookSelectionException.class);

    try {
      controller.removeMultiBookComic(session, TEST_COMIC_ID, TEST_PAGE_SIZE);
    } finally {
      Mockito.verify(comicBookSelectionService, Mockito.times(1))
          .decodeSelections(TEST_ENCODED_MULTI_BOOKS);
    }
  }

  @Test
  public void testScrapeMultiBookComic() throws MetadataException, ComicBookSelectionException {
    final List<ComicBook> localComicBookList = new ArrayList<>();
    localComicBookList.add(comicBook);
    Mockito.when(
            comicBookService.loadByComicBookId(
                Mockito.anyList(), Mockito.anyInt(), Mockito.anyInt()))
        .thenReturn(localComicBookList);

    final List<Long> localMultiBookIdList = new ArrayList<>();
    Mockito.when(comicBookSelectionService.decodeSelections(TEST_ENCODED_MULTI_BOOKS))
        .thenReturn(localMultiBookIdList);
    Mockito.when(comicBookSelectionService.encodeSelections(Mockito.anyList()))
        .thenReturn(TEST_REENCODED_MULTI_BOOKS);

    final StartMultiBookScrapingResponse result =
        controller.scrapeMultiBookComic(
            session,
            new ScrapeComicRequest(
                TEST_ISSUE_ID, TEST_SKIP_CACHE, TEST_PAGE_SIZE, TEST_PAGE_NUMBER),
            TEST_METADATA_SOURCE_ID,
            TEST_COMIC_ID);

    assertNotNull(result);

    Mockito.verify(comicBookSelectionService, Mockito.times(1))
        .decodeSelections(TEST_ENCODED_MULTI_BOOKS);
    Mockito.verify(comicBookService, Mockito.times(1))
        .loadByComicBookId(localMultiBookIdList, TEST_PAGE_SIZE, TEST_PAGE_NUMBER);
    Mockito.verify(comicBookSelectionService, Mockito.times(1))
        .encodeSelections(localMultiBookIdList);
    Mockito.verify(session, Mockito.times(1))
        .setAttribute(MULTI_BOOK_SCRAPING_SELECTIONS, TEST_REENCODED_MULTI_BOOKS);
  }
}

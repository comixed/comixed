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
import static org.junit.Assert.*;

import jakarta.servlet.http.HttpSession;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.metadata.MetadataException;
import org.comixedproject.metadata.model.IssueMetadata;
import org.comixedproject.metadata.model.StoryMetadata;
import org.comixedproject.metadata.model.VolumeMetadata;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.library.DisplayableComic;
import org.comixedproject.model.net.metadata.*;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.comixedproject.service.comicbooks.ComicBookSelectionException;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.comicbooks.ComicSelectionService;
import org.comixedproject.service.library.DisplayableComicService;
import org.comixedproject.service.metadata.MetadataCacheService;
import org.comixedproject.service.metadata.MetadataService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.batch.core.job.Job;
import org.springframework.batch.core.job.JobExecution;
import org.springframework.batch.core.job.parameters.JobParameters;
import org.springframework.batch.core.launch.JobOperator;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ComicBookScrapingControllerTest {
  private static final Long TEST_METADATA_SOURCE_ID = 73L;
  private static final String TEST_REFERENCE_ID = "8675309";
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
  private static final String TEST_EMAIL = "user@comixedproject.org";
  private static final String TEST_STORY_NAME = "The Story Name";

  @InjectMocks private ComicBookScrapingController controller;
  @Mock private MetadataService metadataService;
  @Mock private MetadataCacheService metadataCacheService;
  @Mock private ComicSelectionService comicSelectionService;
  @Mock private ComicBookService comicBookService;
  @Mock private DisplayableComicService displayableComicService;
  @Mock private List<VolumeMetadata> comicVolumeList;
  @Mock private IssueMetadata comicIssue;
  @Mock private ComicBook comicBook;
  @Mock private DisplayableComic displayableComic;
  @Mock private List<Long> selectedIdList;
  @Mock private List multiBookIdList;
  @Mock private JobOperator jobOperator;
  @Mock private Job updateComicBookMetadata;
  @Mock private JobExecution jobExecution;
  @Mock private HttpSession session;
  @Mock private Principal principal;
  @Mock private List<ComicBook> comicBookList;
  @Mock private List<DisplayableComic> displayableComicList;
  @Mock private ScrapeSeriesResponse scrapeSeriesResponse;
  @Mock private List<StoryMetadata> storyList;

  @Captor private ArgumentCaptor<JobParameters> jobParametersArgumentCaptor;

  @BeforeEach
  void setUp() throws ComicBookSelectionException {
    Mockito.when(session.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTIONS);
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
    Mockito.when(comicSelectionService.decodeSelections(TEST_ENCODED_SELECTIONS))
        .thenReturn(selectedIdList);
    Mockito.when(comicSelectionService.encodeSelections(selectedIdList))
        .thenReturn(TEST_REENCODED_SELECTIONS);
    Mockito.when(session.getAttribute(MULTI_BOOK_SCRAPING_SELECTIONS))
        .thenReturn(TEST_ENCODED_MULTI_BOOKS);
    Mockito.when(comicSelectionService.decodeSelections(TEST_ENCODED_MULTI_BOOKS))
        .thenReturn(multiBookIdList);
    Mockito.when(comicSelectionService.encodeSelections(multiBookIdList))
        .thenReturn(TEST_REENCODED_MULTI_BOOKS);
  }

  @Test
  void loadScrapingVolumes_adaptorRaisesException() throws MetadataException {
    Mockito.when(
            metadataService.getVolumes(
                Mockito.anyLong(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyInt(),
                Mockito.anyBoolean(),
                Mockito.anyBoolean()))
        .thenThrow(MetadataException.class);

    assertThrows(
        MetadataException.class,
        () ->
            controller.loadScrapingVolumes(
                TEST_METADATA_SOURCE_ID,
                new LoadVolumeMetadataRequest(
                    TEST_PUBLISHER,
                    TEST_SERIES_NAME,
                    TEST_MAX_RECORDS,
                    false,
                    TEST_MATCH_PUBLISHER)));
  }

  @Test
  void loadScrapingVolumes() throws MetadataException {
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
  void loadScrapingVolumes_skipCache() throws MetadataException {
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

  @Test
  void loadScrapingIssue_adaptorRaisesException() throws MetadataException {
    Mockito.when(
            metadataService.getIssue(
                Mockito.anyLong(), Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenThrow(MetadataException.class);

    assertThrows(
        MetadataException.class,
        () ->
            controller.loadScrapingIssue(
                TEST_METADATA_SOURCE_ID,
                TEST_VOLUME,
                TEST_ISSUE_NUMBER,
                new LoadIssueMetadataRequest(TEST_SKIP_CACHE)));
  }

  @Test
  void loadScrapingIssue() throws MetadataException {
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

  @Test
  void scrapeComic_scrapingAdaptorRaisesException() throws MetadataException {
    Mockito.doThrow(MetadataException.class)
        .when(metadataService)
        .asyncScrapeComic(
            Mockito.anyLong(), Mockito.anyLong(), Mockito.anyString(), Mockito.anyBoolean());

    assertThrows(
        MetadataException.class,
        () ->
            controller.scrapeComic(
                TEST_METADATA_SOURCE_ID,
                TEST_COMIC_ID,
                new ScrapeComicRequest(
                    TEST_ISSUE_ID, TEST_SKIP_CACHE, TEST_PAGE_SIZE, TEST_PAGE_NUMBER)));
  }

  @Test
  void scrapeComic() throws MetadataException {
    controller.scrapeComic(
        TEST_METADATA_SOURCE_ID,
        TEST_COMIC_ID,
        new ScrapeComicRequest(TEST_ISSUE_ID, TEST_SKIP_CACHE, TEST_PAGE_SIZE, TEST_PAGE_NUMBER));

    Mockito.verify(metadataService, Mockito.times(1))
        .asyncScrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, TEST_SKIP_CACHE);
  }

  @Test
  void startBatchMetadataUpdate_comicBookServiceException() throws Exception {
    Mockito.doThrow(ComicBookException.class)
        .when(comicBookService)
        .markComicBooksForBatchMetadataUpdate(Mockito.anyList());

    assertThrows(
        ComicBookException.class,
        () ->
            controller.startBatchMetadataUpdate(
                session, principal, new StartMetadataUpdateProcessRequest(TEST_SKIP_CACHE)));
  }

  @Test
  void startBatchMetadataUpdate() throws Exception {
    Mockito.when(jobOperator.start(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenReturn(jobExecution);

    controller.startBatchMetadataUpdate(
        session, principal, new StartMetadataUpdateProcessRequest(TEST_SKIP_CACHE));

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();

    assertNotNull(jobParameters);

    Mockito.verify(comicSelectionService, Mockito.times(1))
        .decodeSelections(TEST_ENCODED_SELECTIONS);
    Mockito.verify(comicBookService, Mockito.times(1))
        .markComicBooksForBatchMetadataUpdate(selectedIdList);
    Mockito.verify(jobOperator, Mockito.times(1)).start(updateComicBookMetadata, jobParameters);
    Mockito.verify(comicSelectionService, Mockito.times(1)).encodeSelections(selectedIdList);
    Mockito.verify(session, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  void clearCache() {
    controller.clearCache();

    Mockito.verify(metadataCacheService, Mockito.times(1)).clearCache();
  }

  @Test
  void scrapeSeries_serviceException() throws MetadataException {
    Mockito.doThrow(MetadataException.class)
        .when(metadataService)
        .scrapeSeries(
            Mockito.anyString(),
            Mockito.anyString(),
            Mockito.anyString(),
            Mockito.anyLong(),
            Mockito.anyString());

    assertThrows(
        MetadataException.class,
        () ->
            controller.scrapeSeries(
                TEST_METADATA_SOURCE_ID,
                new ScrapeSeriesRequest(
                    TEST_PUBLISHER, TEST_SERIES_NAME, TEST_VOLUME, String.valueOf(TEST_VOLUME))));
  }

  @Test
  void scrapeSeries() throws MetadataException {
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

  @Test
  void startMultiBookScraping_selectionsException() throws ComicBookSelectionException {
    Mockito.when(comicSelectionService.decodeSelections(Mockito.any()))
        .thenThrow(ComicBookSelectionException.class);

    assertThrows(
        MetadataException.class,
        () ->
            controller.startMultiBookScraping(
                session, principal, new StartMultiBookScrapingRequest(TEST_PAGE_SIZE)));
  }

  @Test
  void startMultiBookScraping_hasSelections()
      throws MetadataException, ComicBookSelectionException {
    Mockito.when(selectedIdList.isEmpty()).thenReturn(false);
    Mockito.when(
            displayableComicService.loadComicsById(
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyList()))
        .thenReturn(displayableComicList);

    final StartMultiBookScrapingResponse result =
        controller.startMultiBookScraping(
            session, principal, new StartMultiBookScrapingRequest(TEST_PAGE_SIZE));

    assertNotNull(result);
    assertSame(displayableComicList, result.getComicBooks());

    Mockito.verify(comicSelectionService, Mockito.times(1))
        .decodeSelections(TEST_ENCODED_MULTI_BOOKS);
    Mockito.verify(multiBookIdList, Mockito.times(1)).addAll(selectedIdList);
    Mockito.verify(displayableComicService, Mockito.times(1))
        .loadComicsById(TEST_PAGE_SIZE, 0, "", "", multiBookIdList);
    Mockito.verify(comicSelectionService, Mockito.times(1)).encodeSelections(multiBookIdList);
    Mockito.verify(session, Mockito.times(1))
        .setAttribute(MULTI_BOOK_SCRAPING_SELECTIONS, TEST_REENCODED_MULTI_BOOKS);
  }

  @Test
  void startMultiBookScraping_noSelections() throws MetadataException, ComicBookSelectionException {
    Mockito.when(selectedIdList.isEmpty()).thenReturn(true);
    Mockito.when(
            displayableComicService.loadComicsById(
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyList()))
        .thenReturn(displayableComicList);

    final StartMultiBookScrapingResponse result =
        controller.startMultiBookScraping(
            session, principal, new StartMultiBookScrapingRequest(TEST_PAGE_SIZE));

    assertNotNull(result);
    assertSame(displayableComicList, result.getComicBooks());

    Mockito.verify(comicSelectionService, Mockito.times(1))
        .decodeSelections(TEST_ENCODED_MULTI_BOOKS);
    Mockito.verify(multiBookIdList, Mockito.never()).addAll(selectedIdList);
    Mockito.verify(displayableComicService, Mockito.times(1))
        .loadComicsById(TEST_PAGE_SIZE, 0, "", "", multiBookIdList);
    Mockito.verify(comicSelectionService, Mockito.times(1)).encodeSelections(multiBookIdList);
    Mockito.verify(session, Mockito.times(1))
        .setAttribute(MULTI_BOOK_SCRAPING_SELECTIONS, TEST_REENCODED_MULTI_BOOKS);
  }

  @Test
  void loadMultiBookScrapingPage() throws ComicBookSelectionException {
    Mockito.when(
            displayableComicService.loadComicsById(
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyList()))
        .thenReturn(displayableComicList);

    final LoadMultiBookScrapingResponse result =
        controller.loadMultiBookScrapingPage(
            session, new LoadMultiBookScrapingRequest(TEST_PAGE_SIZE, TEST_PAGE_NUMBER));

    assertNotNull(result);
    assertEquals(TEST_PAGE_SIZE, result.getPageSize());
    assertEquals(TEST_PAGE_NUMBER, result.getPageNumber());
    assertEquals(multiBookIdList.size(), result.getTotalComics());
    assertSame(displayableComicList, result.getComicBooks());

    Mockito.verify(displayableComicService, Mockito.times(1))
        .loadComicsById(TEST_PAGE_SIZE, 0, "", "", multiBookIdList);
  }

  @Test
  void scrapeMultiBookComic_decodingException() throws ComicBookSelectionException {
    Mockito.when(comicSelectionService.decodeSelections(TEST_ENCODED_MULTI_BOOKS))
        .thenThrow(ComicBookSelectionException.class);

    assertThrows(
        MetadataException.class,
        () ->
            controller.scrapeMultiBookComic(
                session,
                new ScrapeComicRequest(
                    TEST_ISSUE_ID, TEST_SKIP_CACHE, TEST_PAGE_SIZE, TEST_PAGE_NUMBER),
                TEST_METADATA_SOURCE_ID,
                TEST_COMIC_ID));
  }

  @Test
  void removeMultiBookComic() throws MetadataException, ComicBookSelectionException {
    final List<DisplayableComic> localComicBookList = new ArrayList<>();
    localComicBookList.add(displayableComic);
    Mockito.when(
            displayableComicService.loadComicsById(
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyList()))
        .thenReturn(localComicBookList);

    final List<Long> localMultiBookIdList = new ArrayList<>();
    Mockito.when(comicSelectionService.decodeSelections(TEST_ENCODED_MULTI_BOOKS))
        .thenReturn(localMultiBookIdList);
    Mockito.when(comicSelectionService.encodeSelections(Mockito.anyList()))
        .thenReturn(TEST_REENCODED_MULTI_BOOKS);

    final StartMultiBookScrapingResponse result =
        controller.removeMultiBookComic(session, TEST_COMIC_ID, TEST_PAGE_SIZE);

    assertNotNull(result);

    Mockito.verify(comicSelectionService, Mockito.times(1))
        .decodeSelections(TEST_ENCODED_MULTI_BOOKS);
    Mockito.verify(displayableComicService, Mockito.times(1))
        .loadComicsById(TEST_PAGE_SIZE, 0, "", "", localMultiBookIdList);
    Mockito.verify(comicSelectionService, Mockito.times(1)).encodeSelections(localMultiBookIdList);
    Mockito.verify(session, Mockito.times(1))
        .setAttribute(MULTI_BOOK_SCRAPING_SELECTIONS, TEST_REENCODED_MULTI_BOOKS);
  }

  @Test
  void removeMultiBookComic_decodingException() throws ComicBookSelectionException {
    Mockito.when(comicSelectionService.decodeSelections(TEST_ENCODED_MULTI_BOOKS))
        .thenThrow(ComicBookSelectionException.class);

    assertThrows(
        MetadataException.class,
        () -> controller.removeMultiBookComic(session, TEST_COMIC_ID, TEST_PAGE_SIZE));
  }

  @Test
  void batchScrapeSelected() throws ComicBookSelectionException {
    final List<Long> localMultiBookIdList = new ArrayList<>();
    Mockito.when(session.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTIONS);
    Mockito.when(comicSelectionService.decodeSelections(TEST_ENCODED_SELECTIONS))
        .thenReturn(localMultiBookIdList);
    Mockito.when(comicSelectionService.encodeSelections(Mockito.anyList()))
        .thenReturn(TEST_REENCODED_SELECTIONS);

    controller.batchScrapeSelected(session, principal);

    Mockito.verify(comicSelectionService, Mockito.times(1))
        .decodeSelections(TEST_ENCODED_SELECTIONS);
    Mockito.verify(metadataService, Mockito.times(1)).batchScrapeComicBooks(localMultiBookIdList);
    Mockito.verify(comicSelectionService, Mockito.times(1)).encodeSelections(localMultiBookIdList);
    Mockito.verify(session, Mockito.times(1))
        .setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  void scrapeMultiBookComic() throws MetadataException, ComicBookSelectionException {
    final List<DisplayableComic> localComicBookList = new ArrayList<>();
    localComicBookList.add(displayableComic);
    Mockito.when(
            displayableComicService.loadComicsById(
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyList()))
        .thenReturn(localComicBookList);

    final List<Long> localMultiBookIdList = new ArrayList<>();
    Mockito.when(comicSelectionService.decodeSelections(TEST_ENCODED_MULTI_BOOKS))
        .thenReturn(localMultiBookIdList);
    Mockito.when(comicSelectionService.encodeSelections(Mockito.anyList()))
        .thenReturn(TEST_REENCODED_MULTI_BOOKS);

    final StartMultiBookScrapingResponse result =
        controller.scrapeMultiBookComic(
            session,
            new ScrapeComicRequest(
                TEST_ISSUE_ID, TEST_SKIP_CACHE, TEST_PAGE_SIZE, TEST_PAGE_NUMBER),
            TEST_METADATA_SOURCE_ID,
            TEST_COMIC_ID);

    assertNotNull(result);

    Mockito.verify(comicSelectionService, Mockito.times(1))
        .decodeSelections(TEST_ENCODED_MULTI_BOOKS);
    Mockito.verify(displayableComicService, Mockito.times(1))
        .loadComicsById(TEST_PAGE_SIZE, 0, "", "", localMultiBookIdList);
    Mockito.verify(comicSelectionService, Mockito.times(1)).encodeSelections(localMultiBookIdList);
    Mockito.verify(session, Mockito.times(1))
        .setAttribute(MULTI_BOOK_SCRAPING_SELECTIONS, TEST_REENCODED_MULTI_BOOKS);
  }

  @Test
  void loadStoryCandidates() throws MetadataException {
    Mockito.when(
            metadataService.getStories(
                Mockito.anyString(), Mockito.anyInt(), Mockito.anyLong(), Mockito.anyBoolean()))
        .thenReturn(storyList);

    final List<StoryMetadata> result =
        controller.loadStoryCandidates(
            new LoadScrapingStoriesRequest(TEST_STORY_NAME, TEST_MAX_RECORDS, true),
            TEST_METADATA_SOURCE_ID);

    assertNotNull(result);
    assertSame(storyList, result);

    Mockito.verify(metadataService, Mockito.times(1))
        .getStories(TEST_STORY_NAME, TEST_MAX_RECORDS, TEST_METADATA_SOURCE_ID, true);
  }

  @Test
  void scrapeStory() throws MetadataException {
    controller.scrapeStory(
        new ScrapeStoryRequest(TEST_SKIP_CACHE), TEST_METADATA_SOURCE_ID, TEST_REFERENCE_ID);

    Mockito.verify(metadataService, Mockito.times(1))
        .scrapeStory(TEST_METADATA_SOURCE_ID, TEST_REFERENCE_ID, TEST_SKIP_CACHE);
  }
}

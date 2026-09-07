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
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import jakarta.servlet.http.HttpSession;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.metadata.MetadataException;
import org.comixedproject.metadata.model.IssueMetadata;
import org.comixedproject.metadata.model.StoryMetadata;
import org.comixedproject.metadata.model.VolumeMetadata;
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
  @Mock private DisplayableComic displayableComic;
  @Mock private List<Long> selectedIdList;
  @Mock private List multiBookIdList;
  @Mock private JobOperator jobOperator;
  @Mock private Job updateComicBookMetadata;
  @Mock private JobExecution jobExecution;
  @Mock private HttpSession session;
  @Mock private Principal principal;
  @Mock private List<DisplayableComic> displayableComicList;
  @Mock private ScrapeSeriesResponse scrapeSeriesResponse;
  @Mock private List<StoryMetadata> storyList;

  @Captor private ArgumentCaptor<JobParameters> jobParametersArgumentCaptor;

  @BeforeEach
  void setUp() throws ComicBookSelectionException {
    when(session.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTIONS);
    when(principal.getName()).thenReturn(TEST_EMAIL);
    when(comicSelectionService.decodeSelections(TEST_ENCODED_SELECTIONS))
        .thenReturn(selectedIdList);
    when(comicSelectionService.encodeSelections(selectedIdList))
        .thenReturn(TEST_REENCODED_SELECTIONS);
    when(session.getAttribute(MULTI_BOOK_SCRAPING_SELECTIONS)).thenReturn(TEST_ENCODED_MULTI_BOOKS);
    when(comicSelectionService.decodeSelections(TEST_ENCODED_MULTI_BOOKS))
        .thenReturn(multiBookIdList);
    when(comicSelectionService.encodeSelections(multiBookIdList))
        .thenReturn(TEST_REENCODED_MULTI_BOOKS);
  }

  @Test
  void loadScrapingVolumes_adaptorRaisesException() throws MetadataException {
    when(metadataService.getVolumes(
            anyLong(), anyString(), anyString(), anyInt(), anyBoolean(), anyBoolean()))
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
    when(metadataService.getVolumes(
            anyLong(), anyString(), anyString(), anyInt(), anyBoolean(), anyBoolean()))
        .thenReturn(comicVolumeList);

    final List<VolumeMetadata> response =
        controller.loadScrapingVolumes(
            TEST_METADATA_SOURCE_ID,
            new LoadVolumeMetadataRequest(
                TEST_PUBLISHER, TEST_SERIES_NAME, TEST_MAX_RECORDS, false, TEST_MATCH_PUBLISHER));

    assertNotNull(response);
    assertSame(comicVolumeList, response);

    verify(metadataService)
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
    when(metadataService.getVolumes(
            anyLong(), anyString(), anyString(), anyInt(), anyBoolean(), anyBoolean()))
        .thenReturn(comicVolumeList);

    final List<VolumeMetadata> response =
        controller.loadScrapingVolumes(
            TEST_METADATA_SOURCE_ID,
            new LoadVolumeMetadataRequest(
                TEST_PUBLISHER, TEST_SERIES_NAME, TEST_MAX_RECORDS, true, TEST_MATCH_PUBLISHER));

    assertNotNull(response);
    assertSame(comicVolumeList, response);

    verify(metadataService)
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
    when(metadataService.getIssue(anyLong(), anyString(), anyString(), anyBoolean()))
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
    when(metadataService.getIssue(anyLong(), anyString(), anyString(), anyBoolean()))
        .thenReturn(comicIssue);

    IssueMetadata response =
        controller.loadScrapingIssue(
            TEST_METADATA_SOURCE_ID,
            TEST_VOLUME,
            TEST_ISSUE_NUMBER,
            new LoadIssueMetadataRequest(TEST_SKIP_CACHE));

    assertNotNull(response);
    assertSame(comicIssue, response);

    verify(metadataService)
        .getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME, TEST_ISSUE_NUMBER, TEST_SKIP_CACHE);
  }

  @Test
  void scrapeComic_scrapingAdaptorRaisesException() throws MetadataException {
    doThrow(MetadataException.class)
        .when(metadataService)
        .asyncScrapeComic(anyLong(), anyLong(), anyString(), anyBoolean());

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

    verify(metadataService)
        .asyncScrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, TEST_SKIP_CACHE);
  }

  @Test
  void startBatchMetadataUpdate_comicBookServiceException() throws Exception {
    doThrow(ComicBookException.class)
        .when(comicBookService)
        .markComicBooksForBatchMetadataUpdate(anyList());

    assertThrows(
        ComicBookException.class,
        () ->
            controller.startBatchMetadataUpdate(
                session, principal, new StartMetadataUpdateProcessRequest(TEST_SKIP_CACHE)));
  }

  @Test
  void startBatchMetadataUpdate() throws Exception {
    when(jobOperator.start(any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenReturn(jobExecution);

    controller.startBatchMetadataUpdate(
        session, principal, new StartMetadataUpdateProcessRequest(TEST_SKIP_CACHE));

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();

    assertNotNull(jobParameters);

    verify(comicSelectionService).decodeSelections(TEST_ENCODED_SELECTIONS);
    verify(comicBookService).markComicBooksForBatchMetadataUpdate(selectedIdList);
    verify(jobOperator).start(updateComicBookMetadata, jobParameters);
    verify(comicSelectionService).encodeSelections(selectedIdList);
    verify(session).setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  void clearCache() {
    controller.clearCache();

    verify(metadataCacheService).clearCache();
  }

  @Test
  void scrapeSeries_serviceException() throws MetadataException {
    doThrow(MetadataException.class)
        .when(metadataService)
        .scrapeSeries(anyString(), anyString(), anyString(), anyLong(), anyString());

    assertThrows(
        MetadataException.class,
        () ->
            controller.scrapeSeries(
                TEST_METADATA_SOURCE_ID,
                new ScrapeSeriesRequest(
                    TEST_PUBLISHER, TEST_SERIES_NAME, TEST_VOLUME, TEST_VOLUME)));
  }

  @Test
  void scrapeSeries() throws MetadataException {
    when(metadataService.scrapeSeries(
            anyString(), anyString(), anyString(), anyLong(), anyString()))
        .thenReturn(scrapeSeriesResponse);

    final ScrapeSeriesResponse result =
        controller.scrapeSeries(
            TEST_METADATA_SOURCE_ID,
            new ScrapeSeriesRequest(TEST_PUBLISHER, TEST_SERIES_NAME, TEST_VOLUME, TEST_VOLUME));

    assertNotNull(result);
    assertSame(scrapeSeriesResponse, result);

    verify(metadataService)
        .scrapeSeries(
            TEST_PUBLISHER, TEST_SERIES_NAME, TEST_VOLUME, TEST_METADATA_SOURCE_ID, TEST_VOLUME);
  }

  @Test
  void startMultiBookScraping_selectionsException() throws ComicBookSelectionException {
    when(comicSelectionService.decodeSelections(any()))
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
    when(selectedIdList.isEmpty()).thenReturn(false);
    when(displayableComicService.loadComicsById(
            anyInt(), anyInt(), anyString(), anyString(), anyList()))
        .thenReturn(displayableComicList);

    final StartMultiBookScrapingResponse result =
        controller.startMultiBookScraping(
            session, principal, new StartMultiBookScrapingRequest(TEST_PAGE_SIZE));

    assertNotNull(result);
    assertSame(displayableComicList, result.getComicBooks());

    verify(comicSelectionService).decodeSelections(TEST_ENCODED_MULTI_BOOKS);
    verify(multiBookIdList).addAll(selectedIdList);
    verify(displayableComicService).loadComicsById(TEST_PAGE_SIZE, 0, "", "", multiBookIdList);
    verify(comicSelectionService).encodeSelections(multiBookIdList);
    verify(session).setAttribute(MULTI_BOOK_SCRAPING_SELECTIONS, TEST_REENCODED_MULTI_BOOKS);
  }

  @Test
  void startMultiBookScraping_noSelections() throws MetadataException, ComicBookSelectionException {
    when(selectedIdList.isEmpty()).thenReturn(true);
    when(displayableComicService.loadComicsById(
            anyInt(), anyInt(), anyString(), anyString(), anyList()))
        .thenReturn(displayableComicList);

    final StartMultiBookScrapingResponse result =
        controller.startMultiBookScraping(
            session, principal, new StartMultiBookScrapingRequest(TEST_PAGE_SIZE));

    assertNotNull(result);
    assertSame(displayableComicList, result.getComicBooks());

    verify(comicSelectionService).decodeSelections(TEST_ENCODED_MULTI_BOOKS);
    verify(multiBookIdList, never()).addAll(selectedIdList);
    verify(displayableComicService).loadComicsById(TEST_PAGE_SIZE, 0, "", "", multiBookIdList);
    verify(comicSelectionService).encodeSelections(multiBookIdList);
    verify(session).setAttribute(MULTI_BOOK_SCRAPING_SELECTIONS, TEST_REENCODED_MULTI_BOOKS);
  }

  @Test
  void loadMultiBookScrapingPage() throws ComicBookSelectionException {
    when(displayableComicService.loadComicsById(
            anyInt(), anyInt(), anyString(), anyString(), anyList()))
        .thenReturn(displayableComicList);

    final LoadMultiBookScrapingResponse result =
        controller.loadMultiBookScrapingPage(
            session, new LoadMultiBookScrapingRequest(TEST_PAGE_SIZE, TEST_PAGE_NUMBER));

    assertNotNull(result);
    assertEquals(TEST_PAGE_SIZE, result.getPageSize());
    assertEquals(TEST_PAGE_NUMBER, result.getPageNumber());
    assertEquals(multiBookIdList.size(), result.getTotalComics());
    assertSame(displayableComicList, result.getComicBooks());

    verify(displayableComicService).loadComicsById(TEST_PAGE_SIZE, 0, "", "", multiBookIdList);
  }

  @Test
  void scrapeMultiBookComic_decodingException() throws ComicBookSelectionException {
    when(comicSelectionService.decodeSelections(TEST_ENCODED_MULTI_BOOKS))
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
    when(displayableComicService.loadComicsById(
            anyInt(), anyInt(), anyString(), anyString(), anyList()))
        .thenReturn(localComicBookList);

    final List<Long> localMultiBookIdList = new ArrayList<>();
    when(comicSelectionService.decodeSelections(TEST_ENCODED_MULTI_BOOKS))
        .thenReturn(localMultiBookIdList);
    when(comicSelectionService.encodeSelections(anyList())).thenReturn(TEST_REENCODED_MULTI_BOOKS);

    final StartMultiBookScrapingResponse result =
        controller.removeMultiBookComic(session, TEST_COMIC_ID, TEST_PAGE_SIZE);

    assertNotNull(result);

    verify(comicSelectionService).decodeSelections(TEST_ENCODED_MULTI_BOOKS);
    verify(displayableComicService).loadComicsById(TEST_PAGE_SIZE, 0, "", "", localMultiBookIdList);
    verify(comicSelectionService).encodeSelections(localMultiBookIdList);
    verify(session).setAttribute(MULTI_BOOK_SCRAPING_SELECTIONS, TEST_REENCODED_MULTI_BOOKS);
  }

  @Test
  void removeMultiBookComic_decodingException() throws ComicBookSelectionException {
    when(comicSelectionService.decodeSelections(TEST_ENCODED_MULTI_BOOKS))
        .thenThrow(ComicBookSelectionException.class);

    assertThrows(
        MetadataException.class,
        () -> controller.removeMultiBookComic(session, TEST_COMIC_ID, TEST_PAGE_SIZE));
  }

  @Test
  void batchScrapeSelected() throws ComicBookSelectionException {
    final List<Long> localMultiBookIdList = new ArrayList<>();
    when(session.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_SELECTIONS);
    when(comicSelectionService.decodeSelections(TEST_ENCODED_SELECTIONS))
        .thenReturn(localMultiBookIdList);
    when(comicSelectionService.encodeSelections(anyList())).thenReturn(TEST_REENCODED_SELECTIONS);

    controller.batchScrapeSelected(session, principal);

    verify(comicSelectionService).decodeSelections(TEST_ENCODED_SELECTIONS);
    verify(metadataService).batchScrapeComicBooks(localMultiBookIdList);
    verify(comicSelectionService).encodeSelections(localMultiBookIdList);
    verify(session).setAttribute(LIBRARY_SELECTIONS, TEST_REENCODED_SELECTIONS);
  }

  @Test
  void scrapeMultiBookComic() throws MetadataException, ComicBookSelectionException {
    final List<DisplayableComic> localComicBookList = new ArrayList<>();
    localComicBookList.add(displayableComic);
    when(displayableComicService.loadComicsById(
            anyInt(), anyInt(), anyString(), anyString(), anyList()))
        .thenReturn(localComicBookList);

    final List<Long> localMultiBookIdList = new ArrayList<>();
    when(comicSelectionService.decodeSelections(TEST_ENCODED_MULTI_BOOKS))
        .thenReturn(localMultiBookIdList);
    when(comicSelectionService.encodeSelections(anyList())).thenReturn(TEST_REENCODED_MULTI_BOOKS);

    final StartMultiBookScrapingResponse result =
        controller.scrapeMultiBookComic(
            session,
            new ScrapeComicRequest(
                TEST_ISSUE_ID, TEST_SKIP_CACHE, TEST_PAGE_SIZE, TEST_PAGE_NUMBER),
            TEST_METADATA_SOURCE_ID,
            TEST_COMIC_ID);

    assertNotNull(result);

    verify(comicSelectionService).decodeSelections(TEST_ENCODED_MULTI_BOOKS);
    verify(displayableComicService).loadComicsById(TEST_PAGE_SIZE, 0, "", "", localMultiBookIdList);
    verify(comicSelectionService).encodeSelections(localMultiBookIdList);
    verify(session).setAttribute(MULTI_BOOK_SCRAPING_SELECTIONS, TEST_REENCODED_MULTI_BOOKS);
  }

  @Test
  void loadStoryCandidates() throws MetadataException {
    when(metadataService.getStories(anyString(), anyInt(), anyLong(), anyBoolean()))
        .thenReturn(storyList);

    final List<StoryMetadata> result =
        controller.loadStoryCandidates(
            new LoadScrapingStoriesRequest(TEST_STORY_NAME, TEST_MAX_RECORDS, true),
            TEST_METADATA_SOURCE_ID);

    assertNotNull(result);
    assertSame(storyList, result);

    verify(metadataService)
        .getStories(TEST_STORY_NAME, TEST_MAX_RECORDS, TEST_METADATA_SOURCE_ID, true);
  }

  @Test
  void scrapeStory() throws MetadataException {
    controller.scrapeStory(
        new ScrapeStoryRequest(TEST_SKIP_CACHE), TEST_METADATA_SOURCE_ID, TEST_REFERENCE_ID);

    verify(metadataService)
        .scrapeStory(TEST_METADATA_SOURCE_ID, TEST_REFERENCE_ID, TEST_SKIP_CACHE);
  }
}

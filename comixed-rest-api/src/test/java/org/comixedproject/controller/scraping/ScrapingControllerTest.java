/*
 * ComiXed - A digital comic book library management application.
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

package org.comixedproject.controller.scraping;

import static junit.framework.TestCase.assertFalse;
import static junit.framework.TestCase.assertTrue;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertSame;

import java.util.List;
import org.comixedproject.controller.ComiXedControllerException;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.net.ApiResponse;
import org.comixedproject.model.net.ComicScrapeRequest;
import org.comixedproject.model.net.GetScrapingIssueRequest;
import org.comixedproject.model.net.GetVolumesRequest;
import org.comixedproject.scrapers.ScrapingException;
import org.comixedproject.scrapers.model.ScrapingIssue;
import org.comixedproject.scrapers.model.ScrapingVolume;
import org.comixedproject.service.scraping.ScrapingService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ScrapingControllerTest {
  private static final String TEST_API_KEY = "12345";
  private static final String TEST_SERIES_NAME = "Awesome Comic";
  private static final Integer TEST_MAX_RECORDS = 37;
  private static final Integer TEST_VOLUME = 2018;
  private static final String TEST_ISSUE_NUMBER = "15";
  private static final long TEST_COMIC_ID = 213L;
  private static final Integer TEST_ISSUE_ID = 48132;
  private static final boolean TEST_SKIP_CACHE = true;

  @InjectMocks private ScrapingController controller;
  @Mock private ScrapingService scrapingService;
  @Mock private List<ScrapingVolume> comicVolumeList;
  @Mock private ScrapingIssue comicIssue;
  @Mock private Comic comic;

  @Test
  public void testQueryForVolumesAdaptorRaisesException() throws ScrapingException {
    Mockito.when(
            scrapingService.getVolumes(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyInt(), Mockito.anyBoolean()))
        .thenThrow(ScrapingException.class);

    final ApiResponse<List<ScrapingVolume>> response =
        controller.queryForVolumes(
            new GetVolumesRequest(TEST_API_KEY, TEST_SERIES_NAME, TEST_MAX_RECORDS, false));

    assertFalse(response.isSuccess());
    assertNotNull(response.getThrowable());

    Mockito.verify(scrapingService, Mockito.times(1))
        .getVolumes(TEST_API_KEY, TEST_SERIES_NAME, TEST_MAX_RECORDS, false);
  }

  @Test
  public void testQueryForVolumes() throws ScrapingException {
    Mockito.when(
            scrapingService.getVolumes(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyInt(), Mockito.anyBoolean()))
        .thenReturn(comicVolumeList);

    final ApiResponse<List<ScrapingVolume>> response =
        controller.queryForVolumes(
            new GetVolumesRequest(TEST_API_KEY, TEST_SERIES_NAME, TEST_MAX_RECORDS, false));

    assertTrue(response.isSuccess());
    assertSame(comicVolumeList, response.getResult());

    Mockito.verify(scrapingService, Mockito.times(1))
        .getVolumes(TEST_API_KEY, TEST_SERIES_NAME, TEST_MAX_RECORDS, false);
  }

  @Test
  public void testQueryForVolumesSkipCache() throws ScrapingException {
    Mockito.when(
            scrapingService.getVolumes(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyInt(), Mockito.anyBoolean()))
        .thenReturn(comicVolumeList);

    final ApiResponse<List<ScrapingVolume>> response =
        controller.queryForVolumes(
            new GetVolumesRequest(TEST_API_KEY, TEST_SERIES_NAME, TEST_MAX_RECORDS, true));

    assertTrue(response.isSuccess());
    assertSame(comicVolumeList, response.getResult());

    Mockito.verify(scrapingService, Mockito.times(1))
        .getVolumes(TEST_API_KEY, TEST_SERIES_NAME, TEST_MAX_RECORDS, true);
  }

  @Test
  public void testQueryForIssueAdaptorRaisesException() throws ScrapingException {
    Mockito.when(
            scrapingService.getIssue(
                Mockito.anyString(), Mockito.anyInt(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenThrow(ScrapingException.class);

    final ApiResponse<ScrapingIssue> response =
        controller.queryForIssue(
            TEST_VOLUME,
            new GetScrapingIssueRequest(TEST_API_KEY, TEST_SKIP_CACHE, TEST_ISSUE_NUMBER));

    assertNotNull(response);
    assertFalse(response.isSuccess());
    assertNotNull(response.getThrowable());

    Mockito.verify(scrapingService, Mockito.times(1))
        .getIssue(TEST_API_KEY, TEST_VOLUME, TEST_ISSUE_NUMBER, TEST_SKIP_CACHE);
  }

  @Test
  public void testQueryForIssue() throws ScrapingException {
    Mockito.when(
            scrapingService.getIssue(
                Mockito.anyString(), Mockito.anyInt(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(comicIssue);

    ApiResponse<ScrapingIssue> response =
        controller.queryForIssue(
            TEST_VOLUME,
            new GetScrapingIssueRequest(TEST_API_KEY, TEST_SKIP_CACHE, TEST_ISSUE_NUMBER));

    assertNotNull(response);
    assertTrue(response.isSuccess());
    assertSame(comicIssue, response.getResult());

    Mockito.verify(scrapingService, Mockito.times(1))
        .getIssue(TEST_API_KEY, TEST_VOLUME, TEST_ISSUE_NUMBER, TEST_SKIP_CACHE);
  }

  @Test
  public void testScrapeAndSaveComicDetailsScrapingAdaptorRaisesException()
      throws ScrapingException, ComiXedControllerException {
    Mockito.when(
            scrapingService.scrapeComic(
                Mockito.anyString(), Mockito.anyLong(), Mockito.anyInt(), Mockito.anyBoolean()))
        .thenThrow(ScrapingException.class);

    final ApiResponse<Comic> response =
        controller.scrapeAndSaveComicDetails(
            TEST_COMIC_ID, TEST_ISSUE_ID, new ComicScrapeRequest(TEST_API_KEY, TEST_SKIP_CACHE));

    assertNotNull(response);
    assertFalse(response.isSuccess());

    Mockito.verify(scrapingService, Mockito.times(1))
        .scrapeComic(TEST_API_KEY, TEST_COMIC_ID, TEST_ISSUE_ID, TEST_SKIP_CACHE);
  }

  @Test
  public void testScrapeAndSaveComicDetails() throws ScrapingException, ComiXedControllerException {
    Mockito.when(
            scrapingService.scrapeComic(
                Mockito.anyString(), Mockito.anyLong(), Mockito.anyInt(), Mockito.anyBoolean()))
        .thenReturn(comic);

    ApiResponse<Comic> response =
        controller.scrapeAndSaveComicDetails(
            TEST_COMIC_ID, TEST_ISSUE_ID, new ComicScrapeRequest(TEST_API_KEY, TEST_SKIP_CACHE));

    assertNotNull(response);
    assertTrue(response.isSuccess());
    assertSame(comic, response.getResult());

    Mockito.verify(scrapingService, Mockito.times(1))
        .scrapeComic(TEST_API_KEY, TEST_COMIC_ID, TEST_ISSUE_ID, TEST_SKIP_CACHE);
  }
}

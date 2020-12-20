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

package org.comixedproject.controller.library;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertSame;

import java.util.List;
import org.comixedproject.controller.ComiXedControllerException;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.net.library.LoadScrapingIssueRequest;
import org.comixedproject.model.net.library.LoadScrapingVolumesRequest;
import org.comixedproject.model.net.library.ScrapeComicRequest;
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

  @Test(expected = ScrapingException.class)
  public void testLoadScrapingVolumesAdaptorRaisesException() throws ScrapingException {
    Mockito.when(
            scrapingService.getVolumes(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyInt(), Mockito.anyBoolean()))
        .thenThrow(ScrapingException.class);

    try {
      controller.loadScrapingVolumes(
          new LoadScrapingVolumesRequest(TEST_API_KEY, TEST_SERIES_NAME, TEST_MAX_RECORDS, false));
    } finally {
      Mockito.verify(scrapingService, Mockito.times(1))
          .getVolumes(TEST_API_KEY, TEST_SERIES_NAME, TEST_MAX_RECORDS, false);
    }
  }

  @Test
  public void testLoadScrapingVolumes() throws ScrapingException {
    Mockito.when(
            scrapingService.getVolumes(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyInt(), Mockito.anyBoolean()))
        .thenReturn(comicVolumeList);

    final List<ScrapingVolume> response =
        controller.loadScrapingVolumes(
            new LoadScrapingVolumesRequest(
                TEST_API_KEY, TEST_SERIES_NAME, TEST_MAX_RECORDS, false));

    assertNotNull(response);
    assertSame(comicVolumeList, response);

    Mockito.verify(scrapingService, Mockito.times(1))
        .getVolumes(TEST_API_KEY, TEST_SERIES_NAME, TEST_MAX_RECORDS, false);
  }

  @Test
  public void testLoadScrapingVolumesSkipCache() throws ScrapingException {
    Mockito.when(
            scrapingService.getVolumes(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyInt(), Mockito.anyBoolean()))
        .thenReturn(comicVolumeList);

    final List<ScrapingVolume> response =
        controller.loadScrapingVolumes(
            new LoadScrapingVolumesRequest(TEST_API_KEY, TEST_SERIES_NAME, TEST_MAX_RECORDS, true));

    assertNotNull(response);
    assertSame(comicVolumeList, response);

    Mockito.verify(scrapingService, Mockito.times(1))
        .getVolumes(TEST_API_KEY, TEST_SERIES_NAME, TEST_MAX_RECORDS, true);
  }

  @Test(expected = ScrapingException.class)
  public void testLoadScrapingIssueAdaptorRaisesException() throws ScrapingException {
    Mockito.when(
            scrapingService.getIssue(
                Mockito.anyString(), Mockito.anyInt(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenThrow(ScrapingException.class);

    try {
      controller.loadScrapingIssue(
          TEST_VOLUME,
          TEST_ISSUE_NUMBER,
          new LoadScrapingIssueRequest(TEST_API_KEY, TEST_SKIP_CACHE));
    } finally {
      Mockito.verify(scrapingService, Mockito.times(1))
          .getIssue(TEST_API_KEY, TEST_VOLUME, TEST_ISSUE_NUMBER, TEST_SKIP_CACHE);
    }
  }

  @Test
  public void testLoadScrapingIssue() throws ScrapingException {
    Mockito.when(
            scrapingService.getIssue(
                Mockito.anyString(), Mockito.anyInt(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(comicIssue);

    ScrapingIssue response =
        controller.loadScrapingIssue(
            TEST_VOLUME,
            TEST_ISSUE_NUMBER,
            new LoadScrapingIssueRequest(TEST_API_KEY, TEST_SKIP_CACHE));

    assertNotNull(response);
    assertSame(comicIssue, response);

    Mockito.verify(scrapingService, Mockito.times(1))
        .getIssue(TEST_API_KEY, TEST_VOLUME, TEST_ISSUE_NUMBER, TEST_SKIP_CACHE);
  }

  @Test(expected = ScrapingException.class)
  public void testScrapeComicScrapingAdaptorRaisesException() throws ScrapingException {
    Mockito.when(
            scrapingService.scrapeComic(
                Mockito.anyString(), Mockito.anyLong(), Mockito.anyInt(), Mockito.anyBoolean()))
        .thenThrow(ScrapingException.class);

    try {
      controller.scrapeComic(
          TEST_COMIC_ID, new ScrapeComicRequest(TEST_API_KEY, TEST_ISSUE_ID, TEST_SKIP_CACHE));
    } finally {
      Mockito.verify(scrapingService, Mockito.times(1))
          .scrapeComic(TEST_API_KEY, TEST_COMIC_ID, TEST_ISSUE_ID, TEST_SKIP_CACHE);
    }
  }

  @Test
  public void testScrapeComic() throws ScrapingException, ComiXedControllerException {
    Mockito.when(
            scrapingService.scrapeComic(
                Mockito.anyString(), Mockito.anyLong(), Mockito.anyInt(), Mockito.anyBoolean()))
        .thenReturn(comic);

    Comic response =
        controller.scrapeComic(
            TEST_COMIC_ID, new ScrapeComicRequest(TEST_API_KEY, TEST_ISSUE_ID, TEST_SKIP_CACHE));

    assertNotNull(response);
    assertSame(comic, response);

    Mockito.verify(scrapingService, Mockito.times(1))
        .scrapeComic(TEST_API_KEY, TEST_COMIC_ID, TEST_ISSUE_ID, TEST_SKIP_CACHE);
  }
}

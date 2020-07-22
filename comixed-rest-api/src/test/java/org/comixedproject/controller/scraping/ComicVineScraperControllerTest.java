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

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertSame;

import java.util.List;
import org.comixedproject.controller.RESTException;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.net.ComicScrapeRequest;
import org.comixedproject.net.GetScrapingIssueRequest;
import org.comixedproject.net.GetVolumesRequest;
import org.comixedproject.scrapers.ScrapingException;
import org.comixedproject.scrapers.comicvine.adaptors.ComicVineScrapingAdaptor;
import org.comixedproject.scrapers.model.ScrapingIssue;
import org.comixedproject.scrapers.model.ScrapingVolume;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.comic.ComicService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ComicVineScraperControllerTest {
  private static final String TEST_API_KEY = "12345";
  private static final String TEST_SERIES_NAME = "Awesome Comic";
  private static final Integer TEST_VOLUME = 2018;
  private static final String TEST_ISSUE_NUMBER = "15";
  private static final long TEST_COMIC_ID = 213L;
  private static final String TEST_ISSUE_ID = "48132";
  private static final boolean TEST_SKIP_CACHE = true;

  @InjectMocks private ComicVineScraperController controller;
  @Mock private ComicVineScrapingAdaptor scrapingAdaptor;
  @Mock private List<ScrapingVolume> comicVolumeList;
  @Mock private ScrapingIssue comicIssue;
  @Mock private ComicService comicService;
  @Mock private Comic comic;

  @Test(expected = RESTException.class)
  public void testQueryForVolumesAdaptorRaisesException() throws ScrapingException, RESTException {
    Mockito.when(
            scrapingAdaptor.getVolumes(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenThrow(ScrapingException.class);

    try {
      controller.queryForVolumes(new GetVolumesRequest(TEST_API_KEY, TEST_SERIES_NAME, false));
    } finally {
      Mockito.verify(scrapingAdaptor, Mockito.times(1))
          .getVolumes(TEST_API_KEY, TEST_SERIES_NAME, false);
    }
  }

  @Test
  public void testQueryForVolumes() throws RESTException, ScrapingException {
    Mockito.when(
            scrapingAdaptor.getVolumes(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(comicVolumeList);

    final List<ScrapingVolume> result =
        controller.queryForVolumes(new GetVolumesRequest(TEST_API_KEY, TEST_SERIES_NAME, false));

    assertSame(comicVolumeList, result);

    Mockito.verify(scrapingAdaptor, Mockito.times(1))
        .getVolumes(TEST_API_KEY, TEST_SERIES_NAME, false);
  }

  @Test
  public void testQueryForVolumesSkipCache() throws ScrapingException, RESTException {
    Mockito.when(
            scrapingAdaptor.getVolumes(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(comicVolumeList);

    final List<ScrapingVolume> result =
        controller.queryForVolumes(new GetVolumesRequest(TEST_API_KEY, TEST_SERIES_NAME, true));

    assertSame(comicVolumeList, result);

    Mockito.verify(scrapingAdaptor, Mockito.times(1))
        .getVolumes(TEST_API_KEY, TEST_SERIES_NAME, true);
  }

  @Test(expected = RESTException.class)
  public void testQueryForIssueAdaptorRaisesException() throws ScrapingException, RESTException {
    Mockito.when(
            scrapingAdaptor.getIssue(
                Mockito.anyString(), Mockito.anyInt(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenThrow(ScrapingException.class);

    try {
      controller.queryForIssue(
          TEST_VOLUME,
          new GetScrapingIssueRequest(TEST_API_KEY, TEST_SKIP_CACHE, TEST_ISSUE_NUMBER));
    } finally {
      Mockito.verify(scrapingAdaptor, Mockito.times(1))
          .getIssue(TEST_API_KEY, TEST_VOLUME, TEST_ISSUE_NUMBER, TEST_SKIP_CACHE);
    }
  }

  @Test
  public void testQueryForIssue() throws ScrapingException, RESTException {
    Mockito.when(
            scrapingAdaptor.getIssue(
                Mockito.anyString(), Mockito.anyInt(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(comicIssue);

    ScrapingIssue result =
        controller.queryForIssue(
            TEST_VOLUME,
            new GetScrapingIssueRequest(TEST_API_KEY, TEST_SKIP_CACHE, TEST_ISSUE_NUMBER));

    assertNotNull(result);
    assertSame(comicIssue, result);

    Mockito.verify(scrapingAdaptor, Mockito.times(1))
        .getIssue(TEST_API_KEY, TEST_VOLUME, TEST_ISSUE_NUMBER, TEST_SKIP_CACHE);
  }

  @Test(expected = RESTException.class)
  public void testScrapeAndSaveComicDetailsNoSuchComic() throws ComicException, RESTException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenThrow(ComicException.class);

    try {
      controller.scrapeAndSaveComicDetails(
          TEST_COMIC_ID, TEST_ISSUE_ID, new ComicScrapeRequest(TEST_API_KEY, TEST_SKIP_CACHE));
    } finally {
      Mockito.verify(comicService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    }
  }

  @Test(expected = RESTException.class)
  public void testScrapeAndSaveComicDetailsScrapingAdaptorRaisesException()
      throws ComicException, ScrapingException, RESTException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);
    Mockito.doThrow(ScrapingException.class)
        .when(scrapingAdaptor)
        .scrapeComic(
            Mockito.anyString(),
            Mockito.anyString(),
            Mockito.anyBoolean(),
            Mockito.any(Comic.class));

    try {
      controller.scrapeAndSaveComicDetails(
          TEST_COMIC_ID, TEST_ISSUE_ID, new ComicScrapeRequest(TEST_API_KEY, TEST_SKIP_CACHE));
    } finally {
      Mockito.verify(scrapingAdaptor, Mockito.times(1))
          .scrapeComic(TEST_API_KEY, TEST_ISSUE_ID, TEST_SKIP_CACHE, comic);
    }
  }

  @Test
  public void testScrapeAndSaveComicDetails()
      throws ComicException, ScrapingException, RESTException {
    Mockito.when(comicService.getComic(Mockito.anyLong())).thenReturn(comic);

    Comic result =
        controller.scrapeAndSaveComicDetails(
            TEST_COMIC_ID, TEST_ISSUE_ID, new ComicScrapeRequest(TEST_API_KEY, TEST_SKIP_CACHE));

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(scrapingAdaptor, Mockito.times(1))
        .scrapeComic(TEST_API_KEY, TEST_ISSUE_ID, TEST_SKIP_CACHE, comic);
  }
}

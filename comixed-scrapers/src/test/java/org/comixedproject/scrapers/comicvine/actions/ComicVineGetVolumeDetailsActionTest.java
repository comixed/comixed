/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

package org.comixedproject.scrapers.comicvine.actions;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertNotNull;

import java.io.IOException;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.TimeZone;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.comixedproject.scrapers.ScrapingException;
import org.comixedproject.scrapers.comicvine.model.ComicVineVolume;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RunWith(MockitoJUnitRunner.class)
public class ComicVineGetVolumeDetailsActionTest {
  private static final String TEST_API_KEY = "this is the api key";
  private static final String TEST_API_URL = "http://comicvine.gamespot/com/volumes/4050-9999/";

  private static final String TEST_NAME = "Flashpoint";
  private static final String TEST_START_YEAR = "2011";
  private static final String TEST_BAD_DATA = "This is not JSON";
  private static final String TEST_GOOD_DATA =
      "{\"error\":\"OK\",\"limit\":1,\"offset\":0,\"number_of_page_results\":1,\"number_of_total_results\":1,\"status_code\":1,\"results\":{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/volume\\/4050-39997\\/\",\"name\":\"Flashpoint\",\"start_year\":\"2011\"},\"version\":\"1.0\"}";

  @InjectMocks private ComicVineGetVolumeDetailsAction getVolumeDetailsAction;

  private MockWebServer comicVineServer;
  private Date coverDate;

  @Before
  public void setUp() throws IOException {
    comicVineServer = new MockWebServer();
    comicVineServer.start();

    final Calendar date = new GregorianCalendar();
    date.setTimeZone(TimeZone.getTimeZone("UTC"));
    date.set(2011, 10 - 1, 31, 0, 0, 0);
    coverDate = date.getTime();

    final String hostname = String.format("http://localhost:%s", this.comicVineServer.getPort());
    getVolumeDetailsAction.setApiKey(TEST_API_KEY);
    getVolumeDetailsAction.setApiUrl(hostname);
  }

  @After
  public void tearDown() throws IOException {
    comicVineServer.shutdown();
  }

  @Test(expected = ScrapingException.class)
  public void testExecuteMissingApiKey() throws ScrapingException {
    getVolumeDetailsAction.setApiKey("");
    getVolumeDetailsAction.execute();
  }

  @Test(expected = ScrapingException.class)
  public void testExecuteMissingApiUrl() throws ScrapingException {
    getVolumeDetailsAction.setApiUrl("");
    getVolumeDetailsAction.execute();
  }

  @Test(expected = ScrapingException.class)
  public void testExecuteBadData() throws ScrapingException {
    this.comicVineServer.enqueue(
        new MockResponse()
            .setBody(TEST_BAD_DATA)
            .addHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE));
    getVolumeDetailsAction.execute();
  }

  @Test
  public void testExecute() throws ScrapingException {
    this.comicVineServer.enqueue(
        new MockResponse()
            .setBody(TEST_GOOD_DATA)
            .addHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE));

    final ComicVineVolume result = getVolumeDetailsAction.execute();

    assertNotNull(result);
    assertEquals(TEST_NAME, result.getName());
    assertEquals(TEST_START_YEAR, result.getStartYear());
  }
}

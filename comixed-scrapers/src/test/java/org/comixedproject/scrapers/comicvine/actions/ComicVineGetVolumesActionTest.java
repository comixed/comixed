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

import static junit.framework.TestCase.*;

import java.io.IOException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Random;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.comixedproject.scrapers.ScrapingException;
import org.comixedproject.scrapers.model.ScrapingVolume;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = {ComicVineGetVolumesAction.class})
public class ComicVineGetVolumesActionTest {
  private static final Random RANDOM = new Random();
  private static final String TEST_API_KEY = "OICU812";
  private static final String TEST_VOLUME_NAME = "Action Comics";
  private static final String TEST_BAD_RESPONSE_BODY = "This is not JSON";
  private static final String TEST_RESPONSE_BODY =
      "{\"error\":\"OK\",\"limit\":10,\"offset\":0,\"number_of_page_results\":10,\"number_of_total_results\":10,\"status_code\":1,\"results\":[{\"count_of_issues\":864,\"id\":18005,\"image\":{\"icon_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/square_avatar\\/0\\/2\\/80536-18005-105403-1-action-comics.jpg\",\"medium_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_medium\\/0\\/2\\/80536-18005-105403-1-action-comics.jpg\",\"screen_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/screen_medium\\/0\\/2\\/80536-18005-105403-1-action-comics.jpg\",\"screen_large_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/screen_kubrick\\/0\\/2\\/80536-18005-105403-1-action-comics.jpg\",\"small_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_small\\/0\\/2\\/80536-18005-105403-1-action-comics.jpg\",\"super_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_large\\/0\\/2\\/80536-18005-105403-1-action-comics.jpg\",\"thumb_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_avatar\\/0\\/2\\/80536-18005-105403-1-action-comics.jpg\",\"tiny_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/square_mini\\/0\\/2\\/80536-18005-105403-1-action-comics.jpg\",\"original_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/original\\/0\\/2\\/80536-18005-105403-1-action-comics.jpg\",\"image_tags\":\"All Images\"},\"name\":\"Action Comics\",\"publisher\":{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/publisher\\/4010-10\\/\",\"id\":10,\"name\":\"DC Comics\"},\"start_year\":\"1938\",\"resource_type\":\"volume\"},{\"count_of_issues\":6,\"id\":77491,\"image\":{\"icon_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/square_avatar\\/2\\/27783\\/4144817-action-1.jpg\",\"medium_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_medium\\/2\\/27783\\/4144817-action-1.jpg\",\"screen_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/screen_medium\\/2\\/27783\\/4144817-action-1.jpg\",\"screen_large_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/screen_kubrick\\/2\\/27783\\/4144817-action-1.jpg\",\"small_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_small\\/2\\/27783\\/4144817-action-1.jpg\",\"super_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_large\\/2\\/27783\\/4144817-action-1.jpg\",\"thumb_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_avatar\\/2\\/27783\\/4144817-action-1.jpg\",\"tiny_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/square_mini\\/2\\/27783\\/4144817-action-1.jpg\",\"original_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/original\\/2\\/27783\\/4144817-action-1.jpg\",\"image_tags\":\"All Images\"},\"name\":\"Action Comics\",\"publisher\":{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/publisher\\/4010-4185\\/\",\"id\":4185,\"name\":\"Unknown Publisher\"},\"start_year\":\"1947\",\"resource_type\":\"volume\"},{\"count_of_issues\":66,\"id\":91078,\"image\":{\"icon_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/square_avatar\\/6\\/67663\\/5253674-957.jpg\",\"medium_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_medium\\/6\\/67663\\/5253674-957.jpg\",\"screen_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/screen_medium\\/6\\/67663\\/5253674-957.jpg\",\"screen_large_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/screen_kubrick\\/6\\/67663\\/5253674-957.jpg\",\"small_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_small\\/6\\/67663\\/5253674-957.jpg\",\"super_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_large\\/6\\/67663\\/5253674-957.jpg\",\"thumb_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_avatar\\/6\\/67663\\/5253674-957.jpg\",\"tiny_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/square_mini\\/6\\/67663\\/5253674-957.jpg\",\"original_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/original\\/6\\/67663\\/5253674-957.jpg\",\"image_tags\":\"All Images\"},\"name\":\"Action Comics\",\"publisher\":{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/publisher\\/4010-10\\/\",\"id\":10,\"name\":\"DC Comics\"},\"start_year\":\"2016\",\"resource_type\":\"volume\"},{\"count_of_issues\":57,\"id\":42563,\"image\":{\"icon_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/square_avatar\\/0\\/9116\\/1998210-1a.jpg\",\"medium_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_medium\\/0\\/9116\\/1998210-1a.jpg\",\"screen_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/screen_medium\\/0\\/9116\\/1998210-1a.jpg\",\"screen_large_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/screen_kubrick\\/0\\/9116\\/1998210-1a.jpg\",\"small_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_small\\/0\\/9116\\/1998210-1a.jpg\",\"super_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_large\\/0\\/9116\\/1998210-1a.jpg\",\"thumb_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_avatar\\/0\\/9116\\/1998210-1a.jpg\",\"tiny_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/square_mini\\/0\\/9116\\/1998210-1a.jpg\",\"original_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/original\\/0\\/9116\\/1998210-1a.jpg\",\"image_tags\":\"All Images\"},\"name\":\"Action Comics\",\"publisher\":{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/publisher\\/4010-10\\/\",\"id\":10,\"name\":\"DC Comics\"},\"start_year\":\"2011\",\"resource_type\":\"volume\"},{\"count_of_issues\":1,\"id\":40958,\"image\":{\"icon_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/square_avatar\\/8\\/80884\\/1877973-action.jpg\",\"medium_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_medium\\/8\\/80884\\/1877973-action.jpg\",\"screen_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/screen_medium\\/8\\/80884\\/1877973-action.jpg\",\"screen_large_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/screen_kubrick\\/8\\/80884\\/1877973-action.jpg\",\"small_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_small\\/8\\/80884\\/1877973-action.jpg\",\"super_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_large\\/8\\/80884\\/1877973-action.jpg\",\"thumb_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_avatar\\/8\\/80884\\/1877973-action.jpg\",\"tiny_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/square_mini\\/8\\/80884\\/1877973-action.jpg\",\"original_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/original\\/8\\/80884\\/1877973-action.jpg\",\"image_tags\":\"All Images\"},\"name\":\"Action Comics\",\"publisher\":{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/publisher\\/4010-2361\\/\",\"id\":2361,\"name\":\"L. Miller & Son, Ltd\"},\"start_year\":null,\"resource_type\":\"volume\"},{\"count_of_issues\":6,\"id\":41730,\"image\":{\"icon_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/square_avatar\\/6\\/67663\\/1943858-01.jpg\",\"medium_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_medium\\/6\\/67663\\/1943858-01.jpg\",\"screen_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/screen_medium\\/6\\/67663\\/1943858-01.jpg\",\"screen_large_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/screen_kubrick\\/6\\/67663\\/1943858-01.jpg\",\"small_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_small\\/6\\/67663\\/1943858-01.jpg\",\"super_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_large\\/6\\/67663\\/1943858-01.jpg\",\"thumb_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_avatar\\/6\\/67663\\/1943858-01.jpg\",\"tiny_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/square_mini\\/6\\/67663\\/1943858-01.jpg\",\"original_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/original\\/6\\/67663\\/1943858-01.jpg\",\"image_tags\":\"All Images\"},\"name\":\"Action Comics\",\"publisher\":{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/publisher\\/4010-2350\\/\",\"id\":2350,\"name\":\"Panini Comics\"},\"start_year\":\"2001\",\"resource_type\":\"volume\"},{\"count_of_issues\":1,\"id\":69951,\"image\":{\"icon_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/square_avatar\\/6\\/67663\\/4390314-01.jpg\",\"medium_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_medium\\/6\\/67663\\/4390314-01.jpg\",\"screen_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/screen_medium\\/6\\/67663\\/4390314-01.jpg\",\"screen_large_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/screen_kubrick\\/6\\/67663\\/4390314-01.jpg\",\"small_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_small\\/6\\/67663\\/4390314-01.jpg\",\"super_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_large\\/6\\/67663\\/4390314-01.jpg\",\"thumb_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_avatar\\/6\\/67663\\/4390314-01.jpg\",\"tiny_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/square_mini\\/6\\/67663\\/4390314-01.jpg\",\"original_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/original\\/6\\/67663\\/4390314-01.jpg\",\"image_tags\":\"All Images\"},\"name\":\"DC Comics Essentials: Action Comics\",\"publisher\":{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/publisher\\/4010-10\\/\",\"id\":10,\"name\":\"DC Comics\"},\"start_year\":\"2013\",\"resource_type\":\"volume\"},{\"count_of_issues\":13,\"id\":3776,\"image\":{\"icon_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/square_avatar\\/11112\\/111120209\\/4002722-ac%20annual%201.jpg\",\"medium_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_medium\\/11112\\/111120209\\/4002722-ac%20annual%201.jpg\",\"screen_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/screen_medium\\/11112\\/111120209\\/4002722-ac%20annual%201.jpg\",\"screen_large_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/screen_kubrick\\/11112\\/111120209\\/4002722-ac%20annual%201.jpg\",\"small_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_small\\/11112\\/111120209\\/4002722-ac%20annual%201.jpg\",\"super_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_large\\/11112\\/111120209\\/4002722-ac%20annual%201.jpg\",\"thumb_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_avatar\\/11112\\/111120209\\/4002722-ac%20annual%201.jpg\",\"tiny_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/square_mini\\/11112\\/111120209\\/4002722-ac%20annual%201.jpg\",\"original_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/original\\/11112\\/111120209\\/4002722-ac%20annual%201.jpg\",\"image_tags\":\"All Images,Covers\"},\"name\":\"Action Comics Annual\",\"publisher\":{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/publisher\\/4010-10\\/\",\"id\":10,\"name\":\"DC Comics\"},\"start_year\":\"1987\",\"resource_type\":\"volume\"},{\"count_of_issues\":7,\"id\":25705,\"image\":{\"icon_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/square_avatar\\/10\\/100239\\/2918799-__addme___captain_action_comics_v9999__1___page_1.jpg\",\"medium_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_medium\\/10\\/100239\\/2918799-__addme___captain_action_comics_v9999__1___page_1.jpg\",\"screen_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/screen_medium\\/10\\/100239\\/2918799-__addme___captain_action_comics_v9999__1___page_1.jpg\",\"screen_large_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/screen_kubrick\\/10\\/100239\\/2918799-__addme___captain_action_comics_v9999__1___page_1.jpg\",\"small_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_small\\/10\\/100239\\/2918799-__addme___captain_action_comics_v9999__1___page_1.jpg\",\"super_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_large\\/10\\/100239\\/2918799-__addme___captain_action_comics_v9999__1___page_1.jpg\",\"thumb_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_avatar\\/10\\/100239\\/2918799-__addme___captain_action_comics_v9999__1___page_1.jpg\",\"tiny_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/square_mini\\/10\\/100239\\/2918799-__addme___captain_action_comics_v9999__1___page_1.jpg\",\"original_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/original\\/10\\/100239\\/2918799-__addme___captain_action_comics_v9999__1___page_1.jpg\",\"image_tags\":\"All Images\"},\"name\":\"Captain Action Comics\",\"publisher\":{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/publisher\\/4010-1102\\/\",\"id\":1102,\"name\":\"Moonstone\"},\"start_year\":\"2008\",\"resource_type\":\"volume\"},{\"count_of_issues\":2,\"id\":60056,\"image\":{\"icon_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/square_avatar\\/6\\/67663\\/2987701-01.jpg\",\"medium_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_medium\\/6\\/67663\\/2987701-01.jpg\",\"screen_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/screen_medium\\/6\\/67663\\/2987701-01.jpg\",\"screen_large_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/screen_kubrick\\/6\\/67663\\/2987701-01.jpg\",\"small_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_small\\/6\\/67663\\/2987701-01.jpg\",\"super_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_large\\/6\\/67663\\/2987701-01.jpg\",\"thumb_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_avatar\\/6\\/67663\\/2987701-01.jpg\",\"tiny_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/square_mini\\/6\\/67663\\/2987701-01.jpg\",\"original_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/original\\/6\\/67663\\/2987701-01.jpg\",\"image_tags\":\"All Images\"},\"name\":\"Double Fine Action Comics\",\"publisher\":{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/publisher\\/4010-682\\/\",\"id\":682,\"name\":\"Oni Press\"},\"start_year\":\"2013\",\"resource_type\":\"volume\"}],\"version\":\"1.0\"}";
  private static final Integer TEST_ISSUE_COUNT = 864;
  private static final String TEST_IMAGE_URL =
      "https://comicvine1.cbsistatic.com/uploads/screen_medium/0/2/80536-18005-105403-1-action-comics.jpg";
  private static final String TEST_START_YEAR = "1938";
  private static final String TEST_PUBLISHER_NAME = "DC Comics";
  private static final Integer TEST_ALL_RECORDS = 10;
  private static final Integer TEST_MAX_RECORDS = 3;
  public MockWebServer comicVineServer;
  @Autowired private ComicVineGetVolumesAction getVolumesAction;

  @Before
  public void setUp() throws IOException, KeyStoreException, NoSuchAlgorithmException {
    comicVineServer = new MockWebServer();
    comicVineServer.start();

    final String hostname = String.format("localhost:%s", this.comicVineServer.getPort());
    getVolumesAction.setBaseUrl(hostname);
    getVolumesAction.setApiKey(TEST_API_KEY);
    getVolumesAction.setSeries(TEST_VOLUME_NAME);
  }

  @After
  public void tearDown() throws IOException {
    comicVineServer.shutdown();
  }

  @Test(expected = ScrapingException.class)
  public void testExecuteMissingApiKey() throws ScrapingException {
    getVolumesAction.setApiKey("");
    getVolumesAction.execute();
  }

  @Test(expected = ScrapingException.class)
  public void testExecuteMissingSeries() throws ScrapingException {
    getVolumesAction.setSeries("");

    getVolumesAction.execute();
  }

  @Test(expected = ScrapingException.class)
  public void testExecuteBadResponse() throws ScrapingException {
    this.comicVineServer.enqueue(
        new MockResponse()
            .setBody(TEST_BAD_RESPONSE_BODY)
            .addHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE));

    getVolumesAction.execute();
  }

  @Test
  public void testExecute() throws ScrapingException {
    this.comicVineServer.enqueue(
        new MockResponse()
            .setBody(TEST_RESPONSE_BODY)
            .addHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE));

    getVolumesAction.setMaxRecords(0);

    final List<ScrapingVolume> result = getVolumesAction.execute();

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(TEST_ALL_RECORDS.intValue(), result.size());

    final ScrapingVolume volume = result.get(0);

    assertEquals(TEST_VOLUME_NAME, volume.getName());
    assertEquals(TEST_ISSUE_COUNT.intValue(), volume.getIssueCount());
    assertEquals(TEST_IMAGE_URL, volume.getImageURL());
    assertEquals(TEST_START_YEAR, volume.getStartYear());
    assertEquals(TEST_PUBLISHER_NAME, volume.getPublisher());
  }

  @Test
  public void testExecuteWithLimit() throws ScrapingException {
    this.comicVineServer.enqueue(
        new MockResponse()
            .setBody(TEST_RESPONSE_BODY)
            .addHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE));

    getVolumesAction.setMaxRecords(TEST_MAX_RECORDS);

    final List<ScrapingVolume> result = getVolumesAction.execute();

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(TEST_MAX_RECORDS.intValue(), result.size());

    final ScrapingVolume volume = result.get(0);

    assertEquals(TEST_VOLUME_NAME, volume.getName());
    assertEquals(TEST_ISSUE_COUNT.intValue(), volume.getIssueCount());
    assertEquals(TEST_IMAGE_URL, volume.getImageURL());
    assertEquals(TEST_START_YEAR, volume.getStartYear());
    assertEquals(TEST_PUBLISHER_NAME, volume.getPublisher());
  }
}

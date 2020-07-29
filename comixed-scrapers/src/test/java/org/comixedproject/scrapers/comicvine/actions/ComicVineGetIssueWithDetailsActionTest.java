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

import static junit.framework.TestCase.assertFalse;
import static junit.framework.TestCase.assertTrue;
import static org.junit.Assert.assertEquals;

import java.io.IOException;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.TimeZone;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.apache.commons.lang.time.DateUtils;
import org.comixedproject.scrapers.ScrapingException;
import org.comixedproject.scrapers.comicvine.model.ComicVineIssue;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RunWith(MockitoJUnitRunner.class)
public class ComicVineGetIssueWithDetailsActionTest {
  private static final String TEST_API_KEY = "this is the api key";
  private static final Integer TEST_ISSUE_ID = 282586;

  private static final String TEST_ISSUE_NUMBER = "4";
  private static final Object TEST_TITLE = "Flashpoint: Chapter Four of Five";
  private static final String TEST_BAD_DATA = "This is not JSON";
  private static final String TEST_GOOD_DATA =
      "{\"error\":\"OK\",\"limit\":1,\"offset\":0,\"number_of_page_results\":1,\"number_of_total_results\":1,\"status_code\":1,\"results\":{\"character_credits\":[{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-2357\\/\",\"id\":2357,\"name\":\"Aquaman\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman\\/4005-2357\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-56661\\/\",\"id\":56661,\"name\":\"Barack Obama\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/barack-obama\\/4005-56661\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-22804\\/\",\"id\":22804,\"name\":\"Barry Allen\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/barry-allen\\/4005-22804\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-2350\\/\",\"id\":2350,\"name\":\"Billy Batson\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/billy-batson\\/4005-2350\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-4916\\/\",\"id\":4916,\"name\":\"Black Adam\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/black-adam\\/4005-4916\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-77726\\/\",\"id\":77726,\"name\":\"Blackout\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/blackout\\/4005-77726\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-78421\\/\",\"id\":78421,\"name\":\"Canterbury Cricket\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/canterbury-cricket\\/4005-78421\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-9558\\/\",\"id\":9558,\"name\":\"Captain Thunder\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/captain-thunder\\/4005-9558\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-2388\\/\",\"id\":2388,\"name\":\"Cyborg\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/cyborg\\/4005-2388\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-77807\\/\",\"id\":77807,\"name\":\"Darla Dudley\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/darla-dudley\\/4005-77807\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-77737\\/\",\"id\":77737,\"name\":\"Element Woman\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/element-woman\\/4005-77737\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-31464\\/\",\"id\":31464,\"name\":\"Enchantress\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/enchantress\\/4005-31464\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-18340\\/\",\"id\":18340,\"name\":\"Eobard Thawne\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/eobard-thawne\\/4005-18340\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-77806\\/\",\"id\":77806,\"name\":\"Eugene Choi\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/eugene-choi\\/4005-77806\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-41226\\/\",\"id\":41226,\"name\":\"Frankenstein\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/frankenstein\\/4005-41226\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-10935\\/\",\"id\":10935,\"name\":\"Freddy Freeman\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/freddy-freeman\\/4005-10935\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-23624\\/\",\"id\":23624,\"name\":\"Grifter\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/grifter\\/4005-23624\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-11202\\/\",\"id\":11202,\"name\":\"Hal Jordan\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/hal-jordan\\/4005-11202\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-10210\\/\",\"id\":10210,\"name\":\"Hector Hammond\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/hector-hammond\\/4005-10210\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-90779\\/\",\"id\":90779,\"name\":\"Henry Allen \",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/henry-allen\\/4005-90779\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-2356\\/\",\"id\":2356,\"name\":\"Mary Marvel\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/mary-marvel\\/4005-2356\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-78653\\/\",\"id\":78653,\"name\":\"Mrs. Hyde\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/mrs-hyde\\/4005-78653\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-39462\\/\",\"id\":39462,\"name\":\"Nora Allen\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/nora-allen\\/4005-39462\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-3758\\/\",\"id\":3758,\"name\":\"Ocean Master\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/ocean-master\\/4005-3758\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-77805\\/\",\"id\":77805,\"name\":\"Pedro Pe\\u00f1a\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/pedro-pena\\/4005-77805\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-79034\\/\",\"id\":79034,\"name\":\"Penthesileia\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/penthesileia\\/4005-79034\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-6273\\/\",\"id\":6273,\"name\":\"Tawky Tawny\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/tawky-tawny\\/4005-6273\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-77725\\/\",\"id\":77725,\"name\":\"The Outsider\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/the-outsider\\/4005-77725\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-2365\\/\",\"id\":2365,\"name\":\"The Wizard\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/the-wizard\\/4005-2365\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-3602\\/\",\"id\":3602,\"name\":\"Thomas Wayne\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/thomas-wayne\\/4005-3602\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-2048\\/\",\"id\":2048,\"name\":\"Wonder Woman\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/wonder-woman\\/4005-2048\\/\"}],\"cover_date\":\"2011-10-31\",\"description\":\"<p><i>FLASH FACT: The war between the Amazons and the Atlantians has arrived. The battle between Diana of Themyscira and Emperor Aquaman will tear this world apart \\u2013 unless The Flash can fix it!<\\/i><\\/p><p><i>Summary:<\\/i><\\/p><p><em>Flashpoint #4<\\/em> starts in Fawcett City as Eugene, Pedro, Darla, Billy, Mary, Freddie watch the president addresses to the people it was wrong to have hope in the super-humans. The teens argue on what to do next.<\\/p><p>In Coast City, Hector Hammond readies a custom F-35 for Hal Jordan. Hector berates Hal for having a smug smile across his face, Hal tells Hector he knows what the stakes are, but he can't focus on the fear or he''ll go hide.<\\/p><p>In Metropolis, Batman, Barry and Cyborg try to fend off the security from the Superman facility. Then out of no where Element Woman, Emily Sung douses the security with gas, and she brought extra juice boxes. As this team discuss their next move, Barry is hit with a surge of memories, until Batman gives him an anti-epileptic so it slows down the electrical activity in Barry's brain.<\\/p><p>In Fawcett City, Pedro, Billy, Eugene, Mary, Freddie, Darla and Tawny continue to argue their next move. Billy says they need to stop the Atlanteans and the Amazonians. Then Batman, Emily Sung, Cyborg and Barry burst into their home. They ask Billy to help Barry with his mental deterioration. Then Billy sees himself in the other universe, where he saw hope. Then they tune in on the news in which they hear that Hal Jordan has been confirmed as a casualty, and a giant tidal wave has hit the U.K. Then Barry takes Thomas into the kitchen saying they have to stop them. Thomas argues it's all going to be wiped away, Barry contests he could forget everything and they could fail to stop Thawne, and if they do they will have to be stuck in this world. Thomas says either we change this world or we let it burn in hell. Flash tells Cyborg to round up the resistance, and the kids decide to join. Batman just stands there, until Flash remarks \\\"Bruce would've come.\\\" Thomas then decides to join.<\\/p><p>In New Themyscira, Element Woman, Flash, the Shazam kids, are all in Thomas' jet. As Aquaman and Wonder Woman fight, the kids turn into Shazam. Captain Thunder attacks Wonder Woman. Flash tries to reason with Aquaman, then the Enchantress betrays everyone by splitting the kids from Captain Thunder. Wonder Woman notes he's just a boy but goes on and kills him. Then Thawne comes back and taunts Barry on what he did.<\\/p>\",\"issue_number\":\"4\",\"location_credits\":[{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/location\\/4020-47879\\/\",\"id\":47879,\"name\":\"Coast City\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/coast-city\\/4020-47879\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/location\\/4020-55794\\/\",\"id\":55794,\"name\":\"England\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/england\\/4020-55794\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/location\\/4020-52613\\/\",\"id\":52613,\"name\":\"Fawcett City\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/fawcett-city\\/4020-52613\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/location\\/4020-55896\\/\",\"id\":55896,\"name\":\"Ferris Air\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/ferris-air\\/4020-55896\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/location\\/4020-55798\\/\",\"id\":55798,\"name\":\"London\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/london\\/4020-55798\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/location\\/4020-41184\\/\",\"id\":41184,\"name\":\"Metropolis\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/metropolis\\/4020-41184\\/\"}],\"name\":\"Flashpoint: Chapter Four of Five\",\"person_credits\":[{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/person\\/4040-9587\\/\",\"id\":9587,\"name\":\"Alex Sinclair\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/alex-sinclair\\/4040-9587\\/\",\"role\":\"colorist\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/person\\/4040-8472\\/\",\"id\":8472,\"name\":\"Andy Kubert\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/andy-kubert\\/4040-8472\\/\",\"role\":\"penciler\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/person\\/4040-41680\\/\",\"id\":41680,\"name\":\"Eddie Berganza\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/eddie-berganza\\/4040-41680\\/\",\"role\":\"editor\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/person\\/4040-40439\\/\",\"id\":40439,\"name\":\"Geoff Johns\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/geoff-johns\\/4040-40439\\/\",\"role\":\"writer\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/person\\/4040-14201\\/\",\"id\":14201,\"name\":\"Jesse Delperdang\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/jesse-delperdang\\/4040-14201\\/\",\"role\":\"inker\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/person\\/4040-61919\\/\",\"id\":61919,\"name\":\"Kate Durr\\u00e9\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/kate-durre\\/4040-61919\\/\",\"role\":\"editor\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/person\\/4040-51682\\/\",\"id\":51682,\"name\":\"Nei Ruffino\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/nei-ruffino\\/4040-51682\\/\",\"role\":\"cover\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/person\\/4040-12505\\/\",\"id\":12505,\"name\":\"Nick J. Napolitano\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/nick-j-napolitano\\/4040-12505\\/\",\"role\":\"letterer\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/person\\/4040-5571\\/\",\"id\":5571,\"name\":\"Rags Morales\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/rags-morales\\/4040-5571\\/\",\"role\":\"cover\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/person\\/4040-55944\\/\",\"id\":55944,\"name\":\"Rex Ogle\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/rex-ogle\\/4040-55944\\/\",\"role\":\"editor\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/person\\/4040-4892\\/\",\"id\":4892,\"name\":\"Sandra Hope\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/sandra-hope\\/4040-4892\\/\",\"role\":\"cover\"}],\"story_arc_credits\":[{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/story_arc\\/4045-56280\\/\",\"id\":56280,\"name\":\"Flashpoint\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/flashpoint\\/4045-56280\\/\"}],\"team_credits\":[{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/team\\/4060-42494\\/\",\"id\":42494,\"name\":\"Amazons of Themyscira\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/amazons-of-themyscira\\/4060-42494\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/team\\/4060-56878\\/\",\"id\":56878,\"name\":\"Atlanteans\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/atlanteans\\/4060-56878\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/team\\/4060-58338\\/\",\"id\":58338,\"name\":\"S.H.A.Z.A.M.\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/shazam\\/4060-58338\\/\"}],\"volume\":{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/volume\\/4050-39997\\/\",\"id\":39997,\"name\":\"Flashpoint\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/flashpoint\\/4050-39997\\/\"}},\"version\":\"1.0\"}";

  @InjectMocks private ComicVineGetIssueWithDetailsAction getIssueDetailsAction;

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
    getIssueDetailsAction.setBaseUrl(hostname);
    getIssueDetailsAction.setApiKey(TEST_API_KEY);
    getIssueDetailsAction.setIssueId(TEST_ISSUE_ID);
  }

  @After
  public void tearDown() throws IOException {
    comicVineServer.shutdown();
  }

  @Test(expected = ScrapingException.class)
  public void testExecuteMissingBaseUrl() throws ScrapingException {
    getIssueDetailsAction.setBaseUrl("");
    getIssueDetailsAction.execute();
  }

  @Test(expected = ScrapingException.class)
  public void testExecuteMissingApiKey() throws ScrapingException {
    getIssueDetailsAction.setApiKey("");
    getIssueDetailsAction.execute();
  }

  @Test(expected = ScrapingException.class)
  public void testExecuteMissingIssueId() throws ScrapingException {
    getIssueDetailsAction.setIssueId(null);
    getIssueDetailsAction.execute();
  }

  @Test(expected = ScrapingException.class)
  public void testExecuteBadData() throws ScrapingException {
    this.comicVineServer.enqueue(
        new MockResponse()
            .setBody(TEST_BAD_DATA)
            .addHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE));
    getIssueDetailsAction.execute();
  }

  @Test
  public void testExecute() throws ScrapingException {
    this.comicVineServer.enqueue(
        new MockResponse()
            .addHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .setBody(TEST_GOOD_DATA));

    final ComicVineIssue result = getIssueDetailsAction.execute();

    assertEquals(TEST_ISSUE_NUMBER, result.getIssueNumber());
    assertTrue(DateUtils.isSameDay(coverDate, result.getCoverDate()));
    assertEquals(TEST_TITLE, result.getTitle());
    assertFalse(result.getCharacters().isEmpty());
    assertFalse(result.getTeams().isEmpty());
    assertFalse(result.getLocations().isEmpty());
    assertFalse(result.getStories().isEmpty());
    assertFalse(result.getPeople().isEmpty());
  }
}

/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

package org.comixedproject.metadata.comicvine.actions;

import static junit.framework.TestCase.assertFalse;
import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertNull;
import static junit.framework.TestCase.assertSame;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.comixedproject.metadata.MetadataException;
import org.comixedproject.metadata.comicvine.model.ComicVineIssue;
import org.comixedproject.metadata.model.IssueDetailsMetadata;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RunWith(MockitoJUnitRunner.class)
public class ComicVineGetAllIssuesActionTest {
  private static final String TEST_API_KEY = "This.is.the.test.api.key";
  private static final String TEST_VOLUME_ID = "219";
  private static final String TEST_ISSUE_ID = "219";
  private static final String TEST_BAD_RESPONSE_BODY = "this is not JSON";
  private static final String TEST_GOOD_RESPONSE_BODY =
      "{\"error\":\"OK\",\"limit\":1,\"offset\":0,\"number_of_page_results\":1,\"number_of_total_results\":1,\"status_code\":1,\"results\":{\"issues\":[{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-537207\\/\",\"id\":537207,\"name\":\"The Drowning Part One: The End Of Fear\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-1-the-drowning-part-one-the-end-of-fear\\/4000-537207\\/\",\"issue_number\":\"1\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-538479\\/\",\"id\":538479,\"name\":\"The Drowning Part Two: Full Circle\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-2-the-drowning-part-two-full-circle\\/4000-538479\\/\",\"issue_number\":\"2\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-540043\\/\",\"id\":540043,\"name\":\"The Drowning Part Three: Capitol Crimes\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-3-the-drowning-part-three-capitol-crimes\\/4000-540043\\/\",\"issue_number\":\"3\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-542594\\/\",\"id\":542594,\"name\":\"The Drowning Part Four: Semper Fidelis\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-4-the-drowning-part-four-semper-fidelis\\/4000-542594\\/\",\"issue_number\":\"4\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-544953\\/\",\"id\":544953,\"name\":\"The Drowning Part Five: Executive Sanction\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-5-the-drowning-part-five-executive-sanctio\\/4000-544953\\/\",\"issue_number\":\"5\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-548547\\/\",\"id\":548547,\"name\":\"The Drowning Conclusion: Out of His League\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-6-the-drowning-conclusion-out-of-his-leagu\\/4000-548547\\/\",\"issue_number\":\"6\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-550320\\/\",\"id\":550320,\"name\":\"Uneasy Lies the Head That Wears the Crown\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-7-uneasy-lies-the-head-that-wears-the-crow\\/4000-550320\\/\",\"issue_number\":\"7\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-552122\\/\",\"id\":552122,\"name\":\"Unstoppable Part One\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-8-unstoppable-part-one\\/4000-552122\\/\",\"issue_number\":\"8\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-553915\\/\",\"id\":553915,\"name\":\"Unstoppable Part Two: A League of His Own\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-9-unstoppable-part-two-a-league-of-his-own\\/4000-553915\\/\",\"issue_number\":\"9\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-556440\\/\",\"id\":556440,\"name\":\"Future Tide\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-10-future-tide\\/4000-556440\\/\",\"issue_number\":\"10\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-558382\\/\",\"id\":558382,\"name\":\"The Deluge Prelude: Condition Critical\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-11-the-deluge-prelude-condition-critical\\/4000-558382\\/\",\"issue_number\":\"11\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-563689\\/\",\"id\":563689,\"name\":\"The Deluge Act One\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-12-the-deluge-act-one\\/4000-563689\\/\",\"issue_number\":\"12\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-569297\\/\",\"id\":569297,\"name\":\"The Deluge Act Two\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-13-the-deluge-act-two\\/4000-569297\\/\",\"issue_number\":\"13\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-574833\\/\",\"id\":574833,\"name\":\"The Deluge Act Three\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-14-the-deluge-act-three\\/4000-574833\\/\",\"issue_number\":\"14\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-576583\\/\",\"id\":576583,\"name\":\"The Deluge Finale\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-15-the-deluge-finale\\/4000-576583\\/\",\"issue_number\":\"15\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-579278\\/\",\"id\":579278,\"name\":\"Peace In Our Time\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-16-peace-in-our-time\\/4000-579278\\/\",\"issue_number\":\"16\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-581516\\/\",\"id\":581516,\"name\":\"Warhead Part One\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-17-warhead-part-one\\/4000-581516\\/\",\"issue_number\":\"17\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-583688\\/\",\"id\":583688,\"name\":\"Warhead Finale: Superpower\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-18-warhead-finale-superpower\\/4000-583688\\/\",\"issue_number\":\"18\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-587377\\/\",\"id\":587377,\"name\":\"H2.0 Part One\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-19-h20-part-one\\/4000-587377\\/\",\"issue_number\":\"19\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-590760\\/\",\"id\":590760,\"name\":\"H2.0 Part Two\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-20-h20-part-two\\/4000-590760\\/\",\"issue_number\":\"20\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-592564\\/\",\"id\":592564,\"name\":\"H2.0 Part Three\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-21-h20-part-three\\/4000-592564\\/\",\"issue_number\":\"21\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-594079\\/\",\"id\":594079,\"name\":\"H2.0 Part Four\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-22-h20-part-four\\/4000-594079\\/\",\"issue_number\":\"22\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-595657\\/\",\"id\":595657,\"name\":\"Crown of Atlantis Part One\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-23-crown-of-atlantis-part-one\\/4000-595657\\/\",\"issue_number\":\"23\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-599827\\/\",\"id\":599827,\"name\":\"Crown of Atlantis Part Two\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-24-crown-of-atlantis-part-two\\/4000-599827\\/\",\"issue_number\":\"24\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-603082\\/\",\"id\":603082,\"name\":\"Underworld Part One: The Ninth Tride\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-25-underworld-part-one-the-ninth-tride\\/4000-603082\\/\",\"issue_number\":\"25\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-609274\\/\",\"id\":609274,\"name\":\"Underworld Part Two: Outsiders\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-26-underworld-part-two-outsiders\\/4000-609274\\/\",\"issue_number\":\"26\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-614965\\/\",\"id\":614965,\"name\":\"Underworld Part Three: Krushed\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-27-underworld-part-three-krushed\\/4000-614965\\/\",\"issue_number\":\"27\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-622869\\/\",\"id\":622869,\"name\":\"Underworld Part Four: Unsurper\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-28-underworld-part-four-unsurper\\/4000-622869\\/\",\"issue_number\":\"28\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-630482\\/\",\"id\":630482,\"name\":\"Underworld Part Five: Speak Truth To Power\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-29-underworld-part-five-speak-truth-to-pow\\/4000-630482\\/\",\"issue_number\":\"29\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-638563\\/\",\"id\":638563,\"name\":\"Underworld Finale: Atlantis Uprising\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-30-underworld-finale-atlantis-uprising\\/4000-638563\\/\",\"issue_number\":\"30\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-647902\\/\",\"id\":647902,\"name\":\"The Crown Comes Down Part One\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-31-the-crown-comes-down-part-one\\/4000-647902\\/\",\"issue_number\":\"31\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-654026\\/\",\"id\":654026,\"name\":\"The Crown Comes Down Part Two\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-32-the-crown-comes-down-part-two\\/4000-654026\\/\",\"issue_number\":\"32\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-660619\\/\",\"id\":660619,\"name\":\"The Crown Comes Down Finale\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-33-the-crown-comes-down-finale\\/4000-660619\\/\",\"issue_number\":\"33\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-663535\\/\",\"id\":663535,\"name\":\"Tyrant King\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-34-tyrant-king\\/4000-663535\\/\",\"issue_number\":\"34\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-666765\\/\",\"id\":666765,\"name\":\"Darkness Falls\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-35-darkness-falls\\/4000-666765\\/\",\"issue_number\":\"35\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-670079\\/\",\"id\":670079,\"name\":\"The Assassination of King Rath\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-36-the-assassination-of-king-rath\\/4000-670079\\/\",\"issue_number\":\"36\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-674091\\/\",\"id\":674091,\"name\":\"The Tyrant Triumphant\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-37-the-tyrant-triumphant\\/4000-674091\\/\",\"issue_number\":\"37\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-677940\\/\",\"id\":677940,\"name\":\"The Kingslayer Finale\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-38-the-kingslayer-finale\\/4000-677940\\/\",\"issue_number\":\"38\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-679963\\/\",\"id\":679963,\"name\":\"Sink Atlantis! Part Two\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-39-sink-atlantis-part-two\\/4000-679963\\/\",\"issue_number\":\"39\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-685806\\/\",\"id\":685806,\"name\":\"Sink Atlantis! Finale\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-40-sink-atlantis-finale\\/4000-685806\\/\",\"issue_number\":\"40\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-689007\\/\",\"id\":689007,\"name\":\"Here Comes the Flood\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-41-here-comes-the-flood\\/4000-689007\\/\",\"issue_number\":\"41\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-692518\\/\",\"id\":692518,\"name\":\"Dead Sea\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-42-dead-sea\\/4000-692518\\/\",\"issue_number\":\"42\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-695597\\/\",\"id\":695597,\"name\":\"Unspoken Water Part 1 of 5\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-43-unspoken-water-part-1-of-5\\/4000-695597\\/\",\"issue_number\":\"43\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-698577\\/\",\"id\":698577,\"name\":\"Unspoken Water Part 2 of 5\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-44-unspoken-water-part-2-of-5\\/4000-698577\\/\",\"issue_number\":\"44\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-701280\\/\",\"id\":701280,\"name\":\"Unspoken Water Part 3 of 5\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-45-unspoken-water-part-3-of-5\\/4000-701280\\/\",\"issue_number\":\"45\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-703914\\/\",\"id\":703914,\"name\":\"Unspoken Water Part 4 of 5\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-46-unspoken-water-part-4-of-5\\/4000-703914\\/\",\"issue_number\":\"46\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-706380\\/\",\"id\":706380,\"name\":\"Unspoken Water Part 5 of 5\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-47-unspoken-water-part-5-of-5\\/4000-706380\\/\",\"issue_number\":\"47\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-709163\\/\",\"id\":709163,\"name\":\"Mother Shark Part One\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-48-mother-shark-part-one\\/4000-709163\\/\",\"issue_number\":\"48\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-711810\\/\",\"id\":711810,\"name\":\"Mother Shark Part Two\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-49-mother-shark-part-two\\/4000-711810\\/\",\"issue_number\":\"49\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-713770\\/\",\"id\":713770,\"name\":\"Amnesty, Part 1: The Call\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-50-amnesty-part-1-the-call\\/4000-713770\\/\",\"issue_number\":\"50\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-716806\\/\",\"id\":716806,\"name\":\"Amnesty, Part 2: Light In the Darkness\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-51-amnesty-part-2-light-in-the-darkness\\/4000-716806\\/\",\"issue_number\":\"51\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-719299\\/\",\"id\":719299,\"name\":\"Amnesty, Part 3: Giants and Monsters\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-52-amnesty-part-3-giants-and-monsters\\/4000-719299\\/\",\"issue_number\":\"52\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-722979\\/\",\"id\":722979,\"name\":\"Amnesty, Part 4: Strange Beasts\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-53-amnesty-part-4-strange-beasts\\/4000-722979\\/\",\"issue_number\":\"53\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-728312\\/\",\"id\":728312,\"name\":\"Amnesty, Part 5: Lessons Learned\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-54-amnesty-part-5-lessons-learned\\/4000-728312\\/\",\"issue_number\":\"54\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-731299\\/\",\"id\":731299,\"name\":\"Amnesty, Part 6: Manta vs. Machine\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-55-amnesty-part-6-manta-vs-machine\\/4000-731299\\/\",\"issue_number\":\"55\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-733632\\/\",\"id\":733632,\"name\":\"Generations\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-56-generations\\/4000-733632\\/\",\"issue_number\":\"56\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-737716\\/\",\"id\":737716,\"name\":\"Amnesty, Finale: Xebel's Daughter\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-57-amnesty-finale-xebels-daughter\\/4000-737716\\/\",\"issue_number\":\"57\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-741782\\/\",\"id\":741782,\"name\":\"Echoes of a Life Lived Well\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-58-echoes-of-a-life-lived-well\\/4000-741782\\/\",\"issue_number\":\"58\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-763280\\/\",\"id\":763280,\"name\":\"Echoes of a Life Lived Well Part 2\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-59-echoes-of-a-life-lived-well-part-2\\/4000-763280\\/\",\"issue_number\":\"59\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-769595\\/\",\"id\":769595,\"name\":\"Echoes of a Life Lived Well Part 3\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-60-echoes-of-a-life-lived-well-part-3\\/4000-769595\\/\",\"issue_number\":\"60\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-778241\\/\",\"id\":778241,\"name\":\"Echoes of a Life Lived Well Part 4\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-61-echoes-of-a-life-lived-well-part-4\\/4000-778241\\/\",\"issue_number\":\"61\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-794381\\/\",\"id\":794381,\"name\":\"Homecoming\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-62-homecoming\\/4000-794381\\/\",\"issue_number\":\"62\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-802690\\/\",\"id\":802690,\"name\":\"Homecoming Finale\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-63-homecoming-finale\\/4000-802690\\/\",\"issue_number\":\"63\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-812517\\/\",\"id\":812517,\"name\":\"The Deep End Part 1\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-64-the-deep-end-part-1\\/4000-812517\\/\",\"issue_number\":\"64\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-818622\\/\",\"id\":818622,\"name\":\"The Deep End Finale\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-65-the-deep-end-finale\\/4000-818622\\/\",\"issue_number\":\"65\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-821185\\/\",\"id\":821185,\"name\":\"Endless Winter Chapter 4\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/aquaman-66-endless-winter-chapter-4\\/4000-821185\\/\",\"issue_number\":\"66\"}],\"name\":\"Aquaman\",\"publisher\":{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/publisher\\/4010-10\\/\",\"id\":10,\"name\":\"DC Comics\"},\"start_year\":\"2016\"},\"version\":\"1.0\"}";
  private static final Date TEST_COVER_DATE = new Date();
  private static final Date TEST_STORE_DATE = new Date();

  @InjectMocks private ComicVineGetAllIssuesAction action;

  @Mock
  private ObjectFactory<ComicVineGetIssueWithDetailsAction> getIssueWithDetailsActionObjectFactory;

  @Mock private ComicVineGetIssueWithDetailsAction getIssueWithDetailsAction;
  @Mock private ComicVineIssue comicVineIssue;

  private MockWebServer comicVineServer;

  @Before
  public void setUp() throws IOException {
    comicVineServer = new MockWebServer();
    comicVineServer.start();

    final String hostname = String.format("http://localhost:%s", this.comicVineServer.getPort());
    action.setBaseUrl(hostname);
    action.setApiKey(TEST_API_KEY);
    action.setVolumeId(TEST_VOLUME_ID);

    Mockito.when(getIssueWithDetailsActionObjectFactory.getObject())
        .thenReturn(getIssueWithDetailsAction);
    Mockito.when(comicVineIssue.getCoverDate()).thenReturn(TEST_COVER_DATE);
    Mockito.when(comicVineIssue.getStoreDate()).thenReturn(TEST_STORE_DATE);
  }

  @After
  public void tearDown() throws IOException {
    comicVineServer.shutdown();
  }

  @Test(expected = MetadataException.class)
  public void testExecuteWithoutApiKey() throws MetadataException {
    action.setApiKey("");
    action.execute();
  }

  @Test(expected = MetadataException.class)
  public void testExecuteWithoutVolumeId() throws MetadataException {
    action.setVolumeId(null);
    action.execute();
  }

  @Test(expected = MetadataException.class)
  public void testExecuteBadResponse() throws MetadataException {
    this.comicVineServer.enqueue(
        new MockResponse()
            .setBody(TEST_BAD_RESPONSE_BODY)
            .addHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE));

    action.execute();
  }

  @Test
  public void testExecuteIssueDetailsFailed() throws MetadataException {
    this.comicVineServer.enqueue(
        new MockResponse()
            .setBody(TEST_GOOD_RESPONSE_BODY)
            .addHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE));
    Mockito.when(getIssueWithDetailsAction.execute()).thenThrow(MetadataException.class);

    final List<IssueDetailsMetadata> result = action.execute();

    assertNotNull(result);
    assertFalse(result.isEmpty());

    assertNull(result.get(0).getCoverDate());
    assertNull(result.get(0).getStoreDate());
  }

  @Test
  public void testExecute() throws MetadataException {
    this.comicVineServer.enqueue(
        new MockResponse()
            .setBody(TEST_GOOD_RESPONSE_BODY)
            .addHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE));
    Mockito.when(getIssueWithDetailsAction.execute()).thenReturn(comicVineIssue);

    final List<IssueDetailsMetadata> result = action.execute();

    assertNotNull(result);
    assertFalse(result.isEmpty());

    assertSame(TEST_COVER_DATE, result.get(0).getCoverDate());
    assertSame(TEST_STORE_DATE, result.get(0).getStoreDate());
  }
}

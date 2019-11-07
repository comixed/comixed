/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.web.comicvine;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.comixed.model.library.Comic;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.Date;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = {ComicVineIssueDetailsResponseProcessor.class,
                           ComicVineResponseAdaptor.class,
                           ObjectMapper.class})
public class ComicVineIssueDetailsResponseProcessorTest {
    private static final byte[] TEST_BAD_CONTENT = "This is invalid content".getBytes();
    private static final byte[] TEST_GOOD_CONTENT = "{\"error\":\"OK\",\"limit\":1,\"offset\":0,\"number_of_page_results\":1,\"number_of_total_results\":1,\"status_code\":1,\"results\":{\"aliases\":null,\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/issue\\/4000-686403\\/\",\"character_credits\":[{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-11317\\/\",\"id\":11317,\"name\":\"Cassandra Nova\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/cassandra-nova\\/4005-11317\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-4279\\/\",\"id\":4279,\"name\":\"Forge\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/forge\\/4005-4279\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-1499\\/\",\"id\":1499,\"name\":\"Gambit\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/gambit\\/4005-1499\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-41124\\/\",\"id\":41124,\"name\":\"Gentle\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/gentle\\/4005-41124\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-124525\\/\",\"id\":124525,\"name\":\"Honey Badger\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/honey-badger\\/4005-124525\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-3552\\/\",\"id\":3552,\"name\":\"Jean Grey\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/jean-grey\\/4005-3552\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-1461\\/\",\"id\":1461,\"name\":\"Nightcrawler\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/nightcrawler\\/4005-1461\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-3566\\/\",\"id\":3566,\"name\":\"Rachel Grey\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/rachel-grey\\/4005-3566\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-40456\\/\",\"id\":40456,\"name\":\"Rockslide\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/rockslide\\/4005-40456\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-1444\\/\",\"id\":1444,\"name\":\"Storm\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/storm\\/4005-1444\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-145681\\/\",\"id\":145681,\"name\":\"Trinary\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/trinary\\/4005-145681\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/character\\/4005-3560\\/\",\"id\":3560,\"name\":\"X-23\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/x-23\\/4005-3560\\/\"}],\"character_died_in\":[],\"concept_credits\":[{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/concept\\/4015-57536\\/\",\"id\":57536,\"name\":\"Cosmic Ghost Rider Vs. Variant Cover\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/cosmic-ghost-rider-vs-variant-cover\\/4015-57536\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/concept\\/4015-57270\\/\",\"id\":57270,\"name\":\"Legacy Headshot Variant Cover\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/legacy-headshot-variant-cover\\/4015-57270\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/concept\\/4015-57349\\/\",\"id\":57349,\"name\":\"Variant Cover\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/variant-cover\\/4015-57349\\/\"}],\"cover_date\":\"2018-11-01\",\"date_added\":\"2018-09-26 03:55:05\",\"date_last_updated\":\"2018-09-26 16:55:46\",\"deck\":\" \",\"description\":\"<p><em>In the wake of an unprecedented assault on Atlantis, the X-Men must react and recover...while at the mercy of a world that grows more hostile to mutants every day, and a foe who is determined to keep it that way!<\\/em><\\/p><h4>List of covers and their creators:<\\/h4><table data-max-width=\\\"true\\\"><thead><tr><th scope=\\\"col\\\">Cover<\\/th><th scope=\\\"col\\\">Name<\\/th><th scope=\\\"col\\\">Creator(s)<\\/th><th scope=\\\"col\\\">Sidebar Location<\\/th><\\/tr><\\/thead><tbody><tr><td>Reg<\\/td><td>Regular Cover<\\/td><td>Jenny Frison<\\/td><td>1<\\/td><\\/tr><tr><td>Var<\\/td><td>Cosmic Ghost Rider Vs. Variant Cover<\\/td><td>Jamal Campbell<\\/td><td>2<\\/td><\\/tr><tr><td>Var<\\/td><td>Legacy Headshot Variant Cover (Trinary)<\\/td><td>Travis Charest &amp; Tamra Bonvillain<\\/td><td>3<\\/td><\\/tr><\\/tbody><\\/table>\",\"first_appearance_characters\":null,\"first_appearance_concepts\":null,\"first_appearance_locations\":null,\"first_appearance_objects\":null,\"first_appearance_storyarcs\":null,\"first_appearance_teams\":null,\"has_staff_review\":false,\"id\":686403,\"image\":{\"icon_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/square_avatar\\/6624976-08.jpg\",\"medium_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/scale_medium\\/6624976-08.jpg\",\"screen_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/screen_medium\\/6624976-08.jpg\",\"screen_large_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/screen_kubrick\\/6624976-08.jpg\",\"small_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/scale_small\\/6624976-08.jpg\",\"super_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/scale_large\\/6624976-08.jpg\",\"thumb_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/scale_avatar\\/6624976-08.jpg\",\"tiny_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/square_mini\\/6624976-08.jpg\",\"original_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/original\\/6624976-08.jpg\",\"image_tags\":\"All Images\"},\"issue_number\":\"8\",\"location_credits\":[{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/location\\/4020-40967\\/\",\"id\":40967,\"name\":\"Genosha\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/genosha\\/4020-40967\\/\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/location\\/4020-41138\\/\",\"id\":41138,\"name\":\"Xavier Institute\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/xavier-institute\\/4020-41138\\/\"}],\"name\":\"The Hate Machine Part 8: Global Hatred\",\"object_credits\":[],\"person_credits\":[{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/person\\/4040-56587\\/\",\"id\":56587,\"name\":\"Alan Fine\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/alan-fine\\/4040-56587\\/\",\"role\":\"other\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/person\\/4040-97725\\/\",\"id\":97725,\"name\":\"Annalise Bissa\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/annalise-bissa\\/4040-97725\\/\",\"role\":\"editor, other\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/person\\/4040-90975\\/\",\"id\":90975,\"name\":\"Anthony Gambino\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/anthony-gambino\\/4040-90975\\/\",\"role\":\"other\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/person\\/4040-43193\\/\",\"id\":43193,\"name\":\"C.B. Cebulski\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/cb-cebulski\\/4040-43193\\/\",\"role\":\"other\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/person\\/4040-86336\\/\",\"id\":86336,\"name\":\"Carlos Lao\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/carlos-lao\\/4040-86336\\/\",\"role\":\"other\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/person\\/4040-64434\\/\",\"id\":64434,\"name\":\"Carmen Nunez Carnero\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/carmen-nunez-carnero\\/4040-64434\\/\",\"role\":\"artist\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/person\\/4040-41781\\/\",\"id\":41781,\"name\":\"Cory Petit\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/cory-petit\\/4040-41781\\/\",\"role\":\"letterer\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/person\\/4040-41596\\/\",\"id\":41596,\"name\":\"Dan Buckley\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/dan-buckley\\/4040-41596\\/\",\"role\":\"other\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/person\\/4040-82852\\/\",\"id\":82852,\"name\":\"Jamal Campbell\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/jamal-campbell\\/4040-82852\\/\",\"role\":\"cover\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/person\\/4040-87665\\/\",\"id\":87665,\"name\":\"Jay Bowen\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/jay-bowen\\/4040-87665\\/\",\"role\":\"other\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/person\\/4040-55822\\/\",\"id\":55822,\"name\":\"Jenny Frison\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/jenny-frison\\/4040-55822\\/\",\"role\":\"cover\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/person\\/4040-1537\\/\",\"id\":1537,\"name\":\"Joe Quesada\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/joe-quesada\\/4040-1537\\/\",\"role\":\"other\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/person\\/4040-49529\\/\",\"id\":49529,\"name\":\"Jordan D. White\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/jordan-d-white\\/4040-49529\\/\",\"role\":\"editor\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/person\\/4040-41681\\/\",\"id\":41681,\"name\":\"Rain Beredo\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/rain-beredo\\/4040-41681\\/\",\"role\":\"colorist\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/person\\/4040-63682\\/\",\"id\":63682,\"name\":\"Tamra Bonvillain\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/tamra-bonvillain\\/4040-63682\\/\",\"role\":\"cover\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/person\\/4040-57043\\/\",\"id\":57043,\"name\":\"Tom Taylor\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/tom-taylor\\/4040-57043\\/\",\"role\":\"writer\"},{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/person\\/4040-12188\\/\",\"id\":12188,\"name\":\"Travis Charest\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/travis-charest\\/4040-12188\\/\",\"role\":\"cover\"}],\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/x-men-red-8-the-hate-machine-part-8-global-hatred\\/4000-686403\\/\",\"store_date\":\"2018-09-26\",\"story_arc_credits\":[{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/story_arc\\/4045-59766\\/\",\"id\":59766,\"name\":\"The Hate Machine\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/the-hate-machine\\/4045-59766\\/\"}],\"team_credits\":[{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/team\\/4060-3173\\/\",\"id\":3173,\"name\":\"X-Men\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/x-men\\/4060-3173\\/\"}],\"team_disbanded_in\":[],\"volume\":{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/volume\\/4050-108548\\/\",\"id\":108548,\"name\":\"X-Men: Red\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/x-men-red\\/4050-108548\\/\"}},\"version\":\"1.0\"}".getBytes();

    @Autowired private ComicVineIssueDetailsResponseProcessor processor;
    @Mock private Comic comic;
    @Captor private ArgumentCaptor<Date> coverDate;

    @Test(expected = ComicVineAdaptorException.class)
    public void testProcessWithBadContent()
            throws
            ComicVineAdaptorException {
        processor.process(TEST_BAD_CONTENT,
                          comic);
    }

    @Test
    public void testProcess()
            throws
            ComicVineAdaptorException {
        Mockito.doNothing()
               .when(comic)
               .clearCharacters();
        Mockito.doNothing()
               .when(comic)
               .addCharacter(Mockito.anyString());
        Mockito.doNothing()
               .when(comic)
               .clearLocations();
        Mockito.doNothing()
               .when(comic)
               .addLocation(Mockito.anyString());
        Mockito.doNothing()
               .when(comic)
               .clearStoryArcs();
        Mockito.doNothing()
               .when(comic)
               .addStoryArc(Mockito.anyString());
        Mockito.doNothing()
               .when(comic)
               .clearTeams();
        Mockito.doNothing()
               .when(comic)
               .addTeam(Mockito.anyString());
        Mockito.doNothing()
               .when(comic)
               .clearCredits();
        Mockito.doNothing()
               .when(comic)
               .addCredit(Mockito.anyString(),
                          Mockito.anyString());
        Mockito.doNothing()
               .when(comic)
               .setComicVineId(Mockito.anyString());
        Mockito.doNothing()
               .when(comic)
               .setComicVineURL(Mockito.anyString());
        Mockito.doNothing()
               .when(comic)
               .setDescription(Mockito.anyString());
        Mockito.doNothing()
               .when(comic)
               .setSeries(Mockito.anyString());
        Mockito.doNothing()
               .when(comic)
               .setIssueNumber(Mockito.anyString());
        Mockito.doNothing()
               .when(comic)
               .setTitle(Mockito.anyString());
        Mockito.doNothing()
               .when(comic)
               .setCoverDate(coverDate.capture());

        String result = processor.process(TEST_GOOD_CONTENT,
                                          comic);

        assertNotNull(result);
        assertEquals("108548",
                     result);

        Mockito.verify(comic,
                       Mockito.times(1))
               .clearCharacters();
        Mockito.verify(comic,
                       Mockito.times(1))
               .addCharacter("Cassandra Nova");
        Mockito.verify(comic,
                       Mockito.times(1))
               .addCharacter("X-23");
        Mockito.verify(comic,
                       Mockito.times(1))
               .clearLocations();
        Mockito.verify(comic,
                       Mockito.times(1))
               .addLocation("Genosha");
        Mockito.verify(comic,
                       Mockito.times(1))
               .addLocation("Xavier Institute");
        Mockito.verify(comic,
                       Mockito.times(1))
               .addLocation("Genosha");
        Mockito.verify(comic,
                       Mockito.times(1))
               .clearStoryArcs();
        Mockito.verify(comic,
                       Mockito.times(1))
               .addStoryArc("The Hate Machine");
        Mockito.verify(comic,
                       Mockito.times(1))
               .clearTeams();
        Mockito.verify(comic,
                       Mockito.times(1))
               .addTeam("X-Men");
        Mockito.verify(comic,
                       Mockito.times(1))
               .clearCredits();
        Mockito.verify(comic,
                       Mockito.times(1))
               .addCredit("Annalise Bissa",
                          "editor");
        Mockito.verify(comic,
                       Mockito.times(1))
               .addCredit("Annalise Bissa",
                          "other");
        Mockito.verify(comic,
                       Mockito.times(1))
               .addCredit("Anthony Gambino",
                          "other");
        Mockito.verify(comic,
                       Mockito.times(1))
               .addCredit("Alan Fine",
                          "other");
        Mockito.verify(comic,
                       Mockito.times(1))
               .addCredit("C.B. Cebulski",
                          "other");
        Mockito.verify(comic,
                       Mockito.times(1))
               .addCredit("Carlos Lao",
                          "other");
        Mockito.verify(comic,
                       Mockito.times(1))
               .setComicVineId("686403");
        Mockito.verify(comic,
                       Mockito.times(1))
               .setComicVineURL("https://comicvine.gamespot.com/api/issue/4000-686403/");
        Mockito.verify(comic,
                       Mockito.times(1))
               .setDescription("<p><em>In the wake of an unprecedented assault on Atlantis, the X-Men must react and recover...while at the mercy of a world that grows more hostile to mutants every day, and a foe who is determined to keep it that way!</em></p><h4>List of covers and their creators:</h4><table data-max-width=\"true\"><thead><tr><th scope=\"col\">Cover</th><th scope=\"col\">Name</th><th scope=\"col\">Creator(s)</th><th scope=\"col\">Sidebar Location</th></tr></thead><tbody><tr><td>Reg</td><td>Regular Cover</td><td>Jenny Frison</td><td>1</td></tr><tr><td>Var</td><td>Cosmic Ghost Rider Vs. Variant Cover</td><td>Jamal Campbell</td><td>2</td></tr><tr><td>Var</td><td>Legacy Headshot Variant Cover (Trinary)</td><td>Travis Charest &amp; Tamra Bonvillain</td><td>3</td></tr></tbody></table>");
        Mockito.verify(comic,
                       Mockito.times(1))
               .setSeries("X-Men: Red");
        Mockito.verify(comic,
                       Mockito.times(1))
               .setIssueNumber("8");
        Mockito.verify(comic,
                       Mockito.times(1))
               .setTitle("The Hate Machine Part 8: Global Hatred");
        Mockito.verify(comic,
                       Mockito.times(1))
               .setCoverDate(coverDate.capture());
    }
}

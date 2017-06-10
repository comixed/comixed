/*
 * ComixEd - A digital comic book library management application.
 * Copyright (C) 2017, Darryl L. Pierce
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

package org.comixed.library.model;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import java.util.Date;

import org.junit.Before;
import org.junit.Test;

public class ComicTest
{
    private static final String TEST_VOLUME = "2017";
    private static final String TEST_ISSUE_NUMBER = "23.1";
    private static final Date TEST_DATE = new Date();
    private static final String TEST_STORY_ARC_NAME = "First story arc name";
    private static final String TEST_COMIC_VINE_ID = "206568";
    private static final String TEST_DESCRIPTION = "Simple comic description";
    private static final String TEST_SUMMARY = "A test summary of a comic";
    private static final String TEST_TEAM = "Super test team";
    private static final String TEST_CHARACTER = "Test Man";
    private static final String TEST_LOCATION = "Test Location";
    private static final String TEST_FILENAME = "C:/example.cbz";
    private Comic comic;

    @Before
    public void setUp() throws Exception
    {
        comic = new Comic();
    }

    @Test
    public void testFilename()
    {
        comic.setFilename(TEST_FILENAME);
        assertEquals(TEST_FILENAME, comic.getFilename());
    }

    @Test
    public void testFilenameCanBeNull()
    {
        comic.setFilename(null);
        assertNull(comic.getFilename());
    }

    @Test
    public void testVolume()
    {
        comic.setVolume(TEST_VOLUME);
        assertEquals(TEST_VOLUME, comic.getVolume());
    }

    @Test
    public void testIssueNumber()
    {
        comic.setIssueNumber(TEST_ISSUE_NUMBER);
        assertEquals(TEST_ISSUE_NUMBER, comic.getIssueNumber());
    }

    @Test
    public void testCoverDate()
    {
        comic.setCoverDate(TEST_DATE);
        assertEquals(TEST_DATE, comic.getCoverDate());
    }

    @Test
    public void testCoverDateCanBeNull()
    {
        comic.setCoverDate(null);
        assertNull(comic.getCoverDate());
    }

    @Test
    public void testDateAdded()
    {
        comic.setDateAdded(TEST_DATE);
        assertEquals(TEST_DATE, comic.getDateAdded());
    }

    @Test(expected = IllegalArgumentException.class)
    public void testDateAddedCannotBeNull()
    {
        comic.setDateAdded(null);
    }

    @Test
    public void testDateLastRead()
    {
        comic.setDateLastRead(TEST_DATE);
        assertEquals(TEST_DATE, comic.getDateLastRead());
    }

    @Test
    public void testDateLastReadCanBeNull()
    {
        comic.setDateLastRead(null);
        assertNull(comic.getDateLastRead());
    }

    @Test
    public void testNoStoryArc()
    {
        comic = new Comic();
        assertFalse(comic.hasStoryArcs());
        assertEquals(0, comic.getStoryArcCount());
    }

    @Test
    public void testOneStoryArc()
    {
        comic.addStoryArc(TEST_STORY_ARC_NAME);
        assertTrue(comic.hasStoryArcs());
        assertEquals(1, comic.getStoryArcCount());
        assertEquals(TEST_STORY_ARC_NAME, comic.getStoryArc(0));
    }

    @Test(expected = IndexOutOfBoundsException.class)
    public void testGetStoryArcIndexOutOfBounds()
    {
        comic.addStoryArc(TEST_STORY_ARC_NAME);
        assertTrue(comic.hasStoryArcs());
        assertEquals(1, comic.getStoryArcCount());
        comic.getStoryArc(comic.getStoryArcCount() + 1);
    }

    @Test
    public void testBlockDuplicateStoryArc()
    {
        comic.addStoryArc(TEST_STORY_ARC_NAME);
        assertTrue(comic.hasStoryArcs());
        assertEquals(1, comic.getStoryArcCount());
        assertEquals(TEST_STORY_ARC_NAME, comic.getStoryArc(0));
        // try to add the duplicate
        comic.addStoryArc(TEST_STORY_ARC_NAME);
        assertTrue(comic.hasStoryArcs());
        assertEquals(1, comic.getStoryArcCount());
    }

    @Test
    public void testMultipleStoryArcs()
    {
        String otherStoryArc = TEST_STORY_ARC_NAME.substring(1);
        comic.addStoryArc(TEST_STORY_ARC_NAME);
        comic.addStoryArc(otherStoryArc);
        assertTrue(comic.hasStoryArcs());
        assertEquals(2, comic.getStoryArcCount());
        assertEquals(TEST_STORY_ARC_NAME, comic.getStoryArc(0));
        assertEquals(otherStoryArc, comic.getStoryArc(1));
    }

    @Test
    public void testClearStoryArcs()
    {
        comic.addStoryArc(TEST_STORY_ARC_NAME);
        assertTrue(comic.hasStoryArcs());
        assertEquals(1, comic.getStoryArcCount());
        comic.clearStoryArcs();
        assertFalse(comic.hasStoryArcs());
        assertEquals(0, comic.getStoryArcCount());
    }

    @Test
    public void testSummary()
    {
        comic.setSummary(TEST_SUMMARY);
        assertNotNull(comic.getSummary());
        assertEquals(TEST_SUMMARY, comic.getSummary());
    }

    @Test
    public void testSummaryCanBeNull()
    {
        comic.setSummary(null);
        assertNull(comic.getSummary());
    }

    @Test
    public void testDescription()
    {
        comic.setDescription(TEST_DESCRIPTION);
        assertNotNull(comic.getDescription());
        assertEquals(TEST_DESCRIPTION, comic.getDescription());
    }

    @Test
    public void testDescriptionCanBeNull()
    {
        comic.setDescription(null);
        assertNull(comic.getDescription());
    }

    @Test
    public void testNoCharacters()
    {
        assertFalse(comic.hasCharacters());
        assertEquals(0, comic.getCharacterCount());
    }

    @Test
    public void testMultipleCharacters()
    {
        String secondCharacter = TEST_CHARACTER.substring(1);
        comic.addCharacter(TEST_CHARACTER);
        comic.addCharacter(secondCharacter);
        assertTrue(comic.hasCharacters());
        assertEquals(2, comic.getCharacterCount());
        assertEquals(TEST_CHARACTER, comic.getCharacter(0));
        assertEquals(secondCharacter, comic.getCharacter(1));
    }

    @Test
    public void testDuplicateCharacter()
    {
        comic.addCharacter(TEST_CHARACTER);
        comic.addCharacter(TEST_CHARACTER);
        assertTrue(comic.hasCharacters());
        assertEquals(1, comic.getCharacterCount());
        assertEquals(TEST_CHARACTER, comic.getCharacter(0));
    }

    @Test
    public void testClearCharacters()
    {
        comic.addCharacter(TEST_CHARACTER);
        assertTrue(comic.hasCharacters());
        comic.clearCharacters();
        assertFalse(comic.hasCharacters());
    }

    @Test(expected = IndexOutOfBoundsException.class)
    public void testGetCharactersIndexOutOfBounds()
    {
        comic.addCharacter(TEST_CHARACTER);
        comic.getCharacter(comic.getCharacterCount() + 1);
    }

    @Test
    public void testNoTeams()
    {
        assertFalse(comic.hasTeams());
    }

    @Test
    public void testOneTeam()
    {
        comic.addTeam(TEST_TEAM);
        assertTrue(comic.hasTeams());
        assertEquals(1, comic.getTeamCount());
        assertEquals(TEST_TEAM, comic.getTeam(0));
    }

    @Test
    public void testIgnoreDuplicateTeam()
    {
        comic.addTeam(TEST_TEAM);
        assertTrue(comic.hasTeams());
        assertEquals(1, comic.getTeamCount());
        // add the duplicate
        comic.addTeam(TEST_TEAM);
        assertTrue(comic.hasTeams());
        assertEquals(1, comic.getTeamCount());
    }

    @Test
    public void testMultipleTeams()
    {
        String secondTeamName = TEST_TEAM.substring(1);
        comic.addTeam(TEST_TEAM);
        comic.addTeam(secondTeamName);
        assertTrue(comic.hasTeams());
        assertEquals(2, comic.getTeamCount());
        assertEquals(TEST_TEAM, comic.getTeam(0));
        assertEquals(secondTeamName, comic.getTeam(1));
    }

    @Test(expected = IndexOutOfBoundsException.class)
    public void testGetTeamsIndexOutOfBounds()
    {
        comic.addTeam(TEST_TEAM);
        comic.getTeam(comic.getTeamCount() + 1);
    }

    @Test
    public void testClearTeams()
    {
        comic.addCharacter(TEST_CHARACTER);
        comic.clearCharacters();
        assertFalse(comic.hasCharacters());
        assertEquals(0, comic.getCharacterCount());
    }

    @Test
    public void testNoLocations()
    {
        assertFalse(comic.hasLocations());
        assertEquals(0, comic.getLocationCount());
    }

    @Test
    public void testOneLocation()
    {
        comic.addLocation(TEST_LOCATION);
        assertTrue(comic.hasLocations());
        assertEquals(1, comic.getLocationCount());
        assertEquals(TEST_LOCATION, comic.getLocation(0));
    }

    @Test
    public void testDuplicateLocation()
    {
        comic.addLocation(TEST_LOCATION);
        comic.addLocation(TEST_LOCATION);
        assertTrue(comic.hasLocations());
        assertEquals(1, comic.getLocationCount());
        assertEquals(TEST_LOCATION, comic.getLocation(0));
    }

    @Test
    public void testMultipleLocations()
    {
        String secondLocation = TEST_LOCATION.substring(1);
        comic.addLocation(TEST_LOCATION);
        comic.addLocation(secondLocation);
        assertTrue(comic.hasLocations());
        assertEquals(2, comic.getLocationCount());
        assertEquals(TEST_LOCATION, comic.getLocation(0));
        assertEquals(secondLocation, comic.getLocation(1));
    }

    @Test(expected = IndexOutOfBoundsException.class)
    public void testGetLocationsIndexOutOfBounds()
    {
        comic.addLocation(TEST_LOCATION);
        comic.getLocation(comic.getLocationCount() + 1);
    }

    @Test
    public void testClearLocations()
    {
        comic.addLocation(TEST_LOCATION);
        comic.clearLocations();
        assertFalse(comic.hasLocations());
        assertEquals(0, comic.getLocationCount());
    }

    @Test
    public void testComicVineId()
    {
        comic.setComicVineId(TEST_COMIC_VINE_ID);
        assertNotNull(comic.getComicVineId());
        assertEquals(TEST_COMIC_VINE_ID, comic.getComicVineId());
    }

    @Test
    public void testComicVineIdCanBeNull()
    {
        comic.setComicVineId(null);
        assertNull(comic.getComicVineId());
    }
}

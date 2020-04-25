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

package org.comixed.model.comic;

import static org.junit.Assert.*;

import java.io.File;
import java.io.IOException;
import java.util.Date;
import org.apache.commons.io.FileUtils;
import org.comixed.adaptors.ArchiveType;
import org.junit.Before;
import org.junit.Test;

public class ComicTest {
  private static final String TEST_SERIES = "Batman";
  private static final String TEST_VOLUME = "2017";
  private static final String TEST_PUBLISHER = "DC Comics";
  private static final String TEST_ISSUE_NUMBER = "23.1";
  private static final String TEST_TITLE = "Test title";
  private static final Date TEST_DATE = new Date();
  private static final String TEST_STORY_ARC_NAME = "First story arc name";
  private static final String TEST_COMIC_VINE_ID = "206568";
  private static final String TEST_DESCRIPTION = "Simple comic description";
  private static final String TEST_SUMMARY = "A test summary of a comic";
  private static final String TEST_TEAM = "Super test team";
  private static final String TEST_CHARACTER = "Test Man";
  private static final String TEST_LOCATION = "Test Location";
  private static final String TEST_FILENAME = "src/test/resources/example.cbz";
  private static final String TEST_NOTES = "Some sample notes";
  private static final String TEST_FILENAME_WITHOUT_EXTENSION = "src/test/resources/example";
  private static final String TEST_PAGE_FILENAME = "src/test/resources/example.jpg";
  private static final String TEST_BASE_FILENAME = "example.cbz";
  private static final String TEST_COMIC_VINE_URL = "http://comicvine.gamespot.com/blah/blah/blah";
  private static final String TEST_SORT_NAME = "Sort name for comic";
  private static final String TEST_IMAGE_FILE = "src/test/resources/example.jpg";
  private static byte[] TEST_IMAGE_CONTENT;

  static {
    try {
      TEST_IMAGE_CONTENT = FileUtils.readFileToByteArray(new File(TEST_IMAGE_FILE));
    } catch (IOException error) {
      error.printStackTrace();
    }
  }

  private Comic comic;
  private Page page;
  private PageType pageType = new PageType();

  @Before
  public void setUp() throws Exception {
    this.comic = new Comic();
    this.page = new Page(TEST_PAGE_FILENAME, TEST_IMAGE_CONTENT, pageType);
  }

  @Test
  public void testGetFilenameWithoutExtension() {
    this.comic.setFilename(TEST_FILENAME);
    assertEquals(TEST_FILENAME_WITHOUT_EXTENSION, this.comic.getFilenameWithoutExtension());
  }

  @Test
  public void testGetBaseFilename() {
    this.comic.setFilename(TEST_FILENAME);
    assertEquals(TEST_BASE_FILENAME, this.comic.getBaseFilename());
  }

  @Test
  public void testBlockDuplicateStoryArc() {
    this.comic.addStoryArc(TEST_STORY_ARC_NAME);
    assertTrue(this.comic.hasStoryArcs());
    assertEquals(1, this.comic.getStoryArcCount());
    assertEquals(TEST_STORY_ARC_NAME, this.comic.getStoryArc(0));
    // try to add the duplicate
    this.comic.addStoryArc(TEST_STORY_ARC_NAME);
    assertTrue(this.comic.hasStoryArcs());
    assertEquals(1, this.comic.getStoryArcCount());
  }

  @Test
  public void testClearCharacters() {
    this.comic.addCharacter(TEST_CHARACTER);
    assertTrue(this.comic.hasCharacters());
    this.comic.clearCharacters();
    assertFalse(this.comic.hasCharacters());
  }

  @Test
  public void testClearLocations() {
    this.comic.addLocation(TEST_LOCATION);
    this.comic.clearLocations();
    assertFalse(this.comic.hasLocations());
    assertEquals(0, this.comic.getLocationCount());
  }

  @Test
  public void testClearStoryArcs() {
    this.comic.addStoryArc(TEST_STORY_ARC_NAME);
    assertTrue(this.comic.hasStoryArcs());
    assertEquals(1, this.comic.getStoryArcCount());
    this.comic.clearStoryArcs();
    assertFalse(this.comic.hasStoryArcs());
    assertEquals(0, this.comic.getStoryArcCount());
  }

  @Test
  public void testClearTeams() {
    this.comic.addCharacter(TEST_CHARACTER);
    this.comic.clearCharacters();
    assertFalse(this.comic.hasCharacters());
    assertEquals(0, this.comic.getCharacterCount());
  }

  @Test
  public void testComicVineId() {
    this.comic.setComicVineId(TEST_COMIC_VINE_ID);
    assertNotNull(this.comic.getComicVineId());
    assertEquals(TEST_COMIC_VINE_ID, this.comic.getComicVineId());
  }

  @Test
  public void testComicVineIdCanBeNull() {
    this.comic.setComicVineId(null);
    assertNull(this.comic.getComicVineId());
  }

  @Test
  public void testComicVineURL() {
    this.comic.setComicVineURL(TEST_COMIC_VINE_URL);
    assertEquals(TEST_COMIC_VINE_URL, this.comic.getComicVineURL());
  }

  @Test
  public void testArchiveType() {
    this.comic.archiveType = ArchiveType.CBZ;
    assertEquals(ArchiveType.CBZ, this.comic.getArchiveType());
  }

  @Test
  public void testCoverDate() {
    this.comic.setCoverDate(TEST_DATE);
    assertEquals(TEST_DATE, this.comic.getCoverDate());
  }

  @Test
  public void testPageCount() {
    assertEquals(this.comic.pages.size(), this.comic.getPageCount());
    for (int index = 0; index < this.comic.pages.size(); index++) {
      assertSame(this.comic.pages.get(index), this.comic.getPage(index));
    }
  }

  @Test
  public void testPages() {
    assertSame(this.comic.pages, this.comic.getPages());
  }

  @Test
  public void testGetStoryArcs() {
    assertSame(this.comic.storyArcs, this.comic.getStoryArcs());
  }

  @Test
  public void testStoryArcs() {
    assertEquals(this.comic.storyArcs.size(), this.comic.getStoryArcCount());
    for (int index = 0; index < this.comic.storyArcs.size(); index++) {
      assertSame(this.comic.storyArcs.get(index), this.comic.getStoryArc(index));
    }
  }

  @Test
  public void testCoverDateCanBeNull() {
    this.comic.setCoverDate(null);
    assertNull(this.comic.getCoverDate());
  }

  @Test
  public void testDateAdded() {
    this.comic.setDateAdded(TEST_DATE);
    assertEquals(TEST_DATE, this.comic.getDateAdded());
  }

  @Test(expected = IllegalArgumentException.class)
  public void testDateAddedCannotBeNull() {
    this.comic.setDateAdded(null);
  }

  @Test
  public void testDescription() {
    this.comic.setDescription(TEST_DESCRIPTION);
    assertNotNull(this.comic.getDescription());
    assertEquals(TEST_DESCRIPTION, this.comic.getDescription());
  }

  @Test
  public void testDescriptionCanBeNull() {
    this.comic.setDescription(null);
    assertNull(this.comic.getDescription());
  }

  @Test
  public void testDuplicateCharacter() {
    this.comic.addCharacter(TEST_CHARACTER);
    this.comic.addCharacter(TEST_CHARACTER);
    assertTrue(this.comic.hasCharacters());
    assertEquals(1, this.comic.getCharacterCount());
    assertEquals(TEST_CHARACTER, this.comic.getCharacter(0));
  }

  @Test
  public void testDuplicateLocation() {
    this.comic.addLocation(TEST_LOCATION);
    this.comic.addLocation(TEST_LOCATION);
    assertTrue(this.comic.hasLocations());
    assertEquals(1, this.comic.getLocationCount());
    assertEquals(TEST_LOCATION, this.comic.getLocation(0));
  }

  @Test
  public void testFilename() {
    this.comic.setFilename(TEST_FILENAME);
    assertEquals(TEST_FILENAME, this.comic.getFilename());
  }

  @Test
  public void testFilenameCanBeNull() {
    this.comic.setFilename(null);
    assertNull(this.comic.getFilename());
  }

  @Test(expected = IndexOutOfBoundsException.class)
  public void testGetCharactersIndexOutOfBounds() {
    this.comic.addCharacter(TEST_CHARACTER);
    this.comic.getCharacter(this.comic.getCharacterCount() + 1);
  }

  @Test(expected = IndexOutOfBoundsException.class)
  public void testGetLocationsIndexOutOfBounds() {
    this.comic.addLocation(TEST_LOCATION);
    this.comic.getLocation(this.comic.getLocationCount() + 1);
  }

  @Test(expected = IndexOutOfBoundsException.class)
  public void testGetStoryArcIndexOutOfBounds() {
    this.comic.addStoryArc(TEST_STORY_ARC_NAME);
    assertTrue(this.comic.hasStoryArcs());
    assertEquals(1, this.comic.getStoryArcCount());
    this.comic.getStoryArc(this.comic.getStoryArcCount() + 1);
  }

  @Test(expected = IndexOutOfBoundsException.class)
  public void testGetTeamsIndexOutOfBounds() {
    this.comic.addTeam(TEST_TEAM);
    this.comic.getTeam(this.comic.getTeamCount() + 1);
  }

  @Test
  public void testIgnoreDuplicateTeam() {
    this.comic.addTeam(TEST_TEAM);
    assertTrue(this.comic.hasTeams());
    assertEquals(1, this.comic.getTeamCount());
    // add the duplicate
    this.comic.addTeam(TEST_TEAM);
    assertTrue(this.comic.hasTeams());
    assertEquals(1, this.comic.getTeamCount());
  }

  @Test
  public void testIssueNumber() {
    this.comic.setIssueNumber("0" + TEST_ISSUE_NUMBER);
    assertEquals(TEST_ISSUE_NUMBER, this.comic.getIssueNumber());
  }

  @Test
  public void testIssueNumberAllowsItToBe0() {
    this.comic.setIssueNumber("0");
    assertEquals("0", this.comic.getIssueNumber());
  }

  @Test
  public void testMultipleCharacters() {
    String secondCharacter = TEST_CHARACTER.substring(1);
    this.comic.addCharacter(TEST_CHARACTER);
    this.comic.addCharacter(secondCharacter);
    assertTrue(this.comic.hasCharacters());
    assertEquals(2, this.comic.getCharacterCount());
    assertEquals(TEST_CHARACTER, this.comic.getCharacter(0));
    assertEquals(secondCharacter, this.comic.getCharacter(1));
  }

  @Test
  public void testMultipleLocations() {
    String secondLocation = TEST_LOCATION.substring(1);
    this.comic.addLocation(TEST_LOCATION);
    this.comic.addLocation(secondLocation);
    assertTrue(this.comic.hasLocations());
    assertEquals(2, this.comic.getLocationCount());
    assertEquals(TEST_LOCATION, this.comic.getLocation(0));
    assertEquals(secondLocation, this.comic.getLocation(1));
  }

  @Test
  public void testMultipleStoryArcs() {
    String otherStoryArc = TEST_STORY_ARC_NAME.substring(1);
    this.comic.addStoryArc(TEST_STORY_ARC_NAME);
    this.comic.addStoryArc(otherStoryArc);
    assertTrue(this.comic.hasStoryArcs());
    assertEquals(2, this.comic.getStoryArcCount());
    assertEquals(TEST_STORY_ARC_NAME, this.comic.getStoryArc(0));
    assertEquals(otherStoryArc, this.comic.getStoryArc(1));
  }

  @Test
  public void testMultipleTeams() {
    String secondTeamName = TEST_TEAM.substring(1);
    this.comic.addTeam(TEST_TEAM);
    this.comic.addTeam(secondTeamName);
    assertTrue(this.comic.hasTeams());
    assertEquals(2, this.comic.getTeamCount());
    assertEquals(TEST_TEAM, this.comic.getTeam(0));
    assertEquals(secondTeamName, this.comic.getTeam(1));
  }

  @Test
  public void testNoCharacters() {
    assertFalse(this.comic.hasCharacters());
    assertEquals(0, this.comic.getCharacterCount());
  }

  @Test
  public void testNoLocations() {
    assertFalse(this.comic.hasLocations());
    assertEquals(0, this.comic.getLocationCount());
  }

  @Test
  public void testNoStoryArc() {
    this.comic = new Comic();
    assertFalse(this.comic.hasStoryArcs());
    assertEquals(0, this.comic.getStoryArcCount());
  }

  @Test
  public void testNoTeams() {
    assertFalse(this.comic.hasTeams());
  }

  @Test
  public void testNotes() {
    this.comic.setNotes(TEST_NOTES);
    assertEquals(TEST_NOTES, this.comic.getNotes());
  }

  @Test
  public void testOneLocation() {
    this.comic.addLocation(TEST_LOCATION);
    assertTrue(this.comic.hasLocations());
    assertEquals(1, this.comic.getLocationCount());
    assertEquals(TEST_LOCATION, this.comic.getLocation(0));
  }

  @Test
  public void testOneStoryArc() {
    this.comic.addStoryArc(TEST_STORY_ARC_NAME);
    assertTrue(this.comic.hasStoryArcs());
    assertEquals(1, this.comic.getStoryArcCount());
    assertEquals(TEST_STORY_ARC_NAME, this.comic.getStoryArc(0));
  }

  @Test
  public void testOneTeam() {
    this.comic.addTeam(TEST_TEAM);
    assertTrue(this.comic.hasTeams());
    assertEquals(1, this.comic.getTeamCount());
    assertEquals(TEST_TEAM, this.comic.getTeam(0));
  }

  @Test
  public void testPublisher() {
    this.comic.setPublisher(TEST_PUBLISHER);
    assertEquals(TEST_PUBLISHER, this.comic.getPublisher());
  }

  @Test
  public void testSeries() {
    this.comic.setSeries(TEST_SERIES);
    assertEquals(TEST_SERIES, this.comic.getSeries());
  }

  @Test
  public void testSummary() {
    this.comic.setSummary(TEST_SUMMARY);
    assertNotNull(this.comic.getSummary());
    assertEquals(TEST_SUMMARY, this.comic.getSummary());
  }

  @Test
  public void testSummaryCanBeNull() {
    this.comic.setSummary(null);
    assertNull(this.comic.getSummary());
  }

  @Test
  public void testTitle() {
    this.comic.setTitle(TEST_TITLE);
    assertEquals(TEST_TITLE, this.comic.getTitle());
  }

  @Test
  public void testVolume() {
    this.comic.setVolume(TEST_VOLUME);
    assertEquals(TEST_VOLUME, this.comic.getVolume());
  }

  @Test
  public void testGetCover() {
    this.comic.setFilename(TEST_FILENAME);
    this.comic.addPage(0, this.page);
    Page cover = this.comic.getCover();
    assertNotNull(cover);
    assertSame(this.comic.getPage(0), cover);
  }

  @Test
  public void testGetCoverForMissingFile() {
    this.comic.setFilename(TEST_FILENAME.substring(1));
    this.comic.addPage(0, this.page);
    Page cover = this.comic.getCover();
    assertNull(cover);
  }

  @Test
  public void testGetCoverWithNoPages() {
    this.comic.setFilename(TEST_FILENAME);
    this.comic.pages.clear();
    Page cover = this.comic.getCover();
    assertNull(cover);
  }

  @Test
  public void testGetYearPublishedWhenCoverDateIsNull() {
    this.comic.setCoverDate(null);
    assertEquals(0, this.comic.getYearPublished());
  }

  @Test
  public void testGetYearPublished() {
    this.comic.setCoverDate(TEST_DATE);
    assertEquals(TEST_DATE.getYear() + 1900, this.comic.getYearPublished());
  }

  @Test
  public void testIsMissingForNonexistingComic() throws IOException {
    Comic testComic = new Comic();

    testComic.setFilename(TEST_FILENAME.substring(1));
    assertTrue(testComic.isMissing());
  }

  @Test
  public void testIsMissingCachesLastResult() {
    comic.backingFile = new File(TEST_FILENAME);

    assertFalse(comic.isMissing());
  }

  @Test
  public void testIsMissing() {
    Comic testComic = new Comic();
    testComic.setFilename(TEST_FILENAME);
    assertFalse(testComic.isMissing());
  }

  @Test
  public void testMissingImage() {
    Comic testComic = new Comic();

    Page cover = testComic.getCover();
    assertSame(null, cover);
  }

  @Test
  public void testHasPageWithFilenameForMissingPage() {
    comic.setFilename(TEST_FILENAME);
    comic.addPage(0, page);
    assertFalse(comic.hasPageWithFilename(comic.getCover().getFilename() + "-nope"));
  }

  @Test
  public void testHashPageWithFilename() {
    comic.setFilename(TEST_FILENAME);
    comic.addPage(0, page);
    assertTrue(comic.hasPageWithFilename(comic.getCover().getFilename()));
  }

  @Test
  public void testGetPageWithFilenameForMissingPage() {
    comic.setFilename(TEST_FILENAME);
    comic.addPage(0, page);
    assertNull(comic.getPageWithFilename(comic.getCover().getFilename() + "-nope"));
  }

  @Test
  public void testGetPageWithFilename() {
    comic.setFilename(TEST_FILENAME);
    comic.addPage(0, page);
    Page result = comic.getPageWithFilename(comic.getCover().getFilename());

    assertNotNull(result);
  }

  @Test
  public void testGetIndexOfForNonownedPage() {
    assertEquals(-1, comic.getIndexFor(new Page()));
  }

  @Test
  public void testHasSortName() {
    assertNull(comic.getSortName());
    comic.setSortName(TEST_SORT_NAME);
    assertEquals(TEST_SORT_NAME, comic.getSortName());
  }
}

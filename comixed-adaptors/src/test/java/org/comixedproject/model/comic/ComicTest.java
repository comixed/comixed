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

package org.comixedproject.model.comic;

import static org.junit.Assert.*;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.math.BigInteger;
import java.util.Date;
import javax.imageio.ImageIO;
import org.apache.commons.io.FileUtils;
import org.comixedproject.model.archives.ArchiveType;
import org.junit.Before;
import org.junit.Test;
import org.springframework.util.DigestUtils;

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
  private static String TEST_HASH;
  private static Integer TEST_WIDTH;
  private static Integer TEST_HEIGHT;

  static {
    try {
      TEST_IMAGE_CONTENT = FileUtils.readFileToByteArray(new File(TEST_IMAGE_FILE));
      final BufferedImage bimage = ImageIO.read(new ByteArrayInputStream(TEST_IMAGE_CONTENT));
      TEST_HASH =
          new BigInteger(1, DigestUtils.md5Digest(TEST_IMAGE_CONTENT)).toString(16).toUpperCase();
      TEST_WIDTH = bimage.getWidth();
      TEST_HEIGHT = bimage.getHeight();
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
    this.page = new Page(TEST_PAGE_FILENAME, pageType, TEST_HASH, TEST_WIDTH, TEST_HEIGHT);
  }

  @Test
  public void testGetBaseFilename() {
    this.comic.setFilename(TEST_FILENAME);
    assertEquals(TEST_BASE_FILENAME, this.comic.getBaseFilename());
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
    this.comic.setArchiveType(ArchiveType.CBZ);
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
  public void testCoverDateCanBeNull() {
    this.comic.setCoverDate(null);
    assertNull(this.comic.getCoverDate());
  }

  @Test
  public void testDateAdded() {
    this.comic.setDateAdded(TEST_DATE);
    assertEquals(TEST_DATE, this.comic.getDateAdded());
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
  public void testFilename() {
    this.comic.setFilename(TEST_FILENAME);
    assertEquals(TEST_FILENAME, this.comic.getFilename());
  }

  @Test
  public void testFilenameCanBeNull() {
    this.comic.setFilename(null);
    assertNull(this.comic.getFilename());
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
  public void testNotes() {
    this.comic.setNotes(TEST_NOTES);
    assertEquals(TEST_NOTES, this.comic.getNotes());
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
    this.comic.getPages().add(this.page);
    Page cover = this.comic.getCover();
    assertNotNull(cover);
    assertSame(this.comic.getPage(0), cover);
  }

  @Test
  public void testGetCoverForMissingFile() {
    this.comic.setFilename(TEST_FILENAME.substring(1));
    this.comic.getPages().add(this.page);
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
    comic.setBackingFile(new File(TEST_FILENAME));

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
    comic.getPages().add(page);
    assertFalse(comic.hasPageWithFilename(comic.getCover().getFilename() + "-nope"));
  }

  @Test
  public void testHashPageWithFilename() {
    comic.setFilename(TEST_FILENAME);
    comic.getPages().add(page);
    assertTrue(comic.hasPageWithFilename(comic.getCover().getFilename()));
  }

  @Test
  public void testGetPageWithFilenameForMissingPage() {
    comic.setFilename(TEST_FILENAME);
    comic.getPages().add(page);
    assertNull(comic.getPageWithFilename(comic.getCover().getFilename() + "-nope"));
  }

  @Test
  public void testGetPageWithFilename() {
    comic.setFilename(TEST_FILENAME);
    comic.getPages().add(page);
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

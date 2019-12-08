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

package org.comixed.repositories.library;

import static org.junit.Assert.*;

import com.github.springtestdbunit.DbUnitTestExecutionListener;
import com.github.springtestdbunit.annotation.DatabaseSetup;
import java.io.File;
import java.io.IOException;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.time.DateUtils;
import org.comixed.model.library.Comic;
import org.comixed.model.library.ComicFormat;
import org.comixed.model.library.Page;
import org.comixed.model.library.ScanType;
import org.comixed.repositories.RepositoryContext;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.context.support.DependencyInjectionTestExecutionListener;
import org.springframework.test.context.support.DirtiesContextTestExecutionListener;
import org.springframework.test.context.transaction.TransactionalTestExecutionListener;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = RepositoryContext.class)
@TestPropertySource(locations = "classpath:application.properties")
@DatabaseSetup("classpath:test-comics.xml")
@TestExecutionListeners({
  DependencyInjectionTestExecutionListener.class,
  DirtiesContextTestExecutionListener.class,
  TransactionalTestExecutionListener.class,
  DbUnitTestExecutionListener.class
})
public class ComicRepositoryTest {
  private static final String TEST_COMIC_SORT_NAME = "My First Comic";
  private static final String TEST_COMIC_VINE_ID = "ABCDEFG";
  private static final long TEST_COMIC = 1000L;
  private static final long TEST_COMIC_WITH_BLOCKED_PAGES = 1001L;
  private static final Long TEST_COMIC_WITH_DELETED_PAGES = 1002L;
  private static final String TEST_IMPRINT = "This is an imprint";
  private static final Long TEST_USER_ID = 1000L;
  private static final String TEST_IMAGE_FILE = "src/test/resources/example.jpg";
  private static final String TEST_PUBLISHER_NAME_1 = "Warren";
  private static final String TEST_PUBLISHER_NAME_2 = "Marvel";
  private static final String TEST_SERIES_NAME_1 = "Creepy";
  private static final String TEST_SERIES_NAME_2 = "Steve Rogers: Captain America";
  private static final String TEST_CHARACTER_1 = "Lois Lane";
  private static final String TEST_CHARACTER_2 = "Steve Rogers";
  private static final String TEST_TEAM_1 = "SHIELD";
  private static final String TEST_TEAM_2 = "The Daily Planet";
  private static final String TEST_LOCATION_NAME_1 = "Genosha";
  private static final String TEST_LOCATION_NAME_2 = "The Fortress Of Solitude";
  private static final String TEST_STORY_NAME_1 = "Civil War II";
  private static final String TEST_STORY_NAME_2 = "Prelude To Civil War II";
  private static byte[] TEST_IMAGE_CONTENT;

  static {
    try {
      TEST_IMAGE_CONTENT = FileUtils.readFileToByteArray(new File(TEST_IMAGE_FILE));
    } catch (IOException error) {
      error.printStackTrace();
    }
  }

  @Autowired private ComicRepository repository;
  @Autowired private PageTypeRepository pageTypeRepository;
  @Autowired private ScanTypeRepository scanTypeRepository;
  @Autowired private ComicFormatRepository comicFormatRepository;

  private Comic comic;

  @Before
  public void setUp() throws Exception {
    comic = repository.findById(TEST_COMIC).get();
  }

  @Test(expected = DataIntegrityViolationException.class)
  public void testFilenameIsRequired() {
    comic.setFilename(null);
    repository.save(comic);
  }

  @Test(expected = DataIntegrityViolationException.class)
  public void testFilenameMustBeUnique() {
    Comic newComic = new Comic();
    newComic.setFilename(comic.getFilename());

    repository.save(newComic);
  }

  @Test
  public void testFilenameIsUpdatable() {
    String filename = comic.getFilename().substring(1);
    comic.setFilename(filename);
    repository.save(comic);

    Comic result = repository.findById(comic.getId()).get();

    assertEquals(filename, result.getFilename());
  }

  @Test
  public void testComicVineId() {
    assertEquals(TEST_COMIC_VINE_ID, comic.getComicVineId());
  }

  @Test
  public void testComicVineIdIsNullable() {
    comic.setComicVineId(null);
    repository.save(comic);

    Comic result = repository.findById(comic.getId()).get();

    assertNull(result.getComicVineId());
  }

  @Test
  public void testComicVineIdIsUpdatable() {
    String id = comic.getComicVineId().substring(1);
    comic.setComicVineId(id);
    repository.save(comic);

    Comic result = repository.findById(comic.getId()).get();

    assertEquals(id, result.getComicVineId());
  }

  @Test
  public void testDateAddedCannotBeUpdated() {
    comic.setDateAdded(new Date());

    repository.save(comic);

    Comic result = repository.findById(comic.getId()).get();

    assertNotEquals(
        DateUtils.truncate(comic.getDateAdded(), Calendar.SECOND),
        DateUtils.truncate(result.getDateAdded(), Calendar.SECOND));
  }

  @Test
  public void testCoverDateCanBeNull() {
    comic.setCoverDate(null);

    repository.save(comic);

    Comic result = repository.findById(comic.getId()).get();

    assertNull(result.getCoverDate());
  }

  @Test
  public void testCoverDateCanBeUpdated() {
    comic.setCoverDate(new Date());

    repository.save(comic);

    Comic result = repository.findById(comic.getId()).get();

    assertEquals(
        DateUtils.truncate(comic.getCoverDate(), Calendar.DAY_OF_MONTH),
        DateUtils.truncate(result.getCoverDate(), Calendar.DAY_OF_MONTH));
  }

  @Test
  public void testVolumeCanBeNull() {
    comic.setVolume(null);

    repository.save(comic);

    Comic result = repository.findById(comic.getId()).get();

    assertNull(result.getVolume());
  }

  @Test
  public void testVolumeCanBeUpdated() {
    String volume = comic.getVolume().substring(1);
    comic.setVolume(volume);

    repository.save(comic);

    Comic result = repository.findById(comic.getId()).get();

    assertEquals(volume, result.getVolume());
  }

  @Test
  public void testIssueNumberCanBeNull() {
    comic.setIssueNumber(null);

    repository.save(comic);

    Comic result = repository.findById(comic.getId()).get();

    assertNull(result.getIssueNumber());
  }

  @Test
  public void testIssueNumberCanBeUpdated() {
    String issueno = comic.getIssueNumber().substring(1);
    comic.setIssueNumber(issueno);

    repository.save(comic);

    Comic result = repository.findById(comic.getId()).get();

    assertEquals(issueno, result.getIssueNumber());
  }

  @Test
  public void testDescriptionCanBeNull() {
    comic.setDescription(null);

    repository.save(comic);

    Comic result = repository.findById(comic.getId()).get();

    assertNull(result.getDescription());
  }

  @Test
  public void testDescriptionCanBeUpdated() {
    String description = comic.getDescription().substring(1);
    comic.setDescription(description);

    repository.save(comic);

    Comic result = repository.findById(comic.getId()).get();

    assertEquals(description, result.getDescription());
  }

  @Test
  public void testSummaryCanBeNull() {
    comic.setSummary(null);

    repository.save(comic);

    Comic result = repository.findById(comic.getId()).get();

    assertNull(result.getSummary());
  }

  @Test
  public void testSummaryCanBeUpdated() {
    String summary = comic.getSummary().substring(1);
    comic.setSummary(summary);

    repository.save(comic);

    Comic result = repository.findById(comic.getId()).get();

    assertEquals(summary, result.getSummary());
  }

  @Test
  public void testStoryArcs() {
    assertEquals(1, comic.getStoryArcCount());
  }

  @Test
  public void testTeams() {
    assertEquals(2, comic.getTeamCount());
  }

  @Test
  public void testCharacters() {
    assertEquals(3, comic.getCharacterCount());
  }

  @Test
  public void testLocations() {
    assertEquals(3, comic.getLocationCount());
  }

  @Test
  public void testPageCount() {
    assertEquals(5, comic.getPageCount());
  }

  @Test
  public void testPagesCanBeDeleted() {
    int count = comic.getPageCount() - 1;
    comic.deletePage(0);
    repository.save(comic);

    Comic result = repository.findById(comic.getId()).get();

    assertEquals(count, result.getPageCount());
  }

  @Test
  public void testPagesCanBeAdded() {
    int count = comic.getPageCount() + 1;
    Page page =
        new Page(
            "src/test/resources/example.jpg",
            TEST_IMAGE_CONTENT,
            pageTypeRepository.getDefaultPageType());
    comic.addPage(0, page);
    repository.save(comic);

    Comic result = repository.findById(comic.getId()).get();

    assertEquals(count, result.getPageCount());
    assertEquals(page, result.getPage(0));
  }

  @Test
  public void testComicsReturnTheirBlockedPageCount() {
    Comic result = repository.findById(TEST_COMIC_WITH_BLOCKED_PAGES).get();

    assertEquals(1, result.getBlockedPageCount());
  }

  @Test
  public void testComicsReturnTheirDeletedPageCount() {
    Comic result = repository.findById(TEST_COMIC_WITH_DELETED_PAGES).get();

    assertEquals(3, result.getDeletedPageCount());
  }

  @Test
  public void testComicReturnWithTheirScanType() {
    Comic result = repository.findById(TEST_COMIC).get();

    assertNotNull(result.getScanType());
    assertEquals(1, result.getScanType().getId());
  }

  @Test
  public void testComicScanTypeCanBeChanged() {
    ScanType scanType = scanTypeRepository.findById(2L).get();

    Comic record = repository.findById(TEST_COMIC).get();
    record.setScanType(scanType);

    repository.save(record);

    Comic result = repository.findById(TEST_COMIC).get();
    assertEquals(scanType.getId(), result.getScanType().getId());
  }

  @Test
  public void testComicReturnWithTheirFormat() {
    Comic result = repository.findById(TEST_COMIC).get();

    assertNotNull(result.getFormat());
    assertEquals(1L, result.getFormat().getId());
  }

  @Test
  public void testComicFormatCanBeChanged() {
    ComicFormat format = comicFormatRepository.findById(2L).get();

    Comic record = repository.findById(TEST_COMIC).get();
    record.setFormat(format);

    repository.save(record);

    Comic result = repository.findById(TEST_COMIC).get();
    assertEquals(format.getId(), result.getFormat().getId());
  }

  @Test
  public void testComicsReturnWithTheirImprint() {
    Comic result = repository.findById(TEST_COMIC).get();

    assertNotNull(result.getImprint());
    assertEquals("Marvel Digital", result.getImprint());
  }

  @Test
  public void testComicsImprintCanBeChanged() {
    Comic record = repository.findById(TEST_COMIC).get();
    record.setImprint(TEST_IMPRINT);

    repository.save(record);

    Comic result = repository.findById(TEST_COMIC).get();
    assertEquals(TEST_IMPRINT, result.getImprint());
  }

  @Test
  public void testComicsReturnWithSortName() {
    Comic result = repository.findById(TEST_COMIC).get();

    assertNotNull(result.getSortName());
    assertEquals(TEST_COMIC_SORT_NAME, result.getSortName());
  }

  @Test
  public void testComicSortNameCanBeChanged() {
    Comic record = repository.findById(TEST_COMIC).get();

    record.setSortName("Farkle");
    repository.save(record);

    Comic result = repository.findById(TEST_COMIC).get();
    assertEquals("Farkle", result.getSortName());
  }

  @Test
  public void testFindAllUnreadByUser() {
    List<Comic> result = repository.findAllUnreadByUser(TEST_USER_ID);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(3, result.size());
  }

  @Test
  public void testFindAllByDateLastUpdatedGreaterThan() {
    final List<Comic> result =
        repository.findAllByDateLastUpdatedGreaterThan(new Date(0L), PageRequest.of(0, 1));

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(1, result.size());
  }

  @Test
  public void testGetComics() {
    final List<Comic> result =
        repository.findAll(PageRequest.of(1, 2, Sort.by(Direction.DESC, "dateAdded"))).getContent();

    assertNotNull(result);
    assertEquals(2, result.size());
    assertTrue(result.get(0).getDateAdded().after(result.get(1).getDateAdded()));
  }

  @Test
  public void testFindTopByLastUpdatedDateDesc() {
    final List<Comic> result = repository.findTopByOrderByDateLastUpdatedDesc(PageRequest.of(0, 3));

    assertNotNull(result);
    assertFalse(result.isEmpty());
    for (int index = 1; index < result.size(); index++) {
      assertTrue(
          result.get(index - 1).getDateLastUpdated().after(result.get(index).getDateLastUpdated()));
    }
  }

  @Test
  public void testGetPublisherNames() {
    final List<String> result = this.repository.getPublisherNames();

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(3, result.size());
    assertTrue(result.contains(TEST_PUBLISHER_NAME_1));
    assertTrue(result.contains(TEST_PUBLISHER_NAME_2));
  }

  @Test
  public void testGetComicCountForPublisher() {
    int result = this.repository.getComicCountForPublisher(TEST_PUBLISHER_NAME_1);

    assertEquals(1, result);

    result = this.repository.getComicCountForPublisher(TEST_PUBLISHER_NAME_2);
    assertEquals(2, result);
  }

  @Test
  public void testGetSeriesNames() {
    final List<String> result = this.repository.getSeriesNames();

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(3, result.size());
    assertTrue(result.contains(TEST_SERIES_NAME_1));
    assertTrue(result.contains(TEST_SERIES_NAME_2));
  }

  @Test
  public void testGetComicCountForSeries() {
    int result = this.repository.getComicCountForSeries(TEST_SERIES_NAME_1);

    assertEquals(1, result);

    result = this.repository.getComicCountForSeries(TEST_SERIES_NAME_2);
    assertEquals(2, result);
  }

  @Test
  public void testGetCharacterNames() {
    final List<String> result = this.repository.getCharacterNames();

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(9, result.size());
    assertTrue(result.contains(TEST_CHARACTER_1));
    assertTrue(result.contains(TEST_CHARACTER_2));
  }

  @Test
  public void testGetComicCountForCharacter() {
    int result = this.repository.getComicCountForCharacter(TEST_CHARACTER_1);

    assertEquals(1, result);

    result = this.repository.getComicCountForCharacter(TEST_CHARACTER_2);
    assertEquals(1, result);
  }

  @Test
  public void testGetTeamNames() {
    final List<String> result = this.repository.getTeamNames();

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(4, result.size());
    assertTrue(result.contains(TEST_TEAM_1));
    assertTrue(result.contains(TEST_TEAM_2));
  }

  @Test
  public void testGetComicCountForTeam() {
    int result = this.repository.getComicCountForTeam(TEST_TEAM_1);

    assertEquals(2, result);

    result = this.repository.getComicCountForTeam(TEST_TEAM_2);
    assertEquals(1, result);
  }

  @Test
  public void testGetLocationNames() {
    final List<String> result = this.repository.getLocationNames();

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(5, result.size());
    assertTrue(result.contains(TEST_LOCATION_NAME_1));
    assertTrue(result.contains(TEST_LOCATION_NAME_2));
  }

  @Test
  public void testGetComicCountForLocation() {
    int result = this.repository.getComicCountForLocation(TEST_LOCATION_NAME_1);

    assertEquals(2, result);

    result = this.repository.getComicCountForLocation(TEST_LOCATION_NAME_2);
    assertEquals(1, result);
  }

  @Test
  public void testGetStoryNames() {
    final List<String> result = this.repository.getStoryNames();

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(2, result.size());
    assertTrue(result.contains(TEST_STORY_NAME_1));
    assertTrue(result.contains(TEST_STORY_NAME_2));
  }

  @Test
  public void testGetComicCountForStory() {
    int result = this.repository.getComicCountForStory(TEST_STORY_NAME_1);

    assertEquals(1, result);

    result = this.repository.getComicCountForStory(TEST_STORY_NAME_2);
    assertEquals(1, result);
  }

  @Test
  public void testGetComicPageForPublisher() {
    final List<Comic> result =
        this.repository.getComicPageForPublisher(
            TEST_PUBLISHER_NAME_1, PageRequest.of(0, 1, Sort.by(Direction.ASC, "coverDate")));

    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals(1003L, result.get(0).getId().longValue());
  }

  @Test
  public void testGetComicPageForSeries() {
    final List<Comic> result =
        this.repository.getComicPageForSeries(
            TEST_SERIES_NAME_1, PageRequest.of(0, 1, Sort.by(Direction.ASC, "coverDate")));

    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals(1003L, result.get(0).getId().longValue());
  }

  @Test
  public void testGetComicPageForCharacter() {
    final List<Comic> result =
        this.repository.getComicPageForCharacter(
            TEST_CHARACTER_2, PageRequest.of(0, 1, Sort.by(Direction.ASC, "coverDate")));

    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals(1001L, result.get(0).getId().longValue());
  }

  @Test
  public void testGetComicPageForTeam() {
    final List<Comic> result =
        this.repository.getComicPageForTeam(
            TEST_TEAM_1, PageRequest.of(0, 1, Sort.by(Direction.ASC, "coverDate")));

    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals(1000L, result.get(0).getId().longValue());
  }

  @Test
  public void testGetComicPageForLocation() {
    final List<Comic> result =
        this.repository.getComicPageForLocation(
            TEST_LOCATION_NAME_2, PageRequest.of(0, 1, Sort.by(Direction.ASC, "addedDate")));

    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals(1002L, result.get(0).getId().longValue());
  }

  @Test
  public void testGetComicPageForStory() {
    final List<Comic> result =
        this.repository.getComicPageForStory(
            TEST_STORY_NAME_2, PageRequest.of(0, 1, Sort.by(Direction.ASC, "addedDate")));

    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals(1001L, result.get(0).getId().longValue());
  }
}

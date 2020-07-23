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

package org.comixedproject.repositories.comic;

import static org.junit.Assert.*;

import com.github.springtestdbunit.DbUnitTestExecutionListener;
import com.github.springtestdbunit.annotation.DatabaseSetup;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import org.apache.commons.lang.time.DateUtils;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.ComicFormat;
import org.comixedproject.model.comic.ScanType;
import org.comixedproject.repositories.ComiXedUserRepository;
import org.comixedproject.repositories.RepositoryContext;
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
@DatabaseSetup("classpath:test-database.xml")
@TestExecutionListeners({
  DependencyInjectionTestExecutionListener.class,
  DirtiesContextTestExecutionListener.class,
  TransactionalTestExecutionListener.class,
  DbUnitTestExecutionListener.class
})
public class ComicRepositoryTest {
  private static final String TEST_COMIC_SORT_NAME = "My First Comic";
  private static final String TEST_COMIC_VINE_ID = "ABCDEFG";
  private static final long TEST_COMIC_ID = 1000L;
  private static final long TEST_COMIC_ID_WITH_BLOCKED_PAGES = 1001L;
  private static final Long TEST_COMIC_ID_WITH_DELETED_PAGES = 1002L;
  private static final String TEST_IMPRINT = "This is an imprint";
  private static final Long TEST_USER_ID = 1000L;
  private static final long TEST_INVALID_ID = 9797L;
  private static final String TEST_SERIES = "Steve Rogers: Captain America";
  private static final String TEST_VOLUME = "2017";
  private static final String TEST_ISSUE_WITH_NO_NEXT = "514";
  private static final String TEST_ISSUE_WITH_NEXT = "512";
  private static final Long TEST_NEXT_ISSUE_ID = 1001L;
  private static final Long TEST_PREV_ISSUE_ID = 1000L;
  private static final String TEST_ISSUE_WITH_NO_PREV = "249";
  private static final String TEST_ISSUE_WITH_PREV = "513";
  private static final Long TEST_COMIC_ID_WITH_DUPLICATES = 1020L;
  private static final String TEST_USER_EMAIL_NO_READ_COMIC = "comixedreader2@localhost";
  private static final Date TEST_COVER_DATE_NO_NEXT = new Date(1490932800000L);
  private static final Date TEST_COVER_DATE_WITH_NEXT = new Date(1485838800000L);
  private static final Date TEST_COVER_DATE_NO_PREV = new Date(1425099600000L);
  private static final Date TEST_COVER_DATE_WITH_PREV = new Date(1488258000000L);

  @Autowired private ComicRepository repository;
  @Autowired private PageTypeRepository pageTypeRepository;
  @Autowired private ScanTypeRepository scanTypeRepository;
  @Autowired private ComicFormatRepository comicFormatRepository;
  @Autowired private ComiXedUserRepository userRepository;

  private Comic comic;

  @Before
  public void setUp() throws Exception {
    comic = repository.getById(TEST_COMIC_ID);
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
    assertEquals(1, comic.getStoryArcs().size());
  }

  @Test
  public void testTeams() {
    assertEquals(2, comic.getTeams().size());
  }

  @Test
  public void testCharacters() {
    assertEquals(3, comic.getCharacters().size());
  }

  @Test
  public void testLocations() {
    assertEquals(3, comic.getLocations().size());
  }

  @Test
  public void testPageCount() {
    assertEquals(5, comic.getPageCount());
  }

  @Test
  public void testComicsReturnTheirBlockedPageCount() {
    Comic result = repository.findById(TEST_COMIC_ID_WITH_BLOCKED_PAGES).get();

    assertEquals(1, result.getBlockedPageCount());
  }

  @Test
  public void testComicsReturnTheirDeletedPageCount() {
    Comic result = repository.findById(TEST_COMIC_ID_WITH_DELETED_PAGES).get();

    assertEquals(3, result.getCalculatedDeletedPageCount().intValue());
  }

  @Test
  public void testComicReturnWithTheirScanType() {
    Comic result = repository.findById(TEST_COMIC_ID).get();

    assertNotNull(result.getScanType());
    assertEquals(1, result.getScanType().getId());
  }

  @Test
  public void testComicScanTypeCanBeChanged() {
    ScanType scanType = scanTypeRepository.findById(2L).get();

    Comic record = repository.findById(TEST_COMIC_ID).get();
    record.setScanType(scanType);

    repository.save(record);

    Comic result = repository.findById(TEST_COMIC_ID).get();
    assertEquals(scanType.getId(), result.getScanType().getId());
  }

  @Test
  public void testComicReturnWithTheirFormat() {
    Comic result = repository.findById(TEST_COMIC_ID).get();

    assertNotNull(result.getFormat());
    assertEquals(1L, result.getFormat().getId().longValue());
  }

  @Test
  public void testComicFormatCanBeChanged() {
    ComicFormat format = comicFormatRepository.findById(2L).get();

    Comic record = repository.findById(TEST_COMIC_ID).get();
    record.setFormat(format);

    repository.save(record);

    Comic result = repository.findById(TEST_COMIC_ID).get();
    assertEquals(format.getId(), result.getFormat().getId());
  }

  @Test
  public void testComicsReturnWithTheirImprint() {
    Comic result = repository.findById(TEST_COMIC_ID).get();

    assertNotNull(result.getImprint());
    assertEquals("Marvel Digital", result.getImprint());
  }

  @Test
  public void testComicsImprintCanBeChanged() {
    Comic record = repository.findById(TEST_COMIC_ID).get();
    record.setImprint(TEST_IMPRINT);

    repository.save(record);

    Comic result = repository.findById(TEST_COMIC_ID).get();
    assertEquals(TEST_IMPRINT, result.getImprint());
  }

  @Test
  public void testComicsReturnWithSortName() {
    Comic result = repository.findById(TEST_COMIC_ID).get();

    assertNotNull(result.getSortName());
    assertEquals(TEST_COMIC_SORT_NAME, result.getSortName());
  }

  @Test
  public void testComicSortNameCanBeChanged() {
    Comic record = repository.findById(TEST_COMIC_ID).get();

    record.setSortName("Farkle");
    repository.save(record);

    Comic result = repository.findById(TEST_COMIC_ID).get();
    assertEquals("Farkle", result.getSortName());
  }

  @Test
  public void testFindAllUnreadByUser() {
    List<Comic> result = repository.findAllUnreadByUser(TEST_USER_ID);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(9, result.size());
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
  public void testGetLibraryUpdatesFirstRequest() {
    List<Comic> result = this.repository.getLibraryUpdates(new Date(0L), PageRequest.of(0, 100));

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(10, result.size());
    testComicOrder(0L, 0L, result);
  }

  @Test
  public void testGetLibraryUpdatesSubsequentRequest() {
    final Comic lastComic = this.repository.getById(1002L);
    final Date timestamp = lastComic.getDateLastUpdated();
    final List<Comic> result = this.repository.getLibraryUpdates(timestamp, PageRequest.of(0, 100));

    testComicOrder(0, timestamp.getTime(), result);
    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(6, result.size());
  }

  private void testComicOrder(long id, long timestamp, List<Comic> comicList) {
    for (int index = 0; index < comicList.size(); index++) {
      long thisId = comicList.get(index).getId();
      long thisTimestamp = comicList.get(index).getDateLastUpdated().getTime();

      if (thisTimestamp == timestamp) {
        assertTrue(id < thisId);
        id = thisId;
      } else {
        assertTrue(timestamp < thisTimestamp);
        timestamp = thisTimestamp;
        id = 0L;
      }
    }
  }

  @Test
  public void testGetByIdWithInvalidId() {
    Comic result = this.repository.getById(TEST_INVALID_ID);

    assertNull(result);
  }

  @Test
  public void testGetById() {
    Comic result = this.repository.getById(TEST_COMIC_ID);

    assertNotNull(result);
    assertFalse(result.getPages().isEmpty());
  }

  @Test
  public void testGetIssuesAfterComicWithNone() {
    final List<Comic> result =
        this.repository.findIssuesAfterComic(
            TEST_SERIES, TEST_VOLUME, TEST_ISSUE_WITH_NO_NEXT, TEST_COVER_DATE_NO_NEXT);

    assertTrue(result.isEmpty());
  }

  @Test
  public void testGetIssuesAfterComic() {
    final List<Comic> result =
        this.repository.findIssuesAfterComic(
            TEST_SERIES, TEST_VOLUME, TEST_ISSUE_WITH_NEXT, TEST_COVER_DATE_WITH_NEXT);

    assertFalse(result.isEmpty());
    for (int index = 0; index < result.size(); index++) {
      assertTrue(result.get(index).getIssueNumber().compareTo(TEST_ISSUE_WITH_NEXT) > 0);
    }
  }

  @Test
  public void testGetIssuesBeforeComicNone() {
    final List<Comic> result =
        this.repository.findIssuesBeforeComic(
            TEST_SERIES, TEST_VOLUME, TEST_ISSUE_WITH_NO_PREV, TEST_COVER_DATE_NO_PREV);

    assertTrue(result.isEmpty());
  }

  @Test
  public void testGetIssuesBeforeComic() {
    final List<Comic> result =
        this.repository.findIssuesBeforeComic(
            TEST_SERIES, TEST_VOLUME, TEST_ISSUE_WITH_PREV, TEST_COVER_DATE_WITH_PREV);

    assertFalse(result.isEmpty());
    for (int index = 0; index < result.size(); index++) {
      assertTrue(result.get(index).getIssueNumber().compareTo(TEST_ISSUE_WITH_PREV) < 0);
    }
  }

  @Test
  public void testFindAllMarkedForDeletion() {
    List<Comic> result = repository.findAllMarkedForDeletion();

    assertNotNull(result);
    assertFalse(result.isEmpty());
    for (Comic comic : result) {
      assertNotNull(comic.getDateDeleted());
    }
  }

  @Test
  public void testComicWithDuplicates() {
    List<Comic> result = repository.findAll();

    for (int index = 0; index < result.size(); index++) {
      if (result.get(index).getId().equals(TEST_COMIC_ID_WITH_DUPLICATES)) {
        assertTrue(result.get(index).getDuplicateCount() > 0);
        return;
      }
    }

    fail("Did not find the expected comic");
  }

  @Test
  public void testComicWithoutDuplicates() {
    List<Comic> result = repository.findAll();

    for (int index = 0; index < result.size(); index++) {
      if (!result.get(index).getId().equals(TEST_COMIC_ID_WITH_DUPLICATES)) {
        assertEquals(0, result.get(index).getDuplicateCount().intValue());
        return;
      }
    }

    fail("Did not find the expected comic");
  }

  @Test
  public void testDelete() {
    repository.delete(comic);

    Comic result = repository.getById(TEST_COMIC_ID);

    assertNull(result);
  }
}

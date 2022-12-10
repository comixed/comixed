/*
 * ComiXed - A digital comicBook book library management application.
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

package org.comixedproject.repositories.comicbooks;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import com.github.springtestdbunit.DbUnitTestExecutionListener;
import com.github.springtestdbunit.annotation.DatabaseSetup;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import org.apache.commons.lang.time.DateUtils;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.library.Series;
import org.comixedproject.model.net.library.PublisherAndYearSegment;
import org.comixedproject.model.net.library.RemoteLibrarySegmentState;
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
public class ComicBookRepositoryTest {
  private static final String TEST_COMIC_SORT_NAME = "My First Comic";
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
  private static final String TEST_ISSUE_WITH_NO_PREV = "249";
  private static final String TEST_ISSUE_WITH_PREV = "513";
  private static final Long TEST_COMIC_ID_WITH_DUPLICATES = 1020L;
  private static final Date TEST_COVER_DATE_NO_NEXT = new Date(1490932800000L);
  private static final Date TEST_COVER_DATE_WITH_NEXT = new Date(1485838800000L);
  private static final Date TEST_COVER_DATE_NO_PREV = new Date(1425099600000L);
  private static final Date TEST_COVER_DATE_WITH_PREV = new Date(1488258000000L);
  private static final String TEST_HASH_WITH_NO_COMICS = "FEDCBA9876543210FEDCBA9876543210";
  private static final String TEST_HASH_WITH_COMICS = "0123456789ABCDEF0123456789ABCDEF";
  private static final int TEST_BATCH_SIZE = 1;

  @Autowired private ComicBookRepository repository;

  private ComicBook comicBook;

  @Before
  public void setUp() throws Exception {
    comicBook = repository.getById(TEST_COMIC_ID);
  }

  @Test
  public void testLoadComicList() {
    final List<ComicBook> result = repository.loadComicList();

    for (int index = 0; index < result.size() - 1; index++) {
      assertTrue(
          result.get(index).getDateAdded().getTime()
              <= result.get(index + 1).getDateAdded().getTime());
    }
  }

  @Test(expected = NullPointerException.class)
  public void testFilenameIsRequired() {
    comicBook.setFilename(null);
    repository.save(comicBook);
  }

  @Test(expected = DataIntegrityViolationException.class)
  public void testFilenameMustBeUnique() {
    ComicBook newComicBook = new ComicBook();
    newComicBook.setFilename(comicBook.getFilename());

    repository.save(newComicBook);
  }

  @Test
  public void testFilenameIsUpdatable() {
    String filename = comicBook.getFilename().substring(1);
    comicBook.setFilename(filename);
    repository.save(comicBook);

    ComicBook result = repository.findById(comicBook.getId()).get();

    assertEquals(filename, result.getFilename());
  }

  @Test
  public void testCoverDateCanBeNull() {
    comicBook.setCoverDate(null);

    repository.save(comicBook);

    ComicBook result = repository.findById(comicBook.getId()).get();

    assertNull(result.getCoverDate());
  }

  @Test
  public void testCoverDateCanBeUpdated() {
    comicBook.setCoverDate(new Date());

    repository.save(comicBook);

    ComicBook result = repository.findById(comicBook.getId()).get();

    assertEquals(
        DateUtils.truncate(comicBook.getCoverDate(), Calendar.DAY_OF_MONTH),
        DateUtils.truncate(result.getCoverDate(), Calendar.DAY_OF_MONTH));
  }

  @Test
  public void testVolumeCanBeNull() {
    comicBook.setVolume(null);

    repository.save(comicBook);

    ComicBook result = repository.findById(comicBook.getId()).get();

    assertNull(result.getVolume());
  }

  @Test
  public void testVolumeCanBeUpdated() {
    String volume = comicBook.getVolume().substring(1);
    comicBook.setVolume(volume);

    repository.save(comicBook);

    ComicBook result = repository.findById(comicBook.getId()).get();

    assertEquals(volume, result.getVolume());
  }

  @Test
  public void testIssueNumberCanBeNull() {
    comicBook.setIssueNumber(null);

    repository.save(comicBook);

    ComicBook result = repository.findById(comicBook.getId()).get();

    assertNull(result.getIssueNumber());
  }

  @Test
  public void testIssueNumberCanBeUpdated() {
    String issueno = comicBook.getIssueNumber().substring(1);
    comicBook.setIssueNumber(issueno);

    repository.save(comicBook);

    ComicBook result = repository.findById(comicBook.getId()).get();

    assertEquals(issueno, result.getIssueNumber());
  }

  @Test
  public void testDescriptionCanBeNull() {
    comicBook.setDescription(null);

    repository.save(comicBook);

    ComicBook result = repository.findById(comicBook.getId()).get();

    assertNull(result.getDescription());
  }

  @Test
  public void testDescriptionCanBeUpdated() {
    String description = comicBook.getDescription().substring(1);
    comicBook.setDescription(description);

    repository.save(comicBook);

    ComicBook result = repository.findById(comicBook.getId()).get();

    assertEquals(description, result.getDescription());
  }

  @Test
  public void testStoryArcs() {
    assertEquals(1, comicBook.getStories().size());
  }

  @Test
  public void testTeams() {
    assertEquals(2, comicBook.getTeams().size());
  }

  @Test
  public void testCharacters() {
    assertEquals(3, comicBook.getCharacters().size());
  }

  @Test
  public void testLocations() {
    assertEquals(3, comicBook.getLocations().size());
  }

  @Test
  public void testPageCount() {
    assertEquals(5, comicBook.getPageCount());
  }

  @Test
  public void testComicsReturnTheirBlockedPageCount() {
    ComicBook result = repository.findById(TEST_COMIC_ID_WITH_BLOCKED_PAGES).get();

    assertEquals(1, result.getBlockedPageCount());
  }

  @Test
  public void testComicsReturnTheirDeletedPageCount() {
    ComicBook result = repository.findById(TEST_COMIC_ID_WITH_DELETED_PAGES).get();

    assertEquals(3, result.getCalculatedDeletedPageCount().intValue());
  }

  @Test
  public void testComicsReturnWithTheirImprint() {
    ComicBook result = repository.findById(TEST_COMIC_ID).get();

    assertNotNull(result.getImprint());
    assertEquals("Marvel Digital", result.getImprint());
  }

  @Test
  public void testComicsImprintCanBeChanged() {
    ComicBook record = repository.findById(TEST_COMIC_ID).get();
    record.setImprint(TEST_IMPRINT);

    repository.save(record);

    ComicBook result = repository.findById(TEST_COMIC_ID).get();
    assertEquals(TEST_IMPRINT, result.getImprint());
  }

  @Test
  public void testComicsReturnWithSortName() {
    ComicBook result = repository.findById(TEST_COMIC_ID).get();

    assertNotNull(result.getSortName());
    assertEquals(TEST_COMIC_SORT_NAME, result.getSortName());
  }

  @Test
  public void testComicSortNameCanBeChanged() {
    ComicBook record = repository.findById(TEST_COMIC_ID).get();

    record.setSortName("Farkle");
    repository.save(record);

    ComicBook result = repository.findById(TEST_COMIC_ID).get();
    assertEquals("Farkle", result.getSortName());
  }

  @Test
  public void testFindAllUnreadByUser() {
    List<ComicBook> result = repository.findAllUnreadByUser(TEST_USER_ID);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(1, result.size());
  }

  @Test
  public void testGetComics() {
    final List<ComicBook> result =
        repository.findAll(PageRequest.of(1, 2, Sort.by(Direction.DESC, "dateAdded"))).getContent();

    assertNotNull(result);
    assertEquals(2, result.size());
    assertTrue(result.get(0).getDateAdded().after(result.get(1).getDateAdded()));
  }

  private void testComicOrder(long id, long timestamp, List<ComicBook> comicBookList) {
    for (int index = 0; index < comicBookList.size(); index++) {
      long thisId = comicBookList.get(index).getId();
      long thisTimestamp = comicBookList.get(index).getLastModifiedOn().getTime();

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
    ComicBook result = this.repository.getById(TEST_INVALID_ID);

    assertNull(result);
  }

  @Test
  public void testGetById() {
    ComicBook result = this.repository.getById(TEST_COMIC_ID);

    assertNotNull(result);
    assertFalse(result.getPages().isEmpty());
  }

  @Test
  public void testGetIssuesAfterComicWithNone() {
    final List<ComicBook> result =
        this.repository.findIssuesAfterComic(
            TEST_SERIES, TEST_VOLUME, TEST_ISSUE_WITH_NO_NEXT, TEST_COVER_DATE_NO_NEXT);

    assertTrue(result.isEmpty());
  }

  @Test
  public void testGetIssuesAfterComic() {
    final List<ComicBook> result =
        this.repository.findIssuesAfterComic(
            TEST_SERIES, TEST_VOLUME, TEST_ISSUE_WITH_NEXT, TEST_COVER_DATE_WITH_NEXT);

    assertFalse(result.isEmpty());
    for (int index = 0; index < result.size(); index++) {
      assertTrue(result.get(index).getIssueNumber().compareTo(TEST_ISSUE_WITH_NEXT) > 0);
    }
  }

  @Test
  public void testGetIssuesBeforeComicNone() {
    final List<ComicBook> result =
        this.repository.findIssuesBeforeComic(
            TEST_SERIES, TEST_VOLUME, TEST_ISSUE_WITH_NO_PREV, TEST_COVER_DATE_NO_PREV);

    assertTrue(result.isEmpty());
  }

  @Test
  public void testGetIssuesBeforeComic() {
    final List<ComicBook> result =
        this.repository.findIssuesBeforeComic(
            TEST_SERIES, TEST_VOLUME, TEST_ISSUE_WITH_PREV, TEST_COVER_DATE_WITH_PREV);

    assertFalse(result.isEmpty());
    for (int index = 0; index < result.size(); index++) {
      assertTrue(result.get(index).getIssueNumber().compareTo(TEST_ISSUE_WITH_PREV) < 0);
    }
  }

  @Test
  public void testFindAllMarkedForDeletion() {
    List<ComicBook> result =
        repository.findComicsMarkedForDeletion(PageRequest.of(0, TEST_BATCH_SIZE));

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(TEST_BATCH_SIZE, result.size());
    for (ComicBook comicBook : result) {
      assertEquals(ComicState.DELETED, comicBook.getComicState());
    }
  }

  @Test
  public void testComicWithDuplicates() {
    List<ComicBook> result = repository.findAll();

    for (int index = 0; index < result.size(); index++) {
      if (result.get(index).getId().equals(TEST_COMIC_ID_WITH_DUPLICATES)) {
        assertTrue(result.get(index).getDuplicateCount() > 0);
        return;
      }
    }

    fail("Did not find the expected comicBook");
  }

  @Test
  public void testComicWithoutDuplicates() {
    List<ComicBook> result = repository.findAll();

    for (int index = 0; index < result.size(); index++) {
      if (!result.get(index).getId().equals(TEST_COMIC_ID_WITH_DUPLICATES)) {
        assertEquals(0, result.get(index).getDuplicateCount().intValue());
        return;
      }
    }

    fail("Did not find the expected comicBook");
  }

  @Test
  public void testDelete() {
    repository.delete(comicBook);

    ComicBook result = repository.getById(TEST_COMIC_ID);

    assertNull(result);
  }

  @Test
  public void testFindComicsForPageHashNoComics() {
    final List<ComicBook> result = repository.findComicsForPageHash(TEST_HASH_WITH_NO_COMICS);

    assertNotNull(result);
    assertTrue(result.isEmpty());
  }

  @Test
  public void testFindComicsForPageHash() {
    final List<ComicBook> result = repository.findComicsForPageHash(TEST_HASH_WITH_COMICS);

    assertNotNull(result);
    assertFalse(result.isEmpty());
  }

  @Test
  public void testFindDistinctPublishers() {
    final List<String> result = repository.findDistinctPublishers();

    assertNotNull(result);
    assertFalse(result.isEmpty());
  }

  @Test
  public void testLoadYearsWithComics() {
    final List<Integer> result = repository.loadYearsWithComics();

    assertNotNull(result);
    assertFalse(result.isEmpty());
  }

  @Test
  public void testGetPublishersState() {
    final List<RemoteLibrarySegmentState> result = repository.getPublishersState();

    assertNotNull(result);
    assertFalse(result.isEmpty());
  }

  @Test
  public void testGetSeriesState() {
    final List<RemoteLibrarySegmentState> result = repository.getSeriesState();

    assertNotNull(result);
    assertFalse(result.isEmpty());
  }

  @Test
  public void testGetCharactersState() {
    final List<RemoteLibrarySegmentState> result = repository.getCharactersState();

    assertNotNull(result);
    assertFalse(result.isEmpty());
  }

  @Test
  public void testGetTeamsState() {
    final List<RemoteLibrarySegmentState> result = repository.getTeamsState();

    assertNotNull(result);
    assertFalse(result.isEmpty());
  }

  @Test
  public void testGetLocationsState() {
    final List<RemoteLibrarySegmentState> result = repository.getLocationsState();

    assertNotNull(result);
    assertFalse(result.isEmpty());
  }

  @Test
  public void testGetStoriesState() {
    final List<RemoteLibrarySegmentState> result = repository.getStoriesState();

    assertNotNull(result);
    assertFalse(result.isEmpty());
  }

  @Test
  public void testGetComicBooksState() {
    final List<RemoteLibrarySegmentState> result = repository.getComicBooksState();

    assertNotNull(result);
    assertFalse(result.isEmpty());
  }

  @Test
  public void testCountByMetadataIsNull() {
    final long result = repository.countByMetadataIsNull();

    assertTrue(result > 0L);
  }

  @Test
  public void testGetByPublisherAndYear() {
    final List<PublisherAndYearSegment> result = repository.getByPublisherAndYear();

    assertNotNull(result);
    assertFalse(result.isEmpty());
  }

  @Test
  public void testGetAllSeriesAndVolumes() {
    final List<Series> result = repository.getAllSeriesAndVolumes();

    assertNotNull(result);
    assertFalse(result.isEmpty());
  }
}

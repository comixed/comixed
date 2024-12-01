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

import com.github.springtestdbunit.DbUnitTestExecutionListener;
import com.github.springtestdbunit.annotation.DatabaseSetup;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.collections.Publisher;
import org.comixedproject.model.collections.Series;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.net.library.PublisherAndYearSegment;
import org.comixedproject.model.net.library.RemoteLibrarySegmentState;
import org.comixedproject.repositories.RepositoryContext;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Limit;
import org.springframework.data.domain.PageRequest;
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
  private static final long TEST_COMIC_ID = 1001L;
  private static final long TEST_DELETABLE_COMIC_ID = 2000L;
  private static final long TEST_COMIC_ID_WITH_BLOCKED_PAGES = 1001L;
  private static final Long TEST_USER_ID = 1000L;
  private static final long TEST_INVALID_ID = 9797L;
  private static final String TEST_PUBLISHER = "Marvel";
  private static final String TEST_SERIES = "Steve Rogers: Captain America";
  private static final String TEST_VOLUME = "2017";
  private static final String TEST_ISSUE_WITH_NO_NEXT = "514";
  private static final Long TEST_ISSUE_WITH_NEXT = 512L;
  private static final String TEST_ISSUE_WITH_NO_PREV = "249";
  private static final Long TEST_ISSUE_WITH_PREV = 513L;
  private static final Date TEST_COVER_DATE_NO_NEXT = new Date(1490932800000L);
  private static final Date TEST_COVER_DATE_WITH_NEXT = new Date(1485838800000L);
  private static final Date TEST_COVER_DATE_NO_PREV = new Date(1425099600000L);
  private static final Date TEST_COVER_DATE_WITH_PREV = new Date(1488258000000L);
  private static final String TEST_HASH_WITH_NO_COMICS = "FEDCBA9876543210FEDCBA9876543210";
  private static final String TEST_HASH_WITH_COMICS = "0123456789ABCDEF0123456789ABCDEF";
  private static final String TEST_COMICBOOK_FILENAME = "src/test/resources/comicbook.cbz";
  private static final Long TEST_NEXT_ISSUE_ID = 1001L;
  private static final Long TEST_PREVIOUS_ISSUE_ID = 1006L;

  @Autowired private ComicBookRepository repository;

  private ComicBook comicBook;
  private ComicBook deletableComicBook;

  @Before
  public void setUp() {
    comicBook = repository.getById(TEST_COMIC_ID);
    deletableComicBook = repository.getById(TEST_DELETABLE_COMIC_ID);
  }

  @Test
  public void testDelete() {
    repository.delete(deletableComicBook);

    final Optional<ComicBook> result = repository.findById(deletableComicBook.getId());

    assertFalse(result.isPresent());
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
  public void testFindAllUnreadByUser() {
    List<ComicDetail> result = repository.findAllUnreadByUser(TEST_USER_ID);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(1, result.size());
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
    final Long result =
        this.repository.findNextComicBookIdInSeries(
            TEST_SERIES,
            TEST_VOLUME,
            TEST_ISSUE_WITH_NO_NEXT,
            TEST_COVER_DATE_NO_NEXT,
            Limit.of(1));

    assertNull(result);
  }

  @Test
  public void testGetIssuesAfterComic() {
    final Long result =
        this.repository.findNextComicBookIdInSeries(
            TEST_SERIES,
            TEST_VOLUME,
            TEST_ISSUE_WITH_NEXT.toString(),
            TEST_COVER_DATE_WITH_NEXT,
            Limit.of(1));

    assertNotNull(result);
    assertEquals(TEST_NEXT_ISSUE_ID, result);
  }

  @Test
  public void testFindPreviousCoicBookIdInSeriesNone() {
    final Long result =
        this.repository.findPreviousComicBookIdInSeries(
            TEST_SERIES,
            TEST_VOLUME,
            TEST_ISSUE_WITH_NO_PREV,
            TEST_COVER_DATE_NO_PREV,
            Limit.of(1));

    assertNull(result);
  }

  @Test
  public void testGetIssuesBeforeComic() {
    final Long result =
        this.repository.findPreviousComicBookIdInSeries(
            TEST_SERIES,
            TEST_VOLUME,
            TEST_ISSUE_WITH_PREV.toString(),
            TEST_COVER_DATE_WITH_PREV,
            Limit.of(1));

    assertNotNull(result);
    assertEquals(TEST_PREVIOUS_ISSUE_ID, result);
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

  @Test
  public void testGetAllSeriesAndVolumesForPublisher() {
    final List<Series> result = repository.getAllSeriesAndVolumesForPublisher(TEST_PUBLISHER);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertTrue(result.stream().allMatch(series -> series.getPublisher().equals(TEST_PUBLISHER)));
  }

  @Test
  public void getAllPublishersWithNumberOfSeriesCount() {
    final int result = repository.getAllPublishersWithNumberOfSeriesCount();

    assertTrue(result > 0);
  }

  @Test
  public void getAllPublishersWithNumberOfSeries() {
    final List<Publisher> result =
        repository.getAllPublishersWithNumberOfSeries(PageRequest.of(0, 10));

    assertNotNull(result);
    assertFalse(result.isEmpty());
  }

  @Test
  public void testGetAllWithDuplicatePages() {
    final List<ComicDetail> result = repository.getAllWithDuplicatePages();

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertTrue(result.stream().allMatch(comic -> comic.getComicBook().getDuplicatePageCount() > 0));
  }

  @Test
  public void testSaveWithNullFields() {
    final ComicBook incoming = new ComicBook();
    incoming.setComicDetail(new ComicDetail(incoming, TEST_COMICBOOK_FILENAME, ArchiveType.CBZ));

    final ComicBook saved = this.repository.save(incoming);

    this.repository.flush();
    ;

    assertNotNull(saved.getId());

    final Optional<ComicBook> updated = this.repository.findById(saved.getId());

    assertTrue(updated.isPresent());
    assertNull(updated.get().getComicDetail().getPublisher());
    assertNull(updated.get().getComicDetail().getSeries());
    assertNull(updated.get().getComicDetail().getVolume());
    assertNull(updated.get().getComicDetail().getIssueNumber());
    assertNull(updated.get().getComicDetail().getTitle());
    assertNull(updated.get().getComicDetail().getDescription());
  }
}

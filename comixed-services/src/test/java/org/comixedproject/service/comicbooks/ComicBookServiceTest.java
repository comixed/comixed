/*
 * ComiXed - A digital comicBook book library management application.
 * Copyright (C) 2019, The ComiXed Project.
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

package org.comixedproject.service.comicbooks;

import static junit.framework.TestCase.*;

import java.util.*;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.adaptors.comicbooks.ComicBookMetadataAdaptor;
import org.comixedproject.adaptors.comicbooks.ComicFileAdaptor;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.batch.OrganizingLibraryEvent;
import org.comixedproject.model.batch.UpdateMetadataEvent;
import org.comixedproject.model.collections.PublisherDetail;
import org.comixedproject.model.collections.SeriesDetail;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.comicbooks.ComicType;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.model.net.comicbooks.PageOrderEntry;
import org.comixedproject.model.net.library.PublisherAndYearSegment;
import org.comixedproject.model.net.library.RemoteLibrarySegmentState;
import org.comixedproject.repositories.collections.PublisherDetailRepository;
import org.comixedproject.repositories.comicbooks.ComicBookRepository;
import org.comixedproject.repositories.comicbooks.ComicDetailRepository;
import org.comixedproject.repositories.comicbooks.ComicTagRepository;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Limit;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ComicBookServiceTest {
  private static final long TEST_COMIC_BOOK_ID = 5;
  private static final String TEST_COMIC_FILENAME = "src/test/resources/example.cbz";
  private static final ComicType TEST_COMIC_TYPE =
      ComicType.values()[RandomUtils.nextInt(ComicType.values().length)];
  private static final String TEST_PUBLISHER = "Awesome Publications";
  private static final String TEST_SERIES = "SeriesDetail Name";
  private static final String TEST_VOLUME = "Volume Name";
  private static final String TEST_ISSUE_NUMBER = "237";
  private static final int TEST_MAXIMUM_COMICS = 100;
  private static final String TEST_BEFORE_PREVIOUS_ISSUE_NUMBER = "5";
  private static final Long TEST_PREVIOUS_ISSUE_NUMBER = 5L;
  private static final String TEST_CURRENT_ISSUE_NUMBER = "7";
  private static final Long TEST_NEXT_ISSUE_NUMBER = 10L;
  private static final String TEST_AFTER_NEXT_ISSUE_NUMBER = "11";
  private static final String TEST_SORTABLE_NAME = "Sortable Name";
  private static final String TEST_IMPRINT = "Incredible Imprints";
  private static final String TEST_TITLE = "The Issue Title";
  private static final String TEST_DESCRIPTION = "This description of the issue";
  private static final Date TEST_COVER_DATE = new Date();
  private static final Date TEST_STORE_DATE =
      new Date(System.currentTimeMillis() - 30L * 24L * 60L * 60L * 24L);
  private static final String TEST_NOTES = "These are the comic book's notes...";
  private static final ComicState TEST_STATE = ComicState.CHANGED;
  private static final String TEST_STORY_NAME = "The ScrapedStory Name";
  private static final long TEST_COMIC_COUNT = 239L;
  private static final String TEST_SEARCH_TERMS = "The search terms";
  private static final int TEST_BATCH_CHUNK_SIZE = 25;
  private static final int TEST_PAGE_SIZE = 25;
  private static final int TEST_PAGE_NUMBER = 3;
  private static final boolean TEST_RENAME_PAGES = RandomUtils.nextBoolean();
  private static final boolean TEST_DELETE_PAGES = RandomUtils.nextBoolean();

  private final List<ComicBook> comicBookList = new ArrayList<>();
  private final List<ComicDetail> comicDetailList = new ArrayList<>();
  private final List<ComicBook> comicsBySeries = new ArrayList<>();
  private final ComicBook beforePreviousComicBook = new ComicBook();
  private final ComicBook previousComicBook = new ComicBook();
  private final ComicBook currentComicBook = new ComicBook();
  private final ComicBook nextComicBook = new ComicBook();
  private final ComicBook afterNextComicBook = new ComicBook();
  private final List<Long> idList = new ArrayList<>();
  private final GregorianCalendar calendar = new GregorianCalendar();
  private final Date now = new Date();

  @InjectMocks private ComicBookService service;
  @Mock private ComicStateHandler comicStateHandler;
  @Mock private ComicBookRepository comicBookRepository;
  @Mock private PublisherDetailRepository publisherDetailRepository;
  @Mock private ComicDetailRepository comicDetailRepository;
  @Mock private ComicTagRepository comicTagRepository;
  @Mock private ComicBookMetadataAdaptor comicBookMetadataAdaptor;
  @Mock private ComicFileAdaptor comicFileAdaptor;
  @Mock private ApplicationEventPublisher applicationEventPublisher;
  @Mock private FileTypeAdaptor fileTypeAdaptor;
  @Mock private ComicBook comicBook;
  @Mock private ComicDetail comicDetail;
  @Mock private ComicBook incomingComicBook;
  @Mock private ComicDetail incomingComicDetail;
  @Mock private ComicBook comicBookRecord;
  @Mock private ImprintService imprintService;
  @Mock private List<String> collectionList;
  @Mock private List<String> publisherList;
  @Mock private List<RemoteLibrarySegmentState> librarySegmentList;
  @Mock private List<PublisherAndYearSegment> byPublisherAndYearList;
  @Mock private List<PublisherDetail> publisherWithSeriesCountList;
  @Mock private List<SeriesDetail> publisherDetail;
  @Mock private List<SeriesDetail> seriesDetailList;
  @Mock private ComicBook savedComicBook;
  @Mock private ArchiveType targetArchiveType;

  @Captor private ArgumentCaptor<Pageable> pageableCaptor;
  @Captor private ArgumentCaptor<PageRequest> pageRequestCaptor;
  @Captor private ArgumentCaptor<Limit> previousComicBookLimitArgumentCaptor;
  @Captor private ArgumentCaptor<Limit> nextComicBookLimitArgumentCaptor;
  private Set<String> comicFilenameList = new HashSet<>();

  @Before
  public void setUp() {
    Mockito.when(comicDetail.getFilename()).thenReturn(TEST_COMIC_FILENAME);
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(comicBook.getId()).thenReturn(TEST_COMIC_BOOK_ID);
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(incomingComicBook.getComicDetail()).thenReturn(incomingComicDetail);

    previousComicBook.setComicDetail(
        new ComicDetail(previousComicBook, TEST_COMIC_FILENAME, ArchiveType.CBZ));
    previousComicBook.getComicDetail().setIssueNumber(TEST_PREVIOUS_ISSUE_NUMBER.toString());
    previousComicBook
        .getComicDetail()
        .setCoverDate(new Date(System.currentTimeMillis() - 24L * 60L * 60L * 1000L));

    beforePreviousComicBook.setComicDetail(
        new ComicDetail(previousComicBook, TEST_COMIC_FILENAME, ArchiveType.CBZ));
    beforePreviousComicBook.getComicDetail().setIssueNumber(TEST_BEFORE_PREVIOUS_ISSUE_NUMBER);
    beforePreviousComicBook
        .getComicDetail()
        .setCoverDate(new Date(System.currentTimeMillis() - 3L * 24L * 60L * 60L * 1000L));

    currentComicBook.setComicDetail(
        new ComicDetail(currentComicBook, TEST_COMIC_FILENAME, ArchiveType.CBZ));
    currentComicBook.getComicDetail().setSeries(TEST_SERIES);
    currentComicBook.getComicDetail().setVolume(TEST_VOLUME);
    currentComicBook.getComicDetail().setIssueNumber(TEST_CURRENT_ISSUE_NUMBER);
    currentComicBook.getComicDetail().setCoverDate(TEST_COVER_DATE);
    currentComicBook.getComicDetail().setStoreDate(TEST_STORE_DATE);

    nextComicBook.setComicDetail(
        new ComicDetail(nextComicBook, TEST_COMIC_FILENAME, ArchiveType.CBZ));
    nextComicBook.getComicDetail().setIssueNumber(TEST_NEXT_ISSUE_NUMBER.toString());
    nextComicBook
        .getComicDetail()
        .setCoverDate(new Date(System.currentTimeMillis() + 24L * 60L * 60L * 1000L));

    afterNextComicBook.setComicDetail(
        new ComicDetail(nextComicBook, TEST_COMIC_FILENAME, ArchiveType.CBZ));
    afterNextComicBook.getComicDetail().setIssueNumber(TEST_AFTER_NEXT_ISSUE_NUMBER);
    afterNextComicBook
        .getComicDetail()
        .setCoverDate(new Date(System.currentTimeMillis() + 30L * 24L * 60L * 60L * 1000L));

    comicsBySeries.add(nextComicBook);
    comicsBySeries.add(previousComicBook);
    comicsBySeries.add(currentComicBook);

    calendar.setTime(now);
  }

  @Test
  public void testGetComic() throws ComicBookException {
    List<ComicBook> previousComicBooks = new ArrayList<>();
    previousComicBooks.add(previousComicBook);
    previousComicBooks.add(beforePreviousComicBook);
    List<ComicBook> nextComicBooks = new ArrayList<>();
    nextComicBooks.add(nextComicBook);
    nextComicBooks.add(afterNextComicBook);

    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(currentComicBook);

    Mockito.when(
            comicBookRepository.findPreviousComicBookIdInSeries(
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.any(Date.class),
                previousComicBookLimitArgumentCaptor.capture()))
        .thenReturn(TEST_PREVIOUS_ISSUE_NUMBER);
    Mockito.when(
            comicBookRepository.findNextComicBookIdInSeries(
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.any(Date.class),
                nextComicBookLimitArgumentCaptor.capture()))
        .thenReturn(TEST_NEXT_ISSUE_NUMBER);

    final ComicBook result = service.getComic(TEST_COMIC_BOOK_ID);

    assertNotNull(result);
    assertSame(currentComicBook, result);
    assertEquals(TEST_PREVIOUS_ISSUE_NUMBER, result.getPreviousIssueId());
    assertEquals(TEST_NEXT_ISSUE_NUMBER, result.getNextIssueId());

    final Limit previousComicBookLimit = previousComicBookLimitArgumentCaptor.getValue();
    assertEquals(1, previousComicBookLimit.max());
    final Limit nextComicBookLimit = previousComicBookLimitArgumentCaptor.getValue();
    assertEquals(1, nextComicBookLimit.max());

    Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_BOOK_ID);
    Mockito.verify(comicBookRepository, Mockito.times(1))
        .findPreviousComicBookIdInSeries(
            TEST_SERIES,
            TEST_VOLUME,
            TEST_CURRENT_ISSUE_NUMBER,
            TEST_COVER_DATE,
            previousComicBookLimit);
    Mockito.verify(comicBookRepository, Mockito.times(1))
        .findNextComicBookIdInSeries(
            TEST_SERIES,
            TEST_VOLUME,
            TEST_CURRENT_ISSUE_NUMBER,
            TEST_COVER_DATE,
            nextComicBookLimit);
  }

  @Test(expected = ComicBookException.class)
  public void testDeleteComicBookNonexistent() throws ComicBookException {
    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.deleteComicBook(TEST_COMIC_BOOK_ID);
    } finally {
      Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_BOOK_ID);
    }
  }

  @Test
  public void testDeleteComicBook() throws ComicBookException {
    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBookRecord);

    final ComicBook result = service.deleteComicBook(TEST_COMIC_BOOK_ID);

    assertNotNull(result);
    assertSame(comicBookRecord, result);

    Mockito.verify(comicBookRepository, Mockito.times(2)).getById(TEST_COMIC_BOOK_ID);
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(comicBookRecord, ComicEvent.deleteComic);
  }

  @Test(expected = ComicBookException.class)
  public void testRestoreComicBookNonexistent() throws ComicBookException {
    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.undeleteComicBook(TEST_COMIC_BOOK_ID);
    } finally {
      Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_BOOK_ID);
    }
  }

  @Test
  public void testRestoreComic() throws ComicBookException {
    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBookRecord);

    final ComicBook response = service.undeleteComicBook(TEST_COMIC_BOOK_ID);

    assertNotNull(response);
    assertSame(comicBookRecord, response);

    Mockito.verify(comicBookRepository, Mockito.times(2)).getById(TEST_COMIC_BOOK_ID);
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(comicBookRecord, ComicEvent.undeleteComic);
  }

  @Test(expected = ComicBookException.class)
  public void testGetComicContentNoSuchComicBook() throws ComicBookException {
    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      this.service.getComicContent(TEST_COMIC_BOOK_ID);
    } finally {
      Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_BOOK_ID);
    }
  }

  @Test(expected = ComicBookException.class)
  public void testGetComicContentFileNotFound() throws ComicBookException {
    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(comicDetail.getFilename()).thenReturn(TEST_COMIC_FILENAME.substring(1));

    try {
      this.service.getComicContent(TEST_COMIC_BOOK_ID);
    } finally {
      Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_BOOK_ID);
    }
  }

  @Test
  public void testGetComicContent() throws ComicBookException {
    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(comicDetail.getFilename()).thenReturn(TEST_COMIC_FILENAME);

    final DownloadDocument result = this.service.getComicContent(TEST_COMIC_BOOK_ID);

    assertNotNull(result);
    assertEquals(FilenameUtils.getName(TEST_COMIC_FILENAME), result.getFilename());
    assertNotNull(result.getContent());
    assertTrue(result.getContent().length > 0);

    Mockito.verify(comicBookRepository, Mockito.atLeast(1)).getById(TEST_COMIC_BOOK_ID);
    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getMimeTypeFor(Mockito.any());
  }

  @Test(expected = ComicBookException.class)
  public void testUpdateComicInvalidComic() throws ComicBookException {
    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);
    try {
      service.updateComic(TEST_COMIC_BOOK_ID, incomingComicBook);
    } finally {
      Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_BOOK_ID);
    }
  }

  @Test
  public void testUpdateComic() throws ComicBookException {
    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(incomingComicDetail.getComicType()).thenReturn(TEST_COMIC_TYPE);
    Mockito.when(incomingComicDetail.getPublisher()).thenReturn(TEST_PUBLISHER);
    Mockito.when(incomingComicDetail.getImprint()).thenReturn(TEST_IMPRINT);
    Mockito.when(incomingComicDetail.getSeries()).thenReturn(TEST_SERIES);
    Mockito.when(incomingComicDetail.getVolume()).thenReturn(TEST_VOLUME);
    Mockito.when(incomingComicDetail.getIssueNumber()).thenReturn(TEST_ISSUE_NUMBER);
    Mockito.when(incomingComicDetail.getSortName()).thenReturn(TEST_SORTABLE_NAME);
    Mockito.when(incomingComicDetail.getTitle()).thenReturn(TEST_TITLE);
    Mockito.when(incomingComicDetail.getDescription()).thenReturn(TEST_DESCRIPTION);
    Mockito.when(incomingComicDetail.getCoverDate()).thenReturn(TEST_COVER_DATE);
    Mockito.when(incomingComicDetail.getStoreDate()).thenReturn(TEST_STORE_DATE);
    Mockito.when(incomingComicDetail.getNotes()).thenReturn(TEST_NOTES);

    final ComicBook result = service.updateComic(TEST_COMIC_BOOK_ID, incomingComicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookRepository, Mockito.times(2)).getById(TEST_COMIC_BOOK_ID);
    Mockito.verify(comicDetail, Mockito.times(1)).setComicType(TEST_COMIC_TYPE);
    Mockito.verify(comicDetail, Mockito.times(1)).setPublisher(TEST_PUBLISHER);
    Mockito.verify(comicDetail, Mockito.times(1)).setImprint(TEST_IMPRINT);
    Mockito.verify(comicDetail, Mockito.times(1)).setSeries(TEST_SERIES);
    Mockito.verify(comicDetail, Mockito.times(1)).setVolume(TEST_VOLUME);
    Mockito.verify(comicDetail, Mockito.times(1)).setIssueNumber(TEST_ISSUE_NUMBER);
    Mockito.verify(comicDetail, Mockito.times(1)).setSortName(TEST_SORTABLE_NAME);
    Mockito.verify(comicDetail, Mockito.times(1)).setTitle(TEST_TITLE);
    Mockito.verify(comicDetail, Mockito.times(1)).setDescription(TEST_DESCRIPTION);
    Mockito.verify(comicDetail, Mockito.times(1)).setCoverDate(TEST_COVER_DATE);
    Mockito.verify(comicDetail, Mockito.times(1)).setStoreDate(TEST_STORE_DATE);
    Mockito.verify(comicDetail, Mockito.times(1)).setNotes(TEST_NOTES);
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(comicBook, ComicEvent.detailsUpdated);
    Mockito.verify(imprintService, Mockito.times(1)).update(comicBook);
  }

  @Test
  public void testSave() {
    Mockito.when(comicBookRepository.saveAndFlush(Mockito.any(ComicBook.class)))
        .thenReturn(savedComicBook);

    final ComicBook result = this.service.save(comicBook);

    assertNotNull(result);
    assertSame(savedComicBook, result);

    Mockito.verify(comicFileAdaptor, Mockito.times(1)).standardizeFilename(TEST_COMIC_FILENAME);
    Mockito.verify(comicBookRepository, Mockito.times(1)).saveAndFlush(comicBook);
  }

  @Test
  public void testDelete() {
    Mockito.doNothing()
        .when(comicTagRepository)
        .deleteAllByComicDetail(Mockito.any(ComicDetail.class));
    Mockito.doNothing().when(comicBookRepository).delete(Mockito.any(ComicBook.class));

    service.deleteComicBook(comicBook);

    Mockito.verify(comicTagRepository, Mockito.times(1)).deleteAllByComicDetail(comicDetail);
    Mockito.verify(comicBookRepository, Mockito.times(1)).delete(comicBook);
  }

  @Test
  public void testFindComicsToMove() {
    Mockito.when(comicBookRepository.findComicsToMove(pageRequestCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.findComicsToMove(TEST_PAGE_NUMBER, TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicBookList, result);

    assertNotNull(pageRequestCaptor.getValue());
    final PageRequest request = pageRequestCaptor.getValue();
    assertEquals(TEST_PAGE_NUMBER, request.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, request.getPageSize());

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .findComicsToMove(pageRequestCaptor.getValue());
  }

  @Test
  public void testFindByFilename() {
    Mockito.when(comicBookRepository.findByFilename(TEST_COMIC_FILENAME)).thenReturn(comicBook);

    final ComicBook result = service.findByFilename(TEST_COMIC_FILENAME);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).findByFilename(TEST_COMIC_FILENAME);
  }

  @Test(expected = ComicBookException.class)
  public void testDeleteMetadataInvalidComicId() throws ComicBookException {
    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.deleteMetadata(TEST_COMIC_BOOK_ID);
    } finally {
      Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_BOOK_ID);
    }
  }

  @Test
  public void testDeleteMetadata() throws ComicBookException {
    Mockito.when(comicBookRepository.getById(Mockito.anyLong()))
        .thenReturn(comicBook, comicBookRecord);

    final ComicBook result = service.deleteMetadata(TEST_COMIC_BOOK_ID);

    assertNotNull(result);
    assertSame(comicBookRecord, result);

    Mockito.verify(comicBookRepository, Mockito.times(2)).getById(TEST_COMIC_BOOK_ID);
    Mockito.verify(comicBookMetadataAdaptor, Mockito.times(1)).clear(comicBook);
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(comicBook, ComicEvent.metadataCleared);
  }

  @Test
  public void testGetComicsWithoutContentCount() {
    Mockito.when(comicBookRepository.findUnprocessedComicsWithoutContentCount())
        .thenReturn(TEST_MAXIMUM_COMICS);

    final long result = service.getComicsWithoutContentCount();

    assertEquals(TEST_MAXIMUM_COMICS, result);

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .findUnprocessedComicsWithoutContentCount();
  }

  @Test
  public void testFindComicsWithCreateMetadataFlagSet() {
    Mockito.when(
            comicBookRepository.findUnprocessedComicsWithCreateMetadataFlagSet(
                pageableCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.findComicsWithCreateMetadataFlagSet(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicBookList, result);

    final Pageable pageable = pageableCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .findUnprocessedComicsWithCreateMetadataFlagSet(pageable);
  }

  @Test
  public void testFindComicsWithContentToLoad() {
    Mockito.when(comicBookRepository.findComicsWithContentToLoad(pageableCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.findComicsWithContentToLoad(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicBookList, result);

    final Pageable pageable = pageableCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    Mockito.verify(comicBookRepository, Mockito.times(1)).findComicsWithContentToLoad(pageable);
  }

  @Test
  public void testFindProcessedComics() {
    Mockito.when(comicBookRepository.findProcessedComics()).thenReturn(comicBookList);

    final List<ComicBook> result = service.findProcessedComics();

    assertNotNull(result);
    assertSame(comicBookList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).findProcessedComics();
  }

  @Test
  public void testPrepareForRescan() {
    for (long index = 0L; index < 25L; index++) idList.add(index + 100);

    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);

    service.prepareForRescan(idList);

    idList.forEach(
        id -> Mockito.verify(comicBookRepository, Mockito.times(1)).getById(id.longValue()));
    Mockito.verify(comicStateHandler, Mockito.times(idList.size()))
        .fireEvent(comicBook, ComicEvent.rescanComic);
  }

  @Test
  public void testPrepareForRescanNoSuchComic() {
    idList.add(TEST_COMIC_BOOK_ID);

    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);

    service.prepareForRescan(idList);

    idList.forEach(
        id -> Mockito.verify(comicBookRepository, Mockito.times(1)).getById(id.longValue()));
    Mockito.verify(comicStateHandler, Mockito.never()).fireEvent(comicBook, ComicEvent.rescanComic);
  }

  @Test
  public void testGetCountForState() {
    for (int index = 0; index < 50; index++) comicBookList.add(comicBook);

    Mockito.when(comicBookRepository.findForStateCount(Mockito.any(ComicState.class)))
        .thenReturn(TEST_COMIC_COUNT);

    final long result = service.getCountForState(TEST_STATE);

    assertEquals(TEST_COMIC_COUNT, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).findForStateCount(TEST_STATE);
  }

  @Test
  public void testFindComicsWithMetadataToUpdate() {
    Mockito.when(comicBookRepository.findComicsWithMetadataToUpdate(pageableCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.findComicsWithMetadataToUpdate(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicBookList, result);

    final Pageable pageable = pageableCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    Mockito.verify(comicBookRepository, Mockito.times(1)).findComicsWithMetadataToUpdate(pageable);
  }

  @Test
  public void testFindComicsForBatchMetadataUpdate() {
    Mockito.when(comicBookRepository.findComicsForBatchMetadataUpdate(pageableCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.findComicsForBatchMetadataUpdate(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicBookList, result);

    final Pageable pageable = pageableCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .findComicsForBatchMetadataUpdate(pageable);
  }

  @Test
  public void testFindComicsForBatchMetadataUpdateCount() {
    Mockito.when(comicBookRepository.findComicsForBatchMetadataUpdateCount())
        .thenReturn(TEST_COMIC_COUNT);

    final long result = service.findComicsForBatchMetadataUpdateCount();

    assertEquals(TEST_COMIC_COUNT, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).findComicsForBatchMetadataUpdateCount();
  }

  @Test
  public void testGetComicBooksToBePurgedCount() {
    Mockito.when(comicBookRepository.findComicsToPurgeCount()).thenReturn(TEST_COMIC_COUNT);

    final long result = service.findComicsToPurgeCount();

    assertEquals(TEST_COMIC_COUNT, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).findComicsToPurgeCount();
  }

  @Test
  public void testFindAllComicsMarkedForDeletion() {
    service.prepareComicBooksForDeleting();

    Mockito.verify(comicBookRepository, Mockito.times(1)).prepareComicBooksForDeleting();
  }

  @Test
  public void testFindComicsToRecreateCount() {
    Mockito.when(comicBookRepository.findComicsToBeRecreatedCount()).thenReturn(TEST_COMIC_COUNT);

    final long result = service.findComicsToRecreateCount();

    assertEquals(TEST_COMIC_COUNT, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).findComicsToBeRecreatedCount();
  }

  @Test
  public void testFindComicsToPurgeCount() {
    Mockito.when(comicBookRepository.findComicsToPurgeCount()).thenReturn(TEST_COMIC_COUNT);

    final long result = service.findComicsToPurgeCount();

    assertEquals(TEST_COMIC_COUNT, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).findComicsToPurgeCount();
  }

  @Test
  public void testFindAll() {
    Mockito.when(comicBookRepository.findAll()).thenReturn(comicBookList);

    final List<ComicBook> result = service.findAll();

    assertNotNull(result);
    assertSame(comicBookList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).findAll();
  }

  @Test
  public void testDeleteComicBooksByIdInvalidId() {
    idList.clear();
    idList.add(TEST_COMIC_BOOK_ID);

    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);

    service.deleteComicBooksById(idList);

    Mockito.verify(comicBookRepository, Mockito.times(idList.size())).getById(TEST_COMIC_BOOK_ID);
  }

  @Test
  public void testDeleteComicBooksById() {
    idList.clear();
    idList.add(TEST_COMIC_BOOK_ID);

    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);

    service.deleteComicBooksById(idList);

    Mockito.verify(comicBookRepository, Mockito.times(idList.size())).getById(TEST_COMIC_BOOK_ID);
    Mockito.verify(comicStateHandler, Mockito.times(idList.size()))
        .fireEvent(comicBook, ComicEvent.deleteComic);
  }

  @Test
  public void testUndeleteComicBookByIdInvalidId() {
    idList.add(TEST_COMIC_BOOK_ID);

    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);

    service.undeleteComicBooksById(idList);

    Mockito.verify(comicBookRepository, Mockito.times(idList.size())).getById(TEST_COMIC_BOOK_ID);
  }

  @Test
  public void testUndeleteComicBooksById() {
    idList.add(TEST_COMIC_BOOK_ID);

    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);

    service.undeleteComicBooksById(idList);

    Mockito.verify(comicBookRepository, Mockito.times(idList.size())).getById(TEST_COMIC_BOOK_ID);
    Mockito.verify(comicStateHandler, Mockito.times(idList.size()))
        .fireEvent(comicBook, ComicEvent.undeleteComic);
  }

  @Test
  public void testFindAllComicsToRecreate() {
    Mockito.when(comicBookRepository.findComicsToRecreate(pageableCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.findComicsToRecreate(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicBookList, result);

    final Pageable pageable = pageableCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    Mockito.verify(comicBookRepository, Mockito.times(1)).findComicsToRecreate(pageable);
  }

  @Test
  public void testFindComicNotFound() {
    Mockito.when(
            comicBookRepository.findComic(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(Collections.emptyList());

    final List<ComicBook> result =
        service.findComic(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER);

    assertNotNull(result);
    assertTrue(result.isEmpty());

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .findComic(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER);
  }

  @Test
  public void testFindComic() {
    comicBookList.add(comicBook);

    Mockito.when(
            comicBookRepository.findComic(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(comicBookList);

    final List<ComicBook> result =
        service.findComic(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER);

    assertNotNull(result);
    assertSame(comicBookList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .findComic(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER);
  }

  @Test
  public void testFindSeries() {
    Mockito.when(comicBookRepository.findDistinctSeries()).thenReturn(collectionList);

    final List<String> result = service.getAllSeries();

    assertNotNull(result);
    assertSame(collectionList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).findDistinctSeries();
  }

  @Test
  public void testGetAllPublishersForStory() {
    Mockito.when(comicBookRepository.findDistinctPublishersForStory(Mockito.anyString()))
        .thenReturn(publisherList);

    final List<String> result = service.getAllPublishersForStory(TEST_STORY_NAME);

    assertNotNull(result);
    assertSame(publisherList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .findDistinctPublishersForStory(TEST_STORY_NAME);
  }

  @Test
  public void testFindComicsMarkedForPurging() {
    Mockito.when(comicBookRepository.findComicsMarkedForPurging(pageableCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.findComicsMarkedForPurging(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicBookList, result);

    final Pageable pageable = pageableCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    Mockito.verify(comicBookRepository, Mockito.times(1)).findComicsMarkedForPurging(pageable);
  }

  @Test(expected = ComicBookException.class)
  public void testSavePageOrderInvalidId() throws ComicBookException {
    List<PageOrderEntry> entryList = new ArrayList<>();
    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.savePageOrder(TEST_COMIC_BOOK_ID, entryList);
    } finally {
      Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_BOOK_ID);
    }
  }

  @Test(expected = ComicBookException.class)
  public void testSavePageOrderContainsGap() throws ComicBookException {
    List<PageOrderEntry> entryList = new ArrayList<>();
    for (int index = 0; index < 25; index++) {
      entryList.add(new PageOrderEntry(String.format("filename-%d", index), index + 1));
    }

    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);

    try {
      service.savePageOrder(TEST_COMIC_BOOK_ID, entryList);
    } finally {
      Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_BOOK_ID);
    }
  }

  @Test(expected = ComicBookException.class)
  public void testSavePageOrderMissingFilename() throws ComicBookException {
    List<PageOrderEntry> entryList = new ArrayList<>();
    List<ComicPage> pageList = new ArrayList<>();
    for (int index = 0; index < 25; index++) {
      final String filename = String.format("filename-%d", index);
      entryList.add(new PageOrderEntry(filename, 24 - index));
      final ComicPage page = new ComicPage();
      page.setFilename(filename.substring(1));
      pageList.add(page);
    }

    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(comicBook.getPages()).thenReturn(pageList);

    try {
      service.savePageOrder(TEST_COMIC_BOOK_ID, entryList);
    } finally {
      Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_BOOK_ID);
    }
  }

  @Test
  public void testSavePageOrder() throws ComicBookException {
    List<PageOrderEntry> entryList = new ArrayList<>();
    List<ComicPage> pageList = new ArrayList<>();
    for (int index = 0; index < 25; index++) {
      final String filename = String.format("filename-%d", index);
      entryList.add(new PageOrderEntry(filename, 24 - index));
      final ComicPage page = new ComicPage();
      page.setFilename(filename);
      pageList.add(page);
    }

    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(comicBook.getPages()).thenReturn(pageList);

    service.savePageOrder(TEST_COMIC_BOOK_ID, entryList);

    for (int index = 0; index < entryList.size(); index++) {
      final PageOrderEntry pageOrderEntry = entryList.get(index);
      final Optional<ComicPage> pageListEntry =
          pageList.stream()
              .filter(entry -> entry.getFilename().equals(pageOrderEntry.getFilename()))
              .findFirst();

      assertTrue(pageListEntry.isPresent());
      assertEquals(pageOrderEntry.getPosition(), pageListEntry.get().getPageNumber().intValue());
    }

    Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_BOOK_ID);
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(comicBook, ComicEvent.detailsUpdated);
  }

  @Test(expected = ComicBookException.class)
  public void testUpdateMultipleComicsInvalidId() throws ComicBookException {
    idList.add(TEST_COMIC_BOOK_ID);

    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.updateMultipleComics(idList);
    } finally {
      Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_BOOK_ID);
    }
  }

  @Test
  public void testUpdateMultipleComics() throws ComicBookException {
    idList.add(TEST_COMIC_BOOK_ID);

    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);

    service.updateMultipleComics(idList);

    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(comicBook, ComicEvent.updateDetails);
  }

  @Test
  public void testGetComicBookCount() {
    Mockito.when(comicBookRepository.count()).thenReturn(TEST_COMIC_COUNT);

    final long result = service.getComicBookCount();

    assertEquals(TEST_COMIC_COUNT, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).count();
  }

  @Test
  public void testGetDeletedComicBookCount() {
    Mockito.when(comicBookRepository.findForStateCount(Mockito.any())).thenReturn(TEST_COMIC_COUNT);

    final long result = service.getDeletedComicCount();

    assertEquals(TEST_COMIC_COUNT, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).findForStateCount(ComicState.DELETED);
  }

  @Test
  public void testGetPublishersState() {
    Mockito.when(comicBookRepository.getPublishersState()).thenReturn(librarySegmentList);

    final List<RemoteLibrarySegmentState> result = service.getPublishersState();

    assertNotNull(result);
    assertSame(librarySegmentList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).getPublishersState();
  }

  @Test
  public void testGetSeriesState() {
    Mockito.when(comicBookRepository.getSeriesState()).thenReturn(librarySegmentList);

    final List<RemoteLibrarySegmentState> result = service.getSeriesState();

    assertNotNull(result);
    assertSame(librarySegmentList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).getSeriesState();
  }

  @Test
  public void testGetCharactersState() {
    Mockito.when(comicBookRepository.getCharactersState()).thenReturn(librarySegmentList);

    final List<RemoteLibrarySegmentState> result = service.getCharactersState();

    assertNotNull(result);
    assertSame(librarySegmentList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).getCharactersState();
  }

  @Test
  public void testGetTeamsState() {
    Mockito.when(comicBookRepository.getTeamsState()).thenReturn(librarySegmentList);

    final List<RemoteLibrarySegmentState> result = service.getTeamsState();

    assertNotNull(result);
    assertSame(librarySegmentList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).getTeamsState();
  }

  @Test
  public void testGetLocationsState() {
    Mockito.when(comicBookRepository.getLocationsState()).thenReturn(librarySegmentList);

    final List<RemoteLibrarySegmentState> result = service.getLocationsState();

    assertNotNull(result);
    assertSame(librarySegmentList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).getLocationsState();
  }

  @Test
  public void testGetStoriesState() {
    Mockito.when(comicBookRepository.getStoriesState()).thenReturn(librarySegmentList);

    final List<RemoteLibrarySegmentState> result = service.getStoriesState();

    assertNotNull(result);
    assertSame(librarySegmentList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).getStoriesState();
  }

  @Test
  public void testGetComicBooksState() {
    Mockito.when(comicBookRepository.getComicBooksState()).thenReturn(librarySegmentList);

    final List<RemoteLibrarySegmentState> result = service.getComicBooksState();

    assertNotNull(result);
    assertSame(librarySegmentList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).getComicBooksState();
  }

  @Test
  public void testGetByPublisherAndYear() {
    Mockito.when(comicBookRepository.getByPublisherAndYear()).thenReturn(byPublisherAndYearList);

    final List<PublisherAndYearSegment> result = service.getByPublisherAndYear();

    assertNotNull(result);
    assertSame(byPublisherAndYearList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).getByPublisherAndYear();
  }

  @Test(expected = ComicBookException.class)
  public void testMarkComicsForBatchMetadataUpdateInvalidId() throws ComicBookException {
    idList.add(TEST_COMIC_BOOK_ID);

    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.markComicBooksForBatchMetadataUpdate(idList);
    } finally {
      Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_BOOK_ID);
    }
  }

  @Test
  public void testMarkComicsForBatchMetadataUpdate() throws ComicBookException {
    idList.add(TEST_COMIC_BOOK_ID);

    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);

    service.markComicBooksForBatchMetadataUpdate(idList);

    Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_BOOK_ID);
    Mockito.verify(comicBook, Mockito.times(1)).setBatchMetadataUpdate(true);
    Mockito.verify(comicBookRepository, Mockito.times(1)).save(comicBook);
    Mockito.verify(applicationEventPublisher, Mockito.times(1))
        .publishEvent(UpdateMetadataEvent.instance);
  }

  @Test
  public void testGetComicBookssForSearchTerms() {
    Mockito.when(comicBookRepository.findForSearchTerms(Mockito.anyString()))
        .thenReturn(comicDetailList);

    final List<ComicDetail> result = service.getComicBooksForSearchTerms(TEST_SEARCH_TERMS);

    assertNotNull(result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).findForSearchTerms(TEST_SEARCH_TERMS);
  }

  @Test
  public void testFindComicsWithEditDetails() {
    Mockito.when(comicBookRepository.findComicsWithEditDetails(pageableCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.findComicsWithEditDetails(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicBookList, result);

    final Pageable pageable = pageableCaptor.getValue();
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    Mockito.verify(comicBookRepository, Mockito.times(1)).findComicsWithEditDetails(pageable);
  }

  @Test
  public void testGetPublisherDetail_unsorted() {
    Mockito.when(
            comicBookRepository.getAllSeriesAndVolumesForPublisher(
                Mockito.anyString(), pageableCaptor.capture()))
        .thenReturn(publisherDetail);

    final List<SeriesDetail> result =
        service.getPublisherDetail(TEST_PUBLISHER, TEST_PAGE_NUMBER, TEST_PAGE_SIZE, null, null);

    assertNotNull(result);
    assertSame(publisherDetail, result);

    final Pageable pageable = pageableCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(TEST_PAGE_NUMBER, pageable.getPageNumber());
    assertEquals(TEST_PAGE_SIZE, pageable.getPageSize());
    assertFalse(pageable.getSort().isSorted());

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .getAllSeriesAndVolumesForPublisher(TEST_PUBLISHER, pageable);
  }

  @Test
  public void testGetPublisherDetail_ascendingNameSort() {
    Mockito.when(
            comicBookRepository.getAllSeriesAndVolumesForPublisher(
                Mockito.anyString(), pageableCaptor.capture()))
        .thenReturn(publisherDetail);

    final List<SeriesDetail> result =
        service.getPublisherDetail(
            TEST_PUBLISHER, TEST_PAGE_NUMBER, TEST_PAGE_SIZE, "series-name", "desc");

    assertNotNull(result);
    assertSame(publisherDetail, result);

    final Pageable pageable = pageableCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(TEST_PAGE_NUMBER, pageable.getPageNumber());
    assertEquals(TEST_PAGE_SIZE, pageable.getPageSize());
    assertTrue(pageable.getSort().isSorted());

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .getAllSeriesAndVolumesForPublisher(TEST_PUBLISHER, pageable);
  }

  @Test
  public void testGetPublisherDetail_descendingNameSort() {
    Mockito.when(
            comicBookRepository.getAllSeriesAndVolumesForPublisher(
                Mockito.anyString(), pageableCaptor.capture()))
        .thenReturn(publisherDetail);

    final List<SeriesDetail> result =
        service.getPublisherDetail(
            TEST_PUBLISHER, TEST_PAGE_NUMBER, TEST_PAGE_SIZE, "series-name", "desc");

    assertNotNull(result);
    assertSame(publisherDetail, result);

    final Pageable pageable = pageableCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(TEST_PAGE_NUMBER, pageable.getPageNumber());
    assertEquals(TEST_PAGE_SIZE, pageable.getPageSize());
    assertTrue(pageable.getSort().isSorted());

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .getAllSeriesAndVolumesForPublisher(TEST_PUBLISHER, pageable);
  }

  @Test
  public void testGetPublisherDetail_ascendingVolumeSort() {
    Mockito.when(
            comicBookRepository.getAllSeriesAndVolumesForPublisher(
                Mockito.anyString(), pageableCaptor.capture()))
        .thenReturn(publisherDetail);

    final List<SeriesDetail> result =
        service.getPublisherDetail(
            TEST_PUBLISHER, TEST_PAGE_NUMBER, TEST_PAGE_SIZE, "series-volume", "desc");

    assertNotNull(result);
    assertSame(publisherDetail, result);

    final Pageable pageable = pageableCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(TEST_PAGE_NUMBER, pageable.getPageNumber());
    assertEquals(TEST_PAGE_SIZE, pageable.getPageSize());
    assertTrue(pageable.getSort().isSorted());

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .getAllSeriesAndVolumesForPublisher(TEST_PUBLISHER, pageable);
  }

  @Test
  public void testGetPublisherDetail_descendingVolumeSort() {
    Mockito.when(
            comicBookRepository.getAllSeriesAndVolumesForPublisher(
                Mockito.anyString(), pageableCaptor.capture()))
        .thenReturn(publisherDetail);

    final List<SeriesDetail> result =
        service.getPublisherDetail(
            TEST_PUBLISHER, TEST_PAGE_NUMBER, TEST_PAGE_SIZE, "series-volume", "desc");

    assertNotNull(result);
    assertSame(publisherDetail, result);

    final Pageable pageable = pageableCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(TEST_PAGE_NUMBER, pageable.getPageNumber());
    assertEquals(TEST_PAGE_SIZE, pageable.getPageSize());
    assertTrue(pageable.getSort().isSorted());

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .getAllSeriesAndVolumesForPublisher(TEST_PUBLISHER, pageable);
  }

  @Test
  public void testGetAllSeriesAndVolumes() {
    Mockito.when(comicBookRepository.getAllSeriesAndVolumes()).thenReturn(seriesDetailList);

    final List<SeriesDetail> result = service.getAllSeriesAndVolumes();

    assertSame(seriesDetailList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).getAllSeriesAndVolumes();
  }

  @Test
  public void testGetUnscrapedComicCount() {
    Mockito.when(comicBookRepository.getUnscrapedComicCount()).thenReturn(TEST_COMIC_COUNT);

    final long result = service.getUnscrapedComicCount();

    assertEquals(TEST_COMIC_COUNT, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).getUnscrapedComicCount();
  }

  @Test
  public void testGetComicBooksWithoutDetails() {
    Mockito.when(comicBookRepository.getComicBooksWithoutDetails(Mockito.anyInt()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.getComicBooksWithoutDetails(TEST_BATCH_CHUNK_SIZE);

    assertNotNull(result);
    assertSame(comicBookList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .getComicBooksWithoutDetails(TEST_BATCH_CHUNK_SIZE);
  }

  @Test
  public void testPrepareForMetadataUpdate() {
    service.prepareForMetadataUpdate(idList);

    Mockito.verify(comicBookRepository, Mockito.times(1)).prepareForMetadataUpdate(idList);
  }

  @Test
  public void testPrepareForOrganization() {
    service.prepareForOrganization(idList);

    Mockito.verify(comicBookRepository, Mockito.times(1)).markForOrganizationById(idList);
    Mockito.verify(applicationEventPublisher, Mockito.times(1))
        .publishEvent(OrganizingLibraryEvent.instance);
  }

  @Test
  public void testPrepareAllForOrganization() {
    service.prepareAllForOrganization();

    Mockito.verify(comicBookRepository, Mockito.times(1)).markAllForOrganization();
    Mockito.verify(applicationEventPublisher, Mockito.times(1))
        .publishEvent(OrganizingLibraryEvent.instance);
  }

  @Test
  public void testPrepareForRecreation() {
    service.prepareForRecreation(idList, targetArchiveType, TEST_RENAME_PAGES, TEST_DELETE_PAGES);

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .markForRecreationById(idList, targetArchiveType, TEST_RENAME_PAGES, TEST_DELETE_PAGES);
  }

  @Test
  public void testGetUnprocessedComicBookCount() {
    Mockito.when(comicBookRepository.getUnprocessedComicBookCount()).thenReturn(TEST_COMIC_COUNT);

    final long result = service.getUnprocessedComicBookCount();

    assertEquals(TEST_COMIC_COUNT, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).getUnprocessedComicBookCount();
  }

  @Test
  public void testGetAllIds() {
    comicBookList.add(comicBook);
    Mockito.when(comicBookRepository.getAllIds()).thenReturn(idList);

    final List<Long> result = service.getAllIds();

    assertNotNull(result);
    assertSame(idList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).getAllIds();
  }

  @Test
  public void testGetUpdateMetatdataCount() {
    Mockito.when(comicBookRepository.getUpdateMetadataCount()).thenReturn(TEST_COMIC_COUNT);

    final long result = service.getUpdateMetadataCount();

    assertEquals(TEST_COMIC_COUNT, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).getUpdateMetadataCount();
  }

  @Test
  public void testGetRecreatingCount() {
    Mockito.when(comicBookRepository.getRecreatingCount()).thenReturn(TEST_COMIC_COUNT);

    final long result = service.getRecreatingCount();

    assertEquals(TEST_COMIC_COUNT, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).getRecreatingCount();
  }

  @Test
  public void testLoadByComicBookIdForPageAndSize() {
    Mockito.when(comicBookRepository.loadByComicDetailId(Mockito.anyList()))
        .thenReturn(comicBookList);

    final List<ComicBook> result =
        service.loadByComicBookId(idList, TEST_PAGE_SIZE, TEST_PAGE_NUMBER);

    assertNotNull(result);
    assertSame(comicBookList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).loadByComicDetailId(idList);
  }

  @Test
  public void testLoadByComicBookIdForPageTooBig() {
    Mockito.when(comicBookRepository.loadByComicDetailId(Mockito.anyList()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.loadByComicBookId(idList, idList.size() + 1, 0);

    assertNotNull(result);
    assertSame(comicBookList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).loadByComicDetailId(idList);
  }

  @Test
  public void testLoadByComicBookIdForPageAndSizeNotEnoughComics() {
    Mockito.when(comicBookRepository.loadByComicDetailId(Mockito.anyList()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.loadByComicBookId(idList, idList.size(), 1);

    assertNotNull(result);
    assertSame(comicBookList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).loadByComicDetailId(idList);
  }

  @Test
  public void testGetAllComicDetails_missingFiles() {
    Mockito.when(comicBookRepository.getComicFilenames(true)).thenReturn(comicFilenameList);

    final Set<String> result = service.getAllComicDetails(true);

    assertNotNull(result);
    assertSame(comicFilenameList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).getComicFilenames(true);
  }

  @Test
  public void testGetAllComicDetails_notMissingFiles() {
    Mockito.when(comicBookRepository.getComicFilenames(false)).thenReturn(comicFilenameList);

    final Set<String> result = service.getAllComicDetails(false);

    assertNotNull(result);
    assertSame(comicFilenameList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).getComicFilenames(false);
  }

  @Test
  public void testMarkComicAsFound() {
    Mockito.when(comicBookRepository.findByFilename(Mockito.anyString())).thenReturn(comicBook);

    service.markComicAsFound(TEST_COMIC_FILENAME);

    Mockito.verify(comicBookRepository, Mockito.times(1)).findByFilename(TEST_COMIC_FILENAME);
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(comicBook, ComicEvent.markAsFound);
  }

  @Test
  public void testMarkComicAsMissing() {
    Mockito.when(comicBookRepository.findByFilename(Mockito.anyString())).thenReturn(comicBook);

    service.markComicAsMissing(TEST_COMIC_FILENAME);

    Mockito.verify(comicBookRepository, Mockito.times(1)).findByFilename(TEST_COMIC_FILENAME);
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(comicBook, ComicEvent.markAsMissing);
  }

  @Test
  public void testGetBatchScrapingCount() {
    Mockito.when(comicBookRepository.getBatchScrapingCount()).thenReturn(TEST_COMIC_COUNT);

    final long result = service.getBatchScrapingCount();

    assertEquals(TEST_COMIC_COUNT, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).getBatchScrapingCount();
  }

  @Test
  public void testFindBatchScrapingComics() {
    Mockito.when(comicBookRepository.findBatchScrapingComics(pageableCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.findBatchScrapingComics(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicBookList, result);

    final Pageable pageable = pageableCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    Mockito.verify(comicBookRepository, Mockito.times(1)).findBatchScrapingComics(pageable);
  }

  @Test
  public void testMarkComicBooksForBatchScraping() {
    service.markComicBooksForBatchScraping(idList);

    Mockito.verify(comicBookRepository, Mockito.times(1)).prepareForBatchScraping(idList);
  }

  @Test
  public void testGetSeriesCountForPublisher() {
    Mockito.when(comicDetailRepository.getSeriesCountForPublisher(Mockito.anyString()))
        .thenReturn(TEST_COMIC_COUNT);

    final long result = service.getSeriesCountForPublisher(TEST_PUBLISHER);

    assertEquals(TEST_COMIC_COUNT, result);

    Mockito.verify(comicDetailRepository, Mockito.times(1))
        .getSeriesCountForPublisher(TEST_PUBLISHER);
  }
}

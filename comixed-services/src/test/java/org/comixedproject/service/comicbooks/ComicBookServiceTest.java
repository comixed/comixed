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
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

import java.util.*;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.adaptors.comicbooks.ComicBookMetadataAdaptor;
import org.comixedproject.adaptors.comicbooks.ComicFileAdaptor;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.batch.OrganizingLibraryEvent;
import org.comixedproject.model.batch.UpdateMetadataEvent;
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
import org.comixedproject.state.comicbooks.ComicBookStateAdaptor;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Limit;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ComicBookServiceTest {
  private static final long TEST_COMIC_BOOK_ID = 5;
  private static final String TEST_COMIC_FILENAME = "src/test/resources/example.cbz";
  private static final String TEST_STANDARDIZED_FILENAME =
      "src/test/resources/standardized-example.cbz";
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
  private static final ArchiveType TEST_TARGET_ARCHIVE_TYPE = ArchiveType.CB7;
  private static final long TEST_COMIC_DETAIL_ID = 96237L;

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
  @Mock private ComicBookStateAdaptor comicBookStateAdaptor;
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
  @Mock private List<SeriesDetail> publisherDetail;
  @Mock private List<SeriesDetail> seriesDetailList;
  @Mock private ComicBook savedComicBook;
  @Mock private ArchiveType targetArchiveType;

  @Captor private ArgumentCaptor<Pageable> pageableCaptor;
  @Captor private ArgumentCaptor<PageRequest> pageRequestCaptor;
  @Captor private ArgumentCaptor<Limit> previousComicBookLimitArgumentCaptor;
  @Captor private ArgumentCaptor<Limit> nextComicBookLimitArgumentCaptor;
  @Captor private ArgumentCaptor<Date> dateArgumentCaptor;

  private Set<String> comicFilenameList = new HashSet<>();

  @BeforeEach
  void setUp() {
    when(comicDetail.getFilename()).thenReturn(TEST_COMIC_FILENAME);
    when(comicBook.getComicDetail()).thenReturn(comicDetail);
    when(comicBook.getComicBookId()).thenReturn(TEST_COMIC_BOOK_ID);
    when(comicBook.getComicDetail()).thenReturn(comicDetail);
    when(incomingComicBook.getComicDetail()).thenReturn(incomingComicDetail);

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
  void getComic() throws ComicBookException {
    when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(currentComicBook);
    when(comicBookRepository.findPreviousComicBookIdInSeries(
            Mockito.anyString(),
            Mockito.anyString(),
            Mockito.anyString(),
            Mockito.any(Date.class),
            previousComicBookLimitArgumentCaptor.capture()))
        .thenReturn(TEST_PREVIOUS_ISSUE_NUMBER);
    when(comicBookRepository.findNextComicBookIdInSeries(
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

    verify(comicBookRepository).getById(TEST_COMIC_BOOK_ID);
    verify(comicBookRepository)
        .findPreviousComicBookIdInSeries(
            TEST_SERIES,
            TEST_VOLUME,
            TEST_CURRENT_ISSUE_NUMBER,
            TEST_COVER_DATE,
            previousComicBookLimit);
    verify(comicBookRepository)
        .findNextComicBookIdInSeries(
            TEST_SERIES,
            TEST_VOLUME,
            TEST_CURRENT_ISSUE_NUMBER,
            TEST_COVER_DATE,
            nextComicBookLimit);
  }

  @Test
  void deleteComicBook_notFound() {
    when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);

    assertThrows(ComicBookException.class, () -> service.deleteComicBook(TEST_COMIC_BOOK_ID));
  }

  @Test
  void deleteComicBook() throws ComicBookException {
    when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);
    when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBookRecord);

    final ComicBook result = service.deleteComicBook(TEST_COMIC_BOOK_ID);

    assertNotNull(result);
    assertSame(comicBookRecord, result);

    verify(comicBookRepository, times(2)).getById(TEST_COMIC_BOOK_ID);
    verify(comicBookStateAdaptor).fireEvent(comicBookRecord, ComicEvent.markComicForRemoval);
  }

  @Test
  void restoreComicBook_notFound() {
    when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);

    assertThrows(ComicBookException.class, () -> service.undeleteComicBook(TEST_COMIC_BOOK_ID));
  }

  @Test
  void restoreComic() throws ComicBookException {
    when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);
    when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBookRecord);

    final ComicBook response = service.undeleteComicBook(TEST_COMIC_BOOK_ID);

    assertNotNull(response);
    assertSame(comicBookRecord, response);

    verify(comicBookRepository, times(2)).getById(TEST_COMIC_BOOK_ID);
    verify(comicBookStateAdaptor).fireEvent(comicBookRecord, ComicEvent.unmarkComicForRemoval);
  }

  @Test
  void GetComicContentNoSuchComicBook() {
    when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);

    assertThrows(ComicBookException.class, () -> this.service.getComicContent(TEST_COMIC_BOOK_ID));
  }

  @Test
  void getComicContentFileNotFound() {
    when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);
    when(comicDetail.getFilename()).thenReturn(TEST_COMIC_FILENAME.substring(1));

    assertThrows(ComicBookException.class, () -> this.service.getComicContent(TEST_COMIC_BOOK_ID));
  }

  @Test
  void getComicContent() throws ComicBookException {
    when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);
    when(comicDetail.getFilename()).thenReturn(TEST_COMIC_FILENAME);

    final DownloadDocument result = this.service.getComicContent(TEST_COMIC_BOOK_ID);

    assertNotNull(result);
    assertEquals(FilenameUtils.getName(TEST_COMIC_FILENAME), result.getFilename());
    assertNotNull(result.getContent());
    assertTrue(result.getContent().length > 0);

    verify(comicBookRepository, Mockito.atLeast(1)).getById(TEST_COMIC_BOOK_ID);
    verify(fileTypeAdaptor).getMimeTypeFor(Mockito.any());
  }

  @Test
  void updateComicInvalidComic() {
    when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);

    assertThrows(
        ComicBookException.class,
        () ->
            service.updateComic(
                TEST_COMIC_BOOK_ID,
                TEST_COMIC_TYPE,
                TEST_PUBLISHER,
                TEST_SERIES,
                TEST_VOLUME,
                TEST_ISSUE_NUMBER,
                TEST_IMPRINT,
                TEST_SORTABLE_NAME,
                TEST_TITLE,
                TEST_COVER_DATE,
                TEST_STORE_DATE));
  }

  @Test
  void updateComic() throws ComicBookException {
    when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);
    when(incomingComicDetail.getComicType()).thenReturn(TEST_COMIC_TYPE);
    when(incomingComicDetail.getPublisher()).thenReturn(TEST_PUBLISHER);
    when(incomingComicDetail.getImprint()).thenReturn(TEST_IMPRINT);
    when(incomingComicDetail.getSeries()).thenReturn(TEST_SERIES);
    when(incomingComicDetail.getVolume()).thenReturn(TEST_VOLUME);
    when(incomingComicDetail.getIssueNumber()).thenReturn(TEST_ISSUE_NUMBER);
    when(incomingComicDetail.getSortName()).thenReturn(TEST_SORTABLE_NAME);
    when(incomingComicDetail.getTitle()).thenReturn(TEST_TITLE);
    when(incomingComicDetail.getDescription()).thenReturn(TEST_DESCRIPTION);
    when(incomingComicDetail.getCoverDate()).thenReturn(TEST_COVER_DATE);
    when(incomingComicDetail.getStoreDate()).thenReturn(TEST_STORE_DATE);
    when(incomingComicDetail.getNotes()).thenReturn(TEST_NOTES);

    final ComicBook result =
        service.updateComic(
            TEST_COMIC_BOOK_ID,
            TEST_COMIC_TYPE,
            TEST_PUBLISHER,
            TEST_SERIES,
            TEST_VOLUME,
            TEST_ISSUE_NUMBER,
            TEST_IMPRINT,
            TEST_SORTABLE_NAME,
            TEST_TITLE,
            TEST_COVER_DATE,
            TEST_STORE_DATE);

    assertNotNull(result);
    assertSame(comicBook, result);

    verify(comicBookRepository, times(2)).getById(TEST_COMIC_BOOK_ID);
    verify(comicDetail).setComicType(TEST_COMIC_TYPE);
    verify(comicDetail).setPublisher(TEST_PUBLISHER);
    verify(comicDetail).setImprint(TEST_IMPRINT);
    verify(comicDetail).setSeries(TEST_SERIES);
    verify(comicDetail).setVolume(TEST_VOLUME);
    verify(comicDetail).setIssueNumber(TEST_ISSUE_NUMBER);
    verify(comicDetail).setSortName(TEST_SORTABLE_NAME);
    verify(comicDetail).setTitle(TEST_TITLE);
    verify(comicDetail).setCoverDate(TEST_COVER_DATE);
    verify(comicDetail).setStoreDate(TEST_STORE_DATE);
    verify(comicBookStateAdaptor).fireEvent(comicBook, ComicEvent.comicMetadataChanged);
    verify(imprintService).update(comicBook);
  }

  @Test
  void save() {
    Mockito.doNothing().when(comicDetail).setLastModifiedDate(dateArgumentCaptor.capture());
    when(comicBookRepository.saveAndFlush(Mockito.any(ComicBook.class))).thenReturn(savedComicBook);

    final ComicBook result = this.service.save(comicBook);

    assertNotNull(result);
    assertSame(savedComicBook, result);

    final Date lastModifiedDate = dateArgumentCaptor.getValue();
    assertNotNull(lastModifiedDate);

    verify(comicFileAdaptor).standardizeFilename(TEST_COMIC_FILENAME);
    verify(comicDetail).setLastModifiedDate(lastModifiedDate);
    verify(comicBookRepository).saveAndFlush(comicBook);
  }

  @Test
  void delete() {
    Mockito.doNothing()
        .when(comicTagRepository)
        .deleteAllByComicDetail(Mockito.any(ComicDetail.class));
    Mockito.doNothing().when(comicBookRepository).delete(Mockito.any(ComicBook.class));

    service.deleteComicBook(comicBook);

    verify(comicTagRepository).deleteAllByComicDetail(comicDetail);
    verify(comicBookRepository).delete(comicBook);
  }

  @Test
  void findComicsToMove() {
    when(comicBookRepository.findComicsToMove(pageRequestCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.findComicsToMove(TEST_PAGE_NUMBER, TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicBookList, result);

    assertNotNull(pageRequestCaptor.getValue());
    final PageRequest request = pageRequestCaptor.getValue();
    assertEquals(TEST_PAGE_NUMBER, request.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, request.getPageSize());

    verify(comicBookRepository).findComicsToMove(pageRequestCaptor.getValue());
  }

  @Test
  void findByFilename() {
    when(comicBookRepository.findByFilename(TEST_COMIC_FILENAME)).thenReturn(comicBook);

    final ComicBook result = service.findByFilename(TEST_COMIC_FILENAME);

    assertNotNull(result);
    assertSame(comicBook, result);

    verify(comicBookRepository).findByFilename(TEST_COMIC_FILENAME);
  }

  @Test
  void deleteMetadataInvalidComicId() {
    when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);

    assertThrows(ComicBookException.class, () -> service.deleteMetadata(TEST_COMIC_BOOK_ID));
  }

  @Test
  void deleteMetadata() throws ComicBookException {
    when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook, comicBookRecord);

    final ComicBook result = service.deleteMetadata(TEST_COMIC_BOOK_ID);

    assertNotNull(result);
    assertSame(comicBookRecord, result);

    verify(comicBookRepository, times(2)).getById(TEST_COMIC_BOOK_ID);
    verify(comicBookMetadataAdaptor).clear(comicBook);
    verify(comicBookStateAdaptor).fireEvent(comicBook, ComicEvent.comicMetadataCleared);
  }

  @Test
  void getComicsWithoutContentCount() {
    when(comicBookRepository.findUnprocessedComicsWithoutContentCount())
        .thenReturn(TEST_MAXIMUM_COMICS);

    final long result = service.getComicsWithoutContentCount();

    assertEquals(TEST_MAXIMUM_COMICS, result);

    verify(comicBookRepository).findUnprocessedComicsWithoutContentCount();
  }

  @Test
  void findComicsWithCreateMetadataFlagSet() {
    when(comicBookRepository.findUnprocessedComicsWithCreateMetadataFlagSet(
            pageableCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.findComicsWithCreateMetadataFlagSet(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicBookList, result);

    final Pageable pageable = pageableCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    verify(comicBookRepository).findUnprocessedComicsWithCreateMetadataFlagSet(pageable);
  }

  @Test
  void findComicsWithContentToLoad() {
    when(comicBookRepository.findComicsWithContentToLoad(pageableCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.findComicsWithContentToLoad(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicBookList, result);

    final Pageable pageable = pageableCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    verify(comicBookRepository).findComicsWithContentToLoad(pageable);
  }

  @Test
  void findProcessedComics() {
    when(comicBookRepository.findProcessedComics()).thenReturn(comicBookList);

    final List<ComicBook> result = service.findProcessedComics();

    assertNotNull(result);
    assertSame(comicBookList, result);

    verify(comicBookRepository).findProcessedComics();
  }

  @Test
  void prepareForRescan() {
    for (long index = 0L; index < 25L; index++) idList.add(index + 100);

    when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);

    service.prepareForRescan(idList);

    idList.forEach(id -> verify(comicBookRepository).getById(id.longValue()));
    verify(comicBookStateAdaptor, times(idList.size()))
        .fireEvent(comicBook, ComicEvent.rescanComicBookFile);
  }

  @Test
  void prepareForRescanNoSuchComic() {
    idList.add(TEST_COMIC_BOOK_ID);

    when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);

    service.prepareForRescan(idList);

    idList.forEach(id -> verify(comicBookRepository).getById(id.longValue()));
    verify(comicBookStateAdaptor, never()).fireEvent(comicBook, ComicEvent.rescanComicBookFile);
  }

  @Test
  void getCountForState() {
    for (int index = 0; index < 50; index++) comicBookList.add(comicBook);

    when(comicBookRepository.findForStateCount(Mockito.any(ComicState.class)))
        .thenReturn(TEST_COMIC_COUNT);

    final long result = service.getCountForState(TEST_STATE);

    assertEquals(TEST_COMIC_COUNT, result);

    verify(comicBookRepository).findForStateCount(TEST_STATE);
  }

  @Test
  void findComicsWithMetadataToUpdate() {
    when(comicBookRepository.findComicsWithMetadataToUpdate(pageableCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.findComicsWithMetadataToUpdate(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicBookList, result);

    final Pageable pageable = pageableCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    verify(comicBookRepository).findComicsWithMetadataToUpdate(pageable);
  }

  @Test
  void findComicsForBatchMetadataUpdate() {
    when(comicBookRepository.findComicsForBatchMetadataUpdate(pageableCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.findComicsForBatchMetadataUpdate(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicBookList, result);

    final Pageable pageable = pageableCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    verify(comicBookRepository).findComicsForBatchMetadataUpdate(pageable);
  }

  @Test
  void findComicsForBatchMetadataUpdateCount() {
    when(comicBookRepository.findComicsForBatchMetadataUpdateCount()).thenReturn(TEST_COMIC_COUNT);

    final long result = service.findComicsForBatchMetadataUpdateCount();

    assertEquals(TEST_COMIC_COUNT, result);

    verify(comicBookRepository).findComicsForBatchMetadataUpdateCount();
  }

  @Test
  void getComicBooksToBePurgedCount() {
    when(comicBookRepository.findComicsToPurgeCount()).thenReturn(TEST_COMIC_COUNT);

    final long result = service.findComicsToPurgeCount();

    assertEquals(TEST_COMIC_COUNT, result);

    verify(comicBookRepository).findComicsToPurgeCount();
  }

  @Test
  void findAllComicsMarkedForDeletion() {
    service.prepareComicBooksForDeleting();

    verify(comicBookRepository).prepareComicBooksForDeleting();
  }

  @Test
  void findComicsToRecreateCount() {
    when(comicBookRepository.findComicsToBeRecreatedCount()).thenReturn(TEST_COMIC_COUNT);

    final long result = service.findComicsToRecreateCount();

    assertEquals(TEST_COMIC_COUNT, result);

    verify(comicBookRepository).findComicsToBeRecreatedCount();
  }

  @Test
  void FindComicsToPurgeCount() {
    when(comicBookRepository.findComicsToPurgeCount()).thenReturn(TEST_COMIC_COUNT);

    final long result = service.findComicsToPurgeCount();

    assertEquals(TEST_COMIC_COUNT, result);

    verify(comicBookRepository).findComicsToPurgeCount();
  }

  @Test
  void findAll() {
    when(comicBookRepository.findAll()).thenReturn(comicBookList);

    final List<ComicBook> result = service.findAll();

    assertNotNull(result);
    assertSame(comicBookList, result);

    verify(comicBookRepository).findAll();
  }

  @Test
  void deleteComicBooksByIdInvalidId() {
    idList.clear();
    idList.add(TEST_COMIC_BOOK_ID);

    when(comicBookRepository.getByComicDetailId(Mockito.anyLong())).thenReturn(null);

    service.deleteComicBooksById(idList);

    verify(comicBookRepository, times(idList.size())).getByComicDetailId(TEST_COMIC_BOOK_ID);
  }

  @Test
  void deleteComicBooksById() {
    idList.clear();
    idList.add(TEST_COMIC_BOOK_ID);

    when(comicBookRepository.getByComicDetailId(Mockito.anyLong())).thenReturn(comicBook);

    service.deleteComicBooksById(idList);

    verify(comicBookRepository, times(idList.size())).getByComicDetailId(TEST_COMIC_BOOK_ID);
    verify(comicBookStateAdaptor, times(idList.size()))
        .fireEvent(comicBook, ComicEvent.markComicForRemoval);
  }

  @Test
  void undeleteComicBookByIdInvalidId() {
    idList.add(TEST_COMIC_BOOK_ID);

    when(comicBookRepository.getByComicDetailId(Mockito.anyLong())).thenReturn(null);

    service.undeleteComicBooksById(idList);

    verify(comicBookRepository, times(idList.size())).getByComicDetailId(TEST_COMIC_BOOK_ID);
  }

  @Test
  void undeleteComicBooksById() {
    idList.add(TEST_COMIC_BOOK_ID);

    when(comicBookRepository.getByComicDetailId(Mockito.anyLong())).thenReturn(comicBook);

    service.undeleteComicBooksById(idList);

    verify(comicBookRepository, times(idList.size())).getByComicDetailId(TEST_COMIC_BOOK_ID);
    verify(comicBookStateAdaptor, times(idList.size()))
        .fireEvent(comicBook, ComicEvent.unmarkComicForRemoval);
  }

  @Test
  void findAllComicsToRecreate() {
    when(comicBookRepository.findComicsToRecreate(pageableCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.findComicsToRecreate(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicBookList, result);

    final Pageable pageable = pageableCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    verify(comicBookRepository).findComicsToRecreate(pageable);
  }

  @Test
  void findComicNotFound() {
    when(comicBookRepository.findComic(
            Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(Collections.emptyList());

    final List<ComicBook> result =
        service.findComic(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER);

    assertNotNull(result);
    assertTrue(result.isEmpty());

    verify(comicBookRepository)
        .findComic(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER);
  }

  @Test
  void findComic() {
    comicBookList.add(comicBook);

    when(comicBookRepository.findComic(
            Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(comicBookList);

    final List<ComicBook> result =
        service.findComic(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER);

    assertNotNull(result);
    assertSame(comicBookList, result);

    verify(comicBookRepository)
        .findComic(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER);
  }

  @Test
  void findSeries() {
    when(comicBookRepository.findDistinctSeries()).thenReturn(collectionList);

    final List<String> result = service.getAllSeries();

    assertNotNull(result);
    assertSame(collectionList, result);

    verify(comicBookRepository).findDistinctSeries();
  }

  @Test
  void getAllPublishersForStory() {
    when(comicBookRepository.findDistinctPublishersForStory(Mockito.anyString()))
        .thenReturn(publisherList);

    final List<String> result = service.getAllPublishersForStory(TEST_STORY_NAME);

    assertNotNull(result);
    assertSame(publisherList, result);

    verify(comicBookRepository).findDistinctPublishersForStory(TEST_STORY_NAME);
  }

  @Test
  void findComicsMarkedForPurging() {
    when(comicBookRepository.findComicsMarkedForPurging(pageableCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.findComicsMarkedForPurging(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicBookList, result);

    final Pageable pageable = pageableCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    verify(comicBookRepository).findComicsMarkedForPurging(pageable);
  }

  @Test
  void savePageOrder_invalidId() {
    List<PageOrderEntry> entryList = new ArrayList<>();
    when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);

    assertThrows(
        ComicBookException.class, () -> service.savePageOrder(TEST_COMIC_BOOK_ID, entryList));
  }

  @Test
  void savePageOrder_containsGap() throws ComicBookException {
    List<PageOrderEntry> entryList = new ArrayList<>();
    List<ComicPage> pageList = new ArrayList<>();
    for (int index = 0; index < 25; index++) {
      entryList.add(new PageOrderEntry(String.format("filename-%d", index), index));
      if (index % 2 == 0) {
        final String filename = String.format("filename-%d", index);
        final ComicPage page = new ComicPage();
        page.setFilename(filename);
        pageList.add(page);
      }
    }

    when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);
    when(comicBook.getPages()).thenReturn(pageList);

    service.savePageOrder(TEST_COMIC_BOOK_ID, entryList);

    verify(comicBookStateAdaptor).fireEvent(comicBook, ComicEvent.comicMetadataChanged);
  }

  @Test
  void savePageOrder_missingFilename() {
    List<PageOrderEntry> entryList = new ArrayList<>();
    List<ComicPage> pageList = new ArrayList<>();
    for (int index = 0; index < 25; index++) {
      final String filename = String.format("filename-%d", index);
      entryList.add(new PageOrderEntry(filename, 24 - index));
      final ComicPage page = new ComicPage();
      page.setFilename(filename.substring(1));
      pageList.add(page);
    }

    when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);
    when(comicBook.getPages()).thenReturn(pageList);

    assertThrows(
        ComicBookException.class, () -> service.savePageOrder(TEST_COMIC_BOOK_ID, entryList));
  }

  @Test
  void savePageOrder() throws ComicBookException {
    List<PageOrderEntry> entryList = new ArrayList<>();
    List<ComicPage> pageList = new ArrayList<>();
    for (int index = 0; index < 25; index++) {
      final String filename = String.format("filename-%d", index);
      entryList.add(new PageOrderEntry(filename, 24 - index));
      final ComicPage page = new ComicPage();
      page.setFilename(filename);
      pageList.add(page);
    }

    when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);
    when(comicBook.getPages()).thenReturn(pageList);

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

    verify(comicBookRepository).getById(TEST_COMIC_BOOK_ID);
    verify(comicBookStateAdaptor).fireEvent(comicBook, ComicEvent.comicMetadataChanged);
  }

  @Test
  void updateMultipleComics_invalidId() {
    idList.add(TEST_COMIC_BOOK_ID);

    when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);

    assertThrows(ComicBookException.class, () -> service.updateMultipleComics(idList));
  }

  @Test
  void updateMultipleComics() throws ComicBookException {
    idList.add(TEST_COMIC_BOOK_ID);

    when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);

    service.updateMultipleComics(idList);

    verify(comicBookStateAdaptor).fireEvent(comicBook, ComicEvent.prepareComicsForBatchEditing);
  }

  @Test
  void getComicBookCount() {
    when(comicBookRepository.count()).thenReturn(TEST_COMIC_COUNT);

    final long result = service.getComicBookCount();

    assertEquals(TEST_COMIC_COUNT, result);

    verify(comicBookRepository).count();
  }

  @Test
  void getDeletedComicBookCount() {
    when(comicBookRepository.findForStateCount(Mockito.any())).thenReturn(TEST_COMIC_COUNT);

    final long result = service.getDeletedComicCount();

    assertEquals(TEST_COMIC_COUNT, result);

    verify(comicBookRepository).findForStateCount(ComicState.DELETED);
  }

  @Test
  void getPublishersState() {
    when(comicBookRepository.getPublishersState()).thenReturn(librarySegmentList);

    final List<RemoteLibrarySegmentState> result = service.getPublishersState();

    assertNotNull(result);
    assertSame(librarySegmentList, result);

    verify(comicBookRepository).getPublishersState();
  }

  @Test
  void getSeriesState() {
    when(comicBookRepository.getSeriesState()).thenReturn(librarySegmentList);

    final List<RemoteLibrarySegmentState> result = service.getSeriesState();

    assertNotNull(result);
    assertSame(librarySegmentList, result);

    verify(comicBookRepository).getSeriesState();
  }

  @Test
  void getCharactersState() {
    when(comicBookRepository.getCharactersState()).thenReturn(librarySegmentList);

    final List<RemoteLibrarySegmentState> result = service.getCharactersState();

    assertNotNull(result);
    assertSame(librarySegmentList, result);

    verify(comicBookRepository).getCharactersState();
  }

  @Test
  void getTeamsState() {
    when(comicBookRepository.getTeamsState()).thenReturn(librarySegmentList);

    final List<RemoteLibrarySegmentState> result = service.getTeamsState();

    assertNotNull(result);
    assertSame(librarySegmentList, result);

    verify(comicBookRepository).getTeamsState();
  }

  @Test
  void getLocationsState() {
    when(comicBookRepository.getLocationsState()).thenReturn(librarySegmentList);

    final List<RemoteLibrarySegmentState> result = service.getLocationsState();

    assertNotNull(result);
    assertSame(librarySegmentList, result);

    verify(comicBookRepository).getLocationsState();
  }

  @Test
  void getStoriesState() {
    when(comicBookRepository.getStoriesState()).thenReturn(librarySegmentList);

    final List<RemoteLibrarySegmentState> result = service.getStoriesState();

    assertNotNull(result);
    assertSame(librarySegmentList, result);

    verify(comicBookRepository).getStoriesState();
  }

  @Test
  void getComicBooksState() {
    when(comicBookRepository.getComicBooksState()).thenReturn(librarySegmentList);

    final List<RemoteLibrarySegmentState> result = service.getComicBooksState();

    assertNotNull(result);
    assertSame(librarySegmentList, result);

    verify(comicBookRepository).getComicBooksState();
  }

  @Test
  void getComicBookArchiveTypes() {
    when(comicBookRepository.getComicBookArchiveTypes()).thenReturn(librarySegmentList);

    final List<RemoteLibrarySegmentState> result = service.getComicBookArchiveTypes();

    assertNotNull(result);
    assertSame(librarySegmentList, result);

    verify(comicBookRepository).getComicBookArchiveTypes();
  }

  @Test
  void getByPublisherAndYear() {
    when(comicBookRepository.getByPublisherAndYear()).thenReturn(byPublisherAndYearList);

    final List<PublisherAndYearSegment> result = service.getByPublisherAndYear();

    assertNotNull(result);
    assertSame(byPublisherAndYearList, result);

    verify(comicBookRepository).getByPublisherAndYear();
  }

  @Test
  void markComicsForBatchMetadataUpdate_invalidId() {
    idList.add(TEST_COMIC_BOOK_ID);

    when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);

    assertThrows(
        ComicBookException.class, () -> service.markComicBooksForBatchMetadataUpdate(idList));
  }

  @Test
  void markComicsForBatchMetadataUpdate() throws ComicBookException {
    idList.add(TEST_COMIC_BOOK_ID);

    when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);

    service.markComicBooksForBatchMetadataUpdate(idList);

    verify(comicBookRepository).getById(TEST_COMIC_BOOK_ID);
    verify(comicBook).setBatchMetadataUpdate(true);
    verify(comicBookRepository).save(comicBook);
    verify(applicationEventPublisher).publishEvent(UpdateMetadataEvent.instance);
  }

  @Test
  void getComicBookssForSearchTerms() {
    when(comicBookRepository.findForSearchTerms(Mockito.anyString())).thenReturn(comicDetailList);

    final List<ComicDetail> result = service.getComicBooksForSearchTerms(TEST_SEARCH_TERMS);

    assertNotNull(result);

    verify(comicBookRepository).findForSearchTerms(TEST_SEARCH_TERMS);
  }

  @Test
  void findComicsWithEditDetails() {
    when(comicBookRepository.findComicsWithEditDetails(pageableCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.findComicsWithEditDetails(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicBookList, result);

    final Pageable pageable = pageableCaptor.getValue();
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    verify(comicBookRepository).findComicsWithEditDetails(pageable);
  }

  @Test
  void getPublisherDetail_unsorted() {
    when(comicBookRepository.getAllSeriesAndVolumesForPublisher(
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

    verify(comicBookRepository).getAllSeriesAndVolumesForPublisher(TEST_PUBLISHER, pageable);
  }

  @Test
  void getPublisherDetail_ascendingNameSort() {
    when(comicBookRepository.getAllSeriesAndVolumesForPublisher(
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

    verify(comicBookRepository).getAllSeriesAndVolumesForPublisher(TEST_PUBLISHER, pageable);
  }

  @Test
  void getPublisherDetail_descendingNameSort() {
    when(comicBookRepository.getAllSeriesAndVolumesForPublisher(
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

    verify(comicBookRepository).getAllSeriesAndVolumesForPublisher(TEST_PUBLISHER, pageable);
  }

  @Test
  void getPublisherDetail_ascendingVolumeSort() {
    when(comicBookRepository.getAllSeriesAndVolumesForPublisher(
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

    verify(comicBookRepository).getAllSeriesAndVolumesForPublisher(TEST_PUBLISHER, pageable);
  }

  @Test
  void getPublisherDetail_descendingVolumeSort() {
    when(comicBookRepository.getAllSeriesAndVolumesForPublisher(
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

    verify(comicBookRepository).getAllSeriesAndVolumesForPublisher(TEST_PUBLISHER, pageable);
  }

  @Test
  void getAllSeriesAndVolumes() {
    when(comicBookRepository.getAllSeriesAndVolumes()).thenReturn(seriesDetailList);

    final List<SeriesDetail> result = service.getAllSeriesAndVolumes();

    assertSame(seriesDetailList, result);

    verify(comicBookRepository).getAllSeriesAndVolumes();
  }

  @Test
  void getUnscrapedComicCount() {
    when(comicBookRepository.getUnscrapedComicCount()).thenReturn(TEST_COMIC_COUNT);

    final long result = service.getUnscrapedComicCount();

    assertEquals(TEST_COMIC_COUNT, result);

    verify(comicBookRepository).getUnscrapedComicCount();
  }

  @Test
  void getComicBooksWithoutDetails() {
    when(comicBookRepository.getComicBooksWithoutDetails(Mockito.anyInt()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.getComicBooksWithoutDetails(TEST_BATCH_CHUNK_SIZE);

    assertNotNull(result);
    assertSame(comicBookList, result);

    verify(comicBookRepository).getComicBooksWithoutDetails(TEST_BATCH_CHUNK_SIZE);
  }

  @Test
  void prepareForMetadataUpdate() {
    service.prepareForMetadataUpdate(idList);

    verify(comicBookRepository).prepareForMetadataUpdate(idList);
  }

  @Test
  void prepareForOrganization() {
    service.prepareForOrganization(idList);

    verify(comicBookRepository).markForOrganizationById(idList);
    verify(applicationEventPublisher).publishEvent(OrganizingLibraryEvent.instance);
  }

  @Test
  void prepareAllForOrganization() {
    service.prepareAllForOrganization();

    verify(comicBookRepository).markAllForOrganization();
    verify(applicationEventPublisher).publishEvent(OrganizingLibraryEvent.instance);
  }

  @Test
  void prepareForRecreation() {
    service.prepareForRecreation(idList, targetArchiveType);

    verify(comicBookRepository).markForRecreationById(idList, targetArchiveType);
  }

  @Test
  void getUnprocessedComicBookCount() {
    when(comicBookRepository.getUnprocessedComicBookCount()).thenReturn(TEST_COMIC_COUNT);

    final long result = service.getUnprocessedComicBookCount();

    assertEquals(TEST_COMIC_COUNT, result);

    verify(comicBookRepository).getUnprocessedComicBookCount();
  }

  @Test
  void getUpdateMetatdataCount() {
    when(comicBookRepository.getUpdateMetadataCount()).thenReturn(TEST_COMIC_COUNT);

    final long result = service.getUpdateMetadataCount();

    assertEquals(TEST_COMIC_COUNT, result);

    verify(comicBookRepository).getUpdateMetadataCount();
  }

  @Test
  void getRecreatingCount() {
    when(comicBookRepository.getRecreatingCount()).thenReturn(TEST_COMIC_COUNT);

    final long result = service.getRecreatingCount();

    assertEquals(TEST_COMIC_COUNT, result);

    verify(comicBookRepository).getRecreatingCount();
  }

  @Test
  void getAllComicDetails_missingFiles() {
    when(comicBookRepository.getComicFilenames(true)).thenReturn(comicFilenameList);

    final Set<String> result = service.getAllComicDetails(true);

    assertNotNull(result);
    assertSame(comicFilenameList, result);

    verify(comicBookRepository).getComicFilenames(true);
  }

  @Test
  void getAllComicDetails_notMissingFiles() {
    when(comicBookRepository.getComicFilenames(false)).thenReturn(comicFilenameList);

    final Set<String> result = service.getAllComicDetails(false);

    assertNotNull(result);
    assertSame(comicFilenameList, result);

    verify(comicBookRepository).getComicFilenames(false);
  }

  @Test
  void markComicAsMissing_caseInsensitive_noRecordFound() {
    when(comicFileAdaptor.standardizeFilename(Mockito.anyString()))
        .thenReturn(TEST_STANDARDIZED_FILENAME);
    when(comicFileAdaptor.isCaseSensitiveFilenames()).thenReturn(false);
    when(comicBookRepository.findByFilenameCaseInsensitive(Mockito.anyString())).thenReturn(null);

    service.markComicAsMissing(TEST_COMIC_FILENAME);

    verify(comicFileAdaptor).standardizeFilename(TEST_COMIC_FILENAME);
    verify(comicBookRepository).findByFilenameCaseInsensitive(TEST_STANDARDIZED_FILENAME);
    verify(comicBookStateAdaptor, never()).fireEvent(Mockito.any(), Mockito.any());
  }

  @Test
  void markComicAsMissing_caseInsensitive_hasTargetArchiveType() {
    when(comicFileAdaptor.standardizeFilename(Mockito.anyString()))
        .thenReturn(TEST_STANDARDIZED_FILENAME);
    when(comicFileAdaptor.isCaseSensitiveFilenames()).thenReturn(false);
    when(comicBookRepository.findByFilenameCaseInsensitive(Mockito.anyString()))
        .thenReturn(comicBook);
    when(comicBook.getTargetArchiveType()).thenReturn(TEST_TARGET_ARCHIVE_TYPE);

    service.markComicAsMissing(TEST_COMIC_FILENAME);

    verify(comicFileAdaptor).standardizeFilename(TEST_COMIC_FILENAME);
    verify(comicBookRepository).findByFilenameCaseInsensitive(TEST_STANDARDIZED_FILENAME);
    verify(comicBookStateAdaptor, never()).fireEvent(Mockito.any(), Mockito.any());
  }

  @Test
  void markComicAsMissing_caseInsensitive() {
    when(comicFileAdaptor.standardizeFilename(Mockito.anyString()))
        .thenReturn(TEST_STANDARDIZED_FILENAME);
    when(comicFileAdaptor.isCaseSensitiveFilenames()).thenReturn(false);
    when(comicBookRepository.findByFilenameCaseInsensitive(Mockito.anyString()))
        .thenReturn(comicBook);

    service.markComicAsMissing(TEST_COMIC_FILENAME);

    verify(comicFileAdaptor).standardizeFilename(TEST_COMIC_FILENAME);
    verify(comicBookRepository).findByFilenameCaseInsensitive(TEST_STANDARDIZED_FILENAME);
    verify(comicBookStateAdaptor, never()).fireEvent(comicBook, ComicEvent.comicFileDiscovered);
  }

  @Test
  void markComicAsMissing_caseSensitive_noRecordFound() {
    when(comicFileAdaptor.standardizeFilename(Mockito.anyString()))
        .thenReturn(TEST_STANDARDIZED_FILENAME);
    when(comicFileAdaptor.isCaseSensitiveFilenames()).thenReturn(true);
    when(comicBookRepository.findByFilename(Mockito.anyString())).thenReturn(null);

    service.markComicAsMissing(TEST_COMIC_FILENAME);

    verify(comicFileAdaptor).standardizeFilename(TEST_COMIC_FILENAME);
    verify(comicBookRepository).findByFilename(TEST_STANDARDIZED_FILENAME);
    verify(comicBookStateAdaptor, never()).fireEvent(Mockito.any(), Mockito.any());
  }

  @Test
  void markComicAsMissing_caseSensitive_hasTargetArchiveType() {
    when(comicFileAdaptor.standardizeFilename(Mockito.anyString()))
        .thenReturn(TEST_STANDARDIZED_FILENAME);
    when(comicFileAdaptor.isCaseSensitiveFilenames()).thenReturn(true);
    when(comicBookRepository.findByFilename(Mockito.anyString())).thenReturn(comicBook);
    when(comicBook.getTargetArchiveType()).thenReturn(TEST_TARGET_ARCHIVE_TYPE);

    service.markComicAsMissing(TEST_COMIC_FILENAME);

    verify(comicFileAdaptor).standardizeFilename(TEST_COMIC_FILENAME);
    verify(comicBookRepository).findByFilename(TEST_STANDARDIZED_FILENAME);
    verify(comicBookStateAdaptor, never()).fireEvent(Mockito.any(), Mockito.any());
  }

  @Test
  void markComicAsMissing_caseSensitive() {
    when(comicFileAdaptor.standardizeFilename(Mockito.anyString()))
        .thenReturn(TEST_STANDARDIZED_FILENAME);
    when(comicFileAdaptor.isCaseSensitiveFilenames()).thenReturn(true);
    when(comicBookRepository.findByFilename(Mockito.anyString())).thenReturn(comicBook);

    service.markComicAsMissing(TEST_COMIC_FILENAME);

    verify(comicFileAdaptor).standardizeFilename(TEST_COMIC_FILENAME);
    verify(comicBookRepository).findByFilename(TEST_STANDARDIZED_FILENAME);
    verify(comicBookStateAdaptor, never()).fireEvent(comicBook, ComicEvent.comicFileDiscovered);
  }

  @Test
  void markComicAsFound_caseInsensitive_noRecordFound() {
    when(comicFileAdaptor.standardizeFilename(Mockito.anyString()))
        .thenReturn(TEST_STANDARDIZED_FILENAME);
    when(comicFileAdaptor.isCaseSensitiveFilenames()).thenReturn(false);
    when(comicBookRepository.findByFilenameCaseInsensitive(Mockito.anyString())).thenReturn(null);

    service.markComicAsFound(TEST_COMIC_FILENAME);

    verify(comicFileAdaptor).standardizeFilename(TEST_COMIC_FILENAME);
    verify(comicBookRepository).findByFilenameCaseInsensitive(TEST_STANDARDIZED_FILENAME);
    verify(comicBookStateAdaptor, never()).fireEvent(Mockito.any(), Mockito.any());
  }

  @Test
  void markComicAsFound_caseInsensitive() {
    when(comicFileAdaptor.standardizeFilename(Mockito.anyString()))
        .thenReturn(TEST_STANDARDIZED_FILENAME);
    when(comicFileAdaptor.isCaseSensitiveFilenames()).thenReturn(false);
    when(comicBookRepository.findByFilenameCaseInsensitive(Mockito.anyString()))
        .thenReturn(comicBook);

    service.markComicAsFound(TEST_COMIC_FILENAME);

    verify(comicFileAdaptor).standardizeFilename(TEST_COMIC_FILENAME);
    verify(comicBookRepository).findByFilenameCaseInsensitive(TEST_STANDARDIZED_FILENAME);
    verify(comicBookStateAdaptor).fireEvent(comicBook, ComicEvent.comicFileFound);
  }

  @Test
  void markComicAsFound_caseSensitive_noRecordFound() {
    when(comicFileAdaptor.standardizeFilename(Mockito.anyString()))
        .thenReturn(TEST_STANDARDIZED_FILENAME);
    when(comicFileAdaptor.isCaseSensitiveFilenames()).thenReturn(true);
    when(comicBookRepository.findByFilename(Mockito.anyString())).thenReturn(null);

    service.markComicAsFound(TEST_COMIC_FILENAME);

    verify(comicFileAdaptor).standardizeFilename(TEST_COMIC_FILENAME);
    verify(comicBookRepository).findByFilename(TEST_STANDARDIZED_FILENAME);
    verify(comicBookStateAdaptor, never()).fireEvent(Mockito.any(), Mockito.any());
  }

  @Test
  void markComicAsFound_caseSensitive() {
    when(comicFileAdaptor.standardizeFilename(Mockito.anyString()))
        .thenReturn(TEST_STANDARDIZED_FILENAME);
    when(comicFileAdaptor.isCaseSensitiveFilenames()).thenReturn(true);
    when(comicBookRepository.findByFilename(Mockito.anyString())).thenReturn(comicBook);

    service.markComicAsFound(TEST_COMIC_FILENAME);

    verify(comicFileAdaptor).standardizeFilename(TEST_COMIC_FILENAME);
    verify(comicBookRepository).findByFilename(TEST_STANDARDIZED_FILENAME);
    verify(comicBookStateAdaptor).fireEvent(comicBook, ComicEvent.comicFileFound);
  }

  @Test
  void getBatchScrapingCount() {
    when(comicBookRepository.getBatchScrapingCount()).thenReturn(TEST_COMIC_COUNT);

    final long result = service.getBatchScrapingCount();

    assertEquals(TEST_COMIC_COUNT, result);

    verify(comicBookRepository).getBatchScrapingCount();
  }

  @Test
  void findBatchScrapingComics() {
    when(comicBookRepository.findBatchScrapingComics(pageableCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.findBatchScrapingComics(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicBookList, result);

    final Pageable pageable = pageableCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    verify(comicBookRepository).findBatchScrapingComics(pageable);
  }

  @Test
  void markComicBooksForBatchScraping() {
    service.markComicBooksForBatchScraping(idList);

    verify(comicBookRepository).prepareForBatchScraping(idList);
  }

  @Test
  void getSeriesCountForPublisher() {
    when(comicDetailRepository.getSeriesCountForPublisher(Mockito.anyString()))
        .thenReturn(TEST_COMIC_COUNT);

    final long result = service.getSeriesCountForPublisher(TEST_PUBLISHER);

    assertEquals(TEST_COMIC_COUNT, result);

    verify(comicDetailRepository).getSeriesCountForPublisher(TEST_PUBLISHER);
  }

  @Test
  void findComicsWithUnhashedPages() {
    when(comicBookRepository.findComicsWithUnhashedPages(pageableCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.findComicsWithUnhashedPages(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicBookList, result);

    final Pageable pageable = pageableCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    verify(comicBookRepository).findComicsWithUnhashedPages(pageable);
  }

  @Test
  void findComicsWithUnhashedPagesCount() {
    when(comicBookRepository.findComicsWithUnhashedPagesCount()).thenReturn(TEST_COMIC_COUNT);

    final long result = service.findComicsWithUnhashedPagesCount();

    assertEquals(TEST_COMIC_COUNT, result);

    verify(comicBookRepository).findComicsWithUnhashedPagesCount();
  }

  @Test
  void hasComicsWithUnhashedPagesCount_withNoSuchComics() {
    when(comicBookRepository.findComicsWithUnhashedPagesCount()).thenReturn(0L);

    final boolean result = service.hasComicsWithUnhashedPages();

    assertFalse(result);

    verify(comicBookRepository).findComicsWithUnhashedPagesCount();
  }

  @Test
  void hasComicsWithUnhashedPagesCount_withComics() {
    when(comicBookRepository.findComicsWithUnhashedPagesCount()).thenReturn(TEST_COMIC_COUNT);

    final boolean result = service.hasComicsWithUnhashedPages();

    assertTrue(result);

    verify(comicBookRepository).findComicsWithUnhashedPagesCount();
  }

  @Test
  void getComicDetailIdForComicBook() {
    when(comicDetailRepository.getComicDetailIdForComicBook(Mockito.anyLong()))
        .thenReturn(TEST_COMIC_DETAIL_ID);

    final long result = service.getComicDetailIdForComicBook(TEST_COMIC_BOOK_ID);

    assertEquals(TEST_COMIC_DETAIL_ID, result);

    verify(comicDetailRepository).getComicDetailIdForComicBook(TEST_COMIC_BOOK_ID);
  }
}

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

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertNull;
import static junit.framework.TestCase.assertSame;
import static junit.framework.TestCase.assertTrue;

import java.util.ArrayList;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.Optional;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.adaptors.comicbooks.ComicBookMetadataAdaptor;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.comicbooks.PublishComicBookRemovalAction;
import org.comixedproject.messaging.comicbooks.PublishComicBookUpdateAction;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.collections.Publisher;
import org.comixedproject.model.collections.Series;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.comicbooks.ComicType;
import org.comixedproject.model.comicpages.Page;
import org.comixedproject.model.library.LastRead;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.model.net.comicbooks.PageOrderEntry;
import org.comixedproject.model.net.library.PublisherAndYearSegment;
import org.comixedproject.model.net.library.RemoteLibrarySegmentState;
import org.comixedproject.repositories.comicbooks.ComicBookRepository;
import org.comixedproject.service.user.ComiXedUserException;
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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHeaders;
import org.springframework.statemachine.state.State;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ComicBookServiceTest {
  private static final long TEST_COMIC_BOOK_ID = 5;
  private static final String TEST_COMIC_FILENAME = "src/test/resources/example.cbz";
  private static final ComicType TEST_COMIC_TYPE =
      ComicType.values()[RandomUtils.nextInt(ComicType.values().length)];
  private static final String TEST_PUBLISHER = "Awesome Publications";
  private static final String TEST_SERIES = "Series Name";
  private static final String TEST_VOLUME = "Volume Name";
  private static final String TEST_ISSUE_NUMBER = "237";
  private static final int TEST_MAXIMUM_COMICS = 100;
  private static final String TEST_BEFORE_PREVIOUS_ISSUE_NUMBER = "5";
  private static final String TEST_PREVIOUS_ISSUE_NUMBER = "5";
  private static final String TEST_CURRENT_ISSUE_NUMBER = "7";
  private static final String TEST_NEXT_ISSUE_NUMBER = "10";
  private static final String TEST_AFTER_NEXT_ISSUE_NUMBER = "11";
  private static final String TEST_SORTABLE_NAME = "Sortable Name";
  private static final String TEST_IMPRINT = "Incredible Imprints";
  private static final String TEST_TITLE = "The Issue Title";
  private static final String TEST_DESCRIPTION = "This description of the issue";
  private static final Date TEST_COVER_DATE = new Date();
  private static final Date TEST_STORE_DATE =
      new Date(System.currentTimeMillis() - 30L * 24L * 60L * 60L * 24L);
  private static final String TEST_NOTES = "These are the comic book's notes...";
  private static final int TEST_PAGE = Math.abs(RandomUtils.nextInt());
  private static final ComicState TEST_STATE = ComicState.CHANGED;
  private static final String TEST_STORY_NAME = "The Story Name";
  private static final long TEST_COMIC_COUNT = 239L;
  private static final String TEST_SEARCH_TERMS = "The search terms";
  private static final int TEST_BATCH_CHUNK_SIZE = 25;
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
  private final List<LastRead> lastReadList = new ArrayList<>();

  @InjectMocks private ComicBookService service;
  @Mock private ComicStateHandler comicStateHandler;
  @Mock private ComicBookRepository comicBookRepository;
  @Mock private FileTypeAdaptor fileTypeAdaptor;
  @Mock private PublishComicBookUpdateAction comicUpdatePublishAction;
  @Mock private PublishComicBookRemovalAction comicRemovalPublishAction;
  @Mock private ComicBookMetadataAdaptor comicBookMetadataAdaptor;
  @Mock private ComicBook comicBook;
  @Mock private ComicDetail comicDetail;
  @Mock private ComicBook incomingComicBook;
  @Mock private ComicDetail incomingComicDetail;
  @Mock private ComicBook comicBookRecord;
  @Mock private State<ComicState, ComicEvent> state;
  @Mock private Message<ComicEvent> message;
  @Mock private MessageHeaders messageHeaders;
  @Mock private ImprintService imprintService;
  @Mock private List<String> collectionList;
  @Mock private List<String> publisherList;
  @Mock private LastRead lastRead;
  @Mock private List<RemoteLibrarySegmentState> librarySegmentList;
  @Mock private List<PublisherAndYearSegment> byPublisherAndYearList;
  @Mock private List<Publisher> publisherWithSeriesCountList;
  @Mock private List<Series> publisherDetail;
  @Captor private ArgumentCaptor<Pageable> pageableCaptor;
  @Captor private ArgumentCaptor<PageRequest> pageRequestCaptor;

  @Before
  public void setUp() throws ComiXedUserException {
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(incomingComicBook.getComicDetail()).thenReturn(incomingComicDetail);

    previousComicBook.setComicDetail(
        new ComicDetail(previousComicBook, TEST_COMIC_FILENAME, ArchiveType.CBZ));
    previousComicBook.getComicDetail().setIssueNumber(TEST_PREVIOUS_ISSUE_NUMBER);
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
    nextComicBook.getComicDetail().setIssueNumber(TEST_NEXT_ISSUE_NUMBER);
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

    lastReadList.add(lastRead);
  }

  @Test
  public void testAfterPropertiesSet() throws Exception {
    service.afterPropertiesSet();

    Mockito.verify(comicStateHandler, Mockito.times(1)).addListener(service);
  }

  @Test
  public void testOnComicStateChangePurgeEvent() throws PublishingException {
    Mockito.when(message.getHeaders()).thenReturn(messageHeaders);
    Mockito.when(messageHeaders.get(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(comicBook);
    Mockito.when(state.getId()).thenReturn(ComicState.REMOVED);

    service.onComicStateChange(state, message);

    Mockito.verify(comicRemovalPublishAction, Mockito.times(1)).publish(comicBook);
  }

  @Test
  public void testOnComicStateChangePurgeEventPublishingException() throws PublishingException {
    Mockito.when(message.getHeaders()).thenReturn(messageHeaders);
    Mockito.when(messageHeaders.get(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(comicBook);
    Mockito.when(state.getId()).thenReturn(ComicState.REMOVED);
    Mockito.doThrow(PublishingException.class)
        .when(comicRemovalPublishAction)
        .publish(Mockito.any(ComicBook.class));

    service.onComicStateChange(state, message);

    Mockito.verify(comicRemovalPublishAction, Mockito.times(1)).publish(comicBook);
  }

  @Test
  public void testOnComicStateChange() throws PublishingException {
    Mockito.when(message.getHeaders()).thenReturn(messageHeaders);
    Mockito.when(messageHeaders.get(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(comicBook);
    Mockito.when(state.getId()).thenReturn(TEST_STATE);
    Mockito.when(comicBookRepository.save(Mockito.any(ComicBook.class)))
        .thenReturn(comicBookRecord);

    service.onComicStateChange(state, message);

    Mockito.verify(comicDetail, Mockito.times(1)).setComicState(TEST_STATE);
    Mockito.verify(comicBook, Mockito.times(1)).setLastModifiedOn(Mockito.any(Date.class));
    Mockito.verify(comicBookRepository, Mockito.times(1)).save(comicBook);
    Mockito.verify(comicUpdatePublishAction, Mockito.times(1)).publish(comicBookRecord);
  }

  @Test
  public void testOnComicStateChangePublishError() throws PublishingException {
    Mockito.when(message.getHeaders()).thenReturn(messageHeaders);
    Mockito.when(messageHeaders.get(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(comicBook);
    Mockito.when(state.getId()).thenReturn(TEST_STATE);
    Mockito.when(comicBookRepository.save(Mockito.any(ComicBook.class)))
        .thenReturn(comicBookRecord);
    Mockito.doThrow(PublishingException.class)
        .when(comicUpdatePublishAction)
        .publish(Mockito.any(ComicBook.class));

    service.onComicStateChange(state, message);

    Mockito.verify(comicDetail, Mockito.times(1)).setComicState(TEST_STATE);
    Mockito.verify(comicBook, Mockito.times(1)).setLastModifiedOn(Mockito.any(Date.class));
    Mockito.verify(comicBookRepository, Mockito.times(1)).save(comicBook);
    Mockito.verify(comicUpdatePublishAction, Mockito.times(1)).publish(comicBookRecord);
  }

  @Test
  public void testGetComic() throws ComicBookException, ComiXedUserException {
    List<ComicBook> previousComicBooks = new ArrayList<>();
    previousComicBooks.add(previousComicBook);
    previousComicBooks.add(beforePreviousComicBook);
    List<ComicBook> nextComicBooks = new ArrayList<>();
    nextComicBooks.add(nextComicBook);
    nextComicBooks.add(afterNextComicBook);

    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(currentComicBook);

    Mockito.when(
            comicBookRepository.findIssuesBeforeComic(
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.any(Date.class)))
        .thenReturn(previousComicBooks);
    Mockito.when(
            comicBookRepository.findIssuesAfterComic(
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.any(Date.class)))
        .thenReturn(nextComicBooks);

    final ComicBook result = service.getComic(TEST_COMIC_BOOK_ID);

    assertNotNull(result);
    assertSame(currentComicBook, result);
    assertEquals(previousComicBook.getId(), result.getPreviousIssueId());
    assertEquals(nextComicBook.getId(), result.getNextIssueId());

    Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_BOOK_ID);
    Mockito.verify(comicBookRepository, Mockito.times(1))
        .findIssuesBeforeComic(
            TEST_SERIES, TEST_VOLUME, TEST_CURRENT_ISSUE_NUMBER, TEST_COVER_DATE);
    Mockito.verify(comicBookRepository, Mockito.times(1))
        .findIssuesAfterComic(TEST_SERIES, TEST_VOLUME, TEST_CURRENT_ISSUE_NUMBER, TEST_COVER_DATE);
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

  @Test(expected = ComicBookException.class)
  public void testUpdateComicInvalidId() throws ComicBookException {
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
    Mockito.when(comicBookRepository.save(Mockito.any(ComicBook.class))).thenReturn(comicBook);

    final ComicBook result = this.service.save(comicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).save(comicBook);
  }

  @Test
  public void testDelete() {
    Mockito.doNothing().when(comicBookRepository).delete(Mockito.any(ComicBook.class));

    service.deleteComicBook(comicBook);

    Mockito.verify(comicBookRepository, Mockito.times(1)).delete(comicBook);
  }

  @Test
  public void testFindComicsToMove() {
    Mockito.when(comicBookRepository.findComicsToMove(pageRequestCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.findComicsToMove(TEST_PAGE, TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicBookList, result);

    assertNotNull(pageRequestCaptor.getValue());
    final PageRequest request = pageRequestCaptor.getValue();
    assertEquals(TEST_PAGE, request.getPageNumber());
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
  public void testFindInsertedComics() {
    Mockito.when(
            comicBookRepository.findForState(
                Mockito.any(ComicState.class), pageableCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.findInsertedComics(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicBookList, result);

    final Pageable pageable = pageableCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    Mockito.verify(comicBookRepository, Mockito.times(1)).findForState(ComicState.ADDED, pageable);
  }

  @Test
  public void testGetUnprocessedComicsWithoutContentCount() {
    Mockito.when(comicBookRepository.findUnprocessedComicsWithoutContentCount())
        .thenReturn(TEST_MAXIMUM_COMICS);

    final long result = service.getUnprocessedComicsWithoutContentCount();

    assertEquals(TEST_MAXIMUM_COMICS, result);

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .findUnprocessedComicsWithoutContentCount();
  }

  @Test
  public void testGetWithCreateMetadataSourceFlag() {
    Mockito.when(comicBookRepository.findComicsWithCreateMeatadataSourceFlag())
        .thenReturn(TEST_MAXIMUM_COMICS);

    final long result = service.getWithCreateMetadataSourceFlagCount();

    assertEquals(TEST_MAXIMUM_COMICS, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).findComicsWithCreateMeatadataSourceFlag();
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
  public void testFindUnprocessedComicsWithoutContent() {
    Mockito.when(comicBookRepository.findUnprocessedComicsWithoutContent(pageableCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.findUnprocessedComicsWithoutContent(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicBookList, result);

    final Pageable pageable = pageableCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .findUnprocessedComicsWithoutContent(pageable);
  }

  @Test
  public void testGetUnprocessedComicsForMarkedPageBlockingCount() {
    Mockito.when(comicBookRepository.findUnprocessedComicsForMarkedPageBlockingCount())
        .thenReturn(TEST_MAXIMUM_COMICS);

    final long result = service.getUnprocessedComicsForMarkedPageBlockingCount();

    assertEquals(TEST_MAXIMUM_COMICS, result);

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .findUnprocessedComicsForMarkedPageBlockingCount();
  }

  @Test
  public void testFindUnprocessedComicsForMarkedPageBlocking() {
    Mockito.when(
            comicBookRepository.findUnprocessedComicsForMarkedPageBlocking(
                pageableCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result =
        service.findUnprocessedComicsForMarkedPageBlocking(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicBookList, result);

    final Pageable pageable = pageableCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .findUnprocessedComicsForMarkedPageBlocking(pageable);
  }

  @Test
  public void testGetProcessedComicsCount() {
    Mockito.when(comicBookRepository.findProcessedComicsCount()).thenReturn(TEST_MAXIMUM_COMICS);

    final long result = service.getProcessedComicsCount();

    assertEquals(TEST_MAXIMUM_COMICS, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).findProcessedComicsCount();
  }

  @Test
  public void testFindProcessedComics() {
    Mockito.when(comicBookRepository.findProcessedComics(pageableCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.findProcessedComics(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicBookList, result);

    final Pageable pageable = pageableCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    Mockito.verify(comicBookRepository, Mockito.times(1)).findProcessedComics(pageable);
  }

  @Test
  public void testPrepareForRescanById() {
    for (long index = 0L; index < 25L; index++) idList.add(index + 100);

    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);

    service.prepareForRescan(idList);

    idList.forEach(
        id -> Mockito.verify(comicBookRepository, Mockito.times(1)).getById(id.longValue()));
    Mockito.verify(comicStateHandler, Mockito.times(idList.size()))
        .fireEvent(comicBook, ComicEvent.rescanComic);
  }

  @Test
  public void testPrepareForRescanByIdNoSuchComic() {
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
  public void testFindAllComicsMarkedForDeletion() {
    Mockito.when(comicBookRepository.findComicsMarkedForDeletion(pageableCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.findComicsMarkedForDeletion(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicBookList, result);

    final Pageable pageable = pageableCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    Mockito.verify(comicBookRepository, Mockito.times(1)).findComicsMarkedForDeletion(pageable);
  }

  @Test
  public void testFindComicsToBeMoved() {
    Mockito.when(comicBookRepository.findComicsToBeMoved(pageableCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.findComicsToBeMoved(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicBookList, result);

    final Pageable pageable = pageableCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    Mockito.verify(comicBookRepository, Mockito.times(1)).findComicsToBeMoved(pageable);
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
        .thenReturn(null);

    final ComicBook result =
        service.findComic(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER);

    assertNull(result);

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .findComic(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER);
  }

  @Test
  public void testFindComic() {
    Mockito.when(
            comicBookRepository.findComic(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(comicBook);

    final ComicBook result =
        service.findComic(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER);

    assertNotNull(result);
    assertSame(comicBook, result);

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
    List<Page> pageList = new ArrayList<>();
    for (int index = 0; index < 25; index++) {
      final String filename = String.format("filename-%d", index);
      entryList.add(new PageOrderEntry(filename, 24 - index));
      final Page page = new Page();
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
    List<Page> pageList = new ArrayList<>();
    for (int index = 0; index < 25; index++) {
      final String filename = String.format("filename-%d", index);
      entryList.add(new PageOrderEntry(filename, 24 - index));
      final Page page = new Page();
      page.setFilename(filename);
      pageList.add(page);
    }

    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(comicBook.getPages()).thenReturn(pageList);

    service.savePageOrder(TEST_COMIC_BOOK_ID, entryList);

    for (int index = 0; index < entryList.size(); index++) {
      final PageOrderEntry pageOrderEntry = entryList.get(index);
      final Optional<Page> pageListEntry =
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
  }

  @Test
  public void testGetComicBookssForSearchTerms() {
    Mockito.when(comicBookRepository.findForSearchTerms(Mockito.anyString()))
        .thenReturn(comicDetailList);

    final List<ComicDetail> result = service.getComicBooksForSearchTerms(TEST_SEARCH_TERMS);

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
  public void testGetAllPublishers() {
    Mockito.when(comicBookRepository.getAllPublishersWithSeriesCount())
        .thenReturn(publisherWithSeriesCountList);

    final List<Publisher> result = service.getAllPublishersWithSeries();

    assertNotNull(result);
    assertSame(publisherWithSeriesCountList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).getAllPublishersWithSeriesCount();
  }

  @Test
  public void testGetPublisherDetail() {
    Mockito.when(comicBookRepository.getAllSeriesAndVolumesForPublisher(Mockito.anyString()))
        .thenReturn(publisherDetail);

    final List<Series> result = service.getPublisherDetail(TEST_PUBLISHER);

    assertNotNull(result);
    assertSame(publisherDetail, result);

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .getAllSeriesAndVolumesForPublisher(TEST_PUBLISHER);
  }

  @Test
  public void testFindDuplicateComics() {
    Mockito.when(comicBookRepository.getAllWithDuplicatePages()).thenReturn(comicDetailList);

    final List<ComicDetail> result = service.findDuplicateComics();

    assertNotNull(result);
    assertSame(comicDetailList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).getAllWithDuplicatePages();
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

  @Test(expected = ComicBookException.class)
  public void testPrepareForMetadataUpdateInvalidComicBookId() throws ComicBookException {
    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.prepareForMetadataUpdate(TEST_COMIC_BOOK_ID);
    } finally {
      Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_BOOK_ID);
    }
  }

  @Test
  public void testPrepareForMetadataUpdate() throws ComicBookException {
    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);

    service.prepareForMetadataUpdate(TEST_COMIC_BOOK_ID);

    Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_BOOK_ID);
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(comicBook, ComicEvent.updateMetadata);
  }

  @Test(expected = ComicBookException.class)
  public void testPrepareForRescanSingleComicInvalidComicBookId() throws ComicBookException {
    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.prepareForRescan(TEST_COMIC_BOOK_ID);
    } finally {
      Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_BOOK_ID);
    }
  }

  @Test
  public void testPrepareForRescanSingleComic() throws ComicBookException {
    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);

    service.prepareForRescan(TEST_COMIC_BOOK_ID);

    Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_BOOK_ID);
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(comicBook, ComicEvent.rescanComic);
  }
}

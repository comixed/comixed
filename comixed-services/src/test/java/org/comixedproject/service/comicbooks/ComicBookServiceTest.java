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

import java.io.File;
import java.util.*;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.adaptors.comicbooks.ComicBookMetadataAdaptor;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.comicbooks.PublishComicRemovalAction;
import org.comixedproject.messaging.comicbooks.PublishComicUpdateAction;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.comicpages.Page;
import org.comixedproject.model.library.LastRead;
import org.comixedproject.model.net.comicbooks.PageOrderEntry;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.comicbooks.ComicBookRepository;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
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
  private static final long TEST_COMIC_ID = 5;
  private static final String TEST_COMIC_FILENAME = "src/test/resources/example.cbz";
  private static final String TEST_PUBLISHER = "Awesome Publications";
  private static final String TEST_SERIES = "Series Name";
  private static final String TEST_VOLUME = "Volume Name";
  private static final String TEST_ISSUE_NUMBER = "237";
  private static final int TEST_MAXIMUM_COMICS = 100;
  private static final String TEST_PREVIOUS_ISSUE_NUMBER = "5";
  private static final String TEST_CURRENT_ISSUE_NUMBER = "7";
  private static final String TEST_NEXT_ISSUE_NUMBER = "10";
  private static final String TEST_SORTABLE_NAME = "Sortable Name";
  private static final String TEST_IMPRINT = "Incredible Imprints";
  private static final String TEST_TITLE = "The Issue Title";
  private static final String TEST_DESCRIPTION = "This description of the issue";
  private static final Date TEST_COVER_DATE = new Date();
  private static final int TEST_PAGE = Math.abs(RandomUtils.nextInt());
  private static final ComicState TEST_STATE = ComicState.CHANGED;
  private static final String TEST_CHARACTER = "Manlyman";
  private static final String TEST_TEAM = "The Boys";
  private static final String TEST_LOCATION = "The Location";
  private static final String TEST_STORY_NAME = "The Story Name";
  private static final String TEST_EMAIL = "reader@comixedproject.org";

  @InjectMocks private ComicBookService service;
  @Mock private ComicStateHandler comicStateHandler;
  @Mock private ComicBookRepository comicBookRepository;
  @Mock private PublishComicUpdateAction comicUpdatePublishAction;
  @Mock private PublishComicRemovalAction comicRemovalPublishAction;
  @Mock private ComicBookMetadataAdaptor comicBookMetadataAdaptor;
  @Mock private ComicBook comicBook;
  @Mock private ComicBook incomingComicBook;
  @Mock private ComicBook comicBookRecord;
  @Mock private State<ComicState, ComicEvent> state;
  @Mock private Message<ComicEvent> message;
  @Mock private MessageHeaders messageHeaders;
  @Mock private ImprintService imprintService;
  @Mock private List<String> collectionList;
  @Mock private List<String> publisherList;
  @Mock private ComicBook readComicBook;
  @Mock private LastRead lastRead;
  @Mock private ComiXedUser lastReadUser;
  @Mock private List<Integer> yearList;
  @Mock private Set<String> seriesList;
  @Mock private Set<String> volumeList;

  @Captor private ArgumentCaptor<Pageable> pageableCaptor;
  @Captor private ArgumentCaptor<PageRequest> pageRequestCaptor;
  @Captor private ArgumentCaptor<Date> startDateArgumentCaptor;
  @Captor private ArgumentCaptor<Date> endDateArgumentCaptor;

  private List<ComicBook> comicBookList = new ArrayList<>();
  private List<ComicBook> comicsBySeries = new ArrayList<>();
  private ComicBook previousComicBook = new ComicBook();
  private ComicBook currentComicBook = new ComicBook();
  private ComicBook nextComicBook = new ComicBook();
  private List<Long> idList = new ArrayList<>();
  private GregorianCalendar calendar = new GregorianCalendar();
  private Date now = new Date();
  private List<LastRead> lastReadList = new ArrayList<>();
  private List<Date> weeksList = new ArrayList<>();

  @Before
  public void setUp() throws ComiXedUserException {
    previousComicBook.setIssueNumber(TEST_PREVIOUS_ISSUE_NUMBER);
    previousComicBook.setCoverDate(new Date(System.currentTimeMillis() - 24 * 60 * 60 * 1000));
    currentComicBook.setSeries(TEST_SERIES);
    currentComicBook.setVolume(TEST_VOLUME);
    currentComicBook.setIssueNumber(TEST_CURRENT_ISSUE_NUMBER);
    currentComicBook.setCoverDate(new Date(System.currentTimeMillis()));
    currentComicBook.setCoverDate(TEST_COVER_DATE);
    nextComicBook.setIssueNumber(TEST_NEXT_ISSUE_NUMBER);
    nextComicBook.setCoverDate(new Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000));
    comicsBySeries.add(nextComicBook);
    comicsBySeries.add(previousComicBook);
    comicsBySeries.add(currentComicBook);
    calendar.setTime(now);

    Mockito.when(lastRead.getUser()).thenReturn(lastReadUser);
    Mockito.when(lastReadUser.getEmail()).thenReturn(TEST_EMAIL);
    lastReadList.add(lastRead);
    Mockito.when(readComicBook.getLastReads()).thenReturn(lastReadList);
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

    Mockito.verify(comicBook, Mockito.times(1)).setComicState(TEST_STATE);
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

    Mockito.verify(comicBook, Mockito.times(1)).setComicState(TEST_STATE);
    Mockito.verify(comicBook, Mockito.times(1)).setLastModifiedOn(Mockito.any(Date.class));
    Mockito.verify(comicBookRepository, Mockito.times(1)).save(comicBook);
    Mockito.verify(comicUpdatePublishAction, Mockito.times(1)).publish(comicBookRecord);
  }

  @Test
  public void testGetComic() throws ComicException, ComiXedUserException {
    List<ComicBook> previousComicBooks = new ArrayList<>();
    previousComicBooks.add(previousComicBook);
    List<ComicBook> nextComicBooks = new ArrayList<>();
    nextComicBooks.add(nextComicBook);

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

    final ComicBook result = service.getComic(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(currentComicBook, result);
    assertEquals(previousComicBook.getId(), result.getPreviousIssueId());
    assertEquals(nextComicBook.getId(), result.getNextIssueId());

    Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_ID);
    Mockito.verify(comicBookRepository, Mockito.times(1))
        .findIssuesBeforeComic(
            TEST_SERIES, TEST_VOLUME, TEST_CURRENT_ISSUE_NUMBER, TEST_COVER_DATE);
    Mockito.verify(comicBookRepository, Mockito.times(1))
        .findIssuesAfterComic(TEST_SERIES, TEST_VOLUME, TEST_CURRENT_ISSUE_NUMBER, TEST_COVER_DATE);
  }

  @Test(expected = ComicException.class)
  public void testDeleteComicNonexistent() throws ComicException {
    Mockito.when(comicBookRepository.getByIdWithReadingLists(Mockito.anyLong())).thenReturn(null);

    try {
      service.deleteComic(TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicBookRepository, Mockito.times(1)).getByIdWithReadingLists(TEST_COMIC_ID);
    }
  }

  @Test
  public void testDeleteComic() throws ComicException {
    Mockito.when(comicBookRepository.getByIdWithReadingLists(Mockito.anyLong()))
        .thenReturn(comicBook);
    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBookRecord);

    final ComicBook result = service.deleteComic(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(comicBookRecord, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).getByIdWithReadingLists(TEST_COMIC_ID);
    Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_ID);
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(comicBook, ComicEvent.deleteComic);
  }

  @Test(expected = ComicException.class)
  public void testRestoreComicNonexistent() throws ComicException {
    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.undeleteComic(TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_ID);
    }
  }

  @Test
  public void testRestoreComic() throws ComicException {
    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBookRecord);

    final ComicBook response = service.undeleteComic(TEST_COMIC_ID);

    assertNotNull(response);
    assertSame(comicBookRecord, response);

    Mockito.verify(comicBookRepository, Mockito.times(2)).getById(TEST_COMIC_ID);
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(comicBookRecord, ComicEvent.undeleteComic);
  }

  @Test
  public void testGetComicContentNonexistent() {
    Mockito.when(comicBook.getFilename()).thenReturn(TEST_COMIC_FILENAME.substring(1));

    final byte[] result = this.service.getComicContent(comicBook);

    assertNull(result);

    Mockito.verify(comicBook, Mockito.atLeast(1)).getFilename();
  }

  @Test
  public void testGetComicContent() {
    Mockito.when(comicBook.getFilename()).thenReturn(TEST_COMIC_FILENAME);

    final byte[] result = this.service.getComicContent(comicBook);

    assertNotNull(result);
    assertEquals(new File(TEST_COMIC_FILENAME).length(), result.length);

    Mockito.verify(comicBook, Mockito.atLeast(1)).getFilename();
  }

  @Test(expected = ComicException.class)
  public void testUpdateComicInvalidComic() throws ComicException {
    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);
    try {
      service.updateComic(TEST_COMIC_ID, incomingComicBook);
    } finally {
      Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_ID);
    }
  }

  @Test(expected = ComicException.class)
  public void testUpdateComicInvalidId() throws ComicException {
    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.updateComic(TEST_COMIC_ID, incomingComicBook);
    } finally {
      Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_ID);
    }
  }

  @Test
  public void testUpdateComic() throws ComicException {
    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(incomingComicBook.getPublisher()).thenReturn(TEST_PUBLISHER);
    Mockito.when(incomingComicBook.getSeries()).thenReturn(TEST_SERIES);
    Mockito.when(incomingComicBook.getVolume()).thenReturn(TEST_VOLUME);
    Mockito.when(incomingComicBook.getIssueNumber()).thenReturn(TEST_ISSUE_NUMBER);
    // TODO update metadata source
    Mockito.when(incomingComicBook.getImprint()).thenReturn(TEST_IMPRINT);
    Mockito.when(incomingComicBook.getSortName()).thenReturn(TEST_SORTABLE_NAME);
    Mockito.when(incomingComicBook.getTitle()).thenReturn(TEST_TITLE);
    Mockito.when(incomingComicBook.getDescription()).thenReturn(TEST_DESCRIPTION);

    final ComicBook result = service.updateComic(TEST_COMIC_ID, incomingComicBook);

    assertNotNull(result);
    assertSame(comicBook, result);

    Mockito.verify(comicBookRepository, Mockito.times(2)).getById(TEST_COMIC_ID);
    Mockito.verify(comicBook, Mockito.times(1)).setPublisher(TEST_PUBLISHER);
    Mockito.verify(comicBook, Mockito.times(1)).setSeries(TEST_SERIES);
    Mockito.verify(comicBook, Mockito.times(1)).setVolume(TEST_VOLUME);
    Mockito.verify(comicBook, Mockito.times(1)).setIssueNumber(TEST_ISSUE_NUMBER);
    // TODO update metadata source
    Mockito.verify(comicBook, Mockito.times(1)).setSortName(TEST_SORTABLE_NAME);
    Mockito.verify(comicBook, Mockito.times(1)).setImprint(TEST_IMPRINT);
    Mockito.verify(comicBook, Mockito.times(1)).setTitle(TEST_TITLE);
    Mockito.verify(comicBook, Mockito.times(1)).setDescription(TEST_DESCRIPTION);
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

    service.deleteComic(comicBook);

    Mockito.verify(comicBookRepository, Mockito.times(1)).delete(comicBook);
  }

  @Test
  public void testGetComicsById() {
    Mockito.when(
            comicBookRepository.findComicsWithIdGreaterThan(
                Mockito.anyLong(), pageableCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.getComicsById(TEST_COMIC_ID, TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicBookList, result);
    assertNotNull(pageableCaptor.getValue());
    assertEquals(0, pageableCaptor.getValue().getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageableCaptor.getValue().getPageSize());

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .findComicsWithIdGreaterThan(TEST_COMIC_ID, pageableCaptor.getValue());
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

  @Test(expected = ComicException.class)
  public void testDeleteMetadataInvalidComicId() throws ComicException {
    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.deleteMetadata(TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_ID);
    }
  }

  @Test
  public void testDeleteMetadata() throws ComicException {
    Mockito.when(comicBookRepository.getById(Mockito.anyLong()))
        .thenReturn(comicBook, comicBookRecord);

    final ComicBook result = service.deleteMetadata(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(comicBookRecord, result);

    Mockito.verify(comicBookRepository, Mockito.times(2)).getById(TEST_COMIC_ID);
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
  public void testGetUnprocessedComicsWithoutFileDetailsCount() {
    Mockito.when(comicBookRepository.findUnprocessedComicsWithoutFileDetailsCount())
        .thenReturn(TEST_MAXIMUM_COMICS);

    final long result = service.getUnprocessedComicsWithoutFileDetailsCount();

    assertEquals(TEST_MAXIMUM_COMICS, result);

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .findUnprocessedComicsWithoutFileDetailsCount();
  }

  @Test
  public void testFindUnprocessedComicsWithoutFileDetails() {
    Mockito.when(
            comicBookRepository.findUnprocessedComicsWithoutFileDetails(pageableCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result =
        service.findUnprocessedComicsWithoutFileDetails(TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicBookList, result);

    final Pageable pageable = pageableCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(0, pageable.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageable.getPageSize());

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .findUnprocessedComicsWithoutFileDetails(pageable);
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
  public void testRescanComics() {
    for (long index = 0L; index < 25L; index++) idList.add(index + 100);

    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);

    service.rescanComics(idList);

    idList.forEach(
        id -> Mockito.verify(comicBookRepository, Mockito.times(1)).getById(id.longValue()));
    Mockito.verify(comicStateHandler, Mockito.times(idList.size()))
        .fireEvent(comicBook, ComicEvent.rescanComic);
  }

  @Test
  public void testRescanComicsNoSuchComic() {
    idList.add(TEST_COMIC_ID);

    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);

    service.rescanComics(idList);

    idList.forEach(
        id -> Mockito.verify(comicBookRepository, Mockito.times(1)).getById(id.longValue()));
    Mockito.verify(comicStateHandler, Mockito.never()).fireEvent(comicBook, ComicEvent.rescanComic);
  }

  @Test
  public void testGetCountForState() {
    for (int index = 0; index < 50; index++) comicBookList.add(comicBook);

    Mockito.when(comicBookRepository.findForStateCount(Mockito.any(ComicState.class)))
        .thenReturn(TEST_MAXIMUM_COMICS);

    final int result = service.getCountForState(TEST_STATE);

    assertEquals(TEST_MAXIMUM_COMICS, result);

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
  public void testDeleteComicsInvalidId() {
    idList.add(TEST_COMIC_ID);

    Mockito.when(comicBookRepository.getByIdWithReadingLists(Mockito.anyLong())).thenReturn(null);

    service.deleteComics(idList);

    Mockito.verify(comicBookRepository, Mockito.times(idList.size()))
        .getByIdWithReadingLists(TEST_COMIC_ID);
  }

  @Test
  public void testDeleteComics() {
    idList.add(TEST_COMIC_ID);

    Mockito.when(comicBookRepository.getByIdWithReadingLists(Mockito.anyLong()))
        .thenReturn(comicBook);

    service.deleteComics(idList);

    Mockito.verify(comicBookRepository, Mockito.times(idList.size()))
        .getByIdWithReadingLists(TEST_COMIC_ID);
    Mockito.verify(comicStateHandler, Mockito.times(idList.size()))
        .fireEvent(comicBook, ComicEvent.deleteComic);
  }

  @Test
  public void testUndeleteComicsInvalidId() {
    idList.add(TEST_COMIC_ID);

    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);

    service.undeleteComics(idList);

    Mockito.verify(comicBookRepository, Mockito.times(idList.size())).getById(TEST_COMIC_ID);
  }

  @Test
  public void testUndeleteComics() {
    idList.add(TEST_COMIC_ID);

    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);

    service.undeleteComics(idList);

    Mockito.verify(comicBookRepository, Mockito.times(idList.size())).getById(TEST_COMIC_ID);
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
  public void testFindPublishers() {
    Mockito.when(comicBookRepository.findDistinctPublishers()).thenReturn(collectionList);

    final List<String> result = service.getAllPublishers();

    assertNotNull(result);
    assertSame(collectionList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).findDistinctPublishers();
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
  public void testGetAllForSeries() {
    comicBookList.add(comicBook);

    Mockito.when(comicBookRepository.findAllBySeries(Mockito.anyString()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.getAllForSeries(TEST_SERIES, TEST_EMAIL, false);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertTrue(result.contains(comicBook));

    Mockito.verify(comicBookRepository, Mockito.times(1)).findAllBySeries(TEST_SERIES);
  }

  @Test
  public void testGetAllForSeriesUnread() {
    comicBookList.add(comicBook);
    comicBookList.add(readComicBook);

    Mockito.when(comicBookRepository.findAllBySeries(Mockito.anyString()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.getAllForSeries(TEST_SERIES, TEST_EMAIL, true);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertTrue(result.contains(comicBook));
    assertFalse(result.contains(readComicBook));

    Mockito.verify(comicBookRepository, Mockito.times(1)).findAllBySeries(TEST_SERIES);
  }

  @Test
  public void testFindCharacters() {
    Mockito.when(comicBookRepository.findDistinctCharacters()).thenReturn(collectionList);

    final List<String> result = service.getAllCharacters();

    assertNotNull(result);
    assertSame(collectionList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).findDistinctCharacters();
  }

  @Test
  public void testGetAllForCharacter() {
    comicBookList.add(comicBook);

    Mockito.when(comicBookRepository.findAllByCharacters(Mockito.anyString()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.getAllForCharacter(TEST_CHARACTER, TEST_EMAIL, false);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertTrue(result.contains(comicBook));

    Mockito.verify(comicBookRepository, Mockito.times(1)).findAllByCharacters(TEST_CHARACTER);
  }

  @Test
  public void testGetAllForCharacterUnread() {
    comicBookList.add(comicBook);
    comicBookList.add(readComicBook);

    Mockito.when(comicBookRepository.findAllByCharacters(Mockito.anyString()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.getAllForCharacter(TEST_CHARACTER, TEST_EMAIL, true);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertTrue(result.contains(comicBook));
    assertFalse(result.contains(readComicBook));

    Mockito.verify(comicBookRepository, Mockito.times(1)).findAllByCharacters(TEST_CHARACTER);
  }

  @Test
  public void testFindTeams() {
    Mockito.when(comicBookRepository.findDistinctTeams()).thenReturn(collectionList);

    final List<String> result = service.getAllTeams();

    assertNotNull(result);
    assertSame(collectionList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).findDistinctTeams();
  }

  @Test
  public void testGetAllForTeam() {
    comicBookList.add(comicBook);

    Mockito.when(comicBookRepository.findAllByTeams(Mockito.anyString())).thenReturn(comicBookList);

    final List<ComicBook> result = service.getAllForTeam(TEST_TEAM, TEST_EMAIL, false);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertTrue(result.contains(comicBook));

    Mockito.verify(comicBookRepository, Mockito.times(1)).findAllByTeams(TEST_TEAM);
  }

  @Test
  public void testGetAllForTeamUnread() {
    comicBookList.add(comicBook);
    comicBookList.add(readComicBook);

    Mockito.when(comicBookRepository.findAllByTeams(Mockito.anyString())).thenReturn(comicBookList);

    final List<ComicBook> result = service.getAllForTeam(TEST_TEAM, TEST_EMAIL, true);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertTrue(result.contains(comicBook));
    assertFalse(result.contains(readComicBook));

    Mockito.verify(comicBookRepository, Mockito.times(1)).findAllByTeams(TEST_TEAM);
  }

  @Test
  public void testFindLocations() {
    Mockito.when(comicBookRepository.findDistinctLocations()).thenReturn(collectionList);

    final List<String> result = service.getAllLocations();

    assertNotNull(result);
    assertSame(collectionList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).findDistinctLocations();
  }

  @Test
  public void testGetAllForLocation() {
    comicBookList.add(comicBook);

    Mockito.when(comicBookRepository.findAllByLocations(Mockito.anyString()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.getAllForLocation(TEST_LOCATION, TEST_EMAIL, false);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertTrue(result.contains(comicBook));

    Mockito.verify(comicBookRepository, Mockito.times(1)).findAllByLocations(TEST_LOCATION);
  }

  @Test
  public void testGetAllForLocationUnread() {
    comicBookList.add(comicBook);
    comicBookList.add(readComicBook);

    Mockito.when(comicBookRepository.findAllByLocations(Mockito.anyString()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.getAllForLocation(TEST_LOCATION, TEST_EMAIL, true);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertTrue(result.contains(comicBook));
    assertFalse(result.contains(readComicBook));

    Mockito.verify(comicBookRepository, Mockito.times(1)).findAllByLocations(TEST_LOCATION);
  }

  @Test
  public void testFindStories() {
    Mockito.when(comicBookRepository.findDistinctStories()).thenReturn(collectionList);

    final List<String> result = service.getAllStories();

    assertNotNull(result);
    assertSame(collectionList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).findDistinctStories();
  }

  @Test
  public void testGetAllForStory() {
    comicBookList.add(comicBook);

    Mockito.when(comicBookRepository.findAllByStories(Mockito.anyString()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.getAllForStory(TEST_STORY_NAME, TEST_EMAIL, false);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertTrue(result.contains(comicBook));

    Mockito.verify(comicBookRepository, Mockito.times(1)).findAllByStories(TEST_STORY_NAME);
  }

  @Test
  public void testGetAllForStoryUnread() {
    comicBookList.add(comicBook);
    comicBookList.add(readComicBook);

    Mockito.when(comicBookRepository.findAllByStories(Mockito.anyString()))
        .thenReturn(comicBookList);

    final List<ComicBook> result = service.getAllForStory(TEST_STORY_NAME, TEST_EMAIL, true);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertTrue(result.contains(comicBook));
    assertFalse(result.contains(readComicBook));

    Mockito.verify(comicBookRepository, Mockito.times(1)).findAllByStories(TEST_STORY_NAME);
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

  @Test(expected = ComicException.class)
  public void testSavePageOrderInvalidId() throws ComicException {
    List<PageOrderEntry> entryList = new ArrayList<>();
    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.savePageOrder(TEST_COMIC_ID, entryList);
    } finally {
      Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_ID);
    }
  }

  @Test(expected = ComicException.class)
  public void testSavePageOrderContainsGap() throws ComicException {
    List<PageOrderEntry> entryList = new ArrayList<>();
    for (int index = 0; index < 25; index++) {
      entryList.add(new PageOrderEntry(String.format("filename-%d", index), index + 1));
    }

    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);

    try {
      service.savePageOrder(TEST_COMIC_ID, entryList);
    } finally {
      Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_ID);
    }
  }

  @Test(expected = ComicException.class)
  public void testSavePageOrderMissingFilename() throws ComicException {
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
      service.savePageOrder(TEST_COMIC_ID, entryList);
    } finally {
      Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_ID);
    }
  }

  @Test
  public void testSavePageOrder() throws ComicException {
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

    service.savePageOrder(TEST_COMIC_ID, entryList);

    for (int index = 0; index < entryList.size(); index++) {
      final PageOrderEntry pageOrderEntry = entryList.get(index);
      final Optional<Page> pageListEntry =
          pageList.stream()
              .filter(entry -> entry.getFilename().equals(pageOrderEntry.getFilename()))
              .findFirst();

      assertTrue(pageListEntry.isPresent());
      assertEquals(pageOrderEntry.getPosition(), pageListEntry.get().getPageNumber().intValue());
    }

    Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_ID);
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(comicBook, ComicEvent.detailsUpdated);
  }

  @Test(expected = ComicException.class)
  public void testUpdateMultipleComicsInvalidId() throws ComicException {
    idList.add(TEST_COMIC_ID);

    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.updateMultipleComics(
          idList, TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER, TEST_IMPRINT);
    } finally {
      Mockito.verify(comicBookRepository, Mockito.times(1)).getById(TEST_COMIC_ID);
    }
  }

  @Test
  public void testUpdateMultipleComics() throws ComicException {
    idList.add(TEST_COMIC_ID);

    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);

    service.updateMultipleComics(
        idList, TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER, TEST_IMPRINT);

    Mockito.verify(comicBook, Mockito.times(1)).setPublisher(TEST_PUBLISHER);
    Mockito.verify(comicBook, Mockito.times(1)).setSeries(TEST_SERIES);
    Mockito.verify(comicBook, Mockito.times(1)).setVolume(TEST_VOLUME);
    Mockito.verify(comicBook, Mockito.times(1)).setIssueNumber(TEST_ISSUE_NUMBER);
    Mockito.verify(comicBook, Mockito.times(1)).setImprint(TEST_IMPRINT);
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(comicBook, ComicEvent.detailsUpdated);
  }

  @Test
  public void testUpdateMultipleComicsNoPublisher() throws ComicException {
    idList.add(TEST_COMIC_ID);

    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);

    service.updateMultipleComics(
        idList, null, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER, TEST_IMPRINT);

    Mockito.verify(comicBook, Mockito.never()).setPublisher(Mockito.anyString());
    Mockito.verify(comicBook, Mockito.times(1)).setSeries(TEST_SERIES);
    Mockito.verify(comicBook, Mockito.times(1)).setVolume(TEST_VOLUME);
    Mockito.verify(comicBook, Mockito.times(1)).setIssueNumber(TEST_ISSUE_NUMBER);
    Mockito.verify(comicBook, Mockito.times(1)).setImprint(TEST_IMPRINT);
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(comicBook, ComicEvent.detailsUpdated);
  }

  @Test
  public void testUpdateMultipleComicsNoSeries() throws ComicException {
    idList.add(TEST_COMIC_ID);

    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);

    service.updateMultipleComics(
        idList, TEST_PUBLISHER, null, TEST_VOLUME, TEST_ISSUE_NUMBER, TEST_IMPRINT);

    Mockito.verify(comicBook, Mockito.times(1)).setPublisher(TEST_PUBLISHER);
    Mockito.verify(comicBook, Mockito.never()).setSeries(Mockito.anyString());
    Mockito.verify(comicBook, Mockito.times(1)).setVolume(TEST_VOLUME);
    Mockito.verify(comicBook, Mockito.times(1)).setIssueNumber(TEST_ISSUE_NUMBER);
    Mockito.verify(comicBook, Mockito.times(1)).setImprint(TEST_IMPRINT);
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(comicBook, ComicEvent.detailsUpdated);
  }

  @Test
  public void testUpdateMultipleComicsNoVolume() throws ComicException {
    idList.add(TEST_COMIC_ID);

    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);

    service.updateMultipleComics(
        idList, TEST_PUBLISHER, TEST_SERIES, null, TEST_ISSUE_NUMBER, TEST_IMPRINT);

    Mockito.verify(comicBook, Mockito.times(1)).setPublisher(TEST_PUBLISHER);
    Mockito.verify(comicBook, Mockito.times(1)).setSeries(TEST_SERIES);
    Mockito.verify(comicBook, Mockito.never()).setVolume(Mockito.anyString());
    Mockito.verify(comicBook, Mockito.times(1)).setIssueNumber(TEST_ISSUE_NUMBER);
    Mockito.verify(comicBook, Mockito.times(1)).setImprint(TEST_IMPRINT);
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(comicBook, ComicEvent.detailsUpdated);
  }

  @Test
  public void testUpdateMultipleComicsNoIssueNumber() throws ComicException {
    idList.add(TEST_COMIC_ID);

    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);

    service.updateMultipleComics(
        idList, TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, null, TEST_IMPRINT);

    Mockito.verify(comicBook, Mockito.times(1)).setPublisher(TEST_PUBLISHER);
    Mockito.verify(comicBook, Mockito.times(1)).setSeries(TEST_SERIES);
    Mockito.verify(comicBook, Mockito.times(1)).setVolume(TEST_VOLUME);
    Mockito.verify(comicBook, Mockito.never()).setIssueNumber(Mockito.anyString());
    Mockito.verify(comicBook, Mockito.times(1)).setImprint(TEST_IMPRINT);
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(comicBook, ComicEvent.detailsUpdated);
  }

  @Test
  public void testUpdateMultipleComicsNoImprint() throws ComicException {
    idList.add(TEST_COMIC_ID);

    Mockito.when(comicBookRepository.getById(Mockito.anyLong())).thenReturn(comicBook);

    service.updateMultipleComics(
        idList, TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER, null);

    Mockito.verify(comicBook, Mockito.times(1)).setPublisher(TEST_PUBLISHER);
    Mockito.verify(comicBook, Mockito.times(1)).setSeries(TEST_SERIES);
    Mockito.verify(comicBook, Mockito.times(1)).setVolume(TEST_VOLUME);
    Mockito.verify(comicBook, Mockito.times(1)).setIssueNumber(TEST_ISSUE_NUMBER);
    Mockito.verify(comicBook, Mockito.never()).setImprint(Mockito.anyString());
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(comicBook, ComicEvent.detailsUpdated);
  }

  @Test
  public void testGetYearsForComics() {
    Mockito.when(comicBookRepository.loadYearsWithComics()).thenReturn(yearList);

    final List<Integer> result = service.getYearsForComics();

    assertNotNull(result);
    assertSame(yearList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).loadYearsWithComics();
  }

  @Test
  public void testGetWeeksForComics() {
    weeksList.add(now);

    Mockito.when(comicBookRepository.loadWeeksForYear(Mockito.anyInt())).thenReturn(weeksList);

    final List<Integer> result = service.getWeeksForYear(calendar.get(Calendar.YEAR));

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertTrue(result.contains(calendar.get(Calendar.WEEK_OF_YEAR)));

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .loadWeeksForYear(calendar.get(Calendar.YEAR));
  }

  @Test
  public void testGetComicsForYearAndWeek() {
    comicBookList.add(comicBook);

    Mockito.when(
            comicBookRepository.findWithCoverDateRange(
                startDateArgumentCaptor.capture(), endDateArgumentCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result =
        service.getComicsForYearAndWeek(
            calendar.get(Calendar.YEAR), calendar.get(Calendar.WEEK_OF_YEAR), TEST_EMAIL, false);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertTrue(result.contains(comicBook));

    final Date startDate = startDateArgumentCaptor.getValue();
    assertNotNull(startDate);
    final Date endDate = endDateArgumentCaptor.getValue();
    assertNotNull(endDate);
    assertTrue(startDate.before(endDate));

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .findWithCoverDateRange(startDate, endDate);
  }

  @Test
  public void testGetComicsForYearAndWeekUnread() {
    comicBookList.add(comicBook);
    comicBookList.add(readComicBook);

    Mockito.when(
            comicBookRepository.findWithCoverDateRange(
                startDateArgumentCaptor.capture(), endDateArgumentCaptor.capture()))
        .thenReturn(comicBookList);

    final List<ComicBook> result =
        service.getComicsForYearAndWeek(
            calendar.get(Calendar.YEAR), calendar.get(Calendar.WEEK_OF_YEAR), TEST_EMAIL, true);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertTrue(result.contains(comicBook));
    assertFalse(result.contains(readComicBook));

    final Date startDate = startDateArgumentCaptor.getValue();
    assertNotNull(startDate);
    final Date endDate = endDateArgumentCaptor.getValue();
    assertNotNull(endDate);
    assertTrue(startDate.before(endDate));

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .findWithCoverDateRange(startDate, endDate);
  }

  @Test
  public void testGetAllSeriesForPublisher() {
    Mockito.when(comicBookRepository.getAllSeriesForPublisher(Mockito.anyString()))
        .thenReturn(seriesList);

    final Set<String> result = service.getAllSeriesForPublisher(TEST_PUBLISHER);

    assertNotNull(result);
    assertSame(seriesList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).getAllSeriesForPublisher(TEST_PUBLISHER);
  }

  @Test
  public void testGetAllVolumesForPublisherAndSeries() {
    Mockito.when(
            comicBookRepository.getAllVolumesForPublisherAndSeries(
                Mockito.anyString(), Mockito.anyString()))
        .thenReturn(volumeList);

    final Set<String> result =
        service.getAllVolumesForPublisherAndSeries(TEST_PUBLISHER, TEST_SERIES);

    assertNotNull(result);
    assertSame(volumeList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .getAllVolumesForPublisherAndSeries(TEST_PUBLISHER, TEST_SERIES);
  }

  @Test
  public void testGetComicBooksForPublisherAndSeriesAndVolume() {
    comicBookList.add(comicBook);
    comicBookList.add(readComicBook);

    Mockito.when(
            comicBookRepository.getAllComicBooksForPublisherAndSeriesAndVolume(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(comicBookList);

    final List<ComicBook> result =
        service.getAllComicBooksForPublisherAndSeriesAndVolume(
            TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_EMAIL, false);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertTrue(result.contains(comicBook));
    assertTrue(result.contains(readComicBook));

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .getAllComicBooksForPublisherAndSeriesAndVolume(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME);
  }

  @Test
  public void testGetComicBooksForPublisherAndSeriesAndVolumeUnread() {
    comicBookList.add(comicBook);
    comicBookList.add(readComicBook);

    Mockito.when(
            comicBookRepository.getAllComicBooksForPublisherAndSeriesAndVolume(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(comicBookList);

    final List<ComicBook> result =
        service.getAllComicBooksForPublisherAndSeriesAndVolume(
            TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_EMAIL, true);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertTrue(result.contains(comicBook));
    assertFalse(result.contains(readComicBook));

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .getAllComicBooksForPublisherAndSeriesAndVolume(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME);
  }

  @Test
  public void testFGetAllVolumesForSeries() {
    Mockito.when(comicBookRepository.findDistinctVolumesForSeries(Mockito.anyString()))
        .thenReturn(volumeList);

    final Set<String> result = service.getAllVolumesForSeries(TEST_SERIES);

    assertNotNull(result);
    assertSame(volumeList, result);

    Mockito.verify(comicBookRepository, Mockito.times(1)).findDistinctVolumesForSeries(TEST_SERIES);
  }

  @Test
  public void testGetAllComicsForSeriesAndVolume() {
    comicBookList.add(comicBook);
    comicBookList.add(readComicBook);

    Mockito.when(
            comicBookRepository.getAllComicBooksForSeriesAndVolume(
                Mockito.anyString(), Mockito.anyString()))
        .thenReturn(comicBookList);

    final List<ComicBook> result =
        service.getAllComicBooksForSeriesAndVolume(TEST_SERIES, TEST_VOLUME, TEST_EMAIL, false);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertTrue(result.contains(comicBook));
    assertTrue(result.contains(readComicBook));

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .getAllComicBooksForSeriesAndVolume(TEST_SERIES, TEST_VOLUME);
  }

  @Test
  public void testGetAllComicsForSeriesAndVolumeUnread() {
    comicBookList.add(comicBook);
    comicBookList.add(readComicBook);

    Mockito.when(
            comicBookRepository.getAllComicBooksForSeriesAndVolume(
                Mockito.anyString(), Mockito.anyString()))
        .thenReturn(comicBookList);

    final List<ComicBook> result =
        service.getAllComicBooksForSeriesAndVolume(TEST_SERIES, TEST_VOLUME, TEST_EMAIL, true);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertTrue(result.contains(comicBook));
    assertFalse(result.contains(readComicBook));

    Mockito.verify(comicBookRepository, Mockito.times(1))
        .getAllComicBooksForSeriesAndVolume(TEST_SERIES, TEST_VOLUME);
  }
}

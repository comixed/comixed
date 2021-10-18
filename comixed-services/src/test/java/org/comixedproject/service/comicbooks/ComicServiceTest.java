/*
 * ComiXed - A digital comic book library management application.
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
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.adaptors.comicbooks.ComicDataAdaptor;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.comicbooks.PublishComicUpdateAction;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.repositories.comicbooks.ComicRepository;
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
public class ComicServiceTest {
  private static final long TEST_COMIC_ID = 5;
  private static final String TEST_COMIC_FILENAME = "src/test/resources/example.cbz";
  private static final String TEST_PUBLISHER = "Awesome Publications";
  private static final String TEST_SERIES = "Series Name";
  private static final String TEST_VOLUME = "Volume Name";
  private static final String TEST_ISSUE_NUMBER = "237";
  private static final Integer TEST_COMIC_VINE_ID = 2345;
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
  private static final ComicState TEST_STATE =
      ComicState.values()[(RandomUtils.nextInt(ComicState.values().length))];
  private static final String TEST_CHARACTER = "Manlyman";
  private static final String TEST_TEAM = "The Boys";
  private static final String TEST_LOCATION = "The Location";
  private static final String TEST_STORY_NAME = "The Story Name";

  @InjectMocks private ComicService service;
  @Mock private ComicStateHandler comicStateHandler;
  @Mock private ComicRepository comicRepository;
  @Mock private PublishComicUpdateAction comicUpdatePublishAction;
  @Mock private ComicDataAdaptor comicDataAdaptor;
  @Mock private Comic comic;
  @Mock private Comic incomingComic;
  @Mock private Comic comicRecord;
  @Mock private State<ComicState, ComicEvent> state;
  @Mock private Message<ComicEvent> message;
  @Mock private MessageHeaders messageHeaders;
  @Mock private ImprintService imprintService;
  @Mock private List<String> collectionList;
  @Mock private List<String> publisherList;

  @Captor private ArgumentCaptor<Pageable> pageableCaptor;
  @Captor private ArgumentCaptor<PageRequest> pageRequestCaptor;

  private List<Comic> comicList = new ArrayList<>();
  private List<Comic> comicsBySeries = new ArrayList<>();
  private Comic previousComic = new Comic();
  private Comic currentComic = new Comic();
  private Comic nextComic = new Comic();
  private List<Long> idList = new ArrayList<>();

  @Before
  public void setUp() throws ComiXedUserException {
    previousComic.setIssueNumber(TEST_PREVIOUS_ISSUE_NUMBER);
    previousComic.setCoverDate(new Date(System.currentTimeMillis() - 24 * 60 * 60 * 1000));
    currentComic.setSeries(TEST_SERIES);
    currentComic.setVolume(TEST_VOLUME);
    currentComic.setIssueNumber(TEST_CURRENT_ISSUE_NUMBER);
    currentComic.setCoverDate(new Date(System.currentTimeMillis()));
    currentComic.setCoverDate(TEST_COVER_DATE);
    nextComic.setIssueNumber(TEST_NEXT_ISSUE_NUMBER);
    nextComic.setCoverDate(new Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000));
    comicsBySeries.add(nextComic);
    comicsBySeries.add(previousComic);
    comicsBySeries.add(currentComic);
  }

  @Test
  public void testAfterPropertiesSet() throws Exception {
    service.afterPropertiesSet();

    Mockito.verify(comicStateHandler, Mockito.times(1)).addListener(service);
  }

  @Test
  public void testOnComicStateChange() throws PublishingException {
    Mockito.when(message.getHeaders()).thenReturn(messageHeaders);
    Mockito.when(messageHeaders.get(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(comic);
    Mockito.when(state.getId()).thenReturn(TEST_STATE);
    Mockito.when(comicRepository.save(Mockito.any(Comic.class))).thenReturn(comicRecord);

    service.onComicStateChange(state, message);

    Mockito.verify(comic, Mockito.times(1)).setComicState(TEST_STATE);
    Mockito.verify(comic, Mockito.times(1)).setLastModifiedOn(Mockito.any(Date.class));
    Mockito.verify(comicRepository, Mockito.times(1)).save(comic);
    Mockito.verify(comicUpdatePublishAction, Mockito.times(1)).publish(comicRecord);
  }

  @Test
  public void testOnComicStateChangePublishError() throws PublishingException {
    Mockito.when(message.getHeaders()).thenReturn(messageHeaders);
    Mockito.when(messageHeaders.get(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(comic);
    Mockito.when(state.getId()).thenReturn(TEST_STATE);
    Mockito.when(comicRepository.save(Mockito.any(Comic.class))).thenReturn(comicRecord);
    Mockito.doThrow(PublishingException.class)
        .when(comicUpdatePublishAction)
        .publish(Mockito.any(Comic.class));

    service.onComicStateChange(state, message);

    Mockito.verify(comic, Mockito.times(1)).setComicState(TEST_STATE);
    Mockito.verify(comic, Mockito.times(1)).setLastModifiedOn(Mockito.any(Date.class));
    Mockito.verify(comicRepository, Mockito.times(1)).save(comic);
    Mockito.verify(comicUpdatePublishAction, Mockito.times(1)).publish(comicRecord);
  }

  @Test
  public void testGetComic() throws ComicException, ComiXedUserException {
    List<Comic> previousComics = new ArrayList<>();
    previousComics.add(previousComic);
    List<Comic> nextComics = new ArrayList<>();
    nextComics.add(nextComic);

    Mockito.when(comicRepository.getById(Mockito.anyLong())).thenReturn(currentComic);

    Mockito.when(
            comicRepository.findIssuesBeforeComic(
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.any(Date.class)))
        .thenReturn(previousComics);
    Mockito.when(
            comicRepository.findIssuesAfterComic(
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.any(Date.class)))
        .thenReturn(nextComics);

    final Comic result = service.getComic(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(currentComic, result);
    assertEquals(previousComic.getId(), result.getPreviousIssueId());
    assertEquals(nextComic.getId(), result.getNextIssueId());

    Mockito.verify(comicRepository, Mockito.times(1)).getById(TEST_COMIC_ID);
    Mockito.verify(comicRepository, Mockito.times(1))
        .findIssuesBeforeComic(
            TEST_SERIES, TEST_VOLUME, TEST_CURRENT_ISSUE_NUMBER, TEST_COVER_DATE);
    Mockito.verify(comicRepository, Mockito.times(1))
        .findIssuesAfterComic(TEST_SERIES, TEST_VOLUME, TEST_CURRENT_ISSUE_NUMBER, TEST_COVER_DATE);
  }

  @Test(expected = ComicException.class)
  public void testDeleteComicNonexistent() throws ComicException {
    Mockito.when(comicRepository.getByIdWithReadingLists(Mockito.anyLong())).thenReturn(null);

    try {
      service.deleteComic(TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicRepository, Mockito.times(1)).getByIdWithReadingLists(TEST_COMIC_ID);
    }
  }

  @Test
  public void testDeleteComic() throws ComicException {
    Mockito.when(comicRepository.getByIdWithReadingLists(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(comicRepository.getById(Mockito.anyLong())).thenReturn(comicRecord);

    final Comic result = service.deleteComic(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(comicRecord, result);

    Mockito.verify(comicRepository, Mockito.times(1)).getByIdWithReadingLists(TEST_COMIC_ID);
    Mockito.verify(comicRepository, Mockito.times(1)).getById(TEST_COMIC_ID);
    Mockito.verify(comicStateHandler, Mockito.times(1)).fireEvent(comic, ComicEvent.deleteComic);
  }

  @Test(expected = ComicException.class)
  public void testRestoreComicNonexistent() throws ComicException {
    Mockito.when(comicRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.undeleteComic(TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicRepository, Mockito.times(1)).getById(TEST_COMIC_ID);
    }
  }

  @Test
  public void testRestoreComic() throws ComicException {
    Mockito.when(comicRepository.getById(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(comicRepository.getById(Mockito.anyLong())).thenReturn(comicRecord);

    final Comic response = service.undeleteComic(TEST_COMIC_ID);

    assertNotNull(response);
    assertSame(comicRecord, response);

    Mockito.verify(comicRepository, Mockito.times(2)).getById(TEST_COMIC_ID);
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(comicRecord, ComicEvent.undeleteComic);
  }

  @Test
  public void testGetComicContentNonexistent() {
    Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILENAME.substring(1));

    final byte[] result = this.service.getComicContent(comic);

    assertNull(result);

    Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
  }

  @Test
  public void testGetComicContent() {
    Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILENAME);

    final byte[] result = this.service.getComicContent(comic);

    assertNotNull(result);
    assertEquals(new File(TEST_COMIC_FILENAME).length(), result.length);

    Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
  }

  @Test(expected = ComicException.class)
  public void testUpdateComicInvalidComic() throws ComicException {
    Mockito.when(comicRepository.getById(Mockito.anyLong())).thenReturn(null);
    try {
      service.updateComic(TEST_COMIC_ID, incomingComic);
    } finally {
      Mockito.verify(comicRepository, Mockito.times(1)).getById(TEST_COMIC_ID);
    }
  }

  @Test(expected = ComicException.class)
  public void testUpdateComicInvalidId() throws ComicException {
    Mockito.when(comicRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.updateComic(TEST_COMIC_ID, incomingComic);
    } finally {
      Mockito.verify(comicRepository, Mockito.times(1)).getById(TEST_COMIC_ID);
    }
  }

  @Test
  public void testUpdateComic() throws ComicException {
    Mockito.when(comicRepository.getById(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(incomingComic.getPublisher()).thenReturn(TEST_PUBLISHER);
    Mockito.when(incomingComic.getSeries()).thenReturn(TEST_SERIES);
    Mockito.when(incomingComic.getVolume()).thenReturn(TEST_VOLUME);
    Mockito.when(incomingComic.getIssueNumber()).thenReturn(TEST_ISSUE_NUMBER);
    Mockito.when(incomingComic.getComicVineId()).thenReturn(TEST_COMIC_VINE_ID);
    Mockito.when(incomingComic.getImprint()).thenReturn(TEST_IMPRINT);
    Mockito.when(incomingComic.getSortName()).thenReturn(TEST_SORTABLE_NAME);
    Mockito.when(incomingComic.getTitle()).thenReturn(TEST_TITLE);
    Mockito.when(incomingComic.getDescription()).thenReturn(TEST_DESCRIPTION);

    final Comic result = service.updateComic(TEST_COMIC_ID, incomingComic);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(comicRepository, Mockito.times(2)).getById(TEST_COMIC_ID);
    Mockito.verify(comic, Mockito.times(1)).setPublisher(TEST_PUBLISHER);
    Mockito.verify(comic, Mockito.times(1)).setSeries(TEST_SERIES);
    Mockito.verify(comic, Mockito.times(1)).setVolume(TEST_VOLUME);
    Mockito.verify(comic, Mockito.times(1)).setIssueNumber(TEST_ISSUE_NUMBER);
    Mockito.verify(comic, Mockito.times(1)).setComicVineId(TEST_COMIC_VINE_ID);
    Mockito.verify(comic, Mockito.times(1)).setSortName(TEST_SORTABLE_NAME);
    Mockito.verify(comic, Mockito.times(1)).setImprint(TEST_IMPRINT);
    Mockito.verify(comic, Mockito.times(1)).setTitle(TEST_TITLE);
    Mockito.verify(comic, Mockito.times(1)).setDescription(TEST_DESCRIPTION);
    Mockito.verify(comicStateHandler, Mockito.times(1)).fireEvent(comic, ComicEvent.detailsUpdated);
    Mockito.verify(imprintService, Mockito.times(1)).update(comic);
  }

  @Test
  public void testSave() {
    Mockito.when(comicRepository.save(Mockito.any(Comic.class))).thenReturn(comic);

    final Comic result = this.service.save(comic);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(comicRepository, Mockito.times(1)).save(comic);
  }

  @Test
  public void testDelete() {
    Mockito.doNothing().when(comicRepository).delete(Mockito.any(Comic.class));

    service.deleteComic(comic);

    Mockito.verify(comicRepository, Mockito.times(1)).delete(comic);
  }

  @Test
  public void testGetComicsById() {
    Mockito.when(
            comicRepository.findComicsWithIdGreaterThan(
                Mockito.anyLong(), pageableCaptor.capture()))
        .thenReturn(comicList);

    final List<Comic> result = service.getComicsById(TEST_COMIC_ID, TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicList, result);
    assertNotNull(pageableCaptor.getValue());
    assertEquals(0, pageableCaptor.getValue().getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageableCaptor.getValue().getPageSize());

    Mockito.verify(comicRepository, Mockito.times(1))
        .findComicsWithIdGreaterThan(TEST_COMIC_ID, pageableCaptor.getValue());
  }

  @Test
  public void testFindComicsToMove() {
    Mockito.when(comicRepository.findComicsToMove(pageRequestCaptor.capture()))
        .thenReturn(comicList);

    final List<Comic> result = service.findComicsToMove(TEST_PAGE, TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicList, result);

    assertNotNull(pageRequestCaptor.getValue());
    final PageRequest request = pageRequestCaptor.getValue();
    assertEquals(TEST_PAGE, request.getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, request.getPageSize());

    Mockito.verify(comicRepository, Mockito.times(1))
        .findComicsToMove(pageRequestCaptor.getValue());
  }

  @Test
  public void testFindByFilename() {
    Mockito.when(comicRepository.findByFilename(TEST_COMIC_FILENAME)).thenReturn(comic);

    final Comic result = service.findByFilename(TEST_COMIC_FILENAME);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(comicRepository, Mockito.times(1)).findByFilename(TEST_COMIC_FILENAME);
  }

  @Test(expected = ComicException.class)
  public void testDeleteMetadataInvalidComicId() throws ComicException {
    Mockito.when(comicRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.deleteMetadata(TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicRepository, Mockito.times(1)).getById(TEST_COMIC_ID);
    }
  }

  @Test
  public void testDeleteMetadata() throws ComicException {
    Mockito.when(comicRepository.getById(Mockito.anyLong())).thenReturn(comic, comicRecord);

    final Comic result = service.deleteMetadata(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(comicRecord, result);

    Mockito.verify(comicRepository, Mockito.times(2)).getById(TEST_COMIC_ID);
    Mockito.verify(comicDataAdaptor, Mockito.times(1)).clear(comic);
    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(comic, ComicEvent.metadataCleared);
  }

  @Test
  public void testFindInsertedComics() {
    Mockito.when(comicRepository.findForState(Mockito.any(ComicState.class))).thenReturn(comicList);

    final List<Comic> result = service.findInsertedComics();

    assertNotNull(result);
    assertSame(comicList, result);

    Mockito.verify(comicRepository, Mockito.times(1)).findForState(ComicState.ADDED);
  }

  @Test
  public void testFindUnprocessedComicsWithoutContent() {
    Mockito.when(comicRepository.findUnprocessedComicsWithoutContent()).thenReturn(comicList);

    final List<Comic> result = service.findUnprocessedComicsWithoutContent();

    assertNotNull(result);
    assertSame(comicList, result);

    Mockito.verify(comicRepository, Mockito.times(1)).findUnprocessedComicsWithoutContent();
  }

  @Test
  public void testFindUnprocessedComicsForMarkedPageBlocking() {
    Mockito.when(comicRepository.findUnprocessedComicsForMarkedPageBlocking())
        .thenReturn(comicList);

    final List<Comic> result = service.findUnprocessedComicsForMarkedPageBlocking();

    assertNotNull(result);
    assertSame(comicList, result);

    Mockito.verify(comicRepository, Mockito.times(1)).findUnprocessedComicsForMarkedPageBlocking();
  }

  @Test
  public void testFindUnprocessedComicsWithoutFileDetails() {
    Mockito.when(comicRepository.findUnprocessedComicsWithoutFileDetails()).thenReturn(comicList);

    final List<Comic> result = service.findUnprocessedComicsWithoutFileDetails();

    assertNotNull(result);
    assertSame(comicList, result);

    Mockito.verify(comicRepository, Mockito.times(1)).findUnprocessedComicsWithoutFileDetails();
  }

  @Test
  public void testFindProcessedComics() {
    Mockito.when(comicRepository.findProcessedComics()).thenReturn(comicList);

    final List<Comic> result = service.findProcessedComics();

    assertNotNull(result);
    assertSame(comicList, result);

    Mockito.verify(comicRepository, Mockito.times(1)).findProcessedComics();
  }

  @Test
  public void testRescanComics() {
    for (long index = 0L; index < 25L; index++) idList.add(index + 100);

    Mockito.when(comicRepository.getById(Mockito.anyLong())).thenReturn(comic);

    service.rescanComics(idList);

    idList.forEach(id -> Mockito.verify(comicRepository, Mockito.times(1)).getById(id));
    Mockito.verify(comicStateHandler, Mockito.times(idList.size()))
        .fireEvent(comic, ComicEvent.rescanComic);
  }

  @Test
  public void testRescanComicsNoSuchComic() {
    idList.add(TEST_COMIC_ID);

    Mockito.when(comicRepository.getById(Mockito.anyLong())).thenReturn(null);

    service.rescanComics(idList);

    idList.forEach(id -> Mockito.verify(comicRepository, Mockito.times(1)).getById(id));
    Mockito.verify(comicStateHandler, Mockito.never()).fireEvent(comic, ComicEvent.rescanComic);
  }

  @Test
  public void testGetCountForState() {
    for (int index = 0; index < 50; index++) comicList.add(comic);

    Mockito.when(comicRepository.findForState(Mockito.any(ComicState.class))).thenReturn(comicList);

    final int result = service.getCountForState(TEST_STATE);

    assertEquals(comicList.size(), result);

    Mockito.verify(comicRepository, Mockito.times(1)).findForState(TEST_STATE);
  }

  @Test
  public void testFindComicsWithMetadataToUpdate() {
    Mockito.when(comicRepository.findComicsWithMetadataToUpdate()).thenReturn(comicList);

    final List<Comic> result = service.findComicsWithMetadataToUpdate();

    assertNotNull(result);
    assertSame(comicList, result);

    Mockito.verify(comicRepository, Mockito.times(1)).findComicsWithMetadataToUpdate();
  }

  @Test
  public void testFindAllComicsMarkedForDeletion() {
    Mockito.when(comicRepository.findComicsMarkedForDeletion()).thenReturn(comicList);

    final List<Comic> result = service.findComicsMarkedForDeletion();

    assertNotNull(result);
    assertSame(comicList, result);

    Mockito.verify(comicRepository, Mockito.times(1)).findComicsMarkedForDeletion();
  }

  @Test
  public void testFindComicsToBeMoved() {
    Mockito.when(comicRepository.findComicsToBeMoved()).thenReturn(comicList);

    final List<Comic> result = service.findComicsToBeMoved();

    assertNotNull(result);
    assertSame(comicList, result);

    Mockito.verify(comicRepository, Mockito.times(1)).findComicsToBeMoved();
  }

  @Test
  public void testFindAll() {
    Mockito.when(comicRepository.findAll()).thenReturn(comicList);

    final List<Comic> result = service.findAll();

    assertNotNull(result);
    assertSame(comicList, result);

    Mockito.verify(comicRepository, Mockito.times(1)).findAll();
  }

  @Test
  public void testDeleteComicsInvalidId() {
    idList.add(TEST_COMIC_ID);

    Mockito.when(comicRepository.getByIdWithReadingLists(Mockito.anyLong())).thenReturn(null);

    service.deleteComics(idList);

    Mockito.verify(comicRepository, Mockito.times(idList.size()))
        .getByIdWithReadingLists(TEST_COMIC_ID);
  }

  @Test
  public void testDeleteComics() {
    idList.add(TEST_COMIC_ID);

    Mockito.when(comicRepository.getByIdWithReadingLists(Mockito.anyLong())).thenReturn(comic);

    service.deleteComics(idList);

    Mockito.verify(comicRepository, Mockito.times(idList.size()))
        .getByIdWithReadingLists(TEST_COMIC_ID);
    Mockito.verify(comicStateHandler, Mockito.times(idList.size()))
        .fireEvent(comic, ComicEvent.deleteComic);
  }

  @Test
  public void testUndeleteComicsInvalidId() {
    idList.add(TEST_COMIC_ID);

    Mockito.when(comicRepository.getById(Mockito.anyLong())).thenReturn(null);

    service.undeleteComics(idList);

    Mockito.verify(comicRepository, Mockito.times(idList.size())).getById(TEST_COMIC_ID);
  }

  @Test
  public void testUndeleteComics() {
    idList.add(TEST_COMIC_ID);

    Mockito.when(comicRepository.getById(Mockito.anyLong())).thenReturn(comic);

    service.undeleteComics(idList);

    Mockito.verify(comicRepository, Mockito.times(idList.size())).getById(TEST_COMIC_ID);
    Mockito.verify(comicStateHandler, Mockito.times(idList.size()))
        .fireEvent(comic, ComicEvent.undeleteComic);
  }

  @Test
  public void testFindAllComicsToRecreate() {
    Mockito.when(comicRepository.findComicsToRecreate()).thenReturn(comicList);

    final List<Comic> result = service.findComicsToRecreate();

    assertNotNull(result);
    assertSame(comicList, result);

    Mockito.verify(comicRepository, Mockito.times(1)).findComicsToRecreate();
  }

  @Test
  public void testFindComicNotFound() {
    Mockito.when(
            comicRepository.findComic(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(null);

    final Comic result =
        service.findComic(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER);

    assertNull(result);

    Mockito.verify(comicRepository, Mockito.times(1))
        .findComic(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER);
  }

  @Test
  public void testFindComic() {
    Mockito.when(
            comicRepository.findComic(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(comic);

    final Comic result =
        service.findComic(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(comicRepository, Mockito.times(1))
        .findComic(TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER);
  }

  @Test
  public void testFindPublishers() {
    Mockito.when(comicRepository.findDistinctPublishers()).thenReturn(collectionList);

    final List<String> result = service.getAllPublishers();

    assertNotNull(result);
    assertSame(collectionList, result);

    Mockito.verify(comicRepository, Mockito.times(1)).findDistinctPublishers();
  }

  @Test
  public void testGetAllForPublisher() {
    Mockito.when(comicRepository.findAllByPublisher(Mockito.anyString())).thenReturn(comicList);

    final List<Comic> result = service.getAllForPublisher(TEST_PUBLISHER);

    assertNotNull(result);
    assertSame(comicList, result);

    Mockito.verify(comicRepository, Mockito.times(1)).findAllByPublisher(TEST_PUBLISHER);
  }

  @Test
  public void testFindSeries() {
    Mockito.when(comicRepository.findDistinctSeries()).thenReturn(collectionList);

    final List<String> result = service.getAllSeries();

    assertNotNull(result);
    assertSame(collectionList, result);

    Mockito.verify(comicRepository, Mockito.times(1)).findDistinctSeries();
  }

  @Test
  public void testGetAllForSeries() {
    Mockito.when(comicRepository.findAllBySeries(Mockito.anyString())).thenReturn(comicList);

    final List<Comic> result = service.getAllForSeries(TEST_SERIES);

    assertNotNull(result);
    assertSame(comicList, result);

    Mockito.verify(comicRepository, Mockito.times(1)).findAllBySeries(TEST_SERIES);
  }

  @Test
  public void testFindCharacters() {
    Mockito.when(comicRepository.findDistinctCharacters()).thenReturn(collectionList);

    final List<String> result = service.getAllCharacters();

    assertNotNull(result);
    assertSame(collectionList, result);

    Mockito.verify(comicRepository, Mockito.times(1)).findDistinctCharacters();
  }

  @Test
  public void testGetAllForCharacter() {
    Mockito.when(comicRepository.findAllByCharacters(Mockito.anyString())).thenReturn(comicList);

    final List<Comic> result = service.getAllForCharacter(TEST_CHARACTER);

    assertNotNull(result);
    assertSame(comicList, result);

    Mockito.verify(comicRepository, Mockito.times(1)).findAllByCharacters(TEST_CHARACTER);
  }

  @Test
  public void testFindTeams() {
    Mockito.when(comicRepository.findDistinctTeams()).thenReturn(collectionList);

    final List<String> result = service.getAllTeams();

    assertNotNull(result);
    assertSame(collectionList, result);

    Mockito.verify(comicRepository, Mockito.times(1)).findDistinctTeams();
  }

  @Test
  public void testGetAllForTeam() {
    Mockito.when(comicRepository.findAllByTeams(Mockito.anyString())).thenReturn(comicList);

    final List<Comic> result = service.getAllForTeam(TEST_TEAM);

    assertNotNull(result);
    assertSame(comicList, result);

    Mockito.verify(comicRepository, Mockito.times(1)).findAllByTeams(TEST_TEAM);
  }

  @Test
  public void testFindLocations() {
    Mockito.when(comicRepository.findDistinctLocations()).thenReturn(collectionList);

    final List<String> result = service.getAllLocations();

    assertNotNull(result);
    assertSame(collectionList, result);

    Mockito.verify(comicRepository, Mockito.times(1)).findDistinctLocations();
  }

  @Test
  public void testGetAllForLocation() {
    Mockito.when(comicRepository.findAllByLocations(Mockito.anyString())).thenReturn(comicList);

    final List<Comic> result = service.getAllForLocation(TEST_LOCATION);

    assertNotNull(result);
    assertSame(comicList, result);

    Mockito.verify(comicRepository, Mockito.times(1)).findAllByLocations(TEST_LOCATION);
  }

  @Test
  public void testFindStories() {
    Mockito.when(comicRepository.findDistinctStories()).thenReturn(collectionList);

    final List<String> result = service.getAllStories();

    assertNotNull(result);
    assertSame(collectionList, result);

    Mockito.verify(comicRepository, Mockito.times(1)).findDistinctStories();
  }

  @Test
  public void testGetAllForStory() {
    Mockito.when(comicRepository.findAllByStories(Mockito.anyString())).thenReturn(comicList);

    final List<Comic> result = service.getAllForStory(TEST_STORY_NAME);

    assertNotNull(result);
    assertSame(comicList, result);

    Mockito.verify(comicRepository, Mockito.times(1)).findAllByStories(TEST_STORY_NAME);
  }

  @Test
  public void testGetAllPublishersForStory() {
    Mockito.when(comicRepository.findDistinctPublishersForStory(Mockito.anyString()))
        .thenReturn(publisherList);

    final List<String> result = service.getAllPublishersForStory(TEST_STORY_NAME);

    assertNotNull(result);
    assertSame(publisherList, result);

    Mockito.verify(comicRepository, Mockito.times(1))
        .findDistinctPublishersForStory(TEST_STORY_NAME);
  }
}

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

package org.comixedproject.service.comic;

import static junit.framework.TestCase.*;

import java.io.File;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.ComicFormat;
import org.comixedproject.model.comic.ScanType;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.model.user.LastReadDate;
import org.comixedproject.repositories.comic.ComicRepository;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ComicServiceTest {
  private static final long TEST_COMIC_ID = 5;
  private static final String TEST_COMIC_FILENAME = "src/test/resources/example.cbz";
  private static final String TEST_PUBLISHER = "Awesome Publications";
  private static final String TEST_IMPRINT = "Incredible Imprints";
  private static final String TEST_SERIES = "Series Name";
  private static final String TEST_VOLUME = "Volume Name";
  private static final String TEST_ISSUE_NUMBER = "237";
  private static final String TEST_EMAIL = "reader@yourdomain.com";
  private static final int TEST_MAXIMUM_COMICS = 100;
  private static final String TEST_PREVIOUS_ISSUE_NUMBER = "5";
  private static final String TEST_CURRENT_ISSUE_NUMBER = "7";
  private static final String TEST_NEXT_ISSUE_NUMBER = "10";
  private static final String TEST_SORTABLE_NAME = "Sortable Name";
  private static final ScanType TEST_SCAN_TYPE = new ScanType();
  private static final ComicFormat TEST_COMIC_FORMAT = new ComicFormat();
  private static final Date TEST_COVER_DATE = new Date();
  private static final String TEST_HASH = "0123456789ABCDEF";
  private static final int TEST_PAGE = Math.abs(RandomUtils.nextInt());

  @InjectMocks private ComicService comicService;
  @Mock private ComicRepository comicRepository;
  @Mock private LastReadService lastReadService;
  @Mock private UserService userService;
  @Mock private Comic comic;
  @Mock private Comic incomingComic;
  @Mock private ComiXedUser user;
  @Mock private LastReadDate lastReadDate;
  @Mock private Date readDate;

  @Captor private ArgumentCaptor<Date> lastUpdatedDateCaptor;
  @Captor private ArgumentCaptor<Pageable> pageableCaptor;
  @Captor private ArgumentCaptor<Date> deletedCaptor;
  @Captor private ArgumentCaptor<PageRequest> pageRequestCaptor;

  private List<Comic> comicList = new ArrayList<>();
  private List<Comic> comicsBySeries = new ArrayList<>();
  private Comic previousComic = new Comic();
  private Comic currentComic = new Comic();
  private Comic nextComic = new Comic();

  @Before
  public void setUp() throws ComiXedUserException {
    Mockito.when(comicRepository.getById(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);

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

  @Test(expected = ComicException.class)
  public void testGetComicForInvalidUser() throws ComicException, ComiXedUserException {
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      comicService.getComic(TEST_COMIC_ID, TEST_EMAIL);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    }
  }

  @Test(expected = ComicException.class)
  public void testGetComicForUserInvalidComic() throws ComicException, ComiXedUserException {
    Mockito.when(comicRepository.findById(Mockito.anyLong())).thenReturn(Optional.empty());

    try {
      comicService.getComic(TEST_COMIC_ID, TEST_EMAIL);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
      Mockito.verify(comicRepository, Mockito.times(1)).findById(TEST_COMIC_ID);
    }
  }

  @Test
  public void testGetComicForUser() throws ComicException, ComiXedUserException {
    List<Comic> previousComics = new ArrayList<>();
    previousComics.add(previousComic);
    List<Comic> nextComics = new ArrayList<>();
    nextComics.add(nextComic);

    Mockito.when(comicRepository.findById(Mockito.anyLong())).thenReturn(Optional.of(currentComic));

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

    final Comic response = comicService.getComic(TEST_COMIC_ID, TEST_EMAIL);

    assertNotNull(response);
    assertSame(currentComic, response);
    assertEquals(previousComic.getId(), response.getPreviousIssueId());
    assertEquals(nextComic.getId(), response.getNextIssueId());

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(comicRepository, Mockito.times(1)).findById(TEST_COMIC_ID);
    Mockito.verify(comicRepository, Mockito.times(1))
        .findIssuesBeforeComic(
            TEST_SERIES, TEST_VOLUME, TEST_CURRENT_ISSUE_NUMBER, TEST_COVER_DATE);
    Mockito.verify(comicRepository, Mockito.times(1))
        .findIssuesAfterComic(TEST_SERIES, TEST_VOLUME, TEST_CURRENT_ISSUE_NUMBER, TEST_COVER_DATE);
  }

  @Test(expected = ComicException.class)
  public void testGetComicInvalid() throws ComicException, ComiXedUserException {
    Mockito.when(comicRepository.findById(Mockito.anyLong())).thenReturn(Optional.empty());

    try {
      comicService.getComic(TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicRepository, Mockito.times(1)).findById(TEST_COMIC_ID);
    }
  }

  @Test
  public void testGetComic() throws ComicException, ComiXedUserException {
    List<Comic> previousComics = new ArrayList<>();
    previousComics.add(previousComic);
    List<Comic> nextComics = new ArrayList<>();
    nextComics.add(nextComic);

    Mockito.when(comicRepository.findById(Mockito.anyLong())).thenReturn(Optional.of(currentComic));

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

    final Comic result = comicService.getComic(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(currentComic, result);
    assertEquals(previousComic.getId(), result.getPreviousIssueId());
    assertEquals(nextComic.getId(), result.getNextIssueId());

    Mockito.verify(comicRepository, Mockito.times(1)).findById(TEST_COMIC_ID);
    Mockito.verify(comicRepository, Mockito.times(1))
        .findIssuesBeforeComic(
            TEST_SERIES, TEST_VOLUME, TEST_CURRENT_ISSUE_NUMBER, TEST_COVER_DATE);
    Mockito.verify(comicRepository, Mockito.times(1))
        .findIssuesAfterComic(TEST_SERIES, TEST_VOLUME, TEST_CURRENT_ISSUE_NUMBER, TEST_COVER_DATE);
  }

  @Test(expected = ComicException.class)
  public void testDeleteComicNonexistent() throws ComicException {
    Mockito.when(comicRepository.findById(Mockito.anyLong())).thenReturn(Optional.empty());

    try {
      comicService.deleteComic(TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicRepository, Mockito.times(1)).findById(TEST_COMIC_ID);
    }
  }

  @Test
  public void testDeleteComic() throws ComicException {
    Mockito.when(comicRepository.findById(Mockito.anyLong())).thenReturn(Optional.of(comic));
    Mockito.doNothing().when(comic).setDateDeleted(deletedCaptor.capture());
    Mockito.doNothing().when(comic).setDateLastUpdated(lastUpdatedDateCaptor.capture());
    Mockito.when(comicRepository.save(Mockito.any(Comic.class))).thenReturn(comic);

    final Comic result = comicService.deleteComic(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(comicRepository, Mockito.times(1)).findById(TEST_COMIC_ID);
    Mockito.verify(comic, Mockito.times(1)).setDateDeleted(deletedCaptor.getValue());
    Mockito.verify(comic, Mockito.times(1)).setDateLastUpdated(lastUpdatedDateCaptor.getValue());
    Mockito.verify(comicRepository, Mockito.times(1)).save(comic);
  }

  @Test(expected = ComicException.class)
  public void testRestoreComicNonexistent() throws ComicException {
    Mockito.when(comicRepository.findById(Mockito.anyLong())).thenReturn(Optional.empty());

    try {
      comicService.restoreComic(TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicRepository, Mockito.times(1)).findById(TEST_COMIC_ID);
    }
  }

  @Test
  public void testRestoreComic() throws ComicException {
    Mockito.when(comicRepository.findById(Mockito.anyLong())).thenReturn(Optional.of(comic));
    Mockito.when(comic.getDateDeleted()).thenReturn(new Date());
    Mockito.doNothing().when(comic).setDateDeleted(Mockito.any());
    Mockito.when(comicRepository.save(Mockito.any(Comic.class))).thenReturn(comic);

    final Comic response = comicService.restoreComic(TEST_COMIC_ID);

    assertNotNull(response);
    assertSame(comic, response);

    Mockito.verify(comicRepository, Mockito.times(1)).findById(TEST_COMIC_ID);
    Mockito.verify(comic, Mockito.times(1)).setDateDeleted(null);
    Mockito.verify(comicRepository, Mockito.times(1)).save(comic);
  }

  @Test
  public void testGetComicContentNonexistent() {
    Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILENAME.substring(1));

    final byte[] result = this.comicService.getComicContent(comic);

    assertNull(result);

    Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
  }

  @Test
  public void testGetComicContent() {
    Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILENAME);

    final byte[] result = this.comicService.getComicContent(comic);

    assertNotNull(result);
    assertEquals(new File(TEST_COMIC_FILENAME).length(), result.length);

    Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
  }

  @Test
  public void testUpdateComicInvalidComic() {
    Mockito.when(comicRepository.findById(Mockito.anyLong())).thenReturn(Optional.empty());

    assertNull(comicService.updateComic(TEST_COMIC_ID, comic));

    Mockito.verify(comicRepository, Mockito.times(1)).findById(TEST_COMIC_ID);
  }

  @Test
  public void testUpdateComic() {
    Mockito.when(comicRepository.findById(Mockito.anyLong())).thenReturn(Optional.of(comic));
    Mockito.when(incomingComic.getPublisher()).thenReturn(TEST_PUBLISHER);
    Mockito.when(incomingComic.getImprint()).thenReturn(TEST_IMPRINT);
    Mockito.when(incomingComic.getSeries()).thenReturn(TEST_SERIES);
    Mockito.when(incomingComic.getVolume()).thenReturn(TEST_VOLUME);
    Mockito.when(incomingComic.getIssueNumber()).thenReturn(TEST_ISSUE_NUMBER);
    Mockito.when(incomingComic.getSortName()).thenReturn(TEST_SORTABLE_NAME);
    Mockito.when(incomingComic.getScanType()).thenReturn(TEST_SCAN_TYPE);
    Mockito.when(incomingComic.getFormat()).thenReturn(TEST_COMIC_FORMAT);
    Mockito.doNothing().when(comic).setDateLastUpdated(lastUpdatedDateCaptor.capture());
    Mockito.when(comicRepository.save(Mockito.any(Comic.class))).thenReturn(comic);

    final Comic result = comicService.updateComic(TEST_COMIC_ID, incomingComic);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(comicRepository, Mockito.times(1)).findById(TEST_COMIC_ID);
    Mockito.verify(comic, Mockito.times(1)).setPublisher(TEST_PUBLISHER);
    Mockito.verify(comic, Mockito.times(1)).setImprint(TEST_IMPRINT);
    Mockito.verify(comic, Mockito.times(1)).setSeries(TEST_SERIES);
    Mockito.verify(comic, Mockito.times(1)).setVolume(TEST_VOLUME);
    Mockito.verify(comic, Mockito.times(1)).setIssueNumber(TEST_ISSUE_NUMBER);
    Mockito.verify(comic, Mockito.times(1)).setSortName(TEST_SORTABLE_NAME);
    Mockito.verify(comic, Mockito.times(1)).setScanType(TEST_SCAN_TYPE);
    Mockito.verify(comic, Mockito.times(1)).setFormat(TEST_COMIC_FORMAT);
    Mockito.verify(comic, Mockito.times(1)).setDateLastUpdated(lastUpdatedDateCaptor.getValue());
    Mockito.verify(comicRepository, Mockito.times(1)).save(comic);
  }

  @Test
  public void testSave() {
    Mockito.when(comicRepository.save(Mockito.any(Comic.class))).thenReturn(comic);

    final Comic result = this.comicService.save(comic);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(comicRepository, Mockito.times(1)).save(comic);
  }

  @Test
  public void testMarkAsRead() throws ComicException, ComiXedUserException {
    Mockito.when(
            lastReadService.markComicAsRead(
                Mockito.any(Comic.class), Mockito.any(ComiXedUser.class)))
        .thenReturn(lastReadDate);

    LastReadDate result = comicService.markAsRead(TEST_EMAIL, TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(lastReadDate, result);

    Mockito.verify(lastReadService, Mockito.times(1)).markComicAsRead(comic, user);
  }

  @Test
  public void testMarkAsUnread() throws ComicException, ComiXedUserException {
    Mockito.doNothing()
        .when(lastReadService)
        .markComicAsUnread(Mockito.any(Comic.class), Mockito.any(ComiXedUser.class));

    comicService.markAsUnread(TEST_EMAIL, TEST_COMIC_ID);

    Mockito.verify(lastReadService, Mockito.times(1)).markComicAsUnread(comic, user);
  }

  @Test
  public void testDelete() {
    Mockito.doNothing().when(comicRepository).delete(Mockito.any(Comic.class));

    comicService.delete(comic);

    Mockito.verify(comicRepository, Mockito.times(1)).delete(comic);
  }

  @Test
  public void testGetComicsById() {
    Mockito.when(
            comicRepository.findComicsWithIdGreaterThan(
                Mockito.anyLong(), pageableCaptor.capture()))
        .thenReturn(comicList);

    final List<Comic> result = comicService.getComicsById(TEST_COMIC_ID, TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicList, result);
    assertNotNull(pageableCaptor.getValue());
    assertEquals(0, pageableCaptor.getValue().getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageableCaptor.getValue().getPageSize());

    Mockito.verify(comicRepository, Mockito.times(1))
        .findComicsWithIdGreaterThan(TEST_COMIC_ID, pageableCaptor.getValue());
  }

  @Test
  public void testUpdateComicsByPageHash() {
    comicList.add(comic);

    Mockito.when(comicRepository.findComicsForPageHash(Mockito.anyString())).thenReturn(comicList);

    comicService.updateComicsWithPageHash(TEST_HASH);

    Mockito.verify(comicRepository, Mockito.times(1)).findComicsForPageHash(TEST_HASH);
    Mockito.verify(comic, Mockito.times(comicList.size())).setDateLastUpdated(Mockito.any());
    Mockito.verify(comicRepository, Mockito.times(comicList.size())).save(comic);
  }

  @Test
  public void testUpdateComicsByPageHashNoComics() {
    comicList.clear();

    Mockito.when(comicRepository.findComicsForPageHash(Mockito.anyString())).thenReturn(comicList);

    comicService.updateComicsWithPageHash(TEST_HASH);

    Mockito.verify(comicRepository, Mockito.times(1)).findComicsForPageHash(TEST_HASH);
    Mockito.verify(comic, Mockito.never()).setDateLastUpdated(Mockito.any());
    Mockito.verify(comicRepository, Mockito.never()).save(comic);
  }

  @Test
  public void testFindComicsToMove() {
    Mockito.when(comicRepository.findComicsToMove(pageRequestCaptor.capture()))
        .thenReturn(comicList);

    final List<Comic> result = comicService.findComicsToMove(TEST_PAGE, TEST_MAXIMUM_COMICS);

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

    final Comic result = comicService.findByFilename(TEST_COMIC_FILENAME);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(comicRepository, Mockito.times(1)).findByFilename(TEST_COMIC_FILENAME);
  }

  @Test
  public void testGetComicsByIdForUser() throws ComiXedUserException {
    for (int index = 0; index < 25; index++) comicList.add(comic);

    Mockito.when(
            comicRepository.findComicsWithIdGreaterThan(
                Mockito.anyLong(), pageRequestCaptor.capture()))
        .thenReturn(comicList);
    Mockito.when(
            lastReadService.getLastReadForComicAndUser(
                Mockito.any(Comic.class), Mockito.any(ComiXedUser.class)))
        .thenReturn(readDate);

    final List<Comic> result =
        comicService.getComicsById(TEST_EMAIL, TEST_COMIC_ID, TEST_MAXIMUM_COMICS);

    assertSame(comicList, result);

    assertNotNull(pageRequestCaptor.getValue());
    assertEquals(0, pageRequestCaptor.getValue().getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageRequestCaptor.getValue().getPageSize());

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(comicRepository, Mockito.times(1))
        .findComicsWithIdGreaterThan(TEST_COMIC_ID, pageRequestCaptor.getValue());
    Mockito.verify(comic, Mockito.times(comicList.size())).setLastRead(readDate);
  }
}

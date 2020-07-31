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
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.ComicFormat;
import org.comixedproject.model.comic.ScanType;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.model.user.LastReadDate;
import org.comixedproject.repositories.ComiXedUserRepository;
import org.comixedproject.repositories.comic.ComicRepository;
import org.comixedproject.repositories.library.LastReadDatesRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Pageable;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ComicServiceTest {
  private static final long TEST_TIMESTAMP = System.currentTimeMillis();
  private static final long TEST_COMIC_ID = 5;
  private static final String TEST_COMIC_FILENAME = "src/test/resources/example.cbz";
  private static final String TEST_PUBLISHER = "Awesome Publications";
  private static final String TEST_IMPRINT = "Incredible Imprints";
  private static final String TEST_SERIES = "Series Name";
  private static final String TEST_VOLUME = "Volume Name";
  private static final String TEST_ISSUE_NUMBER = "237";
  private static final String TEST_EMAIL = "reader@yourdomain.com";
  private static final long TEST_USER_ID = 717L;
  private static final int TEST_MAXIMUM_COMICS = 100;
  private static final String TEST_PREVIOUS_ISSUE_NUMBER = "5";
  private static final String TEST_CURRENT_ISSUE_NUMBER = "7";
  private static final String TEST_NEXT_ISSUE_NUMBER = "10";
  private static final String TEST_SORTABLE_NAME = "Sortable Name";
  private static final ScanType TEST_SCAN_TYPE = new ScanType();
  private static final ComicFormat TEST_COMIC_FORMAT = new ComicFormat();
  private static final Date TEST_COVER_DATE = new Date();

  @InjectMocks private ComicService comicService;
  @Mock private ComicRepository comicRepository;
  @Mock private LastReadDatesRepository lastReadDatesRepository;
  @Mock private ComiXedUserRepository userRepository;
  @Mock private List<Comic> comicList;
  @Mock private Comic comicListEntry;
  @Mock private Comic comic;
  @Mock private Comic incomingComic;
  @Mock private ComiXedUser user;
  @Mock private List<LastReadDate> listLastReadDate;
  @Captor private ArgumentCaptor<Date> lastUpdatedDateCaptor;
  @Captor private ArgumentCaptor<Pageable> pageableCaptor;
  @Captor private ArgumentCaptor<Date> deletedCaptor;
  @Mock private LastReadDate lastReadDate;
  @Mock private List<LastReadDate> lastReadDateList;
  @Captor private ArgumentCaptor<LastReadDate> lastReadDateCaptor;

  private List<Comic> comicsBySeries = new ArrayList<>();
  private Comic previousComic = new Comic();
  private Comic currentComic = new Comic();
  private Comic nextComic = new Comic();

  @Before
  public void setUp() {
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
  public void testGetComicsUpdatedSince() {
    Mockito.when(
            comicRepository.findAllByDateLastUpdatedGreaterThan(
                Mockito.any(Date.class), pageableCaptor.capture()))
        .thenReturn(comicList);

    final List<Comic> result =
        comicService.getComicsUpdatedSince(TEST_TIMESTAMP, TEST_MAXIMUM_COMICS);

    assertNotNull(result);
    assertSame(comicList, result);
    assertEquals(0, pageableCaptor.getValue().getPageNumber());
    assertEquals(TEST_MAXIMUM_COMICS, pageableCaptor.getValue().getPageSize());

    Mockito.verify(comicRepository, Mockito.times(1))
        .findAllByDateLastUpdatedGreaterThan(new Date(TEST_TIMESTAMP), pageableCaptor.getValue());
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
  public void testDeleteMultipleComics() {
    Mockito.when(comicRepository.findById(Mockito.anyLong())).thenReturn(Optional.of(comic));
    Mockito.doNothing().when(comicRepository).delete(Mockito.any(Comic.class));

    final List<Long> idList = new ArrayList<>();
    for (long index = 1000L; index < 1010L; index++) {
      idList.add(index);
    }

    final List<Long> result = comicService.deleteMultipleComics(idList);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(idList, result);

    for (int index = 0; index < idList.size(); index++) {
      Mockito.verify(comicRepository, Mockito.times(1)).findById(idList.get(index));
    }
    Mockito.verify(comicRepository, Mockito.times(idList.size())).delete(comic);
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

  @Test(expected = ComicException.class)
  public void testGetComicInvalid() throws ComicException {
    Mockito.when(comicRepository.findById(Mockito.anyLong())).thenReturn(Optional.empty());

    try {
      comicService.getComic(TEST_COMIC_ID);
    } finally {
      Mockito.verify(comicRepository, Mockito.times(1)).findById(TEST_COMIC_ID);
    }
  }

  @Test
  public void testGetComic() throws ComicException {
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
  public void testGetLastReadDatesSince() {
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(user.getId()).thenReturn(TEST_USER_ID);
    Mockito.when(lastReadDatesRepository.findAllForUser(Mockito.anyLong(), Mockito.any(Date.class)))
        .thenReturn(listLastReadDate);

    final List<LastReadDate> result =
        this.comicService.getLastReadDatesSince(TEST_EMAIL, TEST_TIMESTAMP);

    assertNotNull(result);
    assertSame(listLastReadDate, result);

    Mockito.verify(userRepository, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(user, Mockito.times(1)).getId();
    Mockito.verify(lastReadDatesRepository, Mockito.times(1))
        .findAllForUser(TEST_USER_ID, new Date(TEST_TIMESTAMP));
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
  public void testMarkAsReadCurrentlyUnread() throws ComicException {
    Mockito.when(comicRepository.getById(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(
            lastReadDatesRepository.getForComicAndUser(
                Mockito.any(Comic.class), Mockito.any(ComiXedUser.class)))
        .thenReturn(null, lastReadDate);
    Mockito.when(lastReadDatesRepository.save(lastReadDateCaptor.capture()))
        .thenReturn(lastReadDate);

    LastReadDate result = comicService.markAsRead(TEST_EMAIL, TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(lastReadDate, result);
    assertNotNull(lastReadDateCaptor.getValue());
    assertSame(comic, lastReadDateCaptor.getValue().getComic());
    assertNotNull(lastReadDateCaptor.getValue().getLastRead());
    assertSame(user, lastReadDateCaptor.getValue().getUser());

    Mockito.verify(lastReadDatesRepository, Mockito.times(1)).save(lastReadDateCaptor.getValue());
    Mockito.verify(comicRepository, Mockito.times(1)).getById(TEST_COMIC_ID);
    Mockito.verify(lastReadDatesRepository, Mockito.times(2)).getForComicAndUser(comic, user);
  }

  @Test
  public void testMarkAsRead() throws ComicException {
    Mockito.when(comicRepository.getById(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(
            lastReadDatesRepository.getForComicAndUser(
                Mockito.any(Comic.class), Mockito.any(ComiXedUser.class)))
        .thenReturn(lastReadDate, lastReadDate);
    Mockito.when(lastReadDatesRepository.save(lastReadDateCaptor.capture()))
        .thenReturn(lastReadDate);

    LastReadDate result = comicService.markAsRead(TEST_EMAIL, TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(lastReadDate, result);

    Mockito.verify(lastReadDatesRepository, Mockito.times(1)).save(lastReadDate);
    Mockito.verify(lastReadDate, Mockito.times(1)).setLastRead(Mockito.any(Date.class));
    Mockito.verify(lastReadDatesRepository, Mockito.times(1)).save(lastReadDateCaptor.getValue());
    Mockito.verify(lastReadDatesRepository, Mockito.times(2)).getForComicAndUser(comic, user);
  }

  @Test
  public void testMarkAsUnreadCurrentlyUnread() throws ComicException {
    Mockito.when(comicRepository.getById(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(
            lastReadDatesRepository.getForComicAndUser(
                Mockito.any(Comic.class), Mockito.any(ComiXedUser.class)))
        .thenReturn(null);

    boolean result = comicService.markAsUnread(TEST_EMAIL, TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(false, result);

    Mockito.verify(comicRepository, Mockito.times(1)).getById(TEST_COMIC_ID);
    Mockito.verify(lastReadDatesRepository, Mockito.times(1)).getForComicAndUser(comic, user);
  }

  @Test
  public void testMarkAsUnread() throws ComicException {
    Mockito.when(comicRepository.getById(Mockito.anyLong())).thenReturn(comic);
    Mockito.when(userRepository.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.when(
            lastReadDatesRepository.getForComicAndUser(
                Mockito.any(Comic.class), Mockito.any(ComiXedUser.class)))
        .thenReturn(lastReadDate);
    Mockito.doNothing().when(lastReadDatesRepository).delete(Mockito.any(LastReadDate.class));

    boolean result = comicService.markAsUnread(TEST_EMAIL, TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(true, result);

    Mockito.verify(lastReadDatesRepository, Mockito.times(1)).delete(lastReadDate);
    Mockito.verify(comicRepository, Mockito.times(1)).getById(TEST_COMIC_ID);
    Mockito.verify(lastReadDatesRepository, Mockito.times(1)).getForComicAndUser(comic, user);
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
}

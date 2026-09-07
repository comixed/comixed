/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

package org.comixedproject.service.library;

import static junit.framework.TestCase.*;
import static org.mockito.Mockito.*;

import java.util.List;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.library.PublishRemoteLibraryUpdateAction;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.net.library.PublisherAndYearSegment;
import org.comixedproject.model.net.library.RemoteLibrarySegmentState;
import org.comixedproject.model.net.library.RemoteLibraryState;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.state.comicbooks.ComicStateAdaptor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class RemoteLibraryStateServiceTest {
  private static final long TEST_COMIC_COUNT = Math.abs(RandomUtils.nextLong());
  private static final long TEST_DELETED_COMIC_COUNT = Math.abs(RandomUtils.nextLong());
  private static final long TEST_DUPLICATE_COMIC_COUNT = Math.abs(RandomUtils.nextLong());

  @InjectMocks private RemoteLibraryStateService service;
  @Mock private ComicStateAdaptor comicStateAdaptor;
  @Mock private ComicBookService comicBookService;
  @Mock private DuplicateComicService duplicateComicService;
  @Mock private List<RemoteLibrarySegmentState> publisherState;
  @Mock private List<RemoteLibrarySegmentState> seriesState;
  @Mock private List<RemoteLibrarySegmentState> charactersState;
  @Mock private List<RemoteLibrarySegmentState> teamsState;
  @Mock private List<RemoteLibrarySegmentState> locationsState;
  @Mock private List<RemoteLibrarySegmentState> storiesState;
  @Mock private List<RemoteLibrarySegmentState> comicsState;
  @Mock private List<RemoteLibrarySegmentState> archiveTypeState;
  @Mock private List<PublisherAndYearSegment> byPublisherAndYear;
  @Mock private PublishRemoteLibraryUpdateAction publishRemoteLibraryUpdateAction;
  @Mock private ComicBook comicBook;
  @Mock private ComicDetail comic;

  @Captor private ArgumentCaptor<RemoteLibraryState> libraryStateArgumentCaptor;

  @BeforeEach
  public void setUp() {
    when(comicBookService.getComicBookCount()).thenReturn(TEST_COMIC_COUNT);
    when(comicBookService.getDeletedComicCount()).thenReturn(TEST_DELETED_COMIC_COUNT);
    when(duplicateComicService.getDuplicateComicBookCount()).thenReturn(TEST_DUPLICATE_COMIC_COUNT);
    when(comicBookService.getPublishersState()).thenReturn(publisherState);
    when(comicBookService.getSeriesState()).thenReturn(seriesState);
    when(comicBookService.getCharactersState()).thenReturn(charactersState);
    when(comicBookService.getTeamsState()).thenReturn(teamsState);
    when(comicBookService.getLocationsState()).thenReturn(locationsState);
    when(comicBookService.getStoriesState()).thenReturn(storiesState);
    when(comicBookService.getComicBooksState()).thenReturn(comicsState);
    when(comicBookService.getComicBookArchiveTypes()).thenReturn(archiveTypeState);
    when(comicBookService.getByPublisherAndYear()).thenReturn(byPublisherAndYear);
  }

  @Test
  void afterPropertiesSet() throws Exception {
    service.afterPropertiesSet();

    verify(comicStateAdaptor).addListener(service);
  }

  @Test
  void comicStateChanged() throws PublishingException {
    doNothing()
        .when(publishRemoteLibraryUpdateAction)
        .publish(libraryStateArgumentCaptor.capture());

    service.onComicStateChanged(comic);

    final RemoteLibraryState libraryState = libraryStateArgumentCaptor.getValue();
    assertNotNull(libraryState);
    assertEquals(TEST_COMIC_COUNT, libraryState.getTotalComics());
    assertEquals(TEST_DELETED_COMIC_COUNT, libraryState.getDeletedComics());
    assertSame(publisherState, libraryState.getPublishers());
    assertSame(seriesState, libraryState.getSeries());
    assertSame(charactersState, libraryState.getCharacters());
    assertSame(teamsState, libraryState.getTeams());
    assertSame(locationsState, libraryState.getLocations());
    assertSame(storiesState, libraryState.getStories());
    assertSame(comicsState, libraryState.getStates());
    assertSame(byPublisherAndYear, libraryState.getByPublisherAndYear());

    verify(publishRemoteLibraryUpdateAction).publish(libraryState);
  }

  @Test
  void comicStateChangedPublishException() throws PublishingException {
    doThrow(PublishingException.class)
        .when(publishRemoteLibraryUpdateAction)
        .publish(libraryStateArgumentCaptor.capture());

    service.onComicStateChanged(comic);

    final RemoteLibraryState libraryState = libraryStateArgumentCaptor.getValue();
    assertNotNull(libraryState);

    verify(publishRemoteLibraryUpdateAction).publish(libraryState);
  }

  @Test
  void getLibraryState() {
    final RemoteLibraryState result = service.getLibraryState();

    assertNotNull(result);
    assertEquals(TEST_COMIC_COUNT, result.getTotalComics());
    assertEquals(TEST_DELETED_COMIC_COUNT, result.getDeletedComics());
    assertEquals(TEST_DUPLICATE_COMIC_COUNT, result.getDuplicateComics());
    assertSame(publisherState, result.getPublishers());
    assertSame(seriesState, result.getSeries());
    assertSame(charactersState, result.getCharacters());
    assertSame(teamsState, result.getTeams());
    assertSame(locationsState, result.getLocations());
    assertSame(storiesState, result.getStories());
    assertSame(comicsState, result.getStates());
    assertSame(archiveTypeState, result.getArchiveTypes());
    assertSame(byPublisherAndYear, result.getByPublisherAndYear());

    verify(comicBookService).getComicBookCount();
    verify(comicBookService).getDeletedComicCount();
    verify(comicBookService).getPublishersState();
    verify(comicBookService).getSeriesState();
    verify(comicBookService).getCharactersState();
    verify(comicBookService).getTeamsState();
    verify(comicBookService).getLocationsState();
    verify(comicBookService).getStoriesState();
    verify(comicBookService).getComicBooksState();
    verify(comicBookService).getComicBookArchiveTypes();
    verify(comicBookService).getByPublisherAndYear();
  }
}

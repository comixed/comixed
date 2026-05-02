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

import java.util.List;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.library.PublishRemoteLibraryUpdateAction;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.net.library.PublisherAndYearSegment;
import org.comixedproject.model.net.library.RemoteLibrarySegmentState;
import org.comixedproject.model.net.library.RemoteLibraryState;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.state.comicbooks.ComicBookStateAdaptor;
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
  @Mock private ComicBookStateAdaptor comicBookStateAdaptor;
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

  @Captor private ArgumentCaptor<RemoteLibraryState> libraryStateArgumentCaptor;

  @BeforeEach
  public void setUp() {
    Mockito.when(comicBookService.getComicBookCount()).thenReturn(TEST_COMIC_COUNT);
    Mockito.when(comicBookService.getDeletedComicCount()).thenReturn(TEST_DELETED_COMIC_COUNT);
    Mockito.when(duplicateComicService.getDuplicateComicBookCount())
        .thenReturn(TEST_DUPLICATE_COMIC_COUNT);
    Mockito.when(comicBookService.getPublishersState()).thenReturn(publisherState);
    Mockito.when(comicBookService.getSeriesState()).thenReturn(seriesState);
    Mockito.when(comicBookService.getCharactersState()).thenReturn(charactersState);
    Mockito.when(comicBookService.getTeamsState()).thenReturn(teamsState);
    Mockito.when(comicBookService.getLocationsState()).thenReturn(locationsState);
    Mockito.when(comicBookService.getStoriesState()).thenReturn(storiesState);
    Mockito.when(comicBookService.getComicBooksState()).thenReturn(comicsState);
    Mockito.when(comicBookService.getComicBookArchiveTypes()).thenReturn(archiveTypeState);
    Mockito.when(comicBookService.getByPublisherAndYear()).thenReturn(byPublisherAndYear);
  }

  @Test
  void afterPropertiesSet() throws Exception {
    service.afterPropertiesSet();

    Mockito.verify(comicBookStateAdaptor).addListener(service);
  }

  @Test
  void comicStateChanged() throws PublishingException {
    Mockito.doNothing()
        .when(publishRemoteLibraryUpdateAction)
        .publish(libraryStateArgumentCaptor.capture());

    service.onComicStateChanged(comicBook);

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

    Mockito.verify(publishRemoteLibraryUpdateAction).publish(libraryState);
  }

  @Test
  void comicStateChangedPublishException() throws PublishingException {
    Mockito.doThrow(PublishingException.class)
        .when(publishRemoteLibraryUpdateAction)
        .publish(libraryStateArgumentCaptor.capture());

    service.onComicStateChanged(comicBook);

    final RemoteLibraryState libraryState = libraryStateArgumentCaptor.getValue();
    assertNotNull(libraryState);

    Mockito.verify(publishRemoteLibraryUpdateAction).publish(libraryState);
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

    Mockito.verify(comicBookService).getComicBookCount();
    Mockito.verify(comicBookService).getDeletedComicCount();
    Mockito.verify(comicBookService).getPublishersState();
    Mockito.verify(comicBookService).getSeriesState();
    Mockito.verify(comicBookService).getCharactersState();
    Mockito.verify(comicBookService).getTeamsState();
    Mockito.verify(comicBookService).getLocationsState();
    Mockito.verify(comicBookService).getStoriesState();
    Mockito.verify(comicBookService).getComicBooksState();
    Mockito.verify(comicBookService).getComicBookArchiveTypes();
    Mockito.verify(comicBookService).getByPublisherAndYear();
  }
}

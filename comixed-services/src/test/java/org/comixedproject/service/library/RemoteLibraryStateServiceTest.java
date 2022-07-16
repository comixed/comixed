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
import org.comixedproject.model.net.library.PublisherAndYearSegment;
import org.comixedproject.model.net.library.RemoteLibrarySegmentState;
import org.comixedproject.model.net.library.RemoteLibraryState;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class RemoteLibraryStateServiceTest {
  private static final long TEST_COMIC_COUNT = Math.abs(RandomUtils.nextLong());
  private static final long TEST_DELETED_COMIC_COUNT = Math.abs(RandomUtils.nextLong());

  @InjectMocks private RemoteLibraryStateService service;
  @Mock private ComicBookService comicBookService;
  @Mock private List<RemoteLibrarySegmentState> publisherState;
  @Mock private List<RemoteLibrarySegmentState> seriesState;
  @Mock private List<RemoteLibrarySegmentState> charactersState;
  @Mock private List<RemoteLibrarySegmentState> teamsState;
  @Mock private List<RemoteLibrarySegmentState> locationsState;
  @Mock private List<RemoteLibrarySegmentState> storiesState;
  @Mock private List<RemoteLibrarySegmentState> comicsState;
  @Mock private List<PublisherAndYearSegment> byPublisherAndYear;

  @Test
  public void testGetLibraryState() {
    Mockito.when(comicBookService.getComicBookCount()).thenReturn(TEST_COMIC_COUNT);
    Mockito.when(comicBookService.getDeletedComicCount()).thenReturn(TEST_DELETED_COMIC_COUNT);
    Mockito.when(comicBookService.getPublishersState()).thenReturn(publisherState);
    Mockito.when(comicBookService.getSeriesState()).thenReturn(seriesState);
    Mockito.when(comicBookService.getCharactersState()).thenReturn(charactersState);
    Mockito.when(comicBookService.getTeamsState()).thenReturn(teamsState);
    Mockito.when(comicBookService.getLocationsState()).thenReturn(locationsState);
    Mockito.when(comicBookService.getStoriesState()).thenReturn(storiesState);
    Mockito.when(comicBookService.getComicBooksState()).thenReturn(comicsState);
    Mockito.when(comicBookService.getByPublisherAndYear()).thenReturn(byPublisherAndYear);

    final RemoteLibraryState result = service.getLibraryState();

    assertNotNull(result);
    assertEquals(TEST_COMIC_COUNT, result.getTotalComics());
    assertEquals(TEST_DELETED_COMIC_COUNT, result.getDeletedComics());
    assertSame(publisherState, result.getPublishers());
    assertSame(seriesState, result.getSeries());
    assertSame(charactersState, result.getCharacters());
    assertSame(teamsState, result.getTeams());
    assertSame(locationsState, result.getLocations());
    assertSame(storiesState, result.getStories());
    assertSame(comicsState, result.getStates());
    assertSame(byPublisherAndYear, result.getByPublisherAndYear());

    Mockito.verify(comicBookService, Mockito.times(1)).getComicBookCount();
    Mockito.verify(comicBookService, Mockito.times(1)).getDeletedComicCount();
    Mockito.verify(comicBookService, Mockito.times(1)).getPublishersState();
    Mockito.verify(comicBookService, Mockito.times(1)).getSeriesState();
    Mockito.verify(comicBookService, Mockito.times(1)).getCharactersState();
    Mockito.verify(comicBookService, Mockito.times(1)).getTeamsState();
    Mockito.verify(comicBookService, Mockito.times(1)).getLocationsState();
    Mockito.verify(comicBookService, Mockito.times(1)).getStoriesState();
    Mockito.verify(comicBookService, Mockito.times(1)).getComicBooksState();
    Mockito.verify(comicBookService, Mockito.times(1)).getByPublisherAndYear();
  }
}

/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project.
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

package org.comixedproject.adaptors;

import java.util.List;
import java.util.Set;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.Credit;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ComicDataAdaptorTest {
  @InjectMocks private ComicDataAdaptor adaptor;
  @Mock private Comic comic;
  @Mock private List<String> storyArcs;
  @Mock private List<String> teams;
  @Mock private List<String> characters;
  @Mock private List<String> locations;
  @Mock private Set<Credit> credits;

  @Test
  public void testClear() {
    Mockito.when(comic.getStoryArcs()).thenReturn(storyArcs);
    Mockito.when(comic.getTeams()).thenReturn(teams);
    Mockito.when(comic.getCharacters()).thenReturn(characters);
    Mockito.when(comic.getLocations()).thenReturn(locations);
    Mockito.when(comic.getCredits()).thenReturn(credits);

    adaptor.clear(comic);

    Mockito.verify(comic, Mockito.times(1)).setComicVineId("");
    Mockito.verify(comic, Mockito.times(1)).setComicVineURL("");
    Mockito.verify(comic, Mockito.times(1)).setPublisher("");
    Mockito.verify(comic, Mockito.times(1)).setImprint("");
    Mockito.verify(comic, Mockito.times(1)).setSeries("");
    Mockito.verify(comic, Mockito.times(1)).setCoverDate(null);
    Mockito.verify(comic, Mockito.times(1)).setVolume("");
    Mockito.verify(comic, Mockito.times(1)).setIssueNumber("");
    Mockito.verify(comic, Mockito.times(1)).setTitle("");
    Mockito.verify(comic, Mockito.times(1)).setDescription("");
    Mockito.verify(comic, Mockito.times(1)).setNotes("");
    Mockito.verify(storyArcs, Mockito.times(1)).clear();
    Mockito.verify(teams, Mockito.times(1)).clear();
    Mockito.verify(characters, Mockito.times(1)).clear();
    Mockito.verify(locations, Mockito.times(1)).clear();
    Mockito.verify(credits, Mockito.times(1)).clear();
  }
}

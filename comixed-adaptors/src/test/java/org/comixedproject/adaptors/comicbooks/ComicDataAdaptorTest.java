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

package org.comixedproject.adaptors.comicbooks;

import java.util.List;
import java.util.Set;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.Credit;
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
  @Mock private List<String> characterList;
  @Mock private List<String> teamList;
  @Mock private List<String> locationList;
  @Mock private List<String> storyList;
  @Mock private Set<Credit> creditList;

  @Test
  public void testClear() {
    Mockito.when(comic.getCharacters()).thenReturn(characterList);
    Mockito.when(comic.getTeams()).thenReturn(teamList);
    Mockito.when(comic.getLocations()).thenReturn(locationList);
    Mockito.when(comic.getStoryArcs()).thenReturn(storyList);
    Mockito.when(comic.getCredits()).thenReturn(creditList);

    adaptor.clear(comic);

    Mockito.verify(comic, Mockito.times(1)).setPublisher("");
    Mockito.verify(comic, Mockito.times(1)).setSeries("");
    Mockito.verify(comic, Mockito.times(1)).setVolume("");
    Mockito.verify(comic, Mockito.times(1)).setIssueNumber("");
    Mockito.verify(comic, Mockito.times(1)).setCoverDate(null);
    Mockito.verify(comic, Mockito.times(1)).setTitle("");
    Mockito.verify(comic, Mockito.times(1)).setDescription("");
    Mockito.verify(characterList, Mockito.times(1)).clear();
    Mockito.verify(teamList, Mockito.times(1)).clear();
    Mockito.verify(locationList, Mockito.times(1)).clear();
    Mockito.verify(storyList, Mockito.times(1)).clear();
    Mockito.verify(creditList, Mockito.times(1)).clear();
  }
}

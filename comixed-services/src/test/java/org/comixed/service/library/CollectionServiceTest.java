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

package org.comixed.service.library;

import static junit.framework.TestCase.*;

import java.util.ArrayList;
import java.util.List;
import org.comixed.model.library.CollectionEntry;
import org.comixed.model.library.CollectionType;
import org.comixed.model.library.Comic;
import org.comixed.repositories.library.ComicRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.data.domain.Pageable;

@RunWith(MockitoJUnitRunner.class)
public class CollectionServiceTest {
  private static final String TEST_NAME_1 = "First Location";
  private static final String TEST_NAME_2 = "Second location";
  private static final int TEST_COMIC_COUNT = 129;
  private static final int TEST_PAGE = 12;
  private static final int TEST_COUNT = 25;
  private static final String TEST_SORT_FIELD = "lastUpdatedDate";
  private static final boolean TEST_ASCENDING = true;

  @InjectMocks private CollectionService service;
  @Mock private ComicRepository comicRepository;
  @Mock private List<Comic> comicList;
  @Captor private ArgumentCaptor<Pageable> pageCaptor;

  @Test
  public void testGetPublisherCollectionEntries() throws CollectionException {
    List<String> nameList = new ArrayList<>();
    nameList.add(TEST_NAME_1);
    nameList.add(TEST_NAME_2);

    Mockito.when(comicRepository.getPublisherNames()).thenReturn(nameList);
    Mockito.when(comicRepository.getComicCountForPublisher(Mockito.anyString()))
        .thenReturn(TEST_COMIC_COUNT);

    final List<CollectionEntry> result = service.getCollectionEntries(CollectionType.PUBLISHERS);

    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals(TEST_NAME_1, result.get(0).getName());
    assertEquals(TEST_COMIC_COUNT, result.get(0).getComicCount());
    assertEquals(TEST_NAME_2, result.get(1).getName());
    assertEquals(TEST_COMIC_COUNT, result.get(1).getComicCount());

    Mockito.verify(comicRepository, Mockito.times(1)).getPublisherNames();
    Mockito.verify(comicRepository, Mockito.times(1)).getComicCountForPublisher(TEST_NAME_1);
    Mockito.verify(comicRepository, Mockito.times(1)).getComicCountForPublisher(TEST_NAME_2);
  }

  @Test
  public void testGetSeriesCollectionEntries() throws CollectionException {
    List<String> nameList = new ArrayList<>();
    nameList.add(TEST_NAME_1);
    nameList.add(TEST_NAME_2);

    Mockito.when(comicRepository.getSeriesNames()).thenReturn(nameList);
    Mockito.when(comicRepository.getComicCountForSeries(Mockito.anyString()))
        .thenReturn(TEST_COMIC_COUNT);

    final List<CollectionEntry> result = service.getCollectionEntries(CollectionType.SERIES);

    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals(TEST_NAME_1, result.get(0).getName());
    assertEquals(TEST_COMIC_COUNT, result.get(0).getComicCount());
    assertEquals(TEST_NAME_2, result.get(1).getName());
    assertEquals(TEST_COMIC_COUNT, result.get(1).getComicCount());

    Mockito.verify(comicRepository, Mockito.times(1)).getSeriesNames();
    Mockito.verify(comicRepository, Mockito.times(1)).getComicCountForSeries(TEST_NAME_1);
    Mockito.verify(comicRepository, Mockito.times(1)).getComicCountForSeries(TEST_NAME_2);
  }

  @Test
  public void testGetCharacterCollectionEntries() throws CollectionException {
    List<String> nameList = new ArrayList<>();
    nameList.add(TEST_NAME_1);
    nameList.add(TEST_NAME_2);

    Mockito.when(comicRepository.getCharacterNames()).thenReturn(nameList);
    Mockito.when(comicRepository.getComicCountForCharacter(Mockito.anyString()))
        .thenReturn(TEST_COMIC_COUNT);

    final List<CollectionEntry> result = service.getCollectionEntries(CollectionType.CHARACTERS);

    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals(TEST_NAME_1, result.get(0).getName());
    assertEquals(TEST_COMIC_COUNT, result.get(0).getComicCount());
    assertEquals(TEST_NAME_2, result.get(1).getName());
    assertEquals(TEST_COMIC_COUNT, result.get(1).getComicCount());

    Mockito.verify(comicRepository, Mockito.times(1)).getCharacterNames();
    Mockito.verify(comicRepository, Mockito.times(1)).getComicCountForCharacter(TEST_NAME_1);
    Mockito.verify(comicRepository, Mockito.times(1)).getComicCountForCharacter(TEST_NAME_2);
  }

  @Test
  public void testGetTeamCollectionEntries() throws CollectionException {
    List<String> nameList = new ArrayList<>();
    nameList.add(TEST_NAME_1);
    nameList.add(TEST_NAME_2);

    Mockito.when(comicRepository.getTeamNames()).thenReturn(nameList);
    Mockito.when(comicRepository.getComicCountForTeam(Mockito.anyString()))
        .thenReturn(TEST_COMIC_COUNT);

    final List<CollectionEntry> result = service.getCollectionEntries(CollectionType.TEAMS);

    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals(TEST_NAME_1, result.get(0).getName());
    assertEquals(TEST_COMIC_COUNT, result.get(0).getComicCount());
    assertEquals(TEST_NAME_2, result.get(1).getName());
    assertEquals(TEST_COMIC_COUNT, result.get(1).getComicCount());

    Mockito.verify(comicRepository, Mockito.times(1)).getTeamNames();
    Mockito.verify(comicRepository, Mockito.times(1)).getComicCountForTeam(TEST_NAME_1);
    Mockito.verify(comicRepository, Mockito.times(1)).getComicCountForTeam(TEST_NAME_2);
  }

  @Test
  public void testGetLocationCollectionEntries() throws CollectionException {
    List<String> nameList = new ArrayList<>();
    nameList.add(TEST_NAME_1);
    nameList.add(TEST_NAME_2);

    Mockito.when(comicRepository.getLocationNames()).thenReturn(nameList);
    Mockito.when(comicRepository.getComicCountForLocation(Mockito.anyString()))
        .thenReturn(TEST_COMIC_COUNT);

    final List<CollectionEntry> result = service.getCollectionEntries(CollectionType.LOCATIONS);

    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals(TEST_NAME_1, result.get(0).getName());
    assertEquals(TEST_COMIC_COUNT, result.get(0).getComicCount());
    assertEquals(TEST_NAME_2, result.get(1).getName());
    assertEquals(TEST_COMIC_COUNT, result.get(1).getComicCount());

    Mockito.verify(comicRepository, Mockito.times(1)).getLocationNames();
    Mockito.verify(comicRepository, Mockito.times(1)).getComicCountForLocation(TEST_NAME_1);
    Mockito.verify(comicRepository, Mockito.times(1)).getComicCountForLocation(TEST_NAME_2);
  }

  @Test
  public void testGetStoryCollectionEntries() throws CollectionException {
    List<String> nameList = new ArrayList<>();
    nameList.add(TEST_NAME_1);
    nameList.add(TEST_NAME_2);

    Mockito.when(comicRepository.getStoryNames()).thenReturn(nameList);
    Mockito.when(comicRepository.getComicCountForStory(Mockito.anyString()))
        .thenReturn(TEST_COMIC_COUNT);

    final List<CollectionEntry> result = service.getCollectionEntries(CollectionType.STORIES);

    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals(TEST_NAME_1, result.get(0).getName());
    assertEquals(TEST_COMIC_COUNT, result.get(0).getComicCount());
    assertEquals(TEST_NAME_2, result.get(1).getName());
    assertEquals(TEST_COMIC_COUNT, result.get(1).getComicCount());

    Mockito.verify(comicRepository, Mockito.times(1)).getStoryNames();
    Mockito.verify(comicRepository, Mockito.times(1)).getComicCountForStory(TEST_NAME_1);
    Mockito.verify(comicRepository, Mockito.times(1)).getComicCountForStory(TEST_NAME_2);
  }

  @Test
  public void testGetCountForPublisherCollectionType() throws CollectionException {
    Mockito.when(comicRepository.getComicCountForPublisher(Mockito.anyString()))
        .thenReturn(TEST_COMIC_COUNT);

    final int result = service.getCountForCollection(CollectionType.PUBLISHERS, TEST_NAME_1);

    assertEquals(TEST_COMIC_COUNT, result);

    Mockito.verify(comicRepository, Mockito.times(1)).getComicCountForPublisher(TEST_NAME_1);
  }

  @Test
  public void testGetCountForSeriesCollectionType() throws CollectionException {
    Mockito.when(comicRepository.getComicCountForSeries(Mockito.anyString()))
        .thenReturn(TEST_COMIC_COUNT);

    final int result = service.getCountForCollection(CollectionType.SERIES, TEST_NAME_1);

    assertEquals(TEST_COMIC_COUNT, result);

    Mockito.verify(comicRepository, Mockito.times(1)).getComicCountForSeries(TEST_NAME_1);
  }

  @Test
  public void testGetCountForCharacterCollectionType() throws CollectionException {
    Mockito.when(comicRepository.getComicCountForCharacter(Mockito.anyString()))
        .thenReturn(TEST_COMIC_COUNT);

    final int result = service.getCountForCollection(CollectionType.CHARACTERS, TEST_NAME_1);

    assertEquals(TEST_COMIC_COUNT, result);

    Mockito.verify(comicRepository, Mockito.times(1)).getComicCountForCharacter(TEST_NAME_1);
  }

  @Test
  public void testGetCountForTeamCollectionType() throws CollectionException {
    Mockito.when(comicRepository.getComicCountForTeam(Mockito.anyString()))
        .thenReturn(TEST_COMIC_COUNT);

    final int result = service.getCountForCollection(CollectionType.TEAMS, TEST_NAME_1);

    assertEquals(TEST_COMIC_COUNT, result);

    Mockito.verify(comicRepository, Mockito.times(1)).getComicCountForTeam(TEST_NAME_1);
  }

  @Test
  public void testGetCountForLocationCollectionType() throws CollectionException {
    Mockito.when(comicRepository.getComicCountForLocation(Mockito.anyString()))
        .thenReturn(TEST_COMIC_COUNT);

    final int result = service.getCountForCollection(CollectionType.LOCATIONS, TEST_NAME_1);

    assertEquals(TEST_COMIC_COUNT, result);

    Mockito.verify(comicRepository, Mockito.times(1)).getComicCountForLocation(TEST_NAME_1);
  }

  @Test
  public void testGetCountForStoryCollectionType() throws CollectionException {
    Mockito.when(comicRepository.getComicCountForStory(Mockito.anyString()))
        .thenReturn(TEST_COMIC_COUNT);

    final int result = service.getCountForCollection(CollectionType.STORIES, TEST_NAME_1);

    assertEquals(TEST_COMIC_COUNT, result);

    Mockito.verify(comicRepository, Mockito.times(1)).getComicCountForStory(TEST_NAME_1);
  }

  @Test
  public void testGetPageForEntryForPublisher() throws CollectionException {
    Mockito.when(
            comicRepository.getComicPageForPublisher(Mockito.anyString(), pageCaptor.capture()))
        .thenReturn(comicList);

    final List<Comic> result =
        service.getPageForEntry(
            CollectionType.PUBLISHERS,
            TEST_NAME_1,
            TEST_PAGE,
            TEST_COUNT,
            TEST_SORT_FIELD,
            TEST_ASCENDING);

    assertNotNull(result);
    assertSame(comicList, result);
    assertEquals(TEST_PAGE, pageCaptor.getValue().getPageNumber());
    assertEquals(TEST_COUNT, pageCaptor.getValue().getPageSize());

    Mockito.verify(comicRepository, Mockito.times(1))
        .getComicPageForPublisher(TEST_NAME_1, pageCaptor.getValue());
  }

  @Test
  public void testGetPageForEntryForSeries() throws CollectionException {
    Mockito.when(comicRepository.getComicPageForSeries(Mockito.anyString(), pageCaptor.capture()))
        .thenReturn(comicList);

    final List<Comic> result =
        service.getPageForEntry(
            CollectionType.SERIES,
            TEST_NAME_1,
            TEST_PAGE,
            TEST_COUNT,
            TEST_SORT_FIELD,
            TEST_ASCENDING);

    assertNotNull(result);
    assertSame(comicList, result);
    assertEquals(TEST_PAGE, pageCaptor.getValue().getPageNumber());
    assertEquals(TEST_COUNT, pageCaptor.getValue().getPageSize());

    Mockito.verify(comicRepository, Mockito.times(1))
        .getComicPageForSeries(TEST_NAME_1, pageCaptor.getValue());
  }

  @Test
  public void testGetPageForEntryForCharacter() throws CollectionException {
    Mockito.when(
            comicRepository.getComicPageForCharacter(Mockito.anyString(), pageCaptor.capture()))
        .thenReturn(comicList);

    final List<Comic> result =
        service.getPageForEntry(
            CollectionType.CHARACTERS,
            TEST_NAME_1,
            TEST_PAGE,
            TEST_COUNT,
            TEST_SORT_FIELD,
            TEST_ASCENDING);

    assertNotNull(result);
    assertSame(comicList, result);
    assertEquals(TEST_PAGE, pageCaptor.getValue().getPageNumber());
    assertEquals(TEST_COUNT, pageCaptor.getValue().getPageSize());

    Mockito.verify(comicRepository, Mockito.times(1))
        .getComicPageForCharacter(TEST_NAME_1, pageCaptor.getValue());
  }

  @Test
  public void testGetPageForEntryForTeam() throws CollectionException {
    Mockito.when(comicRepository.getComicPageForTeam(Mockito.anyString(), pageCaptor.capture()))
        .thenReturn(comicList);

    final List<Comic> result =
        service.getPageForEntry(
            CollectionType.TEAMS,
            TEST_NAME_1,
            TEST_PAGE,
            TEST_COUNT,
            TEST_SORT_FIELD,
            TEST_ASCENDING);

    assertNotNull(result);
    assertSame(comicList, result);
    assertEquals(TEST_PAGE, pageCaptor.getValue().getPageNumber());
    assertEquals(TEST_COUNT, pageCaptor.getValue().getPageSize());

    Mockito.verify(comicRepository, Mockito.times(1))
        .getComicPageForTeam(TEST_NAME_1, pageCaptor.getValue());
  }

  @Test
  public void testGetPageForEntryForLocations() throws CollectionException {
    Mockito.when(comicRepository.getComicPageForLocation(Mockito.anyString(), pageCaptor.capture()))
        .thenReturn(comicList);

    final List<Comic> result =
        service.getPageForEntry(
            CollectionType.LOCATIONS,
            TEST_NAME_1,
            TEST_PAGE,
            TEST_COUNT,
            TEST_SORT_FIELD,
            TEST_ASCENDING);

    assertNotNull(result);
    assertSame(comicList, result);
    assertEquals(TEST_PAGE, pageCaptor.getValue().getPageNumber());
    assertEquals(TEST_COUNT, pageCaptor.getValue().getPageSize());

    Mockito.verify(comicRepository, Mockito.times(1))
        .getComicPageForLocation(TEST_NAME_1, pageCaptor.getValue());
  }

  @Test
  public void testGetPageForEntryForStory() throws CollectionException {
    Mockito.when(comicRepository.getComicPageForStory(Mockito.anyString(), pageCaptor.capture()))
        .thenReturn(comicList);

    final List<Comic> result =
        service.getPageForEntry(
            CollectionType.STORIES,
            TEST_NAME_1,
            TEST_PAGE,
            TEST_COUNT,
            TEST_SORT_FIELD,
            TEST_ASCENDING);

    assertNotNull(result);
    assertSame(comicList, result);
    assertEquals(TEST_PAGE, pageCaptor.getValue().getPageNumber());
    assertEquals(TEST_COUNT, pageCaptor.getValue().getPageSize());

    Mockito.verify(comicRepository, Mockito.times(1))
        .getComicPageForStory(TEST_NAME_1, pageCaptor.getValue());
  }

  @Test
  public void testGetCountForCollectionTypeAndNameForPublisher() throws CollectionException {
    Mockito.when(comicRepository.getComicCountForPublisher(Mockito.anyString()))
        .thenReturn(TEST_COMIC_COUNT);

    final int result =
        service.getCountForCollectionTypeAndName(CollectionType.PUBLISHERS, TEST_NAME_1);

    assertEquals(TEST_COMIC_COUNT, result);

    Mockito.verify(comicRepository, Mockito.times(1)).getComicCountForPublisher(TEST_NAME_1);
  }
}

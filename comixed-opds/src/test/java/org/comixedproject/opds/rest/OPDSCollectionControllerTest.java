/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

package org.comixedproject.opds.rest;

import static junit.framework.TestCase.*;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.opds.OPDSException;
import org.comixedproject.opds.model.CollectionType;
import org.comixedproject.opds.model.OPDSAcquisitionFeed;
import org.comixedproject.opds.model.OPDSNavigationFeed;
import org.comixedproject.service.comicbooks.ComicService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class OPDSCollectionControllerTest {
  private static final String TEST_COLLECTION_ENTRY_NAME = "Collection Entry Name";
  private static final String TEST_BASE_FILENAME = "Filename.CBZ";

  @InjectMocks private OPDSCollectionController controller;
  @Mock private ComicService comicService;
  @Mock private Comic comic;

  private List<String> collectionList = new ArrayList<>();
  private List<Comic> comicList = new ArrayList<>();

  @Before
  public void setUp() {
    collectionList.add(TEST_COLLECTION_ENTRY_NAME);
    collectionList.add("");
    Mockito.when(comic.getBaseFilename()).thenReturn(TEST_BASE_FILENAME);
    Mockito.when(comic.getArchiveType()).thenReturn(ArchiveType.CBZ);
    comicList.add(comic);
  }

  @Test
  public void testGetCollectionFeedForPublisher() throws OPDSException {
    Mockito.when(comicService.getAllPublishers()).thenReturn(collectionList);

    final OPDSNavigationFeed result = controller.getCollectionFeed(CollectionType.publishers);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(TEST_COLLECTION_ENTRY_NAME, result.getEntries().get(0).getTitle());
  }

  @Test
  public void testGetCollectionFeedForSeries() throws OPDSException {
    Mockito.when(comicService.getAllSeries()).thenReturn(collectionList);

    final OPDSNavigationFeed result = controller.getCollectionFeed(CollectionType.series);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(TEST_COLLECTION_ENTRY_NAME, result.getEntries().get(0).getTitle());
  }

  @Test
  public void testGetCollectionFeedForCharacters() throws OPDSException {
    Mockito.when(comicService.getAllCharacters()).thenReturn(collectionList);

    final OPDSNavigationFeed result = controller.getCollectionFeed(CollectionType.characters);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(TEST_COLLECTION_ENTRY_NAME, result.getEntries().get(0).getTitle());
  }

  @Test
  public void testGetCollectionFeedForTeams() throws OPDSException {
    Mockito.when(comicService.getAllTeams()).thenReturn(collectionList);

    final OPDSNavigationFeed result = controller.getCollectionFeed(CollectionType.teams);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(TEST_COLLECTION_ENTRY_NAME, result.getEntries().get(0).getTitle());
  }

  @Test
  public void testGetCollectionFeedForLocations() throws OPDSException {
    Mockito.when(comicService.getAllLocations()).thenReturn(collectionList);

    final OPDSNavigationFeed result = controller.getCollectionFeed(CollectionType.locations);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(TEST_COLLECTION_ENTRY_NAME, result.getEntries().get(0).getTitle());
  }

  @Test
  public void testGetCollectionFeedForStories() throws OPDSException {
    Mockito.when(comicService.getAllStories()).thenReturn(collectionList);

    final OPDSNavigationFeed result = controller.getCollectionFeed(CollectionType.stories);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(TEST_COLLECTION_ENTRY_NAME, result.getEntries().get(0).getTitle());
  }

  @Test
  public void testGetEntriesForCollectionFeedForPublisher() throws OPDSException {
    Mockito.when(comicService.getAllForPublisher(Mockito.anyString())).thenReturn(comicList);

    final OPDSAcquisitionFeed result =
        controller.getEntriesForCollectionFeed(
            CollectionType.publishers, TEST_COLLECTION_ENTRY_NAME);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());

    Mockito.verify(comicService, Mockito.times(1)).getAllForPublisher(TEST_COLLECTION_ENTRY_NAME);
  }

  @Test
  public void testGetEntriesForCollectionFeedForSeries() throws OPDSException {
    Mockito.when(comicService.getAllForSeries(Mockito.anyString())).thenReturn(comicList);

    final OPDSAcquisitionFeed result =
        controller.getEntriesForCollectionFeed(CollectionType.series, TEST_COLLECTION_ENTRY_NAME);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());

    Mockito.verify(comicService, Mockito.times(1)).getAllForSeries(TEST_COLLECTION_ENTRY_NAME);
  }

  @Test
  public void testGetEntriesForCollectionFeedForCharacter() throws OPDSException {
    Mockito.when(comicService.getAllForCharacter(Mockito.anyString())).thenReturn(comicList);

    final OPDSAcquisitionFeed result =
        controller.getEntriesForCollectionFeed(
            CollectionType.characters, TEST_COLLECTION_ENTRY_NAME);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());

    Mockito.verify(comicService, Mockito.times(1)).getAllForCharacter(TEST_COLLECTION_ENTRY_NAME);
  }

  @Test
  public void testGetEntriesForCollectionFeedForTeam() throws OPDSException {
    Mockito.when(comicService.getAllForTeam(Mockito.anyString())).thenReturn(comicList);

    final OPDSAcquisitionFeed result =
        controller.getEntriesForCollectionFeed(CollectionType.teams, TEST_COLLECTION_ENTRY_NAME);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());

    Mockito.verify(comicService, Mockito.times(1)).getAllForTeam(TEST_COLLECTION_ENTRY_NAME);
  }

  @Test
  public void testGetEntriesForCollectionFeedForLocation() throws OPDSException {
    Mockito.when(comicService.getAllForLocation(Mockito.anyString())).thenReturn(comicList);

    final OPDSAcquisitionFeed result =
        controller.getEntriesForCollectionFeed(
            CollectionType.locations, TEST_COLLECTION_ENTRY_NAME);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());

    Mockito.verify(comicService, Mockito.times(1)).getAllForLocation(TEST_COLLECTION_ENTRY_NAME);
  }

  @Test
  public void testGetEntriesForCollectionFeedForStory() throws OPDSException {
    Mockito.when(comicService.getAllForStory(Mockito.anyString())).thenReturn(comicList);

    final OPDSAcquisitionFeed result =
        controller.getEntriesForCollectionFeed(CollectionType.stories, TEST_COLLECTION_ENTRY_NAME);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());

    Mockito.verify(comicService, Mockito.times(1)).getAllForStory(TEST_COLLECTION_ENTRY_NAME);
  }
}

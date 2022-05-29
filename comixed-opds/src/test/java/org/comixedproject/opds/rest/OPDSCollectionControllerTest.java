/*
 * ComiXed - A digital comicBook book library management application.
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

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.opds.OPDSException;
import org.comixedproject.opds.OPDSUtils;
import org.comixedproject.opds.model.CollectionType;
import org.comixedproject.opds.model.OPDSAcquisitionFeed;
import org.comixedproject.opds.model.OPDSNavigationFeed;
import org.comixedproject.service.comicbooks.ComicBookService;
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
  private static final String TEST_EMAIL = "reader@comixedproject.org";
  private static final boolean TEST_UNREAD = RandomUtils.nextBoolean();

  @InjectMocks private OPDSCollectionController controller;
  @Mock private ComicBookService comicBookService;
  @Mock private OPDSUtils opdsUtils;
  @Mock private ComicBook comicBook;
  @Mock private Principal principal;

  private List<String> collectionList = new ArrayList<>();
  private List<ComicBook> comicBookList = new ArrayList<>();

  @Before
  public void setUp() {
    collectionList.add(TEST_COLLECTION_ENTRY_NAME);
    collectionList.add("");
    comicBookList.add(comicBook);
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
  }

  @Test
  public void testGetCollectionFeedForPublisher() throws OPDSException {
    Mockito.when(comicBookService.getAllPublishers()).thenReturn(collectionList);

    final OPDSNavigationFeed result =
        controller.getCollectionFeed(CollectionType.publishers, false);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(TEST_COLLECTION_ENTRY_NAME, result.getEntries().get(0).getTitle());
  }

  @Test
  public void testGetCollectionFeedForSeries() throws OPDSException {
    Mockito.when(comicBookService.getAllSeries()).thenReturn(collectionList);

    final OPDSNavigationFeed result = controller.getCollectionFeed(CollectionType.series, false);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(TEST_COLLECTION_ENTRY_NAME, result.getEntries().get(0).getTitle());
  }

  @Test
  public void testGetCollectionFeedForCharacters() throws OPDSException {
    Mockito.when(comicBookService.getAllCharacters()).thenReturn(collectionList);

    final OPDSNavigationFeed result =
        controller.getCollectionFeed(CollectionType.characters, false);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(TEST_COLLECTION_ENTRY_NAME, result.getEntries().get(0).getTitle());
  }

  @Test
  public void testGetCollectionFeedForTeams() throws OPDSException {
    Mockito.when(comicBookService.getAllTeams()).thenReturn(collectionList);

    final OPDSNavigationFeed result = controller.getCollectionFeed(CollectionType.teams, false);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(TEST_COLLECTION_ENTRY_NAME, result.getEntries().get(0).getTitle());
  }

  @Test
  public void testGetCollectionFeedForLocations() throws OPDSException {
    Mockito.when(comicBookService.getAllLocations()).thenReturn(collectionList);

    final OPDSNavigationFeed result = controller.getCollectionFeed(CollectionType.locations, false);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(TEST_COLLECTION_ENTRY_NAME, result.getEntries().get(0).getTitle());
  }

  @Test
  public void testGetCollectionFeedForStories() throws OPDSException {
    Mockito.when(comicBookService.getAllStories()).thenReturn(collectionList);

    final OPDSNavigationFeed result = controller.getCollectionFeed(CollectionType.stories, false);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(TEST_COLLECTION_ENTRY_NAME, result.getEntries().get(0).getTitle());
  }

  @Test
  public void testGetEntriesForCollectionFeedForSeries() throws OPDSException {
    Mockito.when(opdsUtils.urlDecodeString(Mockito.anyString()))
        .thenReturn(TEST_COLLECTION_ENTRY_NAME);
    Mockito.when(
            comicBookService.getAllForSeries(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(comicBookList);

    final OPDSAcquisitionFeed result =
        controller.getEntriesForCollectionFeed(
            principal, CollectionType.series, TEST_COLLECTION_ENTRY_NAME, TEST_UNREAD);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());

    Mockito.verify(comicBookService, Mockito.times(1))
        .getAllForSeries(TEST_COLLECTION_ENTRY_NAME, TEST_EMAIL, TEST_UNREAD);
  }

  @Test
  public void testGetEntriesForCollectionFeedForCharacter() throws OPDSException {
    Mockito.when(opdsUtils.urlDecodeString(Mockito.anyString()))
        .thenReturn(TEST_COLLECTION_ENTRY_NAME);
    Mockito.when(
            comicBookService.getAllForCharacter(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(comicBookList);

    final OPDSAcquisitionFeed result =
        controller.getEntriesForCollectionFeed(
            principal, CollectionType.characters, TEST_COLLECTION_ENTRY_NAME, TEST_UNREAD);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());

    Mockito.verify(comicBookService, Mockito.times(1))
        .getAllForCharacter(TEST_COLLECTION_ENTRY_NAME, TEST_EMAIL, TEST_UNREAD);
  }

  @Test
  public void testGetEntriesForCollectionFeedForTeam() throws OPDSException {
    Mockito.when(opdsUtils.urlDecodeString(Mockito.anyString()))
        .thenReturn(TEST_COLLECTION_ENTRY_NAME);
    Mockito.when(
            comicBookService.getAllForTeam(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(comicBookList);

    final OPDSAcquisitionFeed result =
        controller.getEntriesForCollectionFeed(
            principal, CollectionType.teams, TEST_COLLECTION_ENTRY_NAME, TEST_UNREAD);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());

    Mockito.verify(comicBookService, Mockito.times(1))
        .getAllForTeam(TEST_COLLECTION_ENTRY_NAME, TEST_EMAIL, TEST_UNREAD);
  }

  @Test
  public void testGetEntriesForCollectionFeedForLocation() throws OPDSException {
    Mockito.when(opdsUtils.urlDecodeString(Mockito.anyString()))
        .thenReturn(TEST_COLLECTION_ENTRY_NAME);
    Mockito.when(
            comicBookService.getAllForLocation(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(comicBookList);

    final OPDSAcquisitionFeed result =
        controller.getEntriesForCollectionFeed(
            principal, CollectionType.locations, TEST_COLLECTION_ENTRY_NAME, TEST_UNREAD);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());

    Mockito.verify(comicBookService, Mockito.times(1))
        .getAllForLocation(TEST_COLLECTION_ENTRY_NAME, TEST_EMAIL, TEST_UNREAD);
  }

  @Test
  public void testGetEntriesForCollectionFeedForStory() throws OPDSException {
    Mockito.when(opdsUtils.urlDecodeString(Mockito.anyString()))
        .thenReturn(TEST_COLLECTION_ENTRY_NAME);
    Mockito.when(
            comicBookService.getAllForStory(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(comicBookList);

    final OPDSAcquisitionFeed result =
        controller.getEntriesForCollectionFeed(
            principal, CollectionType.stories, TEST_COLLECTION_ENTRY_NAME, TEST_UNREAD);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());

    Mockito.verify(comicBookService, Mockito.times(1))
        .getAllForStory(TEST_COLLECTION_ENTRY_NAME, TEST_EMAIL, TEST_UNREAD);
  }
}

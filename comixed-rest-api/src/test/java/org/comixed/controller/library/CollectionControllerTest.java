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

package org.comixed.controller.library;

import static junit.framework.TestCase.*;

import java.util.List;
import org.comixed.model.library.CollectionEntry;
import org.comixed.model.library.CollectionType;
import org.comixed.model.library.Comic;
import org.comixed.net.GetPageForEntryRequest;
import org.comixed.net.GetPageForEntryResponse;
import org.comixed.service.library.CollectionException;
import org.comixed.service.library.CollectionService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class CollectionControllerTest {
  private static final CollectionType TEST_COLLECTION_TYPE = CollectionType.TEAMS;
  private static final String TEST_COLLECTION_NAME = "The Avengers";
  private static final int TEST_COMIC_COUNT = 417;
  private static final int TEST_PAGE = 7;
  private static final int TEST_COUNT = 50;
  private static final String TEST_SORT_FIELD = "series";
  private static final boolean TEST_ASCENDING = true;

  @InjectMocks private CollectionController controller;
  @Mock private CollectionService collectionService;
  @Mock private List<CollectionEntry> collectionEntryList;
  @Mock private List<Comic> comicList;

  @Test
  public void testGetCollectionEntries() throws CollectionException {
    Mockito.when(collectionService.getCollectionEntries(Mockito.any()))
        .thenReturn(collectionEntryList);

    final List<CollectionEntry> result =
        controller.getCollectionEntries(TEST_COLLECTION_TYPE.toString());

    assertNotNull(result);
    assertSame(collectionEntryList, result);

    Mockito.verify(collectionService, Mockito.times(1)).getCollectionEntries(TEST_COLLECTION_TYPE);
  }

  @Test
  public void testGetPageForEntry() throws CollectionException {
    Mockito.when(
            collectionService.getPageForEntry(
                Mockito.any(CollectionType.class),
                Mockito.anyString(),
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.anyString(),
                Mockito.anyBoolean()))
        .thenReturn(comicList);
    Mockito.when(
            collectionService.getCountForCollectionTypeAndName(
                Mockito.any(CollectionType.class), Mockito.anyString()))
        .thenReturn(TEST_COMIC_COUNT);

    final GetPageForEntryResponse result =
        controller.getPageForEntry(
            TEST_COLLECTION_TYPE.toString(),
            TEST_COLLECTION_NAME,
            new GetPageForEntryRequest(TEST_PAGE, TEST_COUNT, TEST_SORT_FIELD, TEST_ASCENDING));

    assertNotNull(result);
    assertSame(comicList, result.getComics());
    assertEquals(TEST_COMIC_COUNT, result.getComicCount());

    Mockito.verify(collectionService, Mockito.times(1))
        .getPageForEntry(
            TEST_COLLECTION_TYPE,
            TEST_COLLECTION_NAME,
            TEST_PAGE,
            TEST_COUNT,
            TEST_SORT_FIELD,
            TEST_ASCENDING);
    Mockito.verify(collectionService, Mockito.times(1))
        .getCountForCollectionTypeAndName(TEST_COLLECTION_TYPE, TEST_COLLECTION_NAME);
  }
}

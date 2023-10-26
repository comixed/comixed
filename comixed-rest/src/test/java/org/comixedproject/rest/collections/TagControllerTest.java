/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

package org.comixedproject.rest.collections;

import static org.junit.Assert.*;

import java.util.List;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.model.collections.CollectionEntry;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.net.collections.LoadCollectionListRequest;
import org.comixedproject.model.net.collections.LoadCollectionListResponse;
import org.comixedproject.service.comicbooks.ComicDetailService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class TagControllerTest {
  private static final int TEST_PAGE_SIZE = 10;
  private static final int TEST_PAGE_INDEX = 12;
  private static final String TEST_SORT_BY = "comic-count";
  private static final String TEST_SORT_DIRECTION = "asc";
  private static final ComicTagType TEST_TAG_TYPE =
      ComicTagType.values()[RandomUtils.nextInt(ComicTagType.values().length)];
  private static final long TEST_COMIC_COUNT = RandomUtils.nextLong();

  @InjectMocks private TagController controller;
  @Mock private ComicDetailService comicDetailService;
  @Mock private List<CollectionEntry> collectionEntryList;

  @Test
  public void testLocalCollection() {
    Mockito.when(
            comicDetailService.loadCollectionEntries(
                Mockito.any(ComicTagType.class),
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.anyString(),
                Mockito.anyString()))
        .thenReturn(collectionEntryList);
    Mockito.when(comicDetailService.loadCollectionTotalEntries(Mockito.any(ComicTagType.class)))
        .thenReturn(TEST_COMIC_COUNT);

    final LoadCollectionListResponse result =
        controller.loadCollectionList(
            new LoadCollectionListRequest(
                TEST_PAGE_SIZE, TEST_PAGE_INDEX, TEST_SORT_BY, TEST_SORT_DIRECTION),
            TEST_TAG_TYPE.getValue());

    assertNotNull(result);
    assertSame(collectionEntryList, result.getEntries());
    assertEquals(TEST_COMIC_COUNT, result.getTotalEntries());

    Mockito.verify(comicDetailService, Mockito.times(1))
        .loadCollectionEntries(
            TEST_TAG_TYPE, TEST_PAGE_SIZE, TEST_PAGE_INDEX, TEST_SORT_BY, TEST_SORT_DIRECTION);
    Mockito.verify(comicDetailService, Mockito.times(1)).loadCollectionTotalEntries(TEST_TAG_TYPE);
  }
}

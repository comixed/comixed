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

package org.comixedproject.rest.collections;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;

import java.util.List;
import org.comixedproject.model.collections.Series;
import org.comixedproject.model.net.collections.LoadPublisherListRequest;
import org.comixedproject.model.net.collections.LoadPublisherListResponse;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class PublisherControllerTest {
  private static final String TEST_PUBLISHER_NAME = "The publisher name";
  private static final int TEST_PAGE_NUMBER = 72;
  private static final int TEST_PAGE_SIZE = 25;

  @InjectMocks private PublisherController controller;
  @Mock private ComicBookService comicBookService;
  @Mock private List<Series> seriesList;
  @Mock private LoadPublisherListResponse loadPublisherResponse;

  @Test
  public void testLoadPublisherList() {
    Mockito.when(
            comicBookService.getAllPublishersWithSeries(
                TEST_PAGE_NUMBER, TEST_PAGE_SIZE, "name", "asc"))
        .thenReturn(loadPublisherResponse);

    final LoadPublisherListResponse result =
        controller.loadPublisherList(
            new LoadPublisherListRequest(TEST_PAGE_NUMBER, TEST_PAGE_SIZE, "name", "asc"));

    assertNotNull(result);
    assertSame(loadPublisherResponse, result);

    Mockito.verify(comicBookService, Mockito.times(1))
        .getAllPublishersWithSeries(TEST_PAGE_NUMBER, TEST_PAGE_SIZE, "name", "asc");
  }

  @Test
  public void testGetPublisherDetail() {
    Mockito.when(comicBookService.getPublisherDetail(Mockito.anyString())).thenReturn(seriesList);

    final List<Series> result = controller.getPublisherDetail(TEST_PUBLISHER_NAME);

    assertNotNull(result);
    assertSame(seriesList, result);

    Mockito.verify(comicBookService, Mockito.times(1)).getPublisherDetail(TEST_PUBLISHER_NAME);
  }
}

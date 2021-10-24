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

package org.comixedproject.rest.library;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;
import static org.comixedproject.rest.library.LastReadController.MAXIMUM;

import java.security.Principal;
import java.util.List;
import org.comixedproject.model.library.LastRead;
import org.comixedproject.model.net.library.GetLastReadDatesResponse;
import org.comixedproject.model.net.library.library.SetComicsReadRequest;
import org.comixedproject.service.library.LastReadException;
import org.comixedproject.service.library.LastReadService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class LastReadControllerTest {
  private static final String TEST_EMAIL = "reader@domain.org";
  private static final long TEST_LAST_ID = 17L;
  private static final long TEST_COMIC_ID = 65L;

  @InjectMocks private LastReadController controller;
  @Mock private LastReadService lastReadService;
  @Mock private Principal principal;
  @Mock private List<LastRead> lastReadEntries;
  @Mock private List<LastRead> reducedLastReadEntries;
  @Mock private LastRead lastReadEntry;
  @Mock private List<Long> comicIdList;

  @Before
  public void setUp() {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
  }

  @Test(expected = LastReadException.class)
  public void testGetLastReadEntriesForUserServiceException() throws LastReadException {
    Mockito.when(
            lastReadService.getLastReadEntries(
                Mockito.anyString(), Mockito.anyLong(), Mockito.anyInt()))
        .thenThrow(LastReadException.class);

    try {
      controller.getLastReadEntries(principal, TEST_LAST_ID);
    } finally {
      Mockito.verify(lastReadService, Mockito.times(1))
          .getLastReadEntries(TEST_EMAIL, TEST_LAST_ID, MAXIMUM + 1);
    }
  }

  @Test
  public void testGetLastReadEntriesTooManyEntries() throws LastReadException {
    Mockito.when(
            lastReadService.getLastReadEntries(
                Mockito.anyString(), Mockito.anyLong(), Mockito.anyInt()))
        .thenReturn(lastReadEntries);
    Mockito.when(lastReadEntries.size()).thenReturn(MAXIMUM + 1);
    Mockito.when(lastReadEntries.subList(Mockito.anyInt(), Mockito.anyInt()))
        .thenReturn(reducedLastReadEntries);

    final GetLastReadDatesResponse response =
        controller.getLastReadEntries(principal, TEST_LAST_ID);

    assertNotNull(response);
    assertSame(reducedLastReadEntries, response.getEntries());

    Mockito.verify(lastReadService, Mockito.times(1))
        .getLastReadEntries(TEST_EMAIL, TEST_LAST_ID, MAXIMUM + 1);
    Mockito.verify(lastReadEntries, Mockito.times(1)).subList(0, MAXIMUM);
  }

  @Test
  public void testGetLastReadEntries() throws LastReadException {
    Mockito.when(
            lastReadService.getLastReadEntries(
                Mockito.anyString(), Mockito.anyLong(), Mockito.anyInt()))
        .thenReturn(lastReadEntries);
    Mockito.when(lastReadEntries.size()).thenReturn(MAXIMUM);

    final GetLastReadDatesResponse response =
        controller.getLastReadEntries(principal, TEST_LAST_ID);

    assertNotNull(response);
    assertSame(lastReadEntries, response.getEntries());

    Mockito.verify(lastReadService, Mockito.times(1))
        .getLastReadEntries(TEST_EMAIL, TEST_LAST_ID, MAXIMUM + 1);
  }

  @Test(expected = LastReadException.class)
  public void testSetComicsReadStateServiceException() throws LastReadException {
    Mockito.doThrow(LastReadException.class)
        .when(lastReadService)
        .setLastReadState(Mockito.anyString(), Mockito.anyList(), Mockito.anyBoolean());

    controller.setComicsReadState(principal, new SetComicsReadRequest(comicIdList, true));

    Mockito.verify(lastReadService, Mockito.times(1))
        .setLastReadState(TEST_EMAIL, comicIdList, true);
  }

  @Test
  public void testSetComicsReadState() throws LastReadException {
    controller.setComicsReadState(principal, new SetComicsReadRequest(comicIdList, true));

    Mockito.verify(lastReadService, Mockito.times(1))
        .setLastReadState(TEST_EMAIL, comicIdList, true);
  }
}

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
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.opds.OPDSException;
import org.comixedproject.opds.model.OPDSAcquisitionFeed;
import org.comixedproject.opds.model.OPDSNavigationFeed;
import org.comixedproject.opds.service.OPDSAcquisitionService;
import org.comixedproject.opds.service.OPDSNavigationService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class OPDSListsControllerTest {
  private static final String TEST_EMAIL = "reader@comixedproject.org";
  private static final long TEST_READING_LIST_ID = 217L;

  @InjectMocks private OPDSListsController controller;
  @Mock private OPDSNavigationService opdsNavigationService;
  @Mock private OPDSAcquisitionService opdsAcquisitionService;
  @Mock private Principal principal;
  @Mock private OPDSNavigationFeed opdsNavigationFeed;
  @Mock private OPDSAcquisitionFeed opdsAcquisitionFeed;

  private List<ComicBook> comicBookList = new ArrayList<>();

  @Before
  public void setUp() {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
  }

  @Test
  public void testLoadReadingLists() throws OPDSException {
    Mockito.when(opdsNavigationService.getReadingListsFeed(Mockito.anyString()))
        .thenReturn(opdsNavigationFeed);

    final OPDSNavigationFeed response = controller.loadReadingLists(principal);

    assertNotNull(response);
    assertSame(opdsNavigationFeed, response);

    Mockito.verify(opdsNavigationService, Mockito.times(1)).getReadingListsFeed(TEST_EMAIL);
  }

  @Test
  public void testLoadReadingListEntries() throws OPDSException {
    Mockito.when(
            opdsAcquisitionService.getComicFeedForReadingList(
                Mockito.anyString(), Mockito.anyLong()))
        .thenReturn(opdsAcquisitionFeed);

    final OPDSAcquisitionFeed result =
        controller.loadReadingListEntries(principal, TEST_READING_LIST_ID);

    assertNotNull(result);
    assertSame(opdsAcquisitionFeed, result);

    Mockito.verify(opdsAcquisitionService, Mockito.times(1))
        .getComicFeedForReadingList(TEST_EMAIL, TEST_READING_LIST_ID);
  }
}

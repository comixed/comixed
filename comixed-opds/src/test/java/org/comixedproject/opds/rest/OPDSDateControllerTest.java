/*
 * ComiXed - A digital comicBook book library management application.
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

package org.comixedproject.opds.rest;

import static junit.framework.TestCase.*;

import java.security.Principal;
import org.apache.commons.lang.math.RandomUtils;
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
public class OPDSDateControllerTest {
  private static final Integer TEST_YEAR = 2022;
  private static final Integer TEST_WEEK = RandomUtils.nextInt(52);
  private static final boolean TEST_UNREAD = RandomUtils.nextBoolean();
  private static final String TEST_EMAIL = "reader@comixedproject.org";

  @InjectMocks private OPDSDateController controller;
  @Mock private OPDSNavigationService opdsNavigationService;
  @Mock private OPDSAcquisitionService opdsAcquisitionService;
  @Mock private Principal principal;
  @Mock private OPDSNavigationFeed opdsNavigationFeed;
  @Mock private OPDSAcquisitionFeed opdsAcquisitionFeed;

  @Before
  public void setUp() {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
  }

  @Test
  public void testGetYearsFeed() {
    Mockito.when(opdsNavigationService.getYearsFeed(Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(opdsNavigationFeed);

    final OPDSNavigationFeed response = controller.getYearsFeed(principal, TEST_UNREAD);

    assertNotNull(response);
    assertSame(opdsNavigationFeed, response);

    Mockito.verify(opdsNavigationService, Mockito.times(1)).getYearsFeed(TEST_EMAIL, TEST_UNREAD);
  }

  @Test
  public void testGetWeeksForYear() throws OPDSException {
    Mockito.when(
            opdsNavigationService.getWeeksFeedForYear(
                Mockito.anyInt(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(opdsNavigationFeed);

    final OPDSNavigationFeed response =
        controller.getWeeksFeedForYear(principal, TEST_YEAR, TEST_UNREAD);

    assertNotNull(response);
    assertSame(opdsNavigationFeed, response);

    Mockito.verify(opdsNavigationService, Mockito.times(1))
        .getWeeksFeedForYear(TEST_YEAR, TEST_EMAIL, TEST_UNREAD);
  }

  @Test
  public void testLoadComicsForYearAndWeek() throws OPDSException {
    Mockito.when(
            opdsAcquisitionService.getComicsFeedForYearAndWeek(
                Mockito.anyString(), Mockito.anyInt(), Mockito.anyInt(), Mockito.anyBoolean()))
        .thenReturn(opdsAcquisitionFeed);

    final OPDSAcquisitionFeed response =
        controller.loadComicsForYearAndWeek(principal, TEST_YEAR, TEST_WEEK, TEST_UNREAD);

    assertNotNull(response);
    assertSame(opdsAcquisitionFeed, response);

    Mockito.verify(opdsAcquisitionService, Mockito.times(1))
        .getComicsFeedForYearAndWeek(TEST_EMAIL, TEST_YEAR, TEST_WEEK, TEST_UNREAD);
  }
}

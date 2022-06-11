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
import static org.junit.Assert.assertNotNull;

import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.opds.model.OPDSNavigationFeed;
import org.comixedproject.opds.service.OPDSNavigationService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class OPDSLibraryControllerTest {
  private static final boolean TEST_UNREAD = RandomUtils.nextBoolean();

  @InjectMocks private OPDSLibraryController controller;
  @Mock private OPDSNavigationService opdsNavigationService;
  @Mock private OPDSNavigationFeed navigationFeed;

  @Test
  public void testGetRoot() {
    Mockito.when(opdsNavigationService.getRootFeed()).thenReturn(navigationFeed);

    final OPDSNavigationFeed response = controller.getRootFeed();

    assertNotNull(response);
    assertSame(navigationFeed, response);

    Mockito.verify(opdsNavigationService, Mockito.times(1)).getRootFeed();
  }

  @Test
  public void testGetLibraryFeed() {
    Mockito.when(opdsNavigationService.getLibraryFeed(Mockito.anyBoolean()))
        .thenReturn(navigationFeed);

    final OPDSNavigationFeed response = controller.getLibraryFeed(TEST_UNREAD);

    assertNotNull(response);
    assertSame(navigationFeed, response);

    Mockito.verify(opdsNavigationService, Mockito.times(1)).getLibraryFeed(TEST_UNREAD);
  }
}

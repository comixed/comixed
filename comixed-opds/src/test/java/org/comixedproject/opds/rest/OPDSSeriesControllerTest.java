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

package org.comixedproject.opds.rest;

import static org.junit.Assert.*;

import java.security.Principal;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.opds.OPDSUtils;
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
public class OPDSSeriesControllerTest {
  private static final boolean TEST_UNREAD = RandomUtils.nextBoolean();
  private static final String TEST_SERIES_NAME_ENCODED = "The encoded series";
  private static final String TEST_SERIES_NAME_DECODED = "The decoded series";
  private static final String TEST_VOLUME_NAME_ENCODED = "The encoded volume";
  private static final String TEST_VOLUME_NAME_DECODED = "The decoded volume";
  private static final String TEST_EMAIL = "reader@comixedproject.org";

  @InjectMocks private OPDSSeriesController controller;
  @Mock private OPDSNavigationService opdsNavigationService;
  @Mock private OPDSAcquisitionService opdsAcquisitionService;
  @Mock private OPDSUtils opdsUtils;
  @Mock private OPDSNavigationFeed opdsNavigationFeed;
  @Mock private OPDSAcquisitionFeed opdsAcquisitionFeed;
  @Mock private Principal principal;

  @Before
  public void setUp() {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
  }

  @Test
  public void testGetRootFeedForSeries() {
    Mockito.when(
            opdsNavigationService.getRootFeedForSeries(Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(opdsNavigationFeed);

    final OPDSNavigationFeed result = controller.getRootFeedForSeries(principal, TEST_UNREAD);

    assertNotNull(result);
    assertSame(opdsNavigationFeed, result);

    Mockito.verify(opdsNavigationService, Mockito.times(1))
        .getRootFeedForSeries(TEST_EMAIL, TEST_UNREAD);
  }

  @Test
  public void testGetVolumeFeedForSeries() {
    Mockito.when(opdsUtils.urlDecodeString(Mockito.anyString()))
        .thenReturn(TEST_SERIES_NAME_DECODED);
    Mockito.when(
            opdsNavigationService.getVolumesFeedForSeries(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(opdsNavigationFeed);

    final OPDSNavigationFeed result =
        controller.getVolumesFeedForSeries(principal, TEST_SERIES_NAME_ENCODED, TEST_UNREAD);

    assertNotNull(result);
    assertSame(opdsNavigationFeed, result);

    Mockito.verify(opdsUtils, Mockito.times(1)).urlDecodeString(TEST_SERIES_NAME_ENCODED);
    Mockito.verify(opdsNavigationService, Mockito.times(1))
        .getVolumesFeedForSeries(TEST_SERIES_NAME_DECODED, TEST_EMAIL, TEST_UNREAD);
  }

  @Test
  public void testGetComicFeedForSeriesAndVolume() {
    Mockito.when(opdsUtils.urlDecodeString(TEST_SERIES_NAME_ENCODED))
        .thenReturn(TEST_SERIES_NAME_DECODED);
    Mockito.when(opdsUtils.urlDecodeString(TEST_VOLUME_NAME_ENCODED))
        .thenReturn(TEST_VOLUME_NAME_DECODED);
    Mockito.when(
            opdsAcquisitionService.getComicFeedForSeriesAndVolumes(
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyBoolean()))
        .thenReturn(opdsAcquisitionFeed);

    final OPDSAcquisitionFeed result =
        controller.getComicFeedForSeriesAndVolumes(
            principal, TEST_SERIES_NAME_ENCODED, TEST_VOLUME_NAME_ENCODED, TEST_UNREAD);

    assertNotNull(result);
    assertSame(opdsAcquisitionFeed, result);

    Mockito.verify(opdsUtils, Mockito.times(1)).urlDecodeString(TEST_SERIES_NAME_ENCODED);
    Mockito.verify(opdsUtils, Mockito.times(1)).urlDecodeString(TEST_VOLUME_NAME_ENCODED);
    Mockito.verify(opdsAcquisitionService, Mockito.times(1))
        .getComicFeedForSeriesAndVolumes(
            TEST_SERIES_NAME_DECODED, TEST_VOLUME_NAME_DECODED, TEST_EMAIL, TEST_UNREAD);
  }
}

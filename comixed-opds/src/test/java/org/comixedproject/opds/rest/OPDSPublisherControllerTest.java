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

import static org.junit.jupiter.api.Assertions.*;

import java.security.Principal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.model.comicbooks.ComicBook;
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
public class OPDSPublisherControllerTest {
  private static final String TEST_PUBLISHER_ENCODED = "The+Publisher";
  private static final String TEST_PUBLISHER = "The Publisher";
  private static final boolean TEST_UNREAD = RandomUtils.nextBoolean();
  private static final String TEST_SERIES_ENCODED = "The+Series+Name";
  private static final String TEST_SERIES = "The Series Name";
  private static final String TEST_VOLUME_ENCODED = "The+Volume";
  private static final String TEST_VOLUME = "The Volume";
  private static final String TEST_EMAIL = "reader@comixedproject.org";

  @InjectMocks private OPDSPublisherController controller;
  @Mock private OPDSNavigationService opdsNavigationService;
  @Mock private OPDSAcquisitionService opdsAcquisitionService;
  @Mock private OPDSNavigationFeed navigationFeed;
  @Mock private OPDSAcquisitionFeed acquisitionFeed;
  @Mock private OPDSUtils opdsUtils;
  @Mock private ComicBook comicBook;
  @Mock private Principal principal;

  private Set<String> seriesList = new HashSet<>();
  private Set<String> volumeList = new HashSet<>();
  private List<ComicBook> comicBookList = new ArrayList<>();

  @Before
  public void setUp() {
    Mockito.when(opdsUtils.urlDecodeString(TEST_PUBLISHER_ENCODED)).thenReturn(TEST_PUBLISHER);
    Mockito.when(opdsUtils.urlDecodeString(TEST_SERIES_ENCODED)).thenReturn(TEST_SERIES);
    Mockito.when(opdsUtils.urlDecodeString(TEST_VOLUME_ENCODED)).thenReturn(TEST_VOLUME);

    seriesList.add(TEST_SERIES);
    volumeList.add(TEST_VOLUME);
    comicBookList.add(comicBook);

    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
  }

  @Test
  public void testGetSeriesFeedForPublisher() {
    Mockito.when(
            opdsNavigationService.getSeriesFeedForPublisher(
                Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(navigationFeed);

    final OPDSNavigationFeed result =
        controller.getSeriesFeedForPublisher(TEST_PUBLISHER_ENCODED, TEST_UNREAD);

    assertNotNull(result);
    assertSame(navigationFeed, result);

    Mockito.verify(opdsNavigationService, Mockito.times(1))
        .getSeriesFeedForPublisher(TEST_PUBLISHER, TEST_UNREAD);
  }

  @Test
  public void testGetVolumeFeedForPublisherAndSeries() {
    Mockito.when(
            opdsNavigationService.getVolumeFeedForPublisherAndSeries(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(navigationFeed);

    final OPDSNavigationFeed response =
        controller.getVolumeFeedForPublisherAndSeries(
            TEST_PUBLISHER_ENCODED, TEST_SERIES_ENCODED, TEST_UNREAD);

    assertNotNull(response);
    assertSame(navigationFeed, response);

    Mockito.verify(opdsNavigationService, Mockito.times(1))
        .getVolumeFeedForPublisherAndSeries(TEST_PUBLISHER, TEST_SERIES, TEST_UNREAD);
  }

  @Test
  public void testGetComicFeedForPublisherAndSeriesAndVolume() {
    Mockito.when(
            opdsAcquisitionService.getComicFeedsForPublisherAndSeriesAndVolume(
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyBoolean()))
        .thenReturn(acquisitionFeed);

    final OPDSAcquisitionFeed result =
        controller.getComicFeedsForPublisherAndSeriesAndVolume(
            principal,
            TEST_UNREAD,
            TEST_PUBLISHER_ENCODED,
            TEST_SERIES_ENCODED,
            TEST_VOLUME_ENCODED);

    assertNotNull(result);
    assertSame(acquisitionFeed, result);

    Mockito.verify(opdsAcquisitionService, Mockito.times(1))
        .getComicFeedsForPublisherAndSeriesAndVolume(
            TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, TEST_EMAIL, TEST_UNREAD);
  }
}

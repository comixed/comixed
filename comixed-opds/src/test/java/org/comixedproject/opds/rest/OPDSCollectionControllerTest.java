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
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.opds.OPDSUtils;
import org.comixedproject.opds.model.CollectionType;
import org.comixedproject.opds.model.OPDSAcquisitionFeed;
import org.comixedproject.opds.model.OPDSNavigationFeed;
import org.comixedproject.opds.service.OPDSAcquisitionService;
import org.comixedproject.opds.service.OPDSNavigationService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class OPDSCollectionControllerTest {
  private static final String TEST_ENCODED_NAME = "Collection Entry Name";
  private static final String TEST_DECODED_NAME = "The decoded collection name";
  private static final String TEST_EMAIL = "reader@comixedproject.org";
  private static final boolean TEST_UNREAD = RandomUtils.nextBoolean();
  private static final CollectionType TEST_COLLECTION_TYPE =
      CollectionType.values()[RandomUtils.nextInt(CollectionType.values().length)];

  @InjectMocks private OPDSCollectionController controller;
  @Mock private OPDSNavigationService opdsNavigationService;
  @Mock private OPDSAcquisitionService opdsAcquisitionService;
  @Mock private OPDSNavigationFeed navigationFeed;
  @Mock private OPDSAcquisitionFeed acquisitionFeed;
  @Mock private Principal principal;
  @Mock private OPDSUtils opdsUtils;

  @Test
  public void testGetCollectionFeed() {
    Mockito.when(
            opdsNavigationService.getCollectionFeed(
                Mockito.any(CollectionType.class), Mockito.anyBoolean()))
        .thenReturn(navigationFeed);

    final OPDSNavigationFeed response =
        controller.getCollectionFeed(TEST_COLLECTION_TYPE, TEST_UNREAD);

    assertNotNull(response);
    assertSame(navigationFeed, response);

    Mockito.verify(opdsNavigationService, Mockito.times(1))
        .getCollectionFeed(TEST_COLLECTION_TYPE, TEST_UNREAD);
  }

  @Test
  public void testGetEntriesForCollectionFeed() {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
    Mockito.when(opdsUtils.urlDecodeString(Mockito.anyString())).thenReturn(TEST_DECODED_NAME);
    Mockito.when(
            opdsAcquisitionService.getEntriesForCollectionFeed(
                Mockito.anyString(),
                Mockito.any(CollectionType.class),
                Mockito.anyString(),
                Mockito.anyBoolean()))
        .thenReturn(acquisitionFeed);

    final OPDSAcquisitionFeed response =
        controller.getEntriesForCollectionFeed(
            principal, TEST_COLLECTION_TYPE, TEST_ENCODED_NAME, TEST_UNREAD);

    assertNotNull(response);
    assertSame(acquisitionFeed, response);

    Mockito.verify(opdsAcquisitionService, Mockito.times(1))
        .getEntriesForCollectionFeed(
            TEST_EMAIL, TEST_COLLECTION_TYPE, TEST_DECODED_NAME, TEST_UNREAD);
  }
}

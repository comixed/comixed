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

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;

import org.comixedproject.opds.OPDSUtils;
import org.comixedproject.opds.model.OPDSAcquisitionFeed;
import org.comixedproject.opds.model.OpenSearchDescriptor;
import org.comixedproject.opds.service.OPDSAcquisitionService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class OPDSSearchControllerTest {
  private static final String TEST_ENCODED_STRING = "The encoded string";
  private static final String TEST_DECODED_STRING = "The decoded string";

  @InjectMocks private OPDSSearchController controller;
  @Mock private OPDSAcquisitionService opdsAcquisitionService;
  @Mock private OPDSUtils opdsUtils;
  @Mock private OPDSAcquisitionFeed feed;

  @Test
  public void testGetSearchDescriptor() {
    final OpenSearchDescriptor result = controller.getSearchDescriptor();

    assertNotNull(result);
    assertSame(controller.searchDescriptor, result);
  }

  @Test
  public void testSearch() {
    Mockito.when(opdsUtils.urlDecodeString(Mockito.anyString())).thenReturn(TEST_DECODED_STRING);
    Mockito.when(opdsAcquisitionService.getComicsFeedForSearchTerms(Mockito.anyString()))
        .thenReturn(feed);

    final OPDSAcquisitionFeed result = controller.search(TEST_ENCODED_STRING);

    assertNotNull(result);
    assertSame(feed, result);

    Mockito.verify(opdsUtils, Mockito.times(1)).urlDecodeString(TEST_ENCODED_STRING);
    Mockito.verify(opdsAcquisitionService, Mockito.times(1))
        .getComicsFeedForSearchTerms(TEST_DECODED_STRING);
  }
}

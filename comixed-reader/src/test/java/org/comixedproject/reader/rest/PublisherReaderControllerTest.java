/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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

package org.comixedproject.reader.rest;

import static org.comixedproject.reader.rest.PublisherReaderController.GET_PUBLISHERS_URL;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import org.comixedproject.reader.model.DirectoryEntry;
import org.comixedproject.reader.model.LoadDirectoryResponse;
import org.comixedproject.reader.service.DirectoryReaderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PublisherReaderControllerTest {
  private static final String TEST_EMAIL = "reader@comixedproject.org";
  private static final String TEST_PUBLISHER = "The Publisher";

  @InjectMocks private PublisherReaderController controller;
  @Mock private DirectoryReaderService directoryReaderService;
  @Mock private Principal principal;
  @Mock private DirectoryEntry directoryEntry;

  @Captor private ArgumentCaptor<String> urlArgumentCaptor;

  private List<DirectoryEntry> directoryEntryList = new ArrayList<DirectoryEntry>();

  @BeforeEach
  void setUp() {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
    directoryEntryList.add(directoryEntry);
  }

  @Test
  void getPublishers() {
    Mockito.when(
            directoryReaderService.getAllPublishers(
                Mockito.anyString(), Mockito.anyBoolean(), Mockito.anyString()))
        .thenReturn(directoryEntryList);

    final LoadDirectoryResponse result =
        controller.getPublishers(principal, Boolean.FALSE.toString());

    assertNotNull(result);
    assertEquals(directoryEntryList, result.getContents());

    Mockito.verify(directoryReaderService, Mockito.times(1))
        .getAllPublishers(TEST_EMAIL, false, GET_PUBLISHERS_URL);
  }

  @Test
  void getPublishers_unread() {
    Mockito.when(
            directoryReaderService.getAllPublishers(
                Mockito.anyString(), Mockito.anyBoolean(), Mockito.anyString()))
        .thenReturn(directoryEntryList);

    final LoadDirectoryResponse result =
        controller.getPublishers(principal, Boolean.TRUE.toString());

    assertNotNull(result);
    assertEquals(directoryEntryList, result.getContents());

    Mockito.verify(directoryReaderService, Mockito.times(1))
        .getAllPublishers(TEST_EMAIL, true, GET_PUBLISHERS_URL);
  }

  @Test
  void getSeriesForPublishers() {
    Mockito.when(
            directoryReaderService.getAllSeriesForPublisher(
                Mockito.anyString(),
                Mockito.anyBoolean(),
                Mockito.anyString(),
                urlArgumentCaptor.capture()))
        .thenReturn(directoryEntryList);

    final LoadDirectoryResponse result =
        controller.getSeriesForPublishers(principal, TEST_PUBLISHER, Boolean.FALSE.toString());

    assertNotNull(result);
    assertEquals(directoryEntryList, result.getContents());

    final String url = urlArgumentCaptor.getValue();
    assertNotNull(url);

    Mockito.verify(directoryReaderService, Mockito.times(1))
        .getAllSeriesForPublisher(TEST_EMAIL, false, TEST_PUBLISHER, url);
  }

  @Test
  void getSeriesForPublishers_unread() {
    Mockito.when(
            directoryReaderService.getAllSeriesForPublisher(
                Mockito.anyString(),
                Mockito.anyBoolean(),
                Mockito.anyString(),
                urlArgumentCaptor.capture()))
        .thenReturn(directoryEntryList);

    final LoadDirectoryResponse result =
        controller.getSeriesForPublishers(principal, TEST_PUBLISHER, Boolean.TRUE.toString());

    assertNotNull(result);
    assertEquals(directoryEntryList, result.getContents());

    final String url = urlArgumentCaptor.getValue();
    assertNotNull(url);

    Mockito.verify(directoryReaderService, Mockito.times(1))
        .getAllSeriesForPublisher(TEST_EMAIL, true, TEST_PUBLISHER, url);
  }
}

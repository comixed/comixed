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

import static org.comixedproject.reader.rest.SeriesReaderController.ALL_SERIES_URL;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import org.comixedproject.reader.ReaderUtil;
import org.comixedproject.reader.model.DirectoryEntry;
import org.comixedproject.reader.model.LoadDirectoryResponse;
import org.comixedproject.reader.service.DirectoryReaderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SeriesReaderControllerTest {
  private static final String TEST_EMAIL = "reader@comixedproject.org";
  private static final String TEST_SERIES = "The Series";
  private static final String TEST_SERIES_ENCODED = ReaderUtil.urlEncode(TEST_SERIES);
  private static final String TEST_PUBLISHER = "The Publisher";
  private static final String TEST_PUBLISHER_ENCODED = ReaderUtil.urlEncode(TEST_PUBLISHER);

  @InjectMocks private SeriesReaderController controller;
  @Mock private DirectoryReaderService directoryReaderService;
  @Mock private Principal principal;

  @Captor private ArgumentCaptor<String> urlArgumentCaptor;

  private List<DirectoryEntry> directoryEntryList = new ArrayList<>();

  @BeforeEach
  void setUp() {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
  }

  @Test
  void getAllSeries() {
    Mockito.when(
            directoryReaderService.getAllSeries(
                Mockito.anyString(), Mockito.anyBoolean(), urlArgumentCaptor.capture()))
        .thenReturn(directoryEntryList);

    final LoadDirectoryResponse result =
        controller.getAllSeries(principal, Boolean.FALSE.toString());

    assertNotNull(result);
    assertEquals(directoryEntryList, result.getContents());

    final String url = urlArgumentCaptor.getValue();
    assertEquals(ALL_SERIES_URL, url);

    Mockito.verify(directoryReaderService, Mockito.times(1)).getAllSeries(TEST_EMAIL, false, url);
  }

  @Test
  void getAllSeries_unread() {
    Mockito.when(
            directoryReaderService.getAllSeries(
                Mockito.anyString(), Mockito.anyBoolean(), urlArgumentCaptor.capture()))
        .thenReturn(directoryEntryList);

    final LoadDirectoryResponse result =
        controller.getAllSeries(principal, Boolean.TRUE.toString());

    assertNotNull(result);
    assertEquals(directoryEntryList, result.getContents());

    final String url = urlArgumentCaptor.getValue();
    assertEquals(ALL_SERIES_URL, url);

    Mockito.verify(directoryReaderService, Mockito.times(1)).getAllSeries(TEST_EMAIL, true, url);
  }

  @Test
  void getPublishersForSeries() {
    Mockito.when(
            directoryReaderService.getAllPublishersForSeries(
                Mockito.anyString(),
                Mockito.anyBoolean(),
                Mockito.anyString(),
                urlArgumentCaptor.capture()))
        .thenReturn(directoryEntryList);

    final LoadDirectoryResponse result =
        controller.getPublishersForSeries(principal, TEST_SERIES_ENCODED, Boolean.FALSE.toString());

    assertNotNull(result);
    assertEquals(directoryEntryList, result.getContents());

    final String url = urlArgumentCaptor.getValue();

    Mockito.verify(directoryReaderService, Mockito.times(1))
        .getAllPublishersForSeries(TEST_EMAIL, false, TEST_SERIES, url);
  }

  @Test
  void getPublishersForSeries_unread() {
    Mockito.when(
            directoryReaderService.getAllPublishersForSeries(
                Mockito.anyString(),
                Mockito.anyBoolean(),
                Mockito.anyString(),
                urlArgumentCaptor.capture()))
        .thenReturn(directoryEntryList);

    final LoadDirectoryResponse result =
        controller.getPublishersForSeries(principal, TEST_SERIES_ENCODED, Boolean.TRUE.toString());

    assertNotNull(result);
    assertEquals(directoryEntryList, result.getContents());

    final String url = urlArgumentCaptor.getValue();

    Mockito.verify(directoryReaderService, Mockito.times(1))
        .getAllPublishersForSeries(TEST_EMAIL, true, TEST_SERIES, url);
  }

  @Test
  void getVolumesForPublisherAndSeries() {
    Mockito.when(
            directoryReaderService.getAllVolumesForPublisherAndSeries(
                Mockito.anyString(),
                Mockito.anyBoolean(),
                Mockito.anyString(),
                Mockito.anyString(),
                urlArgumentCaptor.capture()))
        .thenReturn(directoryEntryList);

    final LoadDirectoryResponse result =
        controller.getVolumesForPublisherAndSeries(
            principal, TEST_PUBLISHER_ENCODED, TEST_SERIES_ENCODED, Boolean.FALSE.toString());

    assertNotNull(result);
    assertEquals(directoryEntryList, result.getContents());

    final String url = urlArgumentCaptor.getValue();

    Mockito.verify(directoryReaderService, Mockito.times(1))
        .getAllVolumesForPublisherAndSeries(TEST_EMAIL, false, TEST_PUBLISHER, TEST_SERIES, url);
  }

  @Test
  void getVolumesForPublisherAndSeries_unread() {
    Mockito.when(
            directoryReaderService.getAllVolumesForPublisherAndSeries(
                Mockito.anyString(),
                Mockito.anyBoolean(),
                Mockito.anyString(),
                Mockito.anyString(),
                urlArgumentCaptor.capture()))
        .thenReturn(directoryEntryList);

    final LoadDirectoryResponse result =
        controller.getVolumesForPublisherAndSeries(
            principal, TEST_PUBLISHER_ENCODED, TEST_SERIES_ENCODED, Boolean.TRUE.toString());

    assertNotNull(result);
    assertEquals(directoryEntryList, result.getContents());

    final String url = urlArgumentCaptor.getValue();

    Mockito.verify(directoryReaderService, Mockito.times(1))
        .getAllVolumesForPublisherAndSeries(TEST_EMAIL, true, TEST_PUBLISHER, TEST_SERIES, url);
  }

  @Test
  void getVolumesForSeriesAndPublisher() {
    Mockito.when(
            directoryReaderService.getAllVolumesForPublisherAndSeries(
                Mockito.anyString(),
                Mockito.anyBoolean(),
                Mockito.anyString(),
                Mockito.anyString(),
                urlArgumentCaptor.capture()))
        .thenReturn(directoryEntryList);

    final LoadDirectoryResponse result =
        controller.getVolumesForSeriesAndPublisher(
            principal, TEST_SERIES_ENCODED, TEST_PUBLISHER_ENCODED, Boolean.FALSE.toString());

    assertNotNull(result);
    assertEquals(directoryEntryList, result.getContents());

    final String url = urlArgumentCaptor.getValue();

    Mockito.verify(directoryReaderService, Mockito.times(1))
        .getAllVolumesForPublisherAndSeries(TEST_EMAIL, false, TEST_PUBLISHER, TEST_SERIES, url);
  }

  @Test
  void getVolumesForSeriesAndPublisher_unread() {
    Mockito.when(
            directoryReaderService.getAllVolumesForPublisherAndSeries(
                Mockito.anyString(),
                Mockito.anyBoolean(),
                Mockito.anyString(),
                Mockito.anyString(),
                urlArgumentCaptor.capture()))
        .thenReturn(directoryEntryList);

    final LoadDirectoryResponse result =
        controller.getVolumesForSeriesAndPublisher(
            principal, TEST_SERIES_ENCODED, TEST_PUBLISHER_ENCODED, Boolean.TRUE.toString());

    assertNotNull(result);
    assertEquals(directoryEntryList, result.getContents());

    final String url = urlArgumentCaptor.getValue();

    Mockito.verify(directoryReaderService, Mockito.times(1))
        .getAllVolumesForPublisherAndSeries(TEST_EMAIL, true, TEST_PUBLISHER, TEST_SERIES, url);
  }
}

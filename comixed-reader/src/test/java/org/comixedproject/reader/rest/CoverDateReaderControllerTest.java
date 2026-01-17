/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import static org.comixedproject.reader.rest.CoverDateReaderController.GET_COVER_DATES_URL;
import static org.junit.jupiter.api.Assertions.*;

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
class CoverDateReaderControllerTest {
  private static final String TEST_EMAIL = "reader@comixedproject.org";

  @InjectMocks private CoverDateReaderController controller;
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
  void getCoverDates() {
    Mockito.when(
            directoryReaderService.getAllCoverDates(
                Mockito.anyString(), Mockito.anyBoolean(), Mockito.anyString()))
        .thenReturn(directoryEntryList);

    final LoadDirectoryResponse result =
        controller.getCoverDates(principal, Boolean.FALSE.toString());

    assertNotNull(result);
    assertEquals(directoryEntryList, result.getContents());

    Mockito.verify(directoryReaderService, Mockito.times(1))
        .getAllCoverDates(TEST_EMAIL, false, GET_COVER_DATES_URL);
  }

  @Test
  void getCoverDates_unread() {
    Mockito.when(
            directoryReaderService.getAllCoverDates(
                Mockito.anyString(), Mockito.anyBoolean(), Mockito.anyString()))
        .thenReturn(directoryEntryList);

    final LoadDirectoryResponse result =
        controller.getCoverDates(principal, Boolean.TRUE.toString());

    assertNotNull(result);
    assertEquals(directoryEntryList, result.getContents());

    Mockito.verify(directoryReaderService, Mockito.times(1))
        .getAllCoverDates(TEST_EMAIL, true, GET_COVER_DATES_URL);
  }
}

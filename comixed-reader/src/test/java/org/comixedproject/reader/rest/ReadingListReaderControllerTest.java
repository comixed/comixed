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

import static org.comixedproject.reader.rest.LibraryReaderController.COMIC_DOWNLOAD_URL;
import static org.comixedproject.reader.rest.ReadingListReaderController.READING_LIST_URL;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import org.comixedproject.reader.model.DirectoryEntry;
import org.comixedproject.reader.model.LoadDirectoryResponse;
import org.comixedproject.reader.service.DirectoryReaderService;
import org.comixedproject.service.lists.ReadingListException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ReadingListReaderControllerTest {
  private static final String TEST_EMAIL = "reader@comixedproject.org";
  private static final Long TEST_READING_LIST_ID = 717L;

  @InjectMocks private ReadingListReaderController controller;
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
  void getReadingLists() throws ReadingListException {
    Mockito.when(
            directoryReaderService.getAllReadingLists(
                Mockito.anyString(), urlArgumentCaptor.capture()))
        .thenReturn(directoryEntryList);

    final LoadDirectoryResponse result = controller.getReadingLists(principal);

    assertNotNull(result);
    assertEquals(directoryEntryList, result.getContents());

    final String url = urlArgumentCaptor.getValue();
    assertEquals(READING_LIST_URL, url);

    Mockito.verify(directoryReaderService, Mockito.times(1)).getAllReadingLists(TEST_EMAIL, url);
  }

  @Test
  void getComicsForReadingList() throws ReadingListException {
    Mockito.when(
            directoryReaderService.getAllComicsForReadingList(
                Mockito.anyString(), Mockito.anyLong(), urlArgumentCaptor.capture()))
        .thenReturn(directoryEntryList);

    final LoadDirectoryResponse result =
        controller.getComicsForReadingList(principal, TEST_READING_LIST_ID);

    assertNotNull(result);
    assertEquals(directoryEntryList, result.getContents());

    final String url = urlArgumentCaptor.getValue();
    assertEquals(COMIC_DOWNLOAD_URL, url);

    Mockito.verify(directoryReaderService, Mockito.times(1))
        .getAllComicsForReadingList(TEST_EMAIL, TEST_READING_LIST_ID, url);
  }
}

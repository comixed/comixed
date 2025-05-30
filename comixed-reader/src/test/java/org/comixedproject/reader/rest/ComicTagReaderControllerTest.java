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

import static org.junit.jupiter.api.Assertions.*;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.reader.model.DirectoryEntry;
import org.comixedproject.reader.model.LoadDirectoryResponse;
import org.comixedproject.reader.service.DirectoryReaderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ComicTagReaderControllerTest {
  private static final String TEST_EMAIL = "reader@comixedproject.org";

  @InjectMocks private ComicTagReaderController controller;
  @Mock private DirectoryReaderService directoryReaderService;
  @Mock private Principal principal;
  @Mock private DirectoryEntry directoryEntry;

  @Captor private ArgumentCaptor<String> urlRootArgumentCaptor;

  private List<DirectoryEntry> directoryEntryList = new ArrayList<>();

  @BeforeEach
  void setUp() {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
    directoryEntryList.add(directoryEntry);
  }

  @Test
  void getAllForTagType() {
    for (int index = 0; index < ComicTagType.values().length; index++) {
      Mockito.when(
              directoryReaderService.getAllForTagType(
                  Mockito.anyString(),
                  Mockito.anyBoolean(),
                  Mockito.any(ComicTagType.class),
                  urlRootArgumentCaptor.capture()))
          .thenReturn(directoryEntryList);

      final ComicTagType comicTagType = ComicTagType.values()[index];
      final LoadDirectoryResponse result =
          controller.getAllForTagType(principal, "false", comicTagType.getValue());

      assertNotNull(result);
      assertEquals(directoryEntryList, result.getContents());

      final String urlRoot = urlRootArgumentCaptor.getValue();
      assertFalse(urlRoot.isEmpty());

      Mockito.verify(directoryReaderService, Mockito.times(1))
          .getAllForTagType(TEST_EMAIL, false, comicTagType, urlRoot);
    }
  }

  @Test
  void getAllForTagType_unread() {
    for (int index = 0; index < ComicTagType.values().length; index++) {
      Mockito.when(
              directoryReaderService.getAllForTagType(
                  Mockito.anyString(),
                  Mockito.anyBoolean(),
                  Mockito.any(ComicTagType.class),
                  urlRootArgumentCaptor.capture()))
          .thenReturn(directoryEntryList);

      final ComicTagType comicTagType = ComicTagType.values()[index];
      final LoadDirectoryResponse result =
          controller.getAllForTagType(principal, "true", comicTagType.getValue());

      assertNotNull(result);
      assertEquals(directoryEntryList, result.getContents());

      final String urlRoot = urlRootArgumentCaptor.getValue();
      assertFalse(urlRoot.isEmpty());

      Mockito.verify(directoryReaderService, Mockito.times(1))
          .getAllForTagType(TEST_EMAIL, true, comicTagType, urlRoot);
    }
  }
}

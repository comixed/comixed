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

import static org.comixedproject.reader.rest.LibraryReaderController.*;
import static org.junit.jupiter.api.Assertions.*;

import org.comixedproject.reader.model.LoadDirectoryResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class LibraryReaderControllerTest {
  @InjectMocks private LibraryReaderController controller;

  @Test
  void getRoot() {
    final LoadDirectoryResponse result = controller.getRoot();

    assertNotNull(result);
    assertEquals(3, result.getContents().size());
    assertEquals(ALL_COMICS, result.getContents().get(0).getName());
    assertEquals(ALL_COMICS_URL, result.getContents().get(0).getPath());
    assertEquals(UNREAD_COMICS, result.getContents().get(1).getName());
    assertEquals(UNREAD_COMICS_URL, result.getContents().get(1).getPath());
    assertEquals(READING_LISTS, result.getContents().get(2).getName());
    assertEquals(READING_LISTS_URL, result.getContents().get(2).getPath());
  }

  @Test
  void getAll() {
    final LoadDirectoryResponse result = controller.getAll(Boolean.FALSE.toString());

    assertNotNull(result);
    assertEquals(7, result.getContents().size());
    assertEquals(COVER_DATES, result.getContents().get(0).getName());
    assertTrue(result.getContents().get(0).getPath().contains("unread=false"));
    assertEquals(PUBLISHERS, result.getContents().get(1).getName());
    assertTrue(result.getContents().get(1).getPath().contains("unread=false"));
    assertEquals(SERIES, result.getContents().get(2).getName());
    assertTrue(result.getContents().get(2).getPath().contains("unread=false"));
    assertEquals(CHARACTERS, result.getContents().get(3).getName());
    assertTrue(result.getContents().get(3).getPath().contains("unread=false"));
    assertEquals(TEAMS, result.getContents().get(4).getName());
    assertTrue(result.getContents().get(4).getPath().contains("unread=false"));
    assertEquals(LOCATIONS, result.getContents().get(5).getName());
    assertTrue(result.getContents().get(5).getPath().contains("unread=false"));
    assertEquals(STORY_ARCS, result.getContents().get(6).getName());
    assertTrue(result.getContents().get(6).getPath().contains("unread=false"));
  }

  @Test
  void getAll_unread() {
    final LoadDirectoryResponse result = controller.getAll(Boolean.TRUE.toString());

    assertNotNull(result);
    assertEquals(7, result.getContents().size());
    assertEquals(COVER_DATES, result.getContents().get(0).getName());
    assertTrue(result.getContents().get(0).getPath().contains("unread=true"));
    assertEquals(PUBLISHERS, result.getContents().get(1).getName());
    assertTrue(result.getContents().get(1).getPath().contains("unread=true"));
    assertEquals(SERIES, result.getContents().get(2).getName());
    assertTrue(result.getContents().get(2).getPath().contains("unread=true"));
    assertEquals(CHARACTERS, result.getContents().get(3).getName());
    assertTrue(result.getContents().get(3).getPath().contains("unread=true"));
    assertEquals(TEAMS, result.getContents().get(4).getName());
    assertTrue(result.getContents().get(4).getPath().contains("unread=true"));
    assertEquals(LOCATIONS, result.getContents().get(5).getName());
    assertTrue(result.getContents().get(5).getPath().contains("unread=true"));
    assertEquals(STORY_ARCS, result.getContents().get(6).getName());
    assertTrue(result.getContents().get(6).getPath().contains("unread=true"));
  }
}

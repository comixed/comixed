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

package org.comixedproject.state.comicbooks.guards;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.File;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MarkComicAsFoundGuardTest {
  private static final String TEST_EXISTING_FILE = "src/test/resources/example.cbz";

  @InjectMocks private MarkComicAsFoundGuard guard;
  @Mock private ComicDetail comicDetail;
  @Mock private ComicBook comicBook;

  @BeforeEach
  void setUp() {
    Mockito.when(comicDetail.isMissing()).thenReturn(true);
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
  }

  @Test
  void evaluate_comicNotMarkedAsMissing() {
    Mockito.when(comicDetail.isMissing()).thenReturn(false);

    assertFalse(guard.evaluate(comicBook));
  }

  @Test
  void evaluate_fileWasNotFound() {
    Mockito.when(comicDetail.getFile()).thenReturn(new File(TEST_EXISTING_FILE.substring(1)));

    assertFalse(guard.evaluate(comicBook));
  }

  @Test
  void evaluate() {
    Mockito.when(comicDetail.getFile()).thenReturn(new File(TEST_EXISTING_FILE));

    assertTrue(guard.evaluate(comicBook));
  }
}

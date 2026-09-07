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
import static org.mockito.Mockito.when;

import java.io.File;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MarkComicAsMissingGuardTest {
  private static final String TEST_EXISTING_FILE = "src/test/resources/example.cbz";

  @InjectMocks private MarkComicAsMissingGuard guard;
  @Mock private ComicDetail comic;

  @BeforeEach
  void setUp() {
    when(comic.isMarkedMissing()).thenReturn(false);
  }

  @Test
  void evaluate_comicAlreadyMarkedAsMissing() {
    when(comic.isMarkedMissing()).thenReturn(true);

    assertFalse(guard.evaluate(comic));
  }

  @Test
  void evaluate_fileWasFound() {
    when(comic.getFile()).thenReturn(new File(TEST_EXISTING_FILE));

    assertFalse(guard.evaluate(comic));
  }

  @Test
  void evaluate() {
    when(comic.getFile()).thenReturn(new File(TEST_EXISTING_FILE.substring(1)));

    assertTrue(guard.evaluate(comic));
  }
}

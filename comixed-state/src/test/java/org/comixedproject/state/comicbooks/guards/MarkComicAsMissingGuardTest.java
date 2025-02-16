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
import org.springframework.messaging.MessageHeaders;
import org.springframework.statemachine.StateContext;

@ExtendWith(MockitoExtension.class)
class MarkComicAsMissingGuardTest {
  private static final String TEST_EXISTING_FILE = "src/test/resources/example.cbz";

  @InjectMocks private MarkComicAsMissingGuard guard;
  @Mock private StateContext context;
  @Mock private MessageHeaders messageHeaders;
  @Mock private ComicDetail comicDetail;
  @Mock private ComicBook comicBook;

  @BeforeEach
  void setUp() {
    Mockito.when(context.getMessageHeaders()).thenReturn(messageHeaders);
    Mockito.when(comicDetail.isMissing()).thenReturn(false);
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(messageHeaders.get(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(comicBook);
  }

  @Test
  void evaluate_comicAlreadyMarkedAsMissing() {
    Mockito.when(comicDetail.isMissing()).thenReturn(true);

    assertFalse(guard.evaluate(context));
  }

  @Test
  void evaluate_fileWasFound() {
    Mockito.when(comicDetail.getFile()).thenReturn(new File(TEST_EXISTING_FILE));

    assertFalse(guard.evaluate(context));
  }

  @Test
  void evaluate() {
    Mockito.when(comicDetail.getFile()).thenReturn(new File(TEST_EXISTING_FILE.substring(1)));

    assertTrue(guard.evaluate(context));
  }
}

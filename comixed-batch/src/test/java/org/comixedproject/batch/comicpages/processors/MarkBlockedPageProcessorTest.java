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

package org.comixedproject.batch.comicpages.processors;

import static org.junit.jupiter.api.Assertions.*;

import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.comicpages.ComicPageType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MarkBlockedPageProcessorTest {
  @InjectMocks private MarkBlockedPageProcessor processor;
  @Mock private ComicPage page;
  @Mock private ComicBook comicBook;

  @Test
  void process() {
    Mockito.when(page.getComicBook()).thenReturn(comicBook);

    final ComicPage result = processor.process(page);

    assertNotNull(result);
    assertSame(page, result);

    Mockito.verify(page).setPageType(ComicPageType.DELETED);
  }
}

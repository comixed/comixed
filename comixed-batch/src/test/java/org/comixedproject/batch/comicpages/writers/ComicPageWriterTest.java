/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

package org.comixedproject.batch.comicpages.writers;

import java.util.ArrayList;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.batch.infrastructure.item.Chunk;

@ExtendWith(MockitoExtension.class)
class ComicPageWriterTest {
  @InjectMocks private ComicPageWriter writer;
  @Mock private ComicStateHandler comicStateHandler;

  @Mock private ComicPage page;
  @Mock private ComicBook comicBook;

  private Chunk<ComicPage> pageList = new Chunk<>(new ArrayList<>());

  @Test
  void write() throws Exception {
    Mockito.when(page.getComicBook()).thenReturn(comicBook);
    pageList.add(page);

    writer.write(pageList);

    Mockito.verify(comicStateHandler, Mockito.times(pageList.size()))
        .fireEvent(comicBook, ComicEvent.detailsUpdated);
  }
}

/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

package org.comixedproject.batch.comicbooks.writers;

import static org.mockito.Mockito.*;

import java.util.ArrayList;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateAdaptor;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.batch.infrastructure.item.Chunk;

@ExtendWith(MockitoExtension.class)
class EditComicMetadataWriterTest {
  @InjectMocks private EditComicMetadataWriter writer;
  @Mock private ComicStateAdaptor comicStateAdaptor;
  @Mock private ComicBook comicBook;
  @Mock private ComicDetail comic;

  private Chunk<ComicBook> comicBookList = new Chunk<>(new ArrayList<>());

  @Test
  void write() {
    when(comicBook.getComicDetail()).thenReturn(comic);

    for (int index = 0; index < 25; index++) comicBookList.add(comicBook);

    writer.write(comicBookList);

    verify(comicStateAdaptor, times(comicBookList.size()))
        .fireEvent(comic, ComicEvent.comicMetadataChanged);
  }
}

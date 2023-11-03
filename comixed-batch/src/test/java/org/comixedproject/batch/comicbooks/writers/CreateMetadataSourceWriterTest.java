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

import static org.junit.Assert.*;

import java.util.ArrayList;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.batch.item.Chunk;

@RunWith(MockitoJUnitRunner.class)
public class CreateMetadataSourceWriterTest {
  @InjectMocks private CreateMetadataSourceWriter writer;
  @Mock private ComicStateHandler comicStateHandler;
  @Mock private ComicBook comicBook;

  private Chunk<ComicBook> comicBookList = new Chunk<>(new ArrayList<>());

  @Test
  public void testWrite() {
    for (int index = 0; index < 25; index++) comicBookList.add(comicBook);

    writer.write(comicBookList);

    Mockito.verify(comicStateHandler, Mockito.times(comicBookList.size()))
        .fireEvent(comicBook, ComicEvent.metadataSourceCreated);
  }
}

/*
 * ComiXed - A digital comicBook book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ComicBookInsertWriterTest {
  @InjectMocks private ComicInsertWriter writer;
  @Mock private ComicBookService comicBookService;
  @Mock private ComicBook comicBook;
  @Mock private ComicBook savedComicBook;

  private List<ComicBook> comicBookList = new ArrayList<>();

  @Test
  public void testWrite() throws Exception {
    for (int index = 0; index < 25; index++) comicBookList.add(comicBook);

    Mockito.when(comicBookService.save(Mockito.any(ComicBook.class))).thenReturn(savedComicBook);

    writer.write(comicBookList);

    Mockito.verify(comicBookService, Mockito.times(comicBookList.size())).save(comicBook);
  }
}

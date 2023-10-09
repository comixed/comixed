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
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicfiles.ComicFileDescriptor;
import org.comixedproject.service.comicfiles.ComicFileService;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ComicBookInsertWriterTest {
  private static final String TEST_FILENAME = "The filename";
  @InjectMocks private ComicInsertWriter writer;
  @Mock private ComicStateHandler comicStateHandler;
  @Mock private ComicFileService comicFileService;
  @Mock private ComicDetail comicDetail;
  @Mock private ComicBook comicBook;
  @Mock private ComicFileDescriptor comicFileDescriptor;

  private List<ComicBook> comicBookList = new ArrayList<>();

  @Before
  public void setUp() {
    Mockito.when(comicDetail.getFilename()).thenReturn(TEST_FILENAME);
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(comicFileService.getComicFileDescriptorByFilename(Mockito.anyString()))
        .thenReturn(comicFileDescriptor);
  }

  @Test
  public void testWrite() {
    for (int index = 0; index < 25; index++) comicBookList.add(comicBook);

    writer.write(comicBookList);

    Mockito.verify(comicStateHandler, Mockito.times(comicBookList.size()))
        .fireEvent(comicBook, ComicEvent.readyForProcessing);
    Mockito.verify(comicFileService, Mockito.times(comicBookList.size()))
        .getComicFileDescriptorByFilename(TEST_FILENAME);
    Mockito.verify(comicFileService, Mockito.times(comicBookList.size()))
        .deleteComicFileDescriptor(comicFileDescriptor);
  }
}

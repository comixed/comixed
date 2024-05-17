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

import static org.junit.Assert.*;

import java.util.ArrayList;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.state.comicpages.ComicPageEvent;
import org.comixedproject.state.comicpages.ComicPageStateHandler;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.batch.item.Chunk;

@RunWith(MockitoJUnitRunner.class)
public class MarkBlockedPagesWriterTest {
  @InjectMocks private MarkBlockedPagesWriter writer;
  @Mock private ComicPageStateHandler comicPageStateHandler;
  @Mock private ComicPage page;

  private Chunk<ComicPage> pageList = new Chunk<>(new ArrayList<>());

  @Test
  public void testWrite() throws Exception {
    pageList.add(page);

    writer.write(pageList);

    Mockito.verify(comicPageStateHandler, Mockito.times(pageList.size()))
        .fireEvent(page, ComicPageEvent.markForDeletion);
  }
}

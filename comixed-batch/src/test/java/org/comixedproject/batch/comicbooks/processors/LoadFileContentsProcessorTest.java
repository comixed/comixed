/*
 * ComiXed - A digital comic book library management application.
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

package org.comixedproject.batch.comicbooks.processors;

import java.util.List;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicpages.Page;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class LoadFileContentsProcessorTest {
  @InjectMocks private LoadFileContentsProcessor processor;
  @Mock private ComicBookAdaptor comicBookAdaptor;
  @Mock private Comic comic;
  @Mock private List<Page> pageList;

  @Test
  public void testProcess() throws Exception {
    Mockito.when(comic.getPages()).thenReturn(pageList);

    processor.process(comic);

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).load(comic);
    Mockito.verify(pageList, Mockito.times(1)).sort(Mockito.any());
  }
}

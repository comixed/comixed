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

import static junit.framework.TestCase.*;

import java.io.InputStream;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicFileDetails;
import org.comixedproject.utils.Utils;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class LoadFileDetailsProcessorTest {
  private static final String TEST_HASH = "0123456789ABCDEF";
  private static final String TEST_COMIC_FILENAME = "src/test/resources/example.cbz";

  @InjectMocks private LoadFileDetailsProcessor processor;
  @Mock private Utils utils;
  @Mock private Comic comic;

  @Captor private ArgumentCaptor<ComicFileDetails> comicFileDetailsArgumentCaptor;

  @Test
  public void testProcess() throws Exception {
    Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILENAME);
    Mockito.when(utils.createHash(Mockito.any(InputStream.class))).thenReturn(TEST_HASH);
    Mockito.doNothing().when(comic).setFileDetails(comicFileDetailsArgumentCaptor.capture());

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    final ComicFileDetails fileDetails = comicFileDetailsArgumentCaptor.getValue();
    assertNotNull(fileDetails);
    assertSame(comic, fileDetails.getComic());
    assertEquals(TEST_HASH, fileDetails.getHash());
  }
}

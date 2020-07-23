/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

package org.comixedproject.loaders;

import java.io.IOException;
import java.util.Map;
import org.comixedproject.model.comic.Comic;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
@TestPropertySource(locations = "classpath:application.properties")
public class FilenameEntryLoaderTest extends BaseLoaderTest {
  private static final String TEST_FILE = "src/test/resources/ComicInfo-complete.xml";
  private static final String TEST_FILENAME = "ComicInfo.xml";

  @InjectMocks private FilenameEntryLoader loader;

  @Mock private Map<String, EntryLoader> entryLoaders;

  @Mock private EntryLoader entryLoader;

  private Comic comic;

  @Before
  public void setUp() {
    comic = new Comic();
  }

  @Test
  public void testLoadNoLoaderDefined() throws EntryLoaderException, IOException {
    byte[] content = loadFile(TEST_FILE);

    Mockito.when(entryLoaders.get(Mockito.anyString())).thenReturn(null);

    loader.loadContent(comic, TEST_FILENAME, content);

    Mockito.verify(entryLoaders, Mockito.times(1)).get("ComicInfo.xml");
    Mockito.verify(entryLoader, Mockito.never()).loadContent(comic, TEST_FILENAME, content);
  }

  @Test
  public void testLoadComicInfoFile() throws IOException, EntryLoaderException {
    byte[] content = loadFile(TEST_FILE);

    Mockito.when(entryLoaders.get(Mockito.anyString())).thenReturn(entryLoader);
    Mockito.doNothing()
        .when(entryLoader)
        .loadContent(Mockito.any(Comic.class), Mockito.anyString(), Mockito.any());

    loader.loadContent(comic, TEST_FILENAME, content);

    Mockito.verify(entryLoaders, Mockito.times(1)).get("ComicInfo.xml");
    Mockito.verify(entryLoader, Mockito.times(1)).loadContent(comic, TEST_FILENAME, content);
  }
}

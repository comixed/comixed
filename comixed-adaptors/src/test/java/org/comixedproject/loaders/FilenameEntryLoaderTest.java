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

import static junit.framework.TestCase.assertSame;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.comixedproject.adaptor.model.EntryLoaderEntry;
import org.comixedproject.model.comic.Comic;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.TestPropertySource;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
@TestPropertySource(locations = "classpath:application.properties")
public class FilenameEntryLoaderTest extends BaseLoaderTest {
  private static final String TEST_FILE = "src/test/resources/ComicInfo-complete.xml";
  private static final String TEST_FILENAME = "ComicInfo.xml";
  private static final String TEST_LOADER_BEAN_NAME = "loadBean";
  private static final String TEST_MASK = "the mask";

  @InjectMocks private FilenameEntryLoader filenameEntryLoader;
  @Mock private Map<String, EntryLoader> entryLoaders;
  @Mock private ApplicationContext context;
  @Mock private EntryLoader loaderBean;
  @Mock private EntryLoaderEntry entryLoaderEntry;

  private Comic comic;
  private List<EntryLoaderEntry> entryLoaderEntries = new ArrayList<>();

  @Before
  public void setUp() {
    comic = new Comic();

    Mockito.when(entryLoaderEntry.getBean()).thenReturn(TEST_LOADER_BEAN_NAME);
    Mockito.when(entryLoaderEntry.getMask()).thenReturn(TEST_MASK);
    entryLoaderEntries.add(entryLoaderEntry);

    filenameEntryLoader.context = context;
    filenameEntryLoader.entryLoaders = entryLoaders;
    filenameEntryLoader.entryLoaderEntries = entryLoaderEntries;
  }

  @Test
  public void testLoadNoLoaderDefined() throws EntryLoaderException, IOException {
    byte[] content = loadFile(TEST_FILE);

    Mockito.when(entryLoaders.get(Mockito.anyString())).thenReturn(null);

    filenameEntryLoader.loadContent(comic, TEST_FILENAME, content, false);

    Mockito.verify(entryLoaders, Mockito.times(1)).get("ComicInfo.xml");
    Mockito.verify(loaderBean, Mockito.never()).loadContent(comic, TEST_FILENAME, content, false);
  }

  @Test
  public void testLoadComicInfoFile() throws IOException, EntryLoaderException {
    byte[] content = loadFile(TEST_FILE);

    Mockito.when(entryLoaders.get(Mockito.anyString())).thenReturn(loaderBean);
    Mockito.doNothing()
        .when(loaderBean)
        .loadContent(
            Mockito.any(Comic.class), Mockito.anyString(), Mockito.any(), Mockito.anyBoolean());

    filenameEntryLoader.loadContent(comic, TEST_FILENAME, content, false);

    Mockito.verify(entryLoaders, Mockito.times(1)).get("ComicInfo.xml");
    Mockito.verify(loaderBean, Mockito.times(1)).loadContent(comic, TEST_FILENAME, content, false);
  }

  @Test
  public void testAfterPropertiesSetInvalidBean() throws Exception {
    Mockito.when(entryLoaderEntry.isValid()).thenReturn(false);

    filenameEntryLoader.afterPropertiesSet();

    Mockito.verify(entryLoaderEntry, Mockito.times(1)).isValid();
    Mockito.verify(entryLoaders, Mockito.never())
        .put(Mockito.anyString(), Mockito.any(EntryLoader.class));
  }

  @Test
  public void testAfterPropertiesSetNoSuchBean() throws Exception {
    Mockito.when(entryLoaderEntry.isValid()).thenReturn(true);
    Mockito.when(context.containsBean(Mockito.anyString())).thenReturn(false);

    filenameEntryLoader.afterPropertiesSet();

    Mockito.verify(entryLoaderEntry, Mockito.times(1)).isValid();
    Mockito.verify(context, Mockito.times(1)).containsBean(TEST_LOADER_BEAN_NAME);
    Mockito.verify(entryLoaders, Mockito.never())
        .put(Mockito.anyString(), Mockito.any(EntryLoader.class));
  }

  @Test
  public void testAfterPropertiesSet() throws Exception {
    Mockito.when(entryLoaderEntry.isValid()).thenReturn(true);
    Mockito.when(context.containsBean(Mockito.anyString())).thenReturn(true);
    Mockito.when(context.getBean(Mockito.anyString())).thenReturn(loaderBean);

    filenameEntryLoader.afterPropertiesSet();

    Mockito.verify(entryLoaderEntry, Mockito.times(1)).isValid();
    Mockito.verify(entryLoaderEntry, Mockito.times(1)).getMask();
    Mockito.verify(context, Mockito.times(1)).containsBean(TEST_LOADER_BEAN_NAME);
    Mockito.verify(context, Mockito.times(1)).getBean(TEST_LOADER_BEAN_NAME);
    //    Mockito.verify(entryLoaders, Mockito.times(1)).put(TEST_MASK, loaderBean);
  }

  @Test
  public void testGetLoaders() {
    assertSame(entryLoaderEntries, filenameEntryLoader.getEntryLoaderEntries());
  }
}

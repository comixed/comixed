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

import static org.junit.Assert.*;

import java.io.IOException;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.PageType;
import org.comixedproject.repositories.comic.PageTypeRepository;
import org.comixedproject.utils.Utils;
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
public class ImageEntryLoaderTest extends BaseLoaderTest {
  private static final String TEST_JPEG_FILENAME = "src/test/resources/example.jpg";
  private static final String TEST_WEBP_FILENAME = "src/test/resources/example.webp";
  private static final String TEST_HASH = "928375298571098571209857";

  @InjectMocks private ImageEntryLoader loader;
  @Mock private PageTypeRepository pageTypeRepository;
  @Mock private PageType pageType;
  @Mock private Utils utils;

  private Comic comic;

  @Before
  public void setUp() {
    comic = new Comic();
    Mockito.when(utils.createHash(Mockito.any(byte[].class))).thenReturn(TEST_HASH);
  }

  @Test
  public void testLoadJPGImage() throws IOException {
    Mockito.when(pageTypeRepository.getDefaultPageType()).thenReturn(pageType);

    byte[] content = loadFile(TEST_JPEG_FILENAME);

    loader.loadContent(comic, TEST_JPEG_FILENAME, content);

    Mockito.verify(pageTypeRepository, Mockito.times(1)).getDefaultPageType();

    assertEquals(1, comic.getPageCount());
    assertNotNull(comic.getPage(0));
    //        assertEquals(content, comic.getPage(0).getContent());
    assertSame(pageType, comic.getPage(0).getPageType());
  }

  @Test
  public void testLoadWebPImage() throws IOException {
    Mockito.when(pageTypeRepository.getDefaultPageType()).thenReturn(pageType);

    byte[] content = loadFile(TEST_WEBP_FILENAME);

    loader.loadContent(comic, TEST_WEBP_FILENAME, content);

    Mockito.verify(pageTypeRepository, Mockito.times(1)).getDefaultPageType();

    assertEquals(1, comic.getPageCount());
    assertNotNull(comic.getPage(0));
    //        assertEquals(content, comic.getPage(0).getContent());
    assertSame(pageType, comic.getPage(0).getPageType());
  }
}

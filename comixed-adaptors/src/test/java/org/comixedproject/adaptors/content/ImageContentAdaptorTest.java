/*
 * ComiXed - A digital comicBook book library management application.
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

package org.comixedproject.adaptors.content;

import static org.junit.Assert.*;

import java.io.IOException;
import org.comixedproject.adaptors.GenericUtilitiesAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
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
public class ImageContentAdaptorTest extends BaseContentAdaptorTest {
  private static final String TEST_JPEG_FILENAME = "src/test/resources/example.jpg";
  private static final String TEST_WEBP_FILENAME = "src/test/resources/example.webp";
  private static final String TEST_HASH = "928375298571098571209857";

  @InjectMocks private ImageContentAdaptor loader;
  @Mock private GenericUtilitiesAdaptor genericUtilitiesAdaptor;

  private ComicBook comicBook;
  private ContentAdaptorRules contentAdaptorRules = new ContentAdaptorRules();

  @Before
  public void setUp() {
    comicBook = new ComicBook();
    Mockito.when(genericUtilitiesAdaptor.createHash(Mockito.any(byte[].class)))
        .thenReturn(TEST_HASH);
  }

  @Test
  public void testLoadJPGImage() throws IOException {
    byte[] content = loadFile(TEST_JPEG_FILENAME);

    loader.loadContent(comicBook, TEST_JPEG_FILENAME, content, contentAdaptorRules);

    assertEquals(1, comicBook.getPageCount());
    assertNotNull(comicBook.getPage(0));
  }

  @Test
  public void testLoadWebPImage() throws IOException {
    byte[] content = loadFile(TEST_WEBP_FILENAME);

    loader.loadContent(comicBook, TEST_WEBP_FILENAME, content, contentAdaptorRules);

    assertEquals(1, comicBook.getPageCount());
    assertNotNull(comicBook.getPage(0));
  }
}

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

package org.comixedproject.adaptors.content;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.io.IOException;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.comicpages.ComicPageType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ImageFileTypeContentAdaptorTest extends BaseContentAdaptorTest {
  private static final String TEST_JPEG_FILENAME = "src/test/resources/example.jpg";
  private static final String TEST_WEBP_FILENAME = "src/test/resources/example.webp";
  private static final String TEST_GIF_FILENAME = "src/test/resources/example.gif";

  @InjectMocks private ImageFileTypeContentAdaptor adaptor;

  @Mock private ComicPage comicPage;

  private ComicBook comicBook = new ComicBook();

  @Test
  void loadContent_fileAlreadyExists() throws IOException {
    comicBook.getPages().add(new ComicPage());
    comicBook.getPages().get(0).setFilename(TEST_JPEG_FILENAME);

    byte[] content = loadFile(TEST_JPEG_FILENAME);

    adaptor.loadContent(comicBook, TEST_JPEG_FILENAME, content);

    assertEquals(1, comicBook.getPageCount());
    assertNotNull(comicBook.getPages().get(0));
  }

  @Test
  void loadContent_not_first_image() throws IOException {
    byte[] content = loadFile(TEST_JPEG_FILENAME);
    Mockito.when(comicPage.getFilename())
        .thenReturn(TEST_JPEG_FILENAME.substring(0, TEST_JPEG_FILENAME.length() - 2));
    comicBook.getPages().add(comicPage);

    adaptor.loadContent(comicBook, TEST_JPEG_FILENAME, content);

    assertEquals(2, comicBook.getPages().size());
    assertNotNull(comicBook.getPages().get(comicBook.getPages().size() - 1));
    assertEquals(
        ComicPageType.STORY,
        comicBook.getPages().get(comicBook.getPages().size() - 1).getPageType());
  }

  @Test
  void loadContent_jpg() throws IOException {
    byte[] content = loadFile(TEST_JPEG_FILENAME);

    adaptor.loadContent(comicBook, TEST_JPEG_FILENAME, content);

    assertEquals(1, comicBook.getPageCount());
    assertNotNull(comicBook.getPages().get(0));
    assertEquals(ComicPageType.FRONT_COVER, comicBook.getPages().get(0).getPageType());
  }

  @Test
  void loadContent_webp() throws IOException {
    byte[] content = loadFile(TEST_WEBP_FILENAME);

    adaptor.loadContent(comicBook, TEST_WEBP_FILENAME, content);

    assertEquals(1, comicBook.getPageCount());
    assertNotNull(comicBook.getPages().get(0));
    assertEquals(ComicPageType.FRONT_COVER, comicBook.getPages().get(0).getPageType());
  }

  @Test
  void loadContent_gif() throws IOException {
    byte[] content = loadFile(TEST_GIF_FILENAME);

    adaptor.loadContent(comicBook, TEST_GIF_FILENAME, content);

    assertEquals(1, comicBook.getPageCount());
    assertNotNull(comicBook.getPages().get(0));
    assertEquals(ComicPageType.FRONT_COVER, comicBook.getPages().get(0).getPageType());
  }
}

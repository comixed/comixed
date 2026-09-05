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
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.comicpages.ComicPageType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ImageFileTypeContentAdaptorTest extends BaseContentAdaptorTest {
  private static final String TEST_JPEG_FILENAME = "src/test/resources/example.jpg";
  private static final String TEST_WEBP_FILENAME = "src/test/resources/example.webp";
  private static final String TEST_GIF_FILENAME = "src/test/resources/example.gif";

  @InjectMocks private ImageFileTypeContentAdaptor adaptor;

  @Mock private ComicPage comicPage;
  @Mock private ComicBook comicBook;
  @Mock private ComicDetail comicDetail;

  private List<ComicPage> pageList = new ArrayList<>();

  @Test
  void loadContent_fileAlreadyExists() throws IOException {
    when(comicBook.hasPageWithFilename(anyString())).thenReturn(true);

    byte[] content = loadFile(TEST_JPEG_FILENAME);

    adaptor.loadContent(comicBook, TEST_JPEG_FILENAME, content);

    assertEquals(0, pageList.size());
  }

  @Test
  void loadContent_not_first_image() throws IOException {
    byte[] content = loadFile(TEST_JPEG_FILENAME);
    pageList.add(comicPage);
    when(comicBook.hasPageWithFilename(anyString())).thenReturn(false);
    when(comicBook.getPages()).thenReturn(pageList);
    when(comicBook.getComicDetail()).thenReturn(comicDetail);

    adaptor.loadContent(comicBook, TEST_JPEG_FILENAME, content);

    assertEquals(2, pageList.size());
    assertNotNull(pageList.get(pageList.size() - 1));
    assertEquals(ComicPageType.STORY, pageList.get(pageList.size() - 1).getPageType());
  }

  @Test
  void loadContent_jpg() throws IOException {
    byte[] content = loadFile(TEST_JPEG_FILENAME);
    when(comicBook.hasPageWithFilename(anyString())).thenReturn(false);
    when(comicBook.getPages()).thenReturn(pageList);
    when(comicBook.getComicDetail()).thenReturn(comicDetail);

    adaptor.loadContent(comicBook, TEST_JPEG_FILENAME, content);

    assertEquals(1, pageList.size());
    assertNotNull(pageList.get(0));
    assertEquals(ComicPageType.FRONT_COVER, pageList.get(0).getPageType());
  }

  @Test
  void loadContent_webp() throws IOException {
    byte[] content = loadFile(TEST_WEBP_FILENAME);
    when(comicBook.hasPageWithFilename(anyString())).thenReturn(false);
    when(comicBook.getPages()).thenReturn(pageList);
    when(comicBook.getComicDetail()).thenReturn(comicDetail);

    adaptor.loadContent(comicBook, TEST_WEBP_FILENAME, content);

    assertEquals(1, pageList.size());
    assertNotNull(pageList.get(0));
    assertEquals(ComicPageType.FRONT_COVER, pageList.get(0).getPageType());
  }

  @Test
  void loadContent_gif() throws IOException {
    byte[] content = loadFile(TEST_GIF_FILENAME);
    when(comicBook.hasPageWithFilename(anyString())).thenReturn(false);
    when(comicBook.getPages()).thenReturn(pageList);
    when(comicBook.getComicDetail()).thenReturn(comicDetail);

    adaptor.loadContent(comicBook, TEST_GIF_FILENAME, content);

    assertEquals(1, pageList.size());
    assertNotNull(pageList.get(0));
    assertEquals(ComicPageType.FRONT_COVER, pageList.get(0).getPageType());
  }
}

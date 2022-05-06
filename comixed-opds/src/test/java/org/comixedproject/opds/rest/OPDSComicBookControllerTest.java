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

package org.comixedproject.opds.rest;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.io.IOUtils;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.encoders.WebResponseEncoder;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicpages.Page;
import org.comixedproject.opds.OPDSException;
import org.comixedproject.opds.utils.OPDSUtils;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.comicbooks.ComicException;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

@RunWith(MockitoJUnitRunner.class)
public class OPDSComicBookControllerTest {
  private static final long TEST_COMIC_ID = 717L;
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CBZ;
  private static final String TEST_COMIC_FILENAME = "Base Filename.CBZ";
  private static final int TEST_PAGE_INDEX = 3;
  private static final String TEST_PAGE_NAME = "test-page.png";
  private static final String TEST_IMAGE_FILE = "src/test/resources/" + TEST_PAGE_NAME;
  private static final String TEST_MIME_TYPE = "image";
  private static final String TEST_MIME_SUBTYPE = "png";
  private static final int TEST_PAGE_WIDTH = 1024;

  @InjectMocks private OPDSComicController controller;
  @Mock private ComicBookService comicBookService;
  @Mock private ComicBookAdaptor comicBookAdaptor;
  @Mock private FileTypeAdaptor fileTypeAdaptor;
  @Mock private WebResponseEncoder webResponseEncoder;
  @Mock private ComicBook comicBook;
  @Mock private ResponseEntity<InputStreamResource> encodedInputStreamResourceResponse;
  @Mock private Page page;
  @Mock private ResponseEntity<byte[]> encodedByteArrayResponse;

  @Captor private ArgumentCaptor<InputStreamResource> inputStreamResourceArgumentCaptor;

  private File comicFile = new File("src/test/resources/example.cbz");
  private long fileLength = 0L;
  private List<Page> pageList = new ArrayList<>();
  private byte[] imageContent;

  @Before
  public void setUp() throws IOException {
    Mockito.when(comicBook.getFile()).thenReturn(comicFile);
    Mockito.when(comicBook.getBaseFilename()).thenReturn(TEST_COMIC_FILENAME);
    Mockito.when(comicBook.getPages()).thenReturn(pageList);
    Mockito.when(page.getFilename()).thenReturn(TEST_PAGE_NAME);
    Mockito.when(page.getWidth()).thenReturn(TEST_PAGE_WIDTH);
    pageList.add(page);

    final File imageFile = new File(TEST_IMAGE_FILE);
    this.imageContent = IOUtils.readFully(new FileInputStream(imageFile), (int) imageFile.length());

    this.fileLength = comicFile.length();
  }

  @Test(expected = OPDSException.class)
  public void testDownloadComicInvalidId() throws ComicException, OPDSException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenThrow(ComicException.class);

    try {
      controller.downloadComic(TEST_COMIC_ID, OPDSUtils.urlEncodeString(TEST_COMIC_FILENAME));
    } finally {
      Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    }
  }

  @Test
  public void testDownloadComic() throws ComicException, OPDSException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(comicBook.getArchiveType()).thenReturn(TEST_ARCHIVE_TYPE);

    Mockito.when(
            webResponseEncoder.encode(
                Mockito.anyInt(),
                inputStreamResourceArgumentCaptor.capture(),
                Mockito.anyString(),
                Mockito.any(MediaType.class)))
        .thenReturn(encodedInputStreamResourceResponse);

    final ResponseEntity<InputStreamResource> result =
        controller.downloadComic(TEST_COMIC_ID, OPDSUtils.urlEncodeString(TEST_COMIC_FILENAME));

    assertNotNull(result);
    assertSame(encodedInputStreamResourceResponse, result);

    final InputStreamResource inputStreamResource = inputStreamResourceArgumentCaptor.getValue();
    assertNotNull(inputStreamResource);

    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(webResponseEncoder, Mockito.times(1))
        .encode(
            (int) this.fileLength,
            inputStreamResource,
            TEST_COMIC_FILENAME,
            MediaType.parseMediaType(TEST_ARCHIVE_TYPE.getMimeType()));
  }

  @Test(expected = OPDSException.class)
  public void testGetPageByComicAndIndexWithMaxWidthInvalidId()
      throws ComicException, OPDSException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenThrow(ComicException.class);

    try {
      controller.getPageByComicAndIndexWithMaxWidth(
          TEST_COMIC_ID, TEST_PAGE_INDEX, TEST_PAGE_WIDTH);
    } finally {
      Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    }
  }

  @Test(expected = OPDSException.class)
  public void testGetPageByComicAndIndexWithMaxWidthInvalidPageIndex()
      throws ComicException, OPDSException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);

    try {
      controller.getPageByComicAndIndexWithMaxWidth(
          TEST_COMIC_ID, pageList.size() + 1, TEST_PAGE_WIDTH);
    } finally {
      Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    }
  }

  @Test
  public void testGetPageByComicAndIndexWithMaxWidth()
      throws ComicException, OPDSException, AdaptorException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(comicBookAdaptor.loadPageContent(Mockito.any(ComicBook.class), Mockito.anyInt()))
        .thenReturn(imageContent);
    Mockito.when(fileTypeAdaptor.getType(Mockito.any(InputStream.class)))
        .thenReturn(TEST_MIME_TYPE);
    Mockito.when(fileTypeAdaptor.getSubtype(Mockito.any(InputStream.class)))
        .thenReturn(TEST_MIME_SUBTYPE);
    Mockito.when(
            webResponseEncoder.encode(
                Mockito.anyInt(),
                Mockito.any(byte[].class),
                Mockito.anyString(),
                Mockito.any(MediaType.class)))
        .thenReturn(encodedByteArrayResponse);

    final ResponseEntity<byte[]> result =
        controller.getPageByComicAndIndexWithMaxWidth(TEST_COMIC_ID, 0, TEST_PAGE_WIDTH - 1);

    assertNotNull(result);
    assertSame(encodedByteArrayResponse, result);

    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(comicBookAdaptor, Mockito.times(1)).loadPageContent(comicBook, 0);
  }
}

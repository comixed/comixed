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
import static org.junit.jupiter.api.Assertions.assertThrows;

import jakarta.servlet.http.HttpServletRequest;
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
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.opds.OPDSException;
import org.comixedproject.opds.OPDSUtils;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class OPDSComicBookControllerTest {
  private static final long TEST_COMIC_ID = 717L;
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CBZ;
  private static final String TEST_COMIC_FILENAME = "Base Filename.CBZ";
  private static final int TEST_PAGE_INDEX = 3;
  private static final String TEST_PAGE_NAME = "test-page.png";
  private static final String TEST_IMAGE_FILE = "src/test/resources/" + TEST_PAGE_NAME;
  private static final String TEST_MIME_TYPE = "image";
  private static final String TEST_MIME_SUBTYPE = "png";
  private static final int TEST_PAGE_WIDTH = 1024;

  @InjectMocks private OPDSComicBookController controller;
  @Mock private ComicBookService comicBookService;
  @Mock private ComicBookAdaptor comicBookAdaptor;
  @Mock private FileTypeAdaptor fileTypeAdaptor;
  @Mock private OPDSUtils opdsUtils;
  @Mock private WebResponseEncoder webResponseEncoder;
  @Mock private ComicBook comicBook;
  @Mock private ComicDetail comicDetail;
  @Mock private ResponseEntity<InputStreamResource> encodedInputStreamResourceResponse;
  @Mock private ComicPage page;
  @Mock private ResponseEntity<byte[]> encodedByteArrayResponse;
  @Mock private HttpServletRequest request;

  @Captor private ArgumentCaptor<InputStreamResource> inputStreamResourceArgumentCaptor;

  private File comicFile = new File("src/test/resources/example.cbz");
  private long fileLength = 0L;
  private List<ComicPage> pageList = new ArrayList<>();
  private byte[] imageContent;

  @BeforeEach
  public void setUp() throws IOException, ComicBookException {
    Mockito.when(comicBook.getPages()).thenReturn(pageList);
    Mockito.when(comicDetail.getFile()).thenReturn(comicFile);
    Mockito.when(comicDetail.getBaseFilename()).thenReturn(TEST_COMIC_FILENAME);
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(page.getFilename()).thenReturn(TEST_PAGE_NAME);
    Mockito.when(page.getWidth()).thenReturn(TEST_PAGE_WIDTH);
    pageList.add(page);

    final File imageFile = new File(TEST_IMAGE_FILE);
    this.imageContent = IOUtils.readFully(new FileInputStream(imageFile), (int) imageFile.length());

    this.fileLength = comicFile.length();
  }

  @Test
  void downloadComic_invalidId() throws ComicBookException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenThrow(ComicBookException.class);

    assertThrows(
        OPDSException.class,
        () ->
            controller.downloadComic(
                request, TEST_COMIC_ID, opdsUtils.urlEncodeString(TEST_COMIC_FILENAME)));
  }

  @Test
  void downloadComic_invalidRange() {
    Mockito.when(request.getHeader(HttpHeaders.RANGE))
        .thenReturn(String.format("bytes=%d-%d", this.fileLength, 0));

    assertThrows(
        OPDSException.class,
        () ->
            controller.downloadComic(
                request, TEST_COMIC_ID, opdsUtils.urlEncodeString(TEST_COMIC_FILENAME)));
  }

  @Test
  void downloadComic_withRange() throws ComicBookException, OPDSException {
    final int start = (int) (this.fileLength / 2);

    Mockito.when(request.getHeader(HttpHeaders.RANGE))
        .thenReturn(String.format("bytes=%d-%d", start, this.fileLength));

    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(comicDetail.getArchiveType()).thenReturn(TEST_ARCHIVE_TYPE);

    Mockito.when(
            webResponseEncoder.encode(
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.anyInt(),
                inputStreamResourceArgumentCaptor.capture(),
                Mockito.anyString(),
                Mockito.any(MediaType.class)))
        .thenReturn(encodedInputStreamResourceResponse);

    final ResponseEntity<InputStreamResource> result =
        controller.downloadComic(
            request, TEST_COMIC_ID, opdsUtils.urlEncodeString(TEST_COMIC_FILENAME));

    assertNotNull(result);
    assertSame(encodedInputStreamResourceResponse, result);

    final InputStreamResource inputStreamResource = inputStreamResourceArgumentCaptor.getValue();
    assertNotNull(inputStreamResource);

    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(webResponseEncoder, Mockito.times(1))
        .encode(
            start,
            (int) this.fileLength,
            (int) this.fileLength - start,
            inputStreamResource,
            TEST_COMIC_FILENAME,
            MediaType.parseMediaType(TEST_ARCHIVE_TYPE.getMimeType()));
  }

  @Test
  void downloadComic_withRangeStart() throws ComicBookException, OPDSException {
    final int start = (int) (this.fileLength / 2);

    Mockito.when(request.getHeader(HttpHeaders.RANGE))
        .thenReturn(String.format("bytes=%d-", start));

    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(comicDetail.getArchiveType()).thenReturn(TEST_ARCHIVE_TYPE);

    Mockito.when(
            webResponseEncoder.encode(
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.anyInt(),
                inputStreamResourceArgumentCaptor.capture(),
                Mockito.anyString(),
                Mockito.any(MediaType.class)))
        .thenReturn(encodedInputStreamResourceResponse);

    final ResponseEntity<InputStreamResource> result =
        controller.downloadComic(
            request, TEST_COMIC_ID, opdsUtils.urlEncodeString(TEST_COMIC_FILENAME));

    assertNotNull(result);
    assertSame(encodedInputStreamResourceResponse, result);

    final InputStreamResource inputStreamResource = inputStreamResourceArgumentCaptor.getValue();
    assertNotNull(inputStreamResource);

    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(webResponseEncoder, Mockito.times(1))
        .encode(
            start,
            (int) this.fileLength,
            (int) this.fileLength - start,
            inputStreamResource,
            TEST_COMIC_FILENAME,
            MediaType.parseMediaType(TEST_ARCHIVE_TYPE.getMimeType()));
  }

  @Test
  void downloadComic_withRangeEnd() throws ComicBookException, OPDSException {
    Mockito.when(request.getHeader(HttpHeaders.RANGE))
        .thenReturn(String.format("bytes=-%d", this.fileLength));

    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(comicDetail.getArchiveType()).thenReturn(TEST_ARCHIVE_TYPE);

    Mockito.when(
            webResponseEncoder.encode(
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.anyInt(),
                inputStreamResourceArgumentCaptor.capture(),
                Mockito.anyString(),
                Mockito.any(MediaType.class)))
        .thenReturn(encodedInputStreamResourceResponse);

    final ResponseEntity<InputStreamResource> result =
        controller.downloadComic(
            request, TEST_COMIC_ID, opdsUtils.urlEncodeString(TEST_COMIC_FILENAME));

    assertNotNull(result);
    assertSame(encodedInputStreamResourceResponse, result);

    final InputStreamResource inputStreamResource = inputStreamResourceArgumentCaptor.getValue();
    assertNotNull(inputStreamResource);

    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(webResponseEncoder, Mockito.times(1))
        .encode(
            0,
            (int) this.fileLength,
            (int) this.fileLength,
            inputStreamResource,
            TEST_COMIC_FILENAME,
            MediaType.parseMediaType(TEST_ARCHIVE_TYPE.getMimeType()));
  }

  @Test
  void downloadComic() throws ComicBookException, OPDSException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(comicDetail.getArchiveType()).thenReturn(TEST_ARCHIVE_TYPE);

    Mockito.when(
            webResponseEncoder.encode(
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.anyInt(),
                inputStreamResourceArgumentCaptor.capture(),
                Mockito.anyString(),
                Mockito.any(MediaType.class)))
        .thenReturn(encodedInputStreamResourceResponse);

    final ResponseEntity<InputStreamResource> result =
        controller.downloadComic(
            request, TEST_COMIC_ID, opdsUtils.urlEncodeString(TEST_COMIC_FILENAME));

    assertNotNull(result);
    assertSame(encodedInputStreamResourceResponse, result);

    final InputStreamResource inputStreamResource = inputStreamResourceArgumentCaptor.getValue();
    assertNotNull(inputStreamResource);

    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
    Mockito.verify(webResponseEncoder, Mockito.times(1))
        .encode(
            0,
            (int) this.fileLength,
            (int) this.fileLength,
            inputStreamResource,
            TEST_COMIC_FILENAME,
            MediaType.parseMediaType(TEST_ARCHIVE_TYPE.getMimeType()));
  }

  @Test
  void getPageByComicAndIndexWithMaxWidthInvalidId() throws ComicBookException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenThrow(ComicBookException.class);

    assertThrows(
        OPDSException.class,
        () ->
            controller.getPageByComicAndIndexWithMaxWidth(
                TEST_COMIC_ID, TEST_PAGE_INDEX, TEST_PAGE_WIDTH));
  }

  @Test
  void getPageByComicAndIndexWithMaxWidthInvalidPageIndex()
      throws ComicBookException, OPDSException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(fileTypeAdaptor.getMimeTypeFor(Mockito.any()))
        .thenReturn(String.format("%s/%s", TEST_MIME_TYPE, TEST_MIME_SUBTYPE));
    Mockito.when(
            webResponseEncoder.encode(
                Mockito.anyInt(),
                Mockito.any(byte[].class),
                Mockito.anyString(),
                Mockito.any(MediaType.class)))
        .thenReturn(encodedByteArrayResponse);

    final ResponseEntity<byte[]> result =
        controller.getPageByComicAndIndexWithMaxWidth(
            TEST_COMIC_ID, pageList.size() + 1, TEST_PAGE_WIDTH);

    assertNotNull(result);
    assertSame(encodedByteArrayResponse, result);

    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_ID);
  }

  @Test
  void getPageByComicAndIndexWithMaxWidth()
      throws ComicBookException, OPDSException, AdaptorException {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(comicBookAdaptor.loadPageContent(Mockito.any(ComicBook.class), Mockito.anyInt()))
        .thenReturn(imageContent);
    Mockito.when(fileTypeAdaptor.getMimeTypeFor(Mockito.any(InputStream.class)))
        .thenReturn(String.format("%s/%s", TEST_MIME_TYPE, TEST_MIME_SUBTYPE));
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

/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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

package org.comixedproject.reader.rest;

import static org.junit.jupiter.api.Assertions.*;

import java.io.File;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import org.comixedproject.adaptors.encoders.WebResponseEncoder;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.reader.ReaderUtil;
import org.comixedproject.reader.model.DirectoryEntry;
import org.comixedproject.reader.model.LoadDirectoryResponse;
import org.comixedproject.reader.service.DirectoryReaderService;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ComicBookReaderControllerTest {
  private static final String TEST_EMAIL = "reader@comixedproject.org";
  private static final String TEST_SERIES = "The Series";
  private static final String TEST_SERIES_ENCODED = ReaderUtil.urlEncode(TEST_SERIES);
  private static final String TEST_PUBLISHER = "The Publisher";
  private static final String TEST_PUBLISHER_ENCODED = ReaderUtil.urlEncode(TEST_PUBLISHER);
  private static final String TEST_VOLUME = "2025";
  private static final String TEST_VOLUME_ENCODED = ReaderUtil.urlEncode(TEST_VOLUME);
  private static final long TEST_COMIC_BOOK_ID = 129L;
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CBZ;

  @InjectMocks private ComicBookReaderController controller;
  @Mock private DirectoryReaderService directoryReaderService;
  @Mock private ComicBookService comicBookService;
  @Mock private WebResponseEncoder webResponseEncoder;
  @Mock private Principal principal;
  @Mock private ComicDetail comicDetail;
  @Mock private ComicBook comicBook;
  @Mock private ResponseEntity<InputStreamResource> webResponseEntity;

  @Captor private ArgumentCaptor<String> urlArgumentCaptor;

  private List<DirectoryEntry> directoryEntryList = new ArrayList<>();
  private File comicFile =
      new File("src/test/java/org/comixedproject/reader/rest/ComicBookReaderControllerTest.java");

  @BeforeEach
  void setUp() {
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
    Mockito.when(comicDetail.getFile()).thenReturn(comicFile);
    Mockito.when(comicDetail.getBaseFilename()).thenReturn(comicFile.getName());
    Mockito.when(comicDetail.getArchiveType()).thenReturn(TEST_ARCHIVE_TYPE);
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
  }

  @Test
  void getComicsForPublisherAndSeriesAndVolume() {
    Mockito.when(
            directoryReaderService.getAllComicsForPublisherAndSeriesAndVolume(
                Mockito.anyString(),
                Mockito.anyBoolean(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                urlArgumentCaptor.capture()))
        .thenReturn(directoryEntryList);

    final LoadDirectoryResponse result =
        controller.getComicsForPublisherAndSeriesAndVolume(
            principal,
            TEST_PUBLISHER_ENCODED,
            TEST_SERIES_ENCODED,
            TEST_VOLUME_ENCODED,
            Boolean.FALSE.toString());

    assertNotNull(result);
    assertEquals(directoryEntryList, result.getContents());

    final String url = urlArgumentCaptor.getValue();

    Mockito.verify(directoryReaderService, Mockito.times(1))
        .getAllComicsForPublisherAndSeriesAndVolume(
            TEST_EMAIL, false, TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, url);
  }

  @Test
  void getComicsForPublisherAndSeriesAndVolume_unread() {
    Mockito.when(
            directoryReaderService.getAllComicsForPublisherAndSeriesAndVolume(
                Mockito.anyString(),
                Mockito.anyBoolean(),
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString(),
                urlArgumentCaptor.capture()))
        .thenReturn(directoryEntryList);

    final LoadDirectoryResponse result =
        controller.getComicsForPublisherAndSeriesAndVolume(
            principal,
            TEST_PUBLISHER_ENCODED,
            TEST_SERIES_ENCODED,
            TEST_VOLUME_ENCODED,
            Boolean.TRUE.toString());

    assertNotNull(result);
    assertEquals(directoryEntryList, result.getContents());

    final String url = urlArgumentCaptor.getValue();

    Mockito.verify(directoryReaderService, Mockito.times(1))
        .getAllComicsForPublisherAndSeriesAndVolume(
            TEST_EMAIL, true, TEST_PUBLISHER, TEST_SERIES, TEST_VOLUME, url);
  }

  @Test
  void getAllForComicsForTagTypeAndValue() {
    for (int index = 0; index < ComicTagType.values().length; index++) {
      final ComicTagType comicTagType = ComicTagType.values()[index];

      Mockito.when(
              directoryReaderService.getAllComicsForTagTypeAndValue(
                  Mockito.anyString(),
                  Mockito.anyBoolean(),
                  Mockito.any(ComicTagType.class),
                  Mockito.anyString(),
                  urlArgumentCaptor.capture()))
          .thenReturn(directoryEntryList);

      final LoadDirectoryResponse result =
          controller.getAllForComicsForTagTypeAndValue(
              principal, Boolean.FALSE.toString(), comicTagType.getValue(), "farkle");

      assertNotNull(result);
      assertEquals(directoryEntryList, result.getContents());

      final String url = urlArgumentCaptor.getValue();

      Mockito.verify(directoryReaderService, Mockito.times(1))
          .getAllComicsForTagTypeAndValue(TEST_EMAIL, false, comicTagType, "farkle", url);
    }
  }

  @Test
  void getAllForComicsForTagTypeAndValue_unread() {
    for (int index = 0; index < ComicTagType.values().length; index++) {
      final ComicTagType comicTagType = ComicTagType.values()[index];

      Mockito.when(
              directoryReaderService.getAllComicsForTagTypeAndValue(
                  Mockito.anyString(),
                  Mockito.anyBoolean(),
                  Mockito.any(ComicTagType.class),
                  Mockito.anyString(),
                  urlArgumentCaptor.capture()))
          .thenReturn(directoryEntryList);

      final LoadDirectoryResponse result =
          controller.getAllForComicsForTagTypeAndValue(
              principal, Boolean.TRUE.toString(), comicTagType.getValue(), "farkle");

      assertNotNull(result);
      assertEquals(directoryEntryList, result.getContents());

      final String url = urlArgumentCaptor.getValue();

      Mockito.verify(directoryReaderService, Mockito.times(1))
          .getAllComicsForTagTypeAndValue(TEST_EMAIL, true, comicTagType, "farkle", url);
    }
  }

  @Test
  void downloadComic() throws Exception {
    Mockito.when(comicBookService.getComic(Mockito.anyLong())).thenReturn(comicBook);
    Mockito.when(
            webResponseEncoder.encode(
                Mockito.anyInt(),
                Mockito.any(InputStreamResource.class),
                Mockito.anyString(),
                Mockito.any(MediaType.class)))
        .thenReturn(webResponseEntity);

    final ResponseEntity<InputStreamResource> result = controller.downloadComic(TEST_COMIC_BOOK_ID);

    assertNotNull(result);
    assertSame(webResponseEntity, result);

    Mockito.verify(comicBookService, Mockito.times(1)).getComic(TEST_COMIC_BOOK_ID);
  }
}

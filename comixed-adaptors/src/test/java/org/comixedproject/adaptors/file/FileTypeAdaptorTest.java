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

package org.comixedproject.adaptors.file;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import org.apache.tika.Tika;
import org.apache.tika.detect.Detector;
import org.apache.tika.io.TikaInputStream;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.mime.MediaType;
import org.apache.tika.parser.ParseContext;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.model.ArchiveEntryType;
import org.comixedproject.adaptors.content.ContentAdaptor;
import org.comixedproject.adaptors.content.ContentAdaptorRegistry;
import org.comixedproject.model.archives.ArchiveType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.context.ApplicationContext;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class FileTypeAdaptorTest {
  private static final String TEST_ARCHIVE_FILENAME = "src/test/resources/example.cbz";
  private static final MediaType TEST_MEDIA_TYPE = MediaType.APPLICATION_ZIP;
  private static final String TEST_BEAN_NAME = "The adaptor name";
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CBZ;
  private static final ArchiveEntryType TEST_ARCHIVE_ENTRY_TYPE = ArchiveEntryType.IMAGE;
  private static final byte[] TEST_CONTENT = "Some file content".getBytes();
  private static final String TEST_EXTENSION = "cbz";
  private static final String TEST_FORMAT = "zip";
  private static final String TEST_ENTRY_FILENAME = "filename.ext";

  @InjectMocks private FileTypeAdaptor adaptor;
  @Mock private ApplicationContext applicationContext;
  @Mock private Tika tika;
  @Mock private Metadata metadata;
  @Mock private Detector detector;
  @Mock private ArchiveAdaptor archiveAdaptor;
  @Mock private ContentAdaptorRegistry contentAdaptorRegistry;
  @Mock private ContentAdaptor contentAdaptor;

  @Captor private ArgumentCaptor<? extends TikaInputStream> argumentCaptorTikaInputStream;

  private FileTypeAdaptor.ArchiveAdaptorDefinition archiveAdaptorEntry =
      new FileTypeAdaptor.ArchiveAdaptorDefinition(
          TEST_MEDIA_TYPE.getSubtype(), TEST_BEAN_NAME, TEST_ARCHIVE_TYPE, TEST_EXTENSION);
  private TikaInputStream inputStream = TikaInputStream.get(new ByteArrayInputStream(TEST_CONTENT));

  @BeforeEach
  void setUp() {
    when(tika.getDetector()).thenReturn(detector);
    adaptor.getArchiveAdaptors().add(archiveAdaptorEntry);
    when(contentAdaptor.getArchiveEntryType()).thenReturn(TEST_ARCHIVE_ENTRY_TYPE);
  }

  @Test
  void getArchiveAdaptorFor_filenNotFound() {
    assertThrows(
        AdaptorException.class,
        () -> adaptor.getArchiveAdaptorFor(TEST_ARCHIVE_FILENAME.substring(1)));
  }

  @Test
  void getArchiveAdaptorFor_filenameSubtypeDetectFailed_extensionsDontMatch() {
    assertThrows(
        AdaptorException.class, () -> adaptor.getArchiveAdaptorFor(TEST_ARCHIVE_FILENAME + "z"));
  }

  @Test
  void getArchiveAdaptorFor_filenameWithNoAdaptorFound_extensionsDontMatch() {
    assertThrows(
        AdaptorException.class, () -> adaptor.getArchiveAdaptorFor(TEST_ARCHIVE_FILENAME + "z"));
  }

  @Test
  void getArchiveAdaptorFor_filenameSubtypeMatch() throws AdaptorException, IOException {
    when(detector.detect(any(TikaInputStream.class), any(Metadata.class), any(ParseContext.class)))
        .thenReturn(TEST_MEDIA_TYPE);
    when(applicationContext.getBean(TEST_BEAN_NAME, ArchiveAdaptor.class))
        .thenReturn(archiveAdaptor);

    final ArchiveAdaptor result = adaptor.getArchiveAdaptorFor(TEST_ARCHIVE_FILENAME);

    assertNotNull(result);
    assertSame(archiveAdaptor, result);
  }

  @Test
  void getArchiveAdaptorFor_filenameFileExtensionMatch() throws AdaptorException, IOException {
    archiveAdaptorEntry.setFormat(TEST_FORMAT + "z");

    when(detector.detect(any(TikaInputStream.class), any(Metadata.class), any(ParseContext.class)))
        .thenReturn(TEST_MEDIA_TYPE);
    when(applicationContext.getBean(TEST_BEAN_NAME, ArchiveAdaptor.class))
        .thenReturn(archiveAdaptor);

    final ArchiveAdaptor result = adaptor.getArchiveAdaptorFor(TEST_ARCHIVE_FILENAME);

    assertNotNull(result);
    assertSame(archiveAdaptor, result);
  }

  @Test
  void GetArchiveAdaptorFor_archiveTypeNotFound() {
    assertThrows(AdaptorException.class, () -> adaptor.getArchiveAdaptorFor(ArchiveType.CB7));
  }

  @Test
  void getArchiveAdaptorFor_archiveType() throws AdaptorException {
    when(applicationContext.getBean(TEST_BEAN_NAME, ArchiveAdaptor.class))
        .thenReturn(archiveAdaptor);

    final ArchiveAdaptor result =
        adaptor.getArchiveAdaptorFor(archiveAdaptorEntry.getArchiveType());

    assertNotNull(result);
    assertSame(archiveAdaptor, result);
  }

  @Test
  void getArchiveEntryType_subtypeDetectFailed() {
    final ArchiveEntryType result =
        adaptor.getArchiveEntryType(TEST_MEDIA_TYPE.getSubtype().substring(1));

    assertNull(result);
  }

  @Test
  void getArchiveEntryType() {
    when(contentAdaptorRegistry.getContentAdaptorForContentType(anyString()))
        .thenReturn(contentAdaptor);

    final ArchiveEntryType result = adaptor.getArchiveEntryType(TEST_MEDIA_TYPE.getSubtype());

    assertNotNull(result);
    assertSame(TEST_ARCHIVE_ENTRY_TYPE, result);

    verify(contentAdaptorRegistry).getContentAdaptorForContentType(TEST_MEDIA_TYPE.getSubtype());
  }

  @Test
  void getTypeFor_invalidInput() throws IOException {
    when(detector.detect(any(), any(), any())).thenThrow(IOException.class);

    final String result = adaptor.getType(inputStream);

    assertNull(result);

    verify(detector).detect(inputStream, metadata, new ParseContext());
  }

  @Test
  void getType() throws IOException {
    when(detector.detect(any(), any(), any())).thenReturn(TEST_MEDIA_TYPE);

    final String result = adaptor.getType(inputStream);

    assertNotNull(result);
    assertEquals(TEST_MEDIA_TYPE.getType(), result);

    verify(detector).detect(inputStream, metadata, new ParseContext());
  }

  @Test
  void getMimeTypeFor_invalidInput() throws IOException {
    when(detector.detect(any(), any(), any())).thenThrow(IOException.class);

    final String result = adaptor.getMimeTypeFor(inputStream);

    assertNull(result);

    verify(detector).detect(inputStream, metadata, new ParseContext());
  }

  @Test
  void getMimeType() throws IOException {
    when(detector.detect(any(), any(), any())).thenReturn(TEST_MEDIA_TYPE);

    final String result = adaptor.getMimeTypeFor(inputStream);

    assertNotNull(result);
    assertEquals(TEST_MEDIA_TYPE.toString(), result);

    verify(detector).detect(inputStream, metadata, new ParseContext());
  }

  @Test
  void getContentAdaptorFor_unknownMimeType() throws IOException, AdaptorException {
    when(detector.detect(any(TikaInputStream.class), any(Metadata.class), any(ParseContext.class)))
        .thenThrow(IOException.class);

    final ContentAdaptor result = adaptor.getContentAdaptorFor(TEST_ENTRY_FILENAME, TEST_CONTENT);

    assertNull(result);
  }

  @Test
  void getContentAdaptorFor() throws IOException, AdaptorException {
    when(detector.detect(
            argumentCaptorTikaInputStream.capture(), any(Metadata.class), any(ParseContext.class)))
        .thenReturn(TEST_MEDIA_TYPE);
    when(contentAdaptorRegistry.getContentAdaptor(anyString(), anyString()))
        .thenReturn(contentAdaptor);

    final ContentAdaptor result = adaptor.getContentAdaptorFor(TEST_ENTRY_FILENAME, TEST_CONTENT);

    assertNotNull(result);
    assertSame(contentAdaptor, result);

    verify(detector).detect(argumentCaptorTikaInputStream.getValue(), metadata, new ParseContext());
    verify(contentAdaptorRegistry)
        .getContentAdaptor(TEST_ENTRY_FILENAME, TEST_MEDIA_TYPE.getSubtype());
  }
}

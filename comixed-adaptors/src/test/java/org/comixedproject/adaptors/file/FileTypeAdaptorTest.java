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

import static junit.framework.TestCase.*;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import org.apache.tika.Tika;
import org.apache.tika.detect.Detector;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.mime.MediaType;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.model.ArchiveEntryType;
import org.comixedproject.adaptors.content.ContentAdaptor;
import org.comixedproject.model.archives.ArchiveType;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.context.ApplicationContext;

@RunWith(MockitoJUnitRunner.class)
public class FileTypeAdaptorTest {
  private static final String TEST_ARCHIVE_FILENAME = "src/test/resources/example.cbz";
  private static final MediaType TEST_MEDIA_TYPE = MediaType.APPLICATION_ZIP;
  private static final String TEST_BEAN_NAME = "The adaptor name";
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CBZ;
  private static final String TEST_MIME_TYPE = "image/jpeg";
  private static final ArchiveEntryType TEST_ARCHIVE_ENTRY_TYPE = ArchiveEntryType.IMAGE;
  private static final byte[] TEST_CONTENT = "Some file content".getBytes();

  @InjectMocks private FileTypeAdaptor adaptor;
  @Mock private ApplicationContext applicationContext;
  @Mock private Tika tika;
  @Mock private Metadata metadata;
  @Mock private Detector detector;
  @Mock private ArchiveAdaptor archiveAdaptor;
  @Mock private ContentAdaptor contentLoader;

  @Captor private ArgumentCaptor<? extends InputStream> argumentCaptorInputStream;

  private FileTypeAdaptor.ArchiveAdaptorDefinition archiveAdaptorEntry =
      new FileTypeAdaptor.ArchiveAdaptorDefinition(
          TEST_MEDIA_TYPE.getSubtype(), TEST_BEAN_NAME, TEST_ARCHIVE_TYPE);
  private FileTypeAdaptor.EntryTypeDefinition entryLoader =
      new FileTypeAdaptor.EntryTypeDefinition(
          TEST_MEDIA_TYPE.getSubtype(), TEST_BEAN_NAME, TEST_ARCHIVE_ENTRY_TYPE);
  private ByteArrayInputStream inputStream = new ByteArrayInputStream(TEST_CONTENT);

  @Before
  public void setUp() {
    Mockito.when(tika.getDetector()).thenReturn(detector);
    adaptor.getArchiveAdaptors().add(archiveAdaptorEntry);
    adaptor.getEntryTypeLoaders().add(entryLoader);
  }

  @Test(expected = AdaptorException.class)
  public void testGetArchiveAdaptorForFilenameNoSuchFile() throws AdaptorException {
    adaptor.getArchiveAdaptorFor(TEST_ARCHIVE_FILENAME.substring(1));
  }

  @Test(expected = AdaptorException.class)
  public void testGetArchiveAdaptorForFilenameSubtypeDetectFailed()
      throws AdaptorException, IOException {
    Mockito.when(detector.detect(Mockito.any(InputStream.class), Mockito.any(Metadata.class)))
        .thenThrow(IOException.class);

    adaptor.getArchiveAdaptorFor(TEST_ARCHIVE_FILENAME);
  }

  @Test(expected = AdaptorException.class)
  public void testGetArchiveAdaptorForFilenameNoAdaptorFound()
      throws AdaptorException, IOException {
    Mockito.when(detector.detect(Mockito.any(InputStream.class), Mockito.any(Metadata.class)))
        .thenReturn(new MediaType("foo", "bar"));

    adaptor.getArchiveAdaptorFor(TEST_ARCHIVE_FILENAME);
  }

  @Test
  public void testGetArchiveAdaptorForFilename() throws AdaptorException, IOException {
    Mockito.when(detector.detect(Mockito.any(InputStream.class), Mockito.any(Metadata.class)))
        .thenReturn(TEST_MEDIA_TYPE);
    Mockito.when(applicationContext.getBean(TEST_BEAN_NAME, ArchiveAdaptor.class))
        .thenReturn(archiveAdaptor);

    final ArchiveAdaptor result = adaptor.getArchiveAdaptorFor(TEST_ARCHIVE_FILENAME);

    assertNotNull(result);
    assertSame(archiveAdaptor, result);
  }

  @Test(expected = AdaptorException.class)
  public void testGetArchiveAdaptorForArchiveTypeNotFound() throws AdaptorException {
    adaptor.getArchiveAdaptorFor(ArchiveType.CB7);
  }

  @Test
  public void testGetArchiveAdaptorForArchiveType() throws AdaptorException {
    Mockito.when(applicationContext.getBean(TEST_BEAN_NAME, ArchiveAdaptor.class))
        .thenReturn(archiveAdaptor);

    final ArchiveAdaptor result =
        adaptor.getArchiveAdaptorFor(archiveAdaptorEntry.getArchiveType());

    assertNotNull(result);
    assertSame(archiveAdaptor, result);
  }

  @Test
  public void testGetArchiveEntryTypeSubtypeDetectFailed() throws IOException {
    final ArchiveEntryType result =
        adaptor.getArchiveEntryType(TEST_MEDIA_TYPE.getSubtype().substring(1));

    assertNull(result);
  }

  @Test
  public void testGetArchiveEntryType() throws IOException {
    final ArchiveEntryType result = adaptor.getArchiveEntryType(TEST_MEDIA_TYPE.getSubtype());

    assertNotNull(result);
    assertSame(TEST_ARCHIVE_ENTRY_TYPE, result);
  }

  @Test
  public void testGetTypeForInvalidInput() throws IOException {
    Mockito.when(detector.detect(Mockito.any(), Mockito.any())).thenThrow(IOException.class);

    final String result = adaptor.getType(inputStream);

    assertNull(result);

    Mockito.verify(detector, Mockito.times(1)).detect(inputStream, metadata);
  }

  @Test
  public void testGetType() throws IOException {
    Mockito.when(detector.detect(Mockito.any(), Mockito.any())).thenReturn(TEST_MEDIA_TYPE);

    final String result = adaptor.getType(inputStream);

    assertNotNull(result);
    assertEquals(TEST_MEDIA_TYPE.getType(), result);

    Mockito.verify(detector, Mockito.times(1)).detect(inputStream, metadata);
  }

  @Test
  public void testGetMimeTypeForInvalidInput() throws IOException {
    Mockito.when(detector.detect(Mockito.any(), Mockito.any())).thenThrow(IOException.class);

    final String result = adaptor.getMimeTypeFor(inputStream);

    assertNull(result);

    Mockito.verify(detector, Mockito.times(1)).detect(inputStream, metadata);
  }

  @Test
  public void testGetMimeType() throws IOException {
    Mockito.when(detector.detect(Mockito.any(), Mockito.any())).thenReturn(TEST_MEDIA_TYPE);

    final String result = adaptor.getMimeTypeFor(inputStream);

    assertNotNull(result);
    assertEquals(TEST_MEDIA_TYPE.toString(), result);

    Mockito.verify(detector, Mockito.times(1)).detect(inputStream, metadata);
  }

  @Test
  public void testGetContentAdaptorForUnknownMimeType() throws IOException, AdaptorException {
    Mockito.when(detector.detect(Mockito.any(InputStream.class), Mockito.any(Metadata.class)))
        .thenThrow(IOException.class);

    final ContentAdaptor result = adaptor.getContentAdaptorFor(TEST_CONTENT);

    assertNull(result);
  }

  @Test
  public void testGetContentAdaptorFor() throws IOException, AdaptorException {
    Mockito.when(detector.detect(argumentCaptorInputStream.capture(), Mockito.any(Metadata.class)))
        .thenReturn(TEST_MEDIA_TYPE);
    Mockito.when(applicationContext.getBean(TEST_BEAN_NAME, ContentAdaptor.class))
        .thenReturn(contentLoader);

    final ContentAdaptor result = adaptor.getContentAdaptorFor(TEST_CONTENT);

    assertNotNull(result);
    assertSame(contentLoader, result);

    Mockito.verify(detector, Mockito.times(1))
        .detect(argumentCaptorInputStream.getValue(), metadata);
  }
}

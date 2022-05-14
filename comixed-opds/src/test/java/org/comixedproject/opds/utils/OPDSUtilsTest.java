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

package org.comixedproject.opds.utils;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertFalse;
import static org.comixedproject.opds.utils.OPDSUtils.*;
import static org.junit.Assert.assertNotNull;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.HashSet;
import java.util.Set;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.comicbooks.ComicBookMetadataAdaptor;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.Credit;
import org.comixedproject.opds.model.OPDSAcquisitionFeedEntry;
import org.comixedproject.opds.model.OPDSLink;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class OPDSUtilsTest {
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CBZ;
  private static final String TEST_BASE_FILENAME = "example.cbz";
  private static final String TEST_FILENAME = "src/test/resources/example.cbz";
  private static final byte[] TEST_COVER_DATA = "Cover data".getBytes();
  private static final String TEST_MIME_TYPE_IMAGE = "image/jpeg";
  private static final String TEST_DISPLAYABLE_TITLE = "The Displayable Title";
  private static final String TEST_CREDIT_NAME = "Joey Writer";
  private static final String TEST_CREDIT_ROLE = "writer";
  private static final String TEST_DESCRIPTION = "This is the description of the issue.";

  @InjectMocks private OPDSUtils utils;
  @Mock private ComicBook comicBook;
  @Mock private FileTypeAdaptor fileTypeAdaptor;
  @Mock private ComicBookAdaptor comicBookAdaptor;
  @Mock private ComicBookMetadataAdaptor comicBookMetadataAdaptor;

  @Captor private ArgumentCaptor<ByteArrayInputStream> inputStreamArgumentCaptor;

  private Set<Credit> creditList = new HashSet<>();

  @Before
  public void setUp() {
    Mockito.when(comicBook.getArchiveType()).thenReturn(TEST_ARCHIVE_TYPE);
    Mockito.when(comicBook.getFilename()).thenReturn(TEST_FILENAME);
    Mockito.when(comicBook.getBaseFilename()).thenReturn(TEST_BASE_FILENAME);
    creditList.add(new Credit(comicBook, TEST_CREDIT_NAME, TEST_CREDIT_ROLE));
    Mockito.when(comicBook.getCredits()).thenReturn(creditList);
    Mockito.when(comicBook.getDescription()).thenReturn(TEST_DESCRIPTION);
  }

  @Test
  public void testCreateComicLink() {
    final OPDSLink result = utils.createComicLink(comicBook);

    assertNotNull(result);
    assertEquals(TEST_ARCHIVE_TYPE.getMimeType(), result.getMimeType());
    assertEquals(
        String.format(COMIC_LINK_URL, comicBook.getId(), utils.urlEncodeString(TEST_BASE_FILENAME)),
        result.getReference());
  }

  @Test
  public void testCreateComicCoverLinkComicBookAdaptorException() throws AdaptorException {
    Mockito.when(comicBookAdaptor.loadCover(Mockito.anyString())).thenThrow(AdaptorException.class);

    final OPDSLink result = utils.createComicCoverLink(comicBook);

    assertNotNull(result);
    assertEquals(MIME_TYPE_IMAGE_UNKNOWN, result.getMimeType());
    assertEquals(OPDS_IMAGE_RELATION, result.getRelation());
    assertEquals(String.format(COMIC_COVER_URL, comicBook.getId(), 0, 160), result.getReference());

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).loadCover(TEST_FILENAME);
  }

  @Test
  public void testCreateComicCoverLink() throws AdaptorException {
    Mockito.when(comicBookAdaptor.loadCover(Mockito.anyString())).thenReturn(TEST_COVER_DATA);
    Mockito.when(fileTypeAdaptor.getMimeTypeFor(inputStreamArgumentCaptor.capture()))
        .thenReturn(TEST_MIME_TYPE_IMAGE);

    final OPDSLink result = utils.createComicCoverLink(comicBook);

    assertNotNull(result);
    assertEquals(TEST_MIME_TYPE_IMAGE, result.getMimeType());
    assertEquals(OPDS_IMAGE_RELATION, result.getRelation());
    assertEquals(String.format(COMIC_COVER_URL, comicBook.getId(), 0, 160), result.getReference());

    final ByteArrayInputStream inputStream = inputStreamArgumentCaptor.getValue();
    assertNotNull(inputStream);

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).loadCover(TEST_FILENAME);
    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getMimeTypeFor(inputStream);
  }

  @Test
  public void testCreateComicThumbnailLinkComicBookAdaptorException() throws AdaptorException {
    Mockito.when(comicBookAdaptor.loadCover(Mockito.anyString())).thenThrow(AdaptorException.class);

    final OPDSLink result = utils.createComicThumbnailLink(comicBook);

    assertNotNull(result);
    assertEquals(MIME_TYPE_IMAGE_UNKNOWN, result.getMimeType());
    assertEquals(OPDS_IMAGE_THUMBNAIL, result.getRelation());
    assertEquals(String.format(COMIC_COVER_URL, comicBook.getId(), 0, 160), result.getReference());

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).loadCover(TEST_FILENAME);
  }

  @Test
  public void testCreateComicThumbnailLink() throws AdaptorException {
    Mockito.when(comicBookAdaptor.loadCover(Mockito.anyString())).thenReturn(TEST_COVER_DATA);
    Mockito.when(fileTypeAdaptor.getMimeTypeFor(inputStreamArgumentCaptor.capture()))
        .thenReturn(TEST_MIME_TYPE_IMAGE);

    final OPDSLink result = utils.createComicThumbnailLink(comicBook);

    assertNotNull(result);
    assertEquals(TEST_MIME_TYPE_IMAGE, result.getMimeType());
    assertEquals(OPDS_IMAGE_THUMBNAIL, result.getRelation());
    assertEquals(String.format(COMIC_COVER_URL, comicBook.getId(), 0, 160), result.getReference());

    final ByteArrayInputStream inputStream = inputStreamArgumentCaptor.getValue();
    assertNotNull(inputStream);

    Mockito.verify(comicBookAdaptor, Mockito.times(1)).loadCover(TEST_FILENAME);
    Mockito.verify(fileTypeAdaptor, Mockito.times(1)).getMimeTypeFor(inputStream);
  }

  @Test
  public void testUrlEncodeString() {
    final String encoded = utils.urlEncodeString(TEST_BASE_FILENAME);
    assertEquals(TEST_BASE_FILENAME, utils.urlDecodeString(encoded));
  }

  @Test
  public void testCreateComicEntry() throws AdaptorException {
    Mockito.when(comicBookAdaptor.loadCover(Mockito.anyString())).thenReturn(TEST_COVER_DATA);
    Mockito.when(comicBookMetadataAdaptor.getDisplayableTitle(Mockito.any(ComicBook.class)))
        .thenReturn(TEST_DISPLAYABLE_TITLE);
    Mockito.when(fileTypeAdaptor.getMimeTypeFor(Mockito.any(InputStream.class)))
        .thenReturn(TEST_MIME_TYPE_IMAGE);

    final OPDSAcquisitionFeedEntry result = utils.createComicEntry(comicBook);

    assertNotNull(result);
    assertEquals(TEST_DISPLAYABLE_TITLE, result.getTitle());
    assertFalse(result.getLinks().isEmpty());

    Mockito.verify(comicBookMetadataAdaptor, Mockito.times(1)).getDisplayableTitle(comicBook);
  }
}

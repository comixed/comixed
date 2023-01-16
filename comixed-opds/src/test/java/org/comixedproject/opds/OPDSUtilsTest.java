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

package org.comixedproject.opds;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertFalse;
import static org.comixedproject.opds.OPDSUtils.*;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertNotNull;

import java.util.HashSet;
import java.util.Set;
import org.comixedproject.adaptors.comicbooks.ComicBookMetadataAdaptor;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicTag;
import org.comixedproject.model.comicbooks.ComicTagType;
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
  private static final String TEST_MIME_TYPE_IMAGE = "image/*";
  private static final String TEST_DISPLAYABLE_TITLE = "The Displayable Title";
  private static final String TEST_CREDIT_NAME = "Joey Writer";
  private static final String TEST_SERIES = "The Series Name";

  @InjectMocks private OPDSUtils utils;
  @Mock private ComicBook comicBook;
  @Mock private ComicDetail comicDetail;
  @Mock private FileTypeAdaptor fileTypeAdaptor;
  @Mock private ComicBookMetadataAdaptor comicBookMetadataAdaptor;

  private Set<ComicTag> comicTags = new HashSet<>();

  @Before
  public void setUp() {
    Mockito.when(comicDetail.getArchiveType()).thenReturn(TEST_ARCHIVE_TYPE);
    Mockito.when(comicDetail.getBaseFilename()).thenReturn(TEST_BASE_FILENAME);
    comicTags.add(new ComicTag(comicDetail, ComicTagType.WRITER, TEST_CREDIT_NAME));
  }

  @Test
  public void testCreateComicLink() {
    final OPDSLink result = utils.createComicLink(comicDetail);

    assertNotNull(result);
    assertEquals(TEST_ARCHIVE_TYPE.getMimeType(), result.getMimeType());
    assertEquals(
        String.format(COMIC_LINK_URL, comicBook.getId(), utils.urlEncodeString(TEST_BASE_FILENAME)),
        result.getReference());
  }

  @Test
  public void testCreateComicCoverLinkComicBookAdaptorException() {
    final OPDSLink result = utils.createComicCoverLink(comicDetail);

    assertNotNull(result);
    assertEquals(MIME_TYPE_IMAGE, result.getMimeType());
    assertEquals(OPDS_IMAGE_RELATION, result.getRelation());
    assertEquals(String.format(COMIC_COVER_URL, comicBook.getId(), 0, 160), result.getReference());
  }

  @Test
  public void testCreateComicCoverLink() {
    final OPDSLink result = utils.createComicCoverLink(comicDetail);

    assertNotNull(result);
    assertEquals(TEST_MIME_TYPE_IMAGE, result.getMimeType());
    assertEquals(OPDS_IMAGE_RELATION, result.getRelation());
    assertEquals(String.format(COMIC_COVER_URL, comicBook.getId(), 0, 160), result.getReference());
  }

  @Test
  public void testCreateComicThumbnailLink() {
    final OPDSLink result = utils.createComicThumbnailLink(comicDetail);

    assertNotNull(result);
    assertEquals(TEST_MIME_TYPE_IMAGE, result.getMimeType());
    assertEquals(OPDS_IMAGE_THUMBNAIL, result.getRelation());
    assertEquals(String.format(COMIC_COVER_URL, comicBook.getId(), 0, 160), result.getReference());
  }

  @Test
  public void testUrlEncodeString() {
    final String encoded = utils.urlEncodeString(TEST_BASE_FILENAME);
    assertEquals(TEST_BASE_FILENAME, utils.urlDecodeString(encoded));
  }

  @Test
  public void testCreateComicEntry() {
    Mockito.when(comicBookMetadataAdaptor.getDisplayableTitle(Mockito.any(ComicDetail.class)))
        .thenReturn(TEST_DISPLAYABLE_TITLE);

    final OPDSAcquisitionFeedEntry result = utils.createComicEntry(comicDetail);

    assertNotNull(result);
    assertEquals(TEST_DISPLAYABLE_TITLE, result.getTitle());
    assertFalse(result.getLinks().isEmpty());

    Mockito.verify(comicBookMetadataAdaptor, Mockito.times(1)).getDisplayableTitle(comicDetail);
  }

  @Test
  public void testCreateIdForEntry() {
    final Long result = utils.createIdForEntry("SERIES", TEST_SERIES);

    assertNotNull(result);
    assertEquals(result, utils.createIdForEntry("SERIES", TEST_SERIES));
    assertNotEquals(result, utils.createIdForEntry("SERIES", TEST_SERIES.substring(1)));
  }
}

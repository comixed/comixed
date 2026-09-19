/*
 * ComiXed - A digital comic book library management application.
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.HashSet;
import java.util.Set;
import org.comixedproject.adaptors.comicbooks.ComicMetadataAdaptor;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicTag;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.opds.model.OPDSAcquisitionFeedEntry;
import org.comixedproject.opds.model.OPDSLink;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class OPDSUtilsTest {
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CBZ;
  private static final String TEST_BASE_FILENAME = "example.cbz";
  private static final String TEST_MIME_TYPE_IMAGE = "image/*";
  private static final String TEST_DISPLAYABLE_TITLE = "The Displayable Title";
  private static final String TEST_CREDIT_NAME = "Joey Writer";
  private static final String TEST_SERIES = "The Series Name";

  @InjectMocks private OPDSUtils utils;
  @Mock private Comic comic;
  @Mock private FileTypeAdaptor fileTypeAdaptor;
  @Mock private ComicMetadataAdaptor comicMetadataAdaptor;

  private Set<ComicTag> comicTags = new HashSet<>();

  @BeforeEach
  void setUp() {
    when(comic.getArchiveType()).thenReturn(TEST_ARCHIVE_TYPE);
    when(comic.getBaseFilename()).thenReturn(TEST_BASE_FILENAME);
    comicTags.add(new ComicTag(comic, ComicTagType.WRITER, TEST_CREDIT_NAME));
  }

  @Test
  void createComicLink() {
    final OPDSLink result = utils.createComicLink(comic);

    assertNotNull(result);
    assertEquals(TEST_ARCHIVE_TYPE.getMimeType(), result.getMimeType());
    assertEquals(
        String.format(
            COMIC_LINK_URL, comic.getComicId(), utils.urlEncodeString(TEST_BASE_FILENAME)),
        result.getReference());
  }

  @Test
  void createComicCoverLink_comicAdaptorException() {
    final OPDSLink result = utils.createComicCoverLink(comic);

    assertNotNull(result);
    assertEquals(MIME_TYPE_IMAGE, result.getMimeType());
    assertEquals(OPDS_IMAGE_RELATION, result.getRelation());
    assertEquals(String.format(COMIC_COVER_URL, comic.getComicId(), 0, 160), result.getReference());
  }

  @Test
  void createComicCoverLink() {
    final OPDSLink result = utils.createComicCoverLink(comic);

    assertNotNull(result);
    assertEquals(TEST_MIME_TYPE_IMAGE, result.getMimeType());
    assertEquals(OPDS_IMAGE_RELATION, result.getRelation());
    assertEquals(String.format(COMIC_COVER_URL, comic.getComicId(), 0, 160), result.getReference());
  }

  @Test
  void createComicThumbnailLink() {
    final OPDSLink result = utils.createComicThumbnailLink(comic);

    assertNotNull(result);
    assertEquals(TEST_MIME_TYPE_IMAGE, result.getMimeType());
    assertEquals(OPDS_IMAGE_THUMBNAIL, result.getRelation());
    assertEquals(String.format(COMIC_COVER_URL, comic.getComicId(), 0, 160), result.getReference());
  }

  @Test
  void urlEncodeString() {
    final String encoded = utils.urlEncodeString(TEST_BASE_FILENAME);
    assertEquals(TEST_BASE_FILENAME, utils.urlDecodeString(encoded));
  }

  @Test
  void createComicEntry() {
    when(comicMetadataAdaptor.getDisplayableTitle(any(Comic.class)))
        .thenReturn(TEST_DISPLAYABLE_TITLE);

    final OPDSAcquisitionFeedEntry result = utils.createComicEntry(comic);

    assertNotNull(result);
    assertEquals(TEST_DISPLAYABLE_TITLE, result.getTitle());
    assertFalse(result.getLinks().isEmpty());

    verify(comicMetadataAdaptor).getDisplayableTitle(comic);
  }

  @Test
  void createIdForEntry() {
    final Long result = utils.createIdForEntry("SERIES", TEST_SERIES);

    assertNotNull(result);
    assertEquals(result, utils.createIdForEntry("SERIES", TEST_SERIES));
    assertNotEquals(result, utils.createIdForEntry("SERIES", TEST_SERIES.substring(1)));
  }
}

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
import static org.comixedproject.opds.utils.OPDSUtils.*;
import static org.junit.Assert.assertNotNull;

import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.opds.model.OPDSLink;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class OPDSUtilsTest {
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CBZ;
  private static final String TEST_BASE_FILENAME = "Test Filename.cbz";

  @Mock private ComicBook comicBook;

  @Before
  public void setUp() {
    Mockito.when(comicBook.getArchiveType()).thenReturn(TEST_ARCHIVE_TYPE);
    Mockito.when(comicBook.getBaseFilename()).thenReturn(TEST_BASE_FILENAME);
  }

  @Test
  public void testCreateComicLink() {
    final OPDSLink result = OPDSUtils.createComicLink(comicBook);

    assertNotNull(result);
    assertEquals(TEST_ARCHIVE_TYPE.getMimeType(), result.getMimeType());
    assertEquals(
        String.format(
            COMIC_LINK_URL, comicBook.getId(), OPDSUtils.urlEncodeString(TEST_BASE_FILENAME)),
        result.getReference());
  }

  @Test
  public void testCreateComicCoverLink() {
    final OPDSLink result = OPDSUtils.createComicCoverLink(comicBook);

    assertNotNull(result);
    assertEquals(IMAGE_MIME_TYPE, result.getMimeType());
    assertEquals(OPDS_IMAGE_RELATION, result.getRelation());
    assertEquals(String.format(COMIC_COVER_URL, comicBook.getId(), 0, 160), result.getReference());
  }

  @Test
  public void testUrlEncoding() {
    final String encoded = OPDSUtils.urlEncodeString(TEST_BASE_FILENAME);
    assertEquals(TEST_BASE_FILENAME, OPDSUtils.urlDecodeString(encoded));
  }
}

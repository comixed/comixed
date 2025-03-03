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

import static org.junit.jupiter.api.Assertions.*;

import java.io.IOException;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ComicInfoXmlFilenameContentAdaptorTest extends BaseContentAdaptorTest {
  private static final String TEST_COMICINFO_FILE_COMPLETE =
      "src/test/resources/ComicInfo-complete.xml";
  private static final String TEST_COMICINFO_FILE_LONG_VOLUME =
      "src/test/resources/ComicInfo-long-volume.xml";
  private static final String TEST_COMICINFO_FILE_NOT_XML =
      "src/test/resources/application.properties";
  private static final String TEST_PUBLISHER_NAME = "Test Publisher";
  private static final String TEST_SERIES_NAME = "Test Series";
  private static final String TEST_VOLUME_NAME = "2011";
  private static final String TEST_ISSUE_NUMBER = "24";
  private static final String TEST_TITLE = "Test Title";
  private static final String TEST_WEB_ADDRESS = "http://comicvine.gamespot.com/foo/71765-12971/";
  private static final String TEST_DESCRIPTION = "Test summary <em>inner tag</em>";
  private static final String TEST_METADATA_SOURCE_NAME = "ComicVine";
  private static final String TEST_METADATA_REFERENCE_ID = "12971";

  @InjectMocks ComicInfoXmlFilenameContentAdaptor adaptor;

  private ComicBook comicBook = new ComicBook();
  private ContentAdaptorRules contentAdaptorRules = new ContentAdaptorRules();

  @BeforeEach
  void setup() {
    comicBook.setComicDetail(
        new ComicDetail(comicBook, TEST_COMICINFO_FILE_COMPLETE, ArchiveType.CBZ));
  }

  @Test
  void loadContent_notXml() {
    assertThrows(
        ContentAdaptorException.class,
        () ->
            adaptor.loadContent(
                comicBook,
                TEST_COMICINFO_FILE_COMPLETE,
                loadFile(TEST_COMICINFO_FILE_NOT_XML),
                contentAdaptorRules));
  }

  @Test
  void loadContent() throws IOException, ContentAdaptorException {
    adaptor.loadContent(
        comicBook,
        TEST_COMICINFO_FILE_COMPLETE,
        loadFile(TEST_COMICINFO_FILE_COMPLETE),
        contentAdaptorRules);

    assertFalse(comicBook.getComicDetail().getTags().isEmpty());

    assertEquals(TEST_PUBLISHER_NAME, comicBook.getComicDetail().getPublisher());
    assertEquals(TEST_SERIES_NAME, comicBook.getComicDetail().getSeries());
    assertEquals(TEST_VOLUME_NAME, comicBook.getComicDetail().getVolume());
    assertEquals(TEST_ISSUE_NUMBER, comicBook.getComicDetail().getIssueNumber());
    assertEquals(TEST_TITLE, comicBook.getComicDetail().getTitle());
    assertEquals(TEST_WEB_ADDRESS, comicBook.getComicDetail().getWebAddress());
    assertEquals(TEST_DESCRIPTION, comicBook.getComicDetail().getDescription());

    assertEquals(TEST_METADATA_SOURCE_NAME, comicBook.getMetadataSourceName());
    assertEquals(TEST_METADATA_REFERENCE_ID, comicBook.getMetadataReferenceId());
  }

  @Test
  void loadContext_skipMetadata() throws IOException, ContentAdaptorException {
    contentAdaptorRules.setSkipMetadata(true);

    adaptor.loadContent(
        comicBook,
        TEST_COMICINFO_FILE_COMPLETE,
        loadFile(TEST_COMICINFO_FILE_COMPLETE),
        contentAdaptorRules);

    assertTrue(comicBook.getComicDetail().getTags().isEmpty());

    assertNull(comicBook.getComicDetail().getPublisher());
    assertNull(comicBook.getComicDetail().getSeries());
    assertNull(comicBook.getComicDetail().getVolume());
    assertNull(comicBook.getComicDetail().getIssueNumber());
    assertNull(comicBook.getComicDetail().getTitle());
    assertNull(comicBook.getComicDetail().getDescription());
  }

  @Test
  void loadContext_volumeTooLong() throws IOException, ContentAdaptorException {
    adaptor.loadContent(
        comicBook,
        TEST_COMICINFO_FILE_LONG_VOLUME,
        loadFile(TEST_COMICINFO_FILE_LONG_VOLUME),
        contentAdaptorRules);

    assertNotNull(comicBook.getComicDetail().getVolume());
    assertEquals(4, comicBook.getComicDetail().getVolume().length());
  }
}

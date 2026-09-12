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
import static org.mockito.Mockito.*;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.comicpages.ComicPageType;
import org.comixedproject.model.metadata.MetadataSource;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
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
  private static final Date TEST_LAST_SCRAPED_DATE;

  static {
    try {
      TEST_LAST_SCRAPED_DATE = new SimpleDateFormat("yyyy-MM-dd").parse("2025-07-17");
    } catch (ParseException e) {
      throw new RuntimeException(e);
    }
  }

  @InjectMocks ComicInfoXmlFilenameContentAdaptor adaptor;
  @Mock private MetadataSource metadataSource;

  private Comic comic = new Comic(TEST_COMICINFO_FILE_COMPLETE, ArchiveType.CBZ);

  @Test
  void loadContent_notXml() {
    assertThrows(
        ContentAdaptorException.class,
        () ->
            adaptor.loadContent(
                comic, TEST_COMICINFO_FILE_COMPLETE, loadFile(TEST_COMICINFO_FILE_NOT_XML)));
  }

  @Test
  void loadContent() throws IOException, ContentAdaptorException {
    adaptor.loadContent(
        comic, TEST_COMICINFO_FILE_COMPLETE, loadFile(TEST_COMICINFO_FILE_COMPLETE));

    assertFalse(comic.getTags().isEmpty());

    assertEquals(TEST_PUBLISHER_NAME, comic.getPublisher());
    assertEquals(TEST_SERIES_NAME, comic.getSeries());
    assertEquals(TEST_VOLUME_NAME, comic.getVolume());
    assertEquals(TEST_ISSUE_NUMBER, comic.getIssueNumber());
    assertEquals(TEST_TITLE, comic.getTitle());
    assertEquals(TEST_WEB_ADDRESS, comic.getWebAddress());
    assertEquals(TEST_DESCRIPTION, comic.getDescription());

    assertEquals(TEST_METADATA_SOURCE_NAME, comic.getMetadataSourceName());
    assertEquals(TEST_METADATA_REFERENCE_ID, comic.getMetadataReferenceId());
    assertEquals(TEST_LAST_SCRAPED_DATE, comic.getLastScrapedDate());

    for (int index = 0; index < comic.getPages().size(); index++) {
      final ComicPage comicPage = comic.getPages().get(index);
      verify(comicPage).setPageNumber(index);
      verify(comicPage).setHeight(1966);
      if (index == 3) {
        verify(comicPage).setWidth(2560);
      } else {
        verify(comicPage).setWidth(1280);
      }
      verify(comicPage).setPageType(any(ComicPageType.class));
      verify(comicPage).setHash(anyString());
    }
  }

  @Test
  void loadContext_volumeTooLong() throws IOException, ContentAdaptorException {
    adaptor.loadContent(
        comic, TEST_COMICINFO_FILE_LONG_VOLUME, loadFile(TEST_COMICINFO_FILE_LONG_VOLUME));

    assertNotNull(comic.getVolume());
    assertEquals(4, comic.getVolume().length());
  }
}

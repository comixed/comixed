/*
 * ComiXed - A digital comicBook book library management application.
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

package org.comixedproject.adaptors.content;

import static com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES;
import static junit.framework.TestCase.*;

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicMetadataSource;
import org.comixedproject.model.metadata.ComicInfo;
import org.comixedproject.model.metadata.MetadataSource;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.converter.xml.MappingJackson2XmlHttpMessageConverter;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest(
    classes = {ComicMetadataContentAdaptor.class, MappingJackson2XmlHttpMessageConverter.class})
public class ComicMetadataContentAdaptorTest extends BaseContentAdaptorTest {
  private static final String TEST_COMICINFO_FILE_COMPLETE =
      "src/test/resources/ComicInfo-complete.xml";
  private static final String TEST_COMICINFO_FILE_NOT_XML =
      "src/test/resources/application.properties";
  private static final String TEST_PUBLISHER_NAME = "Test Publisher";
  private static final String TEST_SERIES_NAME = "Test Series";
  private static final String TEST_VOLUME_NAME = "2011";
  private static final String TEST_ISSUE_NUMBER = "24";
  private static final String TEST_TITLE = "Test Title";
  private static final String TEST_DESCRIPTION = "Test summary <em>inner tag</em>";
  private static final String TEST_METADATA_SOURCE_NAME = "ComicVine";
  private static final String TEST_METADATA_REFERENCE_ID = "12971";

  @Autowired ComicMetadataContentAdaptor adaptor;

  private ComicBook comicBook = new ComicBook();
  private ContentAdaptorRules contentAdaptorRules = new ContentAdaptorRules();

  @Before
  public void setup() {
    adaptor.xmlConverter.getObjectMapper().configure(FAIL_ON_UNKNOWN_PROPERTIES, false);
    comicBook.setComicDetail(
        new ComicDetail(comicBook, TEST_COMICINFO_FILE_COMPLETE, ArchiveType.CBZ));
  }

  @Test(expected = ContentAdaptorException.class)
  public void testLoadComicInfoXmlNotXml() throws IOException, ContentAdaptorException {
    adaptor.loadContent(
        comicBook,
        TEST_COMICINFO_FILE_COMPLETE,
        loadFile(TEST_COMICINFO_FILE_NOT_XML),
        contentAdaptorRules);
  }

  @Test
  public void testLoadComicInfoXml() throws IOException, ContentAdaptorException {
    adaptor.loadContent(
        comicBook,
        TEST_COMICINFO_FILE_COMPLETE,
        loadFile(TEST_COMICINFO_FILE_COMPLETE),
        contentAdaptorRules);

    assertFalse(comicBook.getComicDetail().getTags().isEmpty());

    assertEquals(comicBook.getComicDetail().getPublisher(), TEST_PUBLISHER_NAME);
    assertEquals(comicBook.getComicDetail().getSeries(), TEST_SERIES_NAME);
    assertEquals(comicBook.getComicDetail().getVolume(), TEST_VOLUME_NAME);
    assertEquals(comicBook.getComicDetail().getIssueNumber(), TEST_ISSUE_NUMBER);
    assertEquals(comicBook.getComicDetail().getTitle(), TEST_TITLE);
    assertEquals(comicBook.getComicDetail().getDescription(), TEST_DESCRIPTION);

    assertEquals(TEST_METADATA_SOURCE_NAME, comicBook.getMetadataSourceName());
    assertEquals(TEST_METADATA_REFERENCE_ID, comicBook.getMetadataReferenceId());
  }

  @Test
  public void testLoadComicInfoXmlSkipMetadata() throws IOException, ContentAdaptorException {
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
  public void testCreateContent() throws ContentAdaptorException, IOException {
    final ComicInfo expected =
        adaptor
            .xmlConverter
            .getObjectMapper()
            .readValue(new FileInputStream(TEST_COMICINFO_FILE_COMPLETE), ComicInfo.class);

    adaptor.loadContent(
        comicBook,
        TEST_COMICINFO_FILE_COMPLETE,
        loadFile(TEST_COMICINFO_FILE_COMPLETE),
        contentAdaptorRules);
    comicBook.setMetadata(null);

    final byte[] result = adaptor.createContent(comicBook);

    final ComicInfo outcome =
        adaptor
            .xmlConverter
            .getObjectMapper()
            .readValue(new ByteArrayInputStream(result), ComicInfo.class);

    assertNotNull(outcome);
  }

  @Test
  public void testCreateContentWithMetadataContent() throws ContentAdaptorException, IOException {
    adaptor.loadContent(
        comicBook,
        TEST_COMICINFO_FILE_COMPLETE,
        loadFile(TEST_COMICINFO_FILE_COMPLETE),
        contentAdaptorRules);

    comicBook.setMetadata(
        new ComicMetadataSource(
            comicBook,
            new MetadataSource(TEST_METADATA_SOURCE_NAME, "farkleBan"),
            TEST_METADATA_REFERENCE_ID));
    comicBook.getMetadata().getMetadataSource().setName(comicBook.getMetadataSourceName());
    comicBook.getMetadata().setReferenceId(comicBook.getMetadataReferenceId());

    final byte[] result = adaptor.createContent(comicBook);

    final ComicInfo outcome =
        adaptor
            .xmlConverter
            .getObjectMapper()
            .readValue(new ByteArrayInputStream(result), ComicInfo.class);

    assertNotNull(outcome);
  }
}

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

import static junit.framework.TestCase.assertEquals;

import java.io.IOException;
import org.comixedproject.AdaptorTestContext;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = AdaptorTestContext.class)
public class FilenameContentAdaptorTest extends BaseContentAdaptorTest {
  private static final String TEST_COMICINFO_XML_FILE = "src/test/resources/ComicInfo-complete.xml";
  private static final String COMICINFO_XML = "ComicInfo.xml";

  @Autowired private FilenameContentAdaptor adaptor;

  private ComicBook comicBook;

  @Before
  public void setUp() {
    comicBook = new ComicBook();
    comicBook.setComicDetail(new ComicDetail(comicBook, ArchiveType.CBZ));
  }

  @Test
  public void testLoadComicInfoFile() throws IOException, ContentAdaptorException {
    adaptor.loadContent(comicBook, COMICINFO_XML, this.loadFile(TEST_COMICINFO_XML_FILE));

    assertEquals("Test Publisher", comicBook.getComicDetail().getPublisher());
    assertEquals("Test Series", comicBook.getComicDetail().getSeries());
    assertEquals("2011", comicBook.getComicDetail().getVolume());
  }
}

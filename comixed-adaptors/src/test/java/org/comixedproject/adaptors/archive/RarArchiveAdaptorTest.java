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

package org.comixedproject.adaptors.archive;

import static org.junit.Assert.*;

import java.io.IOException;
import org.comixedproject.ComiXedAdaptorsTestContext;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comic.Comic;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = ComiXedAdaptorsTestContext.class)
public class RarArchiveAdaptorTest {
  private static final String TEST_FILE_ENTRY_0 = "exampleCBR.jpg";
  private static final String TEST_FILE_ENTRY_1 = "example.jpeg";
  private static final String TEST_FILE_ENTRY_2 = "example.jpg";
  private static final String TEST_FILE_ENTRY_3 = "example.png";
  private static final String TEST_CBZ_FILE = "target/test-classes/example.cbz";
  private static final String TEST_CBR_FILE = "target/test-classes/example.cbr";

  @Autowired private RarArchiveAdaptor archiveAdaptor;

  private Comic comic;

  @Before
  public void setUp() {
    comic = new Comic();
    comic.setFilename(TEST_CBR_FILE);
    comic.setArchiveType(ArchiveType.CBR);
  }

  @Test(expected = ArchiveAdaptorException.class)
  public void testOpenFileNotFound() throws ArchiveAdaptorException {
    comic.setFilename(TEST_CBR_FILE.substring(1));
    archiveAdaptor.loadComic(comic);
  }

  @Test(expected = ArchiveAdaptorException.class)
  public void testOpenFileIsDirectory() throws ArchiveAdaptorException {
    comic.setFilename("src/test/resources");
    archiveAdaptor.loadComic(comic);
  }

  @Test(expected = ArchiveAdaptorException.class)
  public void testOpenInvalidFile() throws ArchiveAdaptorException {
    comic.setFilename(TEST_CBZ_FILE);
    archiveAdaptor.loadComic(comic);
  }

  @Test
  public void testLoadComic() throws ArchiveAdaptorException {
    archiveAdaptor.loadComic(comic);

    assertEquals(4, comic.getPageCount());
    assertEquals(TEST_FILE_ENTRY_0, comic.getPage(0).getFilename());
    assertEquals(TEST_FILE_ENTRY_1, comic.getPage(1).getFilename());
    assertEquals(TEST_FILE_ENTRY_2, comic.getPage(2).getFilename());
    assertEquals(TEST_FILE_ENTRY_3, comic.getPage(3).getFilename());
  }

  @Test
  public void testGetSingleFile() throws ArchiveAdaptorException {
    byte[] result = archiveAdaptor.loadSingleFile(comic, TEST_FILE_ENTRY_1);

    assertNotNull(result);
    assertEquals(7449985, result.length);
  }

  @Test
  public void testGetSingleFileNotFound() throws ArchiveAdaptorException {
    byte[] result = archiveAdaptor.loadSingleFile(comic, TEST_FILE_ENTRY_1.substring(1));

    assertNull(result);
  }

  @Test(expected = ArchiveAdaptorException.class)
  public void testSaveComic() throws ArchiveAdaptorException, IOException {
    archiveAdaptor.saveComic(comic, false);
  }

  @Test
  public void testLoadSingleFile() throws ArchiveAdaptorException {
    byte[] result = archiveAdaptor.loadSingleFile(TEST_CBR_FILE, TEST_FILE_ENTRY_1);

    assertNotNull(result);
    assertEquals(7449985, result.length);
  }

  @Test
  public void testGetFirstImageFileName() throws ArchiveAdaptorException {
    assertEquals(TEST_FILE_ENTRY_0, archiveAdaptor.getFirstImageFileName(TEST_CBR_FILE));
  }
}

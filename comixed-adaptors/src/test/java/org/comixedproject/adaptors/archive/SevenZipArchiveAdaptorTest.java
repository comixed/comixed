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

import java.io.File;
import java.io.IOException;
import org.apache.commons.io.FileUtils;
import org.comixedproject.AdaptorTestContext;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.Page;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = AdaptorTestContext.class)
public class SevenZipArchiveAdaptorTest {
  private static final String TEST_FILE_ENTRY_0 = "example.jpeg";
  private static final String TEST_FILE_ENTRY_1 = "example.jpg";
  private static final String TEST_FILE_ENTRY_2 = "exampleCBR.jpg";
  private static final String TEST_FILE_ENTRY_3 = "example.png";
  private static final String TEST_SOURCE_CB7_FILE = "src/test/resources/example.cb7";
  private static final String TEST_CB7_FILE = "target/test-classes/example.cb7";
  private static final String TEST_CREATED_CB7_FILE = "target/test-classes/example-created.cb7";
  private static final String TEST_CBR_FILE = "target/test-classes/example.cbr";
  private static final String TEST_FILE_ENTRY_RENAMED_0 = "offset-000.jpeg";
  private static final String TEST_FILE_ENTRY_RENAMED_1 = "offset-001.jpg";
  private static final String TEST_FILE_ENTRY_RENAMED_2 = "offset-002.jpg";
  private static final String TEST_FILE_ENTRY_RENAMED_3 = "offset-003.png";

  @Autowired private SevenZipArchiveAdaptor archiveAdaptor;

  private Comic comic;

  @Before
  public void setUp() throws IOException {
    comic = new Comic();
    comic.setFilename(TEST_CB7_FILE);
    comic.setArchiveType(ArchiveType.CB7);
    comic.getPages().add(new Page(comic, TEST_FILE_ENTRY_0, 0));
    comic.getPages().add(new Page(comic, TEST_FILE_ENTRY_1, 1));
    comic.getPages().add(new Page(comic, TEST_FILE_ENTRY_2, 2));
    comic.getPages().add(new Page(comic, TEST_FILE_ENTRY_3, 3));
    // TODO remove this when #437 is done
    final File destination = new File(TEST_CB7_FILE);
    FileUtils.deleteQuietly(destination);
    FileUtils.copyFile(new File(TEST_SOURCE_CB7_FILE), destination);
  }

  @Test(expected = ArchiveAdaptorException.class)
  public void testOpenFileNotFound() throws ArchiveAdaptorException {
    comic.setFilename(TEST_CB7_FILE.substring(1));
    archiveAdaptor.loadComic(comic);
  }

  @Test(expected = ArchiveAdaptorException.class)
  public void testOpenFileIsDirectory() throws ArchiveAdaptorException {
    comic.setFilename("src/test/resources");
    archiveAdaptor.loadComic(comic);
  }

  @Test(expected = ArchiveAdaptorException.class)
  public void testOpenInvalidFile() throws ArchiveAdaptorException {
    comic.setFilename(TEST_CBR_FILE);
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
    assertEquals(7443280, result.length);
  }

  @Test
  public void testGetSingleFileNotFound() throws ArchiveAdaptorException {
    byte[] result = archiveAdaptor.loadSingleFile(comic, TEST_FILE_ENTRY_1.substring(1));

    assertNull(result);
  }

  @Test
  public void testSaveComic() throws ArchiveAdaptorException, IOException {
    // load an existing comic
    archiveAdaptor.loadComic(comic);

    // now save it and reload it
    Comic result = archiveAdaptor.saveComic(comic, false, TEST_CREATED_CB7_FILE);

    // reload comic
    archiveAdaptor.loadComic(comic);

    assertEquals(4, result.getPageCount());
    assertEquals(TEST_FILE_ENTRY_0, result.getPage(0).getFilename());
    assertEquals(TEST_FILE_ENTRY_1, result.getPage(1).getFilename());
    assertEquals(TEST_FILE_ENTRY_2, result.getPage(2).getFilename());
    assertEquals(TEST_FILE_ENTRY_3, result.getPage(3).getFilename());
  }

  @Test
  public void testSaveComicRenamePages() throws ArchiveAdaptorException, IOException {
    // load an existing comic
    archiveAdaptor.loadComic(comic);

    // now save it and reload it
    Comic result = archiveAdaptor.saveComic(comic, true, TEST_CREATED_CB7_FILE);

    // reload comic
    archiveAdaptor.loadComic(comic);

    assertEquals(4, result.getPageCount());
    assertEquals(TEST_FILE_ENTRY_RENAMED_0, result.getPage(0).getFilename());
    assertEquals(TEST_FILE_ENTRY_RENAMED_1, result.getPage(1).getFilename());
    assertEquals(TEST_FILE_ENTRY_RENAMED_2, result.getPage(2).getFilename());
    assertEquals(TEST_FILE_ENTRY_RENAMED_3, result.getPage(3).getFilename());
  }

  @Test
  public void testSaveComicDeletePages() throws ArchiveAdaptorException, IOException {
    // load an existing comic
    archiveAdaptor.loadComic(comic);

    comic.getPages().stream()
        .filter(page -> page.getFilename().equals(TEST_FILE_ENTRY_1))
        .findFirst()
        .get()
        .setDeleted(true);

    // now save it and reload it
    Comic result = archiveAdaptor.saveComic(comic, false, TEST_CREATED_CB7_FILE);

    assertFalse(
        result.getPages().stream()
            .filter(page -> page.equals(TEST_FILE_ENTRY_1))
            .findFirst()
            .isPresent());
  }

  @Test
  public void testGetFirstImageFileName() throws ArchiveAdaptorException {
    assertEquals(TEST_FILE_ENTRY_0, archiveAdaptor.getFirstImageFileName(TEST_CB7_FILE));
  }
}

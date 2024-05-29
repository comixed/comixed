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

package org.comixedproject.adaptors.archive;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertNotNull;

import java.io.File;
import java.util.List;
import org.apache.commons.io.FileUtils;
import org.comixedproject.AdaptorTestContext;
import org.comixedproject.adaptors.archive.model.ArchiveWriteHandle;
import org.comixedproject.adaptors.archive.model.CbzArchiveReadHandle;
import org.comixedproject.adaptors.archive.model.ComicArchiveEntry;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = AdaptorTestContext.class)
public class CbzArchiveAdaptorTest {
  private static final String TEST_ZIP_FILENAME = "src/test/resources/example.cbz";
  private static final String TEST_ZIP_FILENAME_WITH_SUBDIRS =
      "src/test/resources/example-with-subdirs.cbz";
  private static final String TEST_SAVE_FILENAME = "target/test-classes/save-example.cbz";

  @Autowired private CbzArchiveAdaptor adaptor;

  @Before
  public void setUp() {
    FileUtils.deleteQuietly(new File(TEST_SAVE_FILENAME));
  }

  @Test
  public void testGetEntries() throws ArchiveAdaptorException {
    final CbzArchiveReadHandle archiveHandle = adaptor.openArchiveForRead(TEST_ZIP_FILENAME);
    final List<ComicArchiveEntry> entries = adaptor.getEntries(archiveHandle);
    adaptor.closeArchiveForRead(archiveHandle);

    for (int index = 0; index < entries.size(); index++) {
      assertEquals(index, entries.get(index).getIndex());
    }
    assertEquals("ComicInfo.xml", entries.get(0).getFilename());
    assertEquals("xml", entries.get(0).getMimetype());
    assertEquals(2881, entries.get(0).getSize());
    assertEquals("example.jpeg", entries.get(1).getFilename());
    assertEquals("jpeg", entries.get(1).getMimetype());
    assertEquals(7449985, entries.get(1).getSize());
    assertEquals("example.jpg", entries.get(2).getFilename());
    assertEquals("jpeg", entries.get(2).getMimetype());
    assertEquals(7443280, entries.get(2).getSize());
    assertEquals("example.png", entries.get(3).getFilename());
    assertEquals("png", entries.get(3).getMimetype());
    assertEquals(17303073, entries.get(3).getSize());
    assertEquals("exampleCBR.jpg", entries.get(4).getFilename());
    assertEquals("jpeg", entries.get(4).getMimetype());
    assertEquals(58656, entries.get(4).getSize());
  }

  @Test
  public void testGetEntriesInSubdirs() throws ArchiveAdaptorException {
    final CbzArchiveReadHandle archiveHandle =
        adaptor.openArchiveForRead(TEST_ZIP_FILENAME_WITH_SUBDIRS);
    final List<ComicArchiveEntry> entries = adaptor.getEntries(archiveHandle);
    adaptor.closeArchiveForRead(archiveHandle);

    for (int index = 0; index < entries.size(); index++) {
      assertEquals(index, entries.get(index).getIndex());
    }
    assertEquals("contents/", entries.get(0).getFilename());
    assertEquals("octet-stream", entries.get(0).getMimetype());
    assertEquals(0, entries.get(0).getSize());
    assertEquals("contents/ComicInfo.xml", entries.get(1).getFilename());
    assertEquals("xml", entries.get(1).getMimetype());
    assertEquals(2881, entries.get(1).getSize());
    assertEquals("contents/example.jpeg", entries.get(2).getFilename());
    assertEquals("jpeg", entries.get(2).getMimetype());
    assertEquals(7449985, entries.get(2).getSize());
    assertEquals("contents/exampleCBR.jpg", entries.get(3).getFilename());
    assertEquals("jpeg", entries.get(3).getMimetype());
    assertEquals(58656, entries.get(3).getSize());
    assertEquals("contents/example.jpg", entries.get(4).getFilename());
    assertEquals("jpeg", entries.get(4).getMimetype());
    assertEquals(7443280, entries.get(4).getSize());
    assertEquals("contents/example.png", entries.get(5).getFilename());
    assertEquals("png", entries.get(5).getMimetype());
    assertEquals(17303073, entries.get(5).getSize());
  }

  @Test(expected = ArchiveAdaptorException.class)
  public void testGetEntryNotFound() throws ArchiveAdaptorException {
    final CbzArchiveReadHandle archiveHandle = adaptor.openArchiveForRead(TEST_ZIP_FILENAME);
    try {
      adaptor.readEntry(archiveHandle, "exampleCBR.gif");
    } finally {
      adaptor.closeArchiveForRead(archiveHandle);
    }
  }

  @Test
  public void testGetEntry() throws ArchiveAdaptorException {
    final CbzArchiveReadHandle archiveHandle = adaptor.openArchiveForRead(TEST_ZIP_FILENAME);
    final byte[] result = adaptor.readEntry(archiveHandle, "exampleCBR.jpg");
    adaptor.closeArchiveForRead(archiveHandle);

    assertNotNull(result);
    assertEquals(58656, result.length);
  }

  @Test
  public void testSaveNewFile() throws ArchiveAdaptorException {
    CbzArchiveReadHandle readHandle = adaptor.openArchiveForRead(TEST_ZIP_FILENAME);
    final ArchiveWriteHandle writeHandle = adaptor.openArchiveForWrite(TEST_SAVE_FILENAME);

    List<ComicArchiveEntry> entries = adaptor.getEntries(readHandle);
    for (int index = 0; index < entries.size(); index++) {
      final ComicArchiveEntry entry = entries.get(index);
      adaptor.writeEntry(
          writeHandle, entry.getFilename(), adaptor.readEntry(readHandle, entry.getFilename()));
    }

    adaptor.closeArchiveForWrite(writeHandle);
    adaptor.closeArchiveForRead(readHandle);

    readHandle = adaptor.openArchiveForRead(TEST_SAVE_FILENAME);
    entries = adaptor.getEntries(readHandle);
    adaptor.closeArchiveForRead(readHandle);

    for (int index = 0; index < entries.size(); index++) {
      assertEquals(index, entries.get(index).getIndex());
    }
    assertEquals("ComicInfo.xml", entries.get(0).getFilename());
    assertEquals("xml", entries.get(0).getMimetype());
    assertEquals(2881, entries.get(0).getSize());
    assertEquals("example.jpeg", entries.get(1).getFilename());
    assertEquals("jpeg", entries.get(1).getMimetype());
    assertEquals(7449985, entries.get(1).getSize());
    assertEquals("example.jpg", entries.get(2).getFilename());
    assertEquals("jpeg", entries.get(2).getMimetype());
    assertEquals(7443280, entries.get(2).getSize());
    assertEquals("example.png", entries.get(3).getFilename());
    assertEquals("png", entries.get(3).getMimetype());
    assertEquals(17303073, entries.get(3).getSize());
    assertEquals("exampleCBR.jpg", entries.get(4).getFilename());
    assertEquals("jpeg", entries.get(4).getMimetype());
    assertEquals(58656, entries.get(4).getSize());
  }
}

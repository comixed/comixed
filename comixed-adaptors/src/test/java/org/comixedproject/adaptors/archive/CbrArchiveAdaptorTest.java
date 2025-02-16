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

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import org.comixedproject.AdaptorTestContext;
import org.comixedproject.adaptors.archive.model.CbrArchiveReadHandle;
import org.comixedproject.adaptors.archive.model.ComicArchiveEntry;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(classes = AdaptorTestContext.class)
class CbrArchiveAdaptorTest {
  private static final String TEST_RAR_FILENAME = "src/test/resources/example.cbr";

  @Autowired private CbrArchiveAdaptor adaptor;

  @Test
  void getEntries() throws ArchiveAdaptorException {
    final CbrArchiveReadHandle archiveHandle = adaptor.openArchiveForRead(TEST_RAR_FILENAME);
    final List<ComicArchiveEntry> entries = adaptor.getEntries(archiveHandle);
    adaptor.closeArchiveForRead(archiveHandle);

    for (int index = 0; index < entries.size(); index++) {
      assertEquals(index, entries.get(index).getIndex());
    }
    assertEquals("exampleCBR.jpg", entries.get(0).getFilename());
    assertEquals("jpeg", entries.get(0).getMimetype());
    assertEquals(58656, entries.get(0).getSize());
    assertEquals("example.jpeg", entries.get(1).getFilename());
    assertEquals("jpeg", entries.get(1).getMimetype());
    assertEquals(7449985, entries.get(1).getSize());
    assertEquals("example.jpg", entries.get(2).getFilename());
    assertEquals("jpeg", entries.get(2).getMimetype());
    assertEquals(7443280, entries.get(2).getSize());
    assertEquals("example.png", entries.get(3).getFilename());
    assertEquals("png", entries.get(3).getMimetype());
    assertEquals(17303073, entries.get(3).getSize());
  }

  @Test
  void getEntry_notFound() throws ArchiveAdaptorException {
    final CbrArchiveReadHandle archiveHandle = adaptor.openArchiveForRead(TEST_RAR_FILENAME);
    assertThrows(
        ArchiveAdaptorException.class, () -> adaptor.readEntry(archiveHandle, "exampleCBR.gif"));
  }

  @Test
  void getEntry() throws ArchiveAdaptorException {
    final CbrArchiveReadHandle archiveHandle = adaptor.openArchiveForRead(TEST_RAR_FILENAME);
    final byte[] result = adaptor.readEntry(archiveHandle, "exampleCBR.jpg");
    adaptor.closeArchiveForRead(archiveHandle);

    assertNotNull(result);
    assertEquals(58656, result.length);
  }

  @Test
  void openArchive_fileNotFound() {
    assertThrows(
        ArchiveAdaptorException.class,
        () -> adaptor.openArchiveForRead(TEST_RAR_FILENAME.substring(1)));
  }

  @Test
  void openForWrite_throwsException() {
    assertThrows(ArchiveAdaptorException.class, () -> adaptor.openArchiveForWrite("any file.rar"));
  }
}

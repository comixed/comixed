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

import java.io.*;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.Iterator;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.compress.archivers.zip.ZipArchiveEntry;
import org.apache.commons.compress.archivers.zip.ZipArchiveOutputStream;
import org.apache.commons.compress.archivers.zip.ZipFile;
import org.apache.commons.compress.utils.IOUtils;
import org.comixedproject.adaptors.archive.model.CbzArchiveReadHandle;
import org.comixedproject.adaptors.archive.model.CbzArchiveWriteHandle;
import org.comixedproject.adaptors.archive.model.ComicArchiveEntry;
import org.comixedproject.model.archives.ArchiveType;
import org.springframework.stereotype.Component;

/**
 * <code>CbzArchiveAdaptor</code> provides an implementation of {@link ArchiveAdaptor} for Zip
 * archives.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class CbzArchiveAdaptor
    extends AbstractArchiveAdaptor<CbzArchiveReadHandle, CbzArchiveWriteHandle> {
  public CbzArchiveAdaptor() {
    super(ArchiveType.CBZ);
  }

  @Override
  protected CbzArchiveReadHandle doOpenArchiveForRead(final String filename) throws Exception {
    log.trace("Opening zip archive: {}", filename);
    return new CbzArchiveReadHandle(new ZipFile(new File(filename)), filename);
  }

  @Override
  protected void doCloseArchiveForRead(final CbzArchiveReadHandle archiveHandle) throws Exception {
    log.trace("Closing zip archive");
    archiveHandle.getArchiveHandle().close();
  }

  @Override
  protected List<ComicArchiveEntry> doGetEntries(final CbzArchiveReadHandle archiveHandle)
      throws Exception {
    List<ComicArchiveEntry> result = new ArrayList<>();
    log.trace("Loading ZIP entries");
    final Enumeration<ZipArchiveEntry> iter = archiveHandle.getArchiveHandle().getEntries();
    int index = 0;
    while (iter.hasMoreElements()) {
      final ZipArchiveEntry archiveEntry = iter.nextElement();
      log.trace("Creating archive entry");
      final InputStream stream = archiveHandle.getArchiveHandle().getInputStream(archiveEntry);
      try {
        result.add(
            createArchiveEntry(index++, archiveEntry.getName(), archiveEntry.getSize(), stream));
      } catch (Exception error) {
        log.error("Could not load archive entry", error);
        result.add(createArchiveEntryForCorruptedPage(index++, archiveEntry.getName()));
      }
    }
    log.trace("Returning entries");
    return result;
  }

  @Override
  protected byte[] doGetEntry(final CbzArchiveReadHandle archiveHandle, final String filename)
      throws Exception {
    log.trace("Loading archive entry: {}", filename);
    final Iterator<ZipArchiveEntry> entries =
        archiveHandle.getArchiveHandle().getEntries(filename).iterator();

    if (!entries.hasNext()) throw new ArchiveAdaptorException("No such entry: " + filename);

    final ZipArchiveEntry zipEntry = entries.next();
    final byte[] result = new byte[(int) zipEntry.getSize()];
    log.trace("Loading file entry content: {} bytes", zipEntry.getSize());
    try {
      IOUtils.readFully(archiveHandle.getArchiveHandle().getInputStream(zipEntry), result);
    } catch (Exception error) {
      log.error("Failed to load zipfile entry", error);
      return this.doLoadMissingPageContent();
    }
    return result;
  }

  @Override
  protected CbzArchiveWriteHandle doOpenArchiveForWrite(final String filename) throws Exception {
    return new CbzArchiveWriteHandle(
        new ZipArchiveOutputStream(new FileOutputStream(filename)), filename);
  }

  @Override
  protected void doWriteEntry(
      final CbzArchiveWriteHandle archiveHandle, final String filename, final byte[] content)
      throws Exception {
    log.trace("Writing ZIP archive entry: {} [{} byes]", filename, content.length);
    final ZipArchiveEntry archiveEntry = new ZipArchiveEntry(filename);
    archiveEntry.setSize(content.length);
    archiveHandle.getArchiveHandle().putArchiveEntry(archiveEntry);
    archiveHandle.getArchiveHandle().write(content);
    log.trace("Finish entry");
    archiveHandle.getArchiveHandle().closeArchiveEntry();
  }

  @Override
  protected void doCloseArchiveForWrite(final CbzArchiveWriteHandle archiveHandle)
      throws Exception {
    log.trace("Closing ZIP archive for write");
    archiveHandle.getArchiveHandle().finish();
    archiveHandle.getArchiveHandle().close();
  }
}

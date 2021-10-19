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

import java.io.File;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.compress.archivers.sevenz.SevenZArchiveEntry;
import org.apache.commons.compress.archivers.sevenz.SevenZFile;
import org.apache.commons.compress.archivers.sevenz.SevenZOutputFile;
import org.apache.commons.compress.utils.IOUtils;
import org.comixedproject.adaptors.archive.model.Cb7ArchiveReadHandle;
import org.comixedproject.adaptors.archive.model.Cb7ArchiveWriteHandle;
import org.comixedproject.adaptors.archive.model.ComicArchiveEntry;
import org.comixedproject.model.archives.ArchiveType;
import org.springframework.stereotype.Component;

/**
 * <code>Cb7ArchiveAdaptor</code> provides an implementation of {@link ArchiveAdaptor} for 7zip
 * archives.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class Cb7ArchiveAdaptor
    extends AbstractArchiveAdaptor<Cb7ArchiveReadHandle, Cb7ArchiveWriteHandle> {
  public Cb7ArchiveAdaptor() {
    super(ArchiveType.CB7);
  }

  @Override
  protected Cb7ArchiveReadHandle doOpenArchiveForRead(final String filename) throws Exception {
    return new Cb7ArchiveReadHandle(new SevenZFile(new File(filename)), filename);
  }

  @Override
  protected void doCloseArchiveForRead(final Cb7ArchiveReadHandle archiveHandle) throws Exception {
    archiveHandle.getArchiveHandle().close();
  }

  @Override
  protected List<ComicArchiveEntry> doGetEntries(final Cb7ArchiveReadHandle archiveHandle)
      throws Exception {
    List<ComicArchiveEntry> result = new ArrayList<>();
    log.trace("Loading ZIP entries");
    int index = 0;
    final Iterator<SevenZArchiveEntry> iter =
        archiveHandle.getArchiveHandle().getEntries().iterator();
    while (iter.hasNext()) {
      final SevenZArchiveEntry archiveEntry = iter.next();
      log.trace("Creating archive entry");
      final InputStream stream = archiveHandle.getArchiveHandle().getInputStream(archiveEntry);
      result.add(
          createArchiveEntry(index++, archiveEntry.getName(), archiveEntry.getSize(), stream));
    }
    log.trace("Returning entries");
    return result;
  }

  @Override
  protected byte[] doGetEntry(final Cb7ArchiveReadHandle archiveHandle, final String filename)
      throws Exception {
    log.trace("Loading archive entry: {}", filename);
    final Iterator<SevenZArchiveEntry> entries =
        archiveHandle.getArchiveHandle().getEntries().iterator();

    while (entries.hasNext()) {
      final SevenZArchiveEntry entry = entries.next();
      if (entry.getName().equals(filename)) {
        log.trace("Loading file entry content: {} bytes", entry.getSize());
        final byte[] result = new byte[(int) entry.getSize()];
        IOUtils.readFully(archiveHandle.getArchiveHandle().getInputStream(entry), result);
        return result;
      }
    }
    throw new ArchiveAdaptorException("No such entry: " + filename);
  }

  @Override
  protected Cb7ArchiveWriteHandle doOpenArchiveForWrite(final String filename) throws Exception {
    log.trace("Opening CB7 file: {}", filename);
    return new Cb7ArchiveWriteHandle(new SevenZOutputFile(new File(filename)), filename);
  }

  @Override
  protected void doWriteEntry(
      final Cb7ArchiveWriteHandle archiveHandle, final String filename, final byte[] content)
      throws Exception {
    log.trace(
        "Writing CB7 entry: {} +{} [{} bytes]",
        archiveHandle.getFilename(),
        filename,
        content.length);
    final SevenZArchiveEntry archiveEntry = new SevenZArchiveEntry();
    archiveEntry.setName(filename);
    archiveEntry.setSize(content.length);
    archiveHandle.getArchiveHandle().putArchiveEntry(archiveEntry);
    log.trace("Writing entry content");
    archiveHandle.getArchiveHandle().write(content);
    archiveHandle.getArchiveHandle().closeArchiveEntry();
  }

  @Override
  protected void doCloseArchiveForWrite(final Cb7ArchiveWriteHandle archiveHandle)
      throws Exception {
    log.trace("Closing CB7 file: {}", archiveHandle.getFilename());
    archiveHandle.getArchiveHandle().finish();
    archiveHandle.getArchiveHandle().close();
  }
}

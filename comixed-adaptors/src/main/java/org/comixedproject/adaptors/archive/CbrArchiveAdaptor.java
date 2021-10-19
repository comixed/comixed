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

import com.github.junrar.Archive;
import com.github.junrar.impl.FileVolumeManager;
import com.github.junrar.rarfile.FileHeader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.compress.utils.IOUtils;
import org.comixedproject.adaptors.archive.model.CbrArchiveReadHandle;
import org.comixedproject.adaptors.archive.model.CbrArchiveWriteHandle;
import org.comixedproject.adaptors.archive.model.ComicArchiveEntry;
import org.comixedproject.model.archives.ArchiveType;
import org.springframework.stereotype.Component;

/**
 * <code>CbrArchiveAdaptor</code> provides an implementation of {@link ArchiveAdaptor} for RAR
 * archives.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class CbrArchiveAdaptor
    extends AbstractArchiveAdaptor<CbrArchiveReadHandle, CbrArchiveWriteHandle> {
  public CbrArchiveAdaptor() {
    super(ArchiveType.CBR);
  }

  @Override
  protected CbrArchiveReadHandle doOpenArchiveForRead(final String filename) throws Exception {
    return new CbrArchiveReadHandle(
        new Archive(new FileVolumeManager(new File(filename))), filename);
  }

  @Override
  protected void doCloseArchiveForRead(final CbrArchiveReadHandle archiveHandle)
      throws IOException {
    archiveHandle.getArchiveHandle().close();
  }

  @Override
  protected List<ComicArchiveEntry> doGetEntries(final CbrArchiveReadHandle archiveHandle)
      throws Exception {
    List<ComicArchiveEntry> result = new ArrayList<>();
    log.trace("Loading RAR entries");
    final Iterator<FileHeader> iter = archiveHandle.getArchiveHandle().getFileHeaders().iterator();
    int index = 0;
    while (iter.hasNext()) {
      final FileHeader fileHeader = iter.next();
      log.trace("Creating archive entry");
      final InputStream stream = archiveHandle.getArchiveHandle().getInputStream(fileHeader);
      result.add(
          createArchiveEntry(
              index++, fileHeader.getFileNameString(), fileHeader.getFullUnpackSize(), stream));
    }
    log.trace("Returning entries");
    return result;
  }

  @Override
  protected byte[] doGetEntry(final CbrArchiveReadHandle archiveHandle, final String filename)
      throws Exception {
    final Optional<FileHeader> fileHeader =
        archiveHandle.getArchiveHandle().getFileHeaders().stream()
            .filter(header -> header.getFileNameString().equals(filename))
            .findFirst();

    if (fileHeader.isEmpty()) throw new ArchiveAdaptorException("No such entry: " + filename);

    byte[] result = new byte[(int) fileHeader.get().getFullUnpackSize()];
    IOUtils.readFully(archiveHandle.getArchiveHandle().getInputStream(fileHeader.get()), result);
    return result;
  }

  @Override
  protected CbrArchiveWriteHandle doOpenArchiveForWrite(final String filename)
      throws ArchiveAdaptorException {
    throw new ArchiveAdaptorException("Writing to RAR files not supported");
  }

  @Override
  protected void doWriteEntry(
      final CbrArchiveWriteHandle archiveHandle, final String filename, final byte[] content) {
    // can never be called
  }

  @Override
  protected void doCloseArchiveForWrite(final CbrArchiveWriteHandle archiveHandle) {
    // can never be called
  }
}

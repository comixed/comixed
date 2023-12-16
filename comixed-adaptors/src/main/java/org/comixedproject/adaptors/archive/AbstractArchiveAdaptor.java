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

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.compress.utils.IOUtils;
import org.comixedproject.adaptors.archive.model.ArchiveEntryType;
import org.comixedproject.adaptors.archive.model.ArchiveReadHandle;
import org.comixedproject.adaptors.archive.model.ArchiveWriteHandle;
import org.comixedproject.adaptors.archive.model.ComicArchiveEntry;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.model.archives.ArchiveType;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * <code>AbstractArchiveAdaptor</code> provides a foundation of {@link ArchiveAdaptor} for building
 * support for new archive types.
 *
 * @param <R> the archive read handle type
 * @param <W> the archive write handle type
 * @author Darryl L. Pierce
 */
@Log4j2
@RequiredArgsConstructor
public abstract class AbstractArchiveAdaptor<
        R extends ArchiveReadHandle, W extends ArchiveWriteHandle>
    implements ArchiveAdaptor {
  @Autowired @Getter private FileTypeAdaptor fileTypeAdaptor;

  @Getter @NonNull private ArchiveType archiveType;

  @Override
  public R openArchiveForRead(@NonNull final String filename) throws ArchiveAdaptorException {
    try {
      return this.doOpenArchiveForRead(filename);
    } catch (Exception error) {
      throw new ArchiveAdaptorException("Failed to open archive for read", error);
    }
  }

  protected abstract R doOpenArchiveForRead(final String filename) throws Exception;

  @Override
  public void closeArchiveForRead(@NonNull final ArchiveReadHandle archiveHandle)
      throws ArchiveAdaptorException {
    try {
      this.doCloseArchiveForRead((R) archiveHandle);
    } catch (Exception error) {
      throw new ArchiveAdaptorException("Failed to close archive for read", error);
    }
  }

  protected abstract void doCloseArchiveForRead(final R archiveHandle) throws Exception;

  @Override
  public List<ComicArchiveEntry> getEntries(@NonNull final ArchiveReadHandle archiveHandle)
      throws ArchiveAdaptorException {
    try {
      return this.doGetEntries((R) archiveHandle);
    } catch (Exception error) {
      throw new ArchiveAdaptorException("Failed to load archive entries", error);
    }
  }

  protected abstract List<ComicArchiveEntry> doGetEntries(final R archiveHandle) throws Exception;

  @Override
  public byte[] readEntry(
      @NonNull final ArchiveReadHandle archiveHandle, @NonNull final String filename)
      throws ArchiveAdaptorException {
    try {
      return this.doGetEntry((R) archiveHandle, filename);
    } catch (Exception error) {
      throw new ArchiveAdaptorException("Failed to get entry", error);
    }
  }

  protected ComicArchiveEntry createArchiveEntry(
      final int index, final String name, final long size, final InputStream input)
      throws IOException {
    final byte[] content = IOUtils.toByteArray(input);
    final String mimeType = this.getFileTypeAdaptor().getSubtype(new ByteArrayInputStream(content));
    final ArchiveEntryType entryType = this.getFileTypeAdaptor().getArchiveEntryType(mimeType);
    return new ComicArchiveEntry(index, name, size, mimeType, entryType);
  }

  protected ComicArchiveEntry createArchiveEntryForCorruptedPage(
      final int index, final String filename) throws IOException {
    final byte[] content = this.doLoadMissingPageContent();
    return createArchiveEntry(index, filename, content.length, new ByteArrayInputStream(content));
  }

  byte[] doLoadMissingPageContent() throws IOException {
    final byte[] content =
        IOUtils.toByteArray(this.getClass().getResourceAsStream("/corrupted-page.png"));

    return content;
  }

  protected abstract byte[] doGetEntry(final R archiveHandle, final String filename)
      throws Exception;

  @Override
  public ArchiveWriteHandle openArchiveForWrite(@NonNull final String filename)
      throws ArchiveAdaptorException {
    try {
      return this.doOpenArchiveForWrite(filename);
    } catch (Exception error) {
      throw new ArchiveAdaptorException("Failed to open archive for write", error);
    }
  }

  protected abstract W doOpenArchiveForWrite(final String filename) throws Exception;

  @Override
  public void writeEntry(
      @NonNull final ArchiveWriteHandle archiveHandle,
      @NonNull final String filename,
      @NonNull final byte[] content)
      throws ArchiveAdaptorException {
    try {
      this.doWriteEntry((W) archiveHandle, filename, content);
    } catch (Exception error) {
      throw new ArchiveAdaptorException("Failed to write entry to archive", error);
    }
  }

  protected abstract void doWriteEntry(
      final W archiveHandle, final String filename, final byte[] content) throws Exception;

  @Override
  public void closeArchiveForWrite(@NonNull final ArchiveWriteHandle archiveHandle)
      throws ArchiveAdaptorException {
    try {
      this.doCloseArchiveForWrite((W) archiveHandle);
    } catch (Exception error) {
      throw new ArchiveAdaptorException("Failed to close archive", error);
    }
  }

  protected abstract void doCloseArchiveForWrite(final W archiveHandle) throws Exception;
}

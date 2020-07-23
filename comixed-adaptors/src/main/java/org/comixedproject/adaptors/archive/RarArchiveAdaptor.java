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

import com.github.junrar.Archive;
import com.github.junrar.exception.RarException;
import com.github.junrar.impl.FileVolumeManager;
import com.github.junrar.rarfile.FileHeader;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comic.Comic;
import org.springframework.stereotype.Component;

/**
 * <code>RarArchiveAdaptor</code> provides a concrete implementation of {@link ArchiveAdaptor} for
 * RAR files.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class RarArchiveAdaptor extends AbstractArchiveAdaptor<Archive> {
  public RarArchiveAdaptor() {
    super("cbr");
  }

  @Override
  protected void closeArchive(Archive archiveReference) throws ArchiveAdaptorException {
    try {
      archiveReference.close();
    } catch (IOException error) {
      throw new ArchiveAdaptorException("Error while closing archive", error);
    }
  }

  @Override
  protected List<String> getEntryFilenames(Archive archiveReference) {
    List<String> result = new ArrayList<>();
    List<FileHeader> fileHeaders = archiveReference.getFileHeaders();

    for (FileHeader fileHeader : fileHeaders) {
      result.add(fileHeader.getFileNameString());
    }

    return result;
  }

  @Override
  protected void loadAllFiles(Comic comic, Archive archiveReference)
      throws ArchiveAdaptorException {
    comic.setArchiveType(ArchiveType.CBR);
    List<FileHeader> fileHeaders = archiveReference.getFileHeaders();

    for (FileHeader fileHeader : fileHeaders) {
      String filename = fileHeader.getFileNameString();
      long fileSize = fileHeader.getFullUnpackSize();
      byte[] content = new byte[0];
      try {
        content = this.loadContent(filename, fileSize, archiveReference.getInputStream(fileHeader));
      } catch (IOException | RarException error) {
        throw new ArchiveAdaptorException("Failed to load entry: " + filename, error);
      }
      this.processContent(comic, filename, content);
    }
  }

  @Override
  protected byte[] loadSingleFileInternal(Archive archiveReference, String entryName)
      throws ArchiveAdaptorException {
    byte[] result = null;
    List<FileHeader> fileHeaders = archiveReference.getFileHeaders();

    for (FileHeader fileHeader : fileHeaders) {
      try {
        byte[] content =
            this.loadContent(
                fileHeader.getFileNameString(),
                fileHeader.getFullUnpackSize(),
                archiveReference.getInputStream(fileHeader));

        if (fileHeader.getFileNameString().equals(entryName)) {
          result = content;
          break;
        }
      } catch (IOException | RarException error) {
        throw new ArchiveAdaptorException(
            "Error loading archive content: entry=" + fileHeader.getFileNameString(), error);
      }
    }

    return result;
  }

  @Override
  protected Archive openArchive(File comicFile) throws ArchiveAdaptorException {
    Archive archive = null;

    try {
      archive = new Archive(new FileVolumeManager(comicFile));
      FileHeader entry = archive.nextFileHeader();

      if (entry == null) {
        archive.close();
        throw new ArchiveAdaptorException("Invalid or corrupt RAR file: " + comicFile.getName());
      }
    } catch (IOException | RarException error) {
      throw new ArchiveAdaptorException(
          "Unable to open archive: " + comicFile.getAbsolutePath(), error);
    }

    return archive;
  }

  @Override
  void saveComicInternal(Comic source, String filename, boolean renamePages)
      throws ArchiveAdaptorException {
    log.warn("Saving RAR comics is not supported");
    throw new ArchiveAdaptorException("Saving CBR comics is not supported");
  }
}

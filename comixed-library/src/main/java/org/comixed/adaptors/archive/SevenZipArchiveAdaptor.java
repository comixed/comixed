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

package org.comixed.adaptors.archive;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.compress.archivers.sevenz.SevenZArchiveEntry;
import org.apache.commons.compress.archivers.sevenz.SevenZFile;
import org.apache.commons.compress.archivers.sevenz.SevenZMethod;
import org.apache.commons.compress.archivers.sevenz.SevenZOutputFile;
import org.comixed.adaptors.ArchiveType;
import org.comixed.model.library.Comic;
import org.comixed.model.library.Page;
import org.springframework.stereotype.Component;

/**
 * <code>SevenZipArchiveAdaptor</code> provides support for reading 7Z encoded comics.
 *
 * @author Darryl L. Pierce
 */
@Component
public class SevenZipArchiveAdaptor extends AbstractArchiveAdaptor<SevenZFile> {

  public SevenZipArchiveAdaptor() {
    super("cb7");
  }

  private void addFileToArchive(SevenZOutputFile archive, String filename, byte[] content)
      throws IOException {
    this.logger.debug("Saving file to archive: " + filename + " [size=" + content.length + "]");

    File tempFile = File.createTempFile("comixed", "tmp");
    this.logger.debug("Saving entry as temporary filename: " + tempFile.getAbsolutePath());
    FileOutputStream output = null;

    try {
      output = new FileOutputStream(tempFile);
      output.write(content, 0, content.length);
    } finally {
      if (output != null) {
        output.close();
      }
    }

    this.logger.debug("Adding temporary file to archive");
    SevenZArchiveEntry entry = archive.createArchiveEntry(tempFile, filename);
    archive.putArchiveEntry(entry);
    archive.write(content);
    archive.closeArchiveEntry();

    this.logger.debug("Cleaning up the temporary file");
    tempFile.delete();
  }

  @Override
  protected void closeArchive(SevenZFile archiveReference) throws ArchiveAdaptorException {
    try {
      archiveReference.close();
    } catch (IOException error) {
      throw new ArchiveAdaptorException("Failed to close 7zip archive", error);
    }
  }

  @Override
  protected List<String> getEntryFilenames(SevenZFile archiveReference) {
    List<String> entryFilenames = new ArrayList<>();
    Iterable<SevenZArchiveEntry> entries = archiveReference.getEntries();

    for (SevenZArchiveEntry entry : entries) {
      entryFilenames.add(entry.getName());
    }

    return entryFilenames;
  }

  @Override
  protected void loadAllFiles(Comic comic, SevenZFile archiveReference)
      throws ArchiveAdaptorException {
    this.logger.debug("Processing entries for archive");
    comic.setArchiveType(ArchiveType.CB7);
    boolean done = false;

    while (!done) {
      SevenZArchiveEntry entry = null;

      try {
        entry = archiveReference.getNextEntry();
      } catch (IOException error) {
        throw new ArchiveAdaptorException("Failed to get next archive entry", error);
      }

      if (entry != null) {
        String filename = entry.getName();
        long fileSize = entry.getSize();
        byte[] content = new byte[(int) fileSize];
        try {
          archiveReference.read(content, 0, (int) fileSize);
          this.processContent(comic, filename, content);
        } catch (IOException error) {
          throw new ArchiveAdaptorException("Failed to load entry: " + filename, error);
        }
      } else {
        done = true;
      }
    }
  }

  @Override
  protected byte[] loadSingleFileInternal(SevenZFile archiveReference, String entryName)
      throws ArchiveAdaptorException {
    byte[] result = null;

    try {
      boolean done = false;
      SevenZArchiveEntry entry = archiveReference.getNextEntry();

      while (!done && (entry != null)) {
        byte[] content = new byte[(int) entry.getSize()];

        archiveReference.read(content, 0, (int) entry.getSize());

        if (entry.getName().equals(entryName)) {
          result = content;
          done = true;
        } else {
          entry = archiveReference.getNextEntry();
        }
      }
    } catch (IOException error) {
      throw new ArchiveAdaptorException("Error reading entry", error);
    }

    return result;
  }

  @Override
  protected SevenZFile openArchive(File comicFile) throws ArchiveAdaptorException {
    try {
      return new SevenZFile(comicFile);
    } catch (IOException error) {
      throw new ArchiveAdaptorException(
          "Unable to open 7zip archive: " + comicFile.getAbsolutePath(), error);
    }
  }

  @Override
  void saveComicInternal(Comic source, String filename, boolean renamePages)
      throws ArchiveAdaptorException, IOException {
    this.logger.debug("Creating temporary file: " + filename);
    SevenZOutputFile sevenzcomic = null;

    try {
      sevenzcomic = new SevenZOutputFile(new File(filename));
      sevenzcomic.setContentCompression(SevenZMethod.LZMA2);

      this.logger.debug("Adding the ComicInfo.xml entry");

      this.addFileToArchive(
          sevenzcomic, "ComicInfo.xml", this.comicInfoEntryAdaptor.saveContent(source));

      for (int index = 0; index < source.getPageCount(); index++) {
        Page page = source.getPage(index);
        if (page.isMarkedDeleted()) {
          this.logger.debug("Skipping offset marked for deletion");
          continue;
        }
        String pagename =
            renamePages ? this.getFilenameForEntry(page.getFilename(), index) : page.getFilename();
        this.logger.debug("Adding entry: " + pagename);
        this.addFileToArchive(sevenzcomic, pagename, page.getContent());
      }
    } catch (IOException error) {
      throw new ArchiveAdaptorException("error creating comic archive", error);
    } finally {
      if (sevenzcomic != null) {
        sevenzcomic.finish();
        sevenzcomic.close();
      }
    }
  }
}

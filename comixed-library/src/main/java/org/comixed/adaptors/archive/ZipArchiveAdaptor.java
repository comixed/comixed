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

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.compress.archivers.ArchiveException;
import org.apache.commons.compress.archivers.ArchiveStreamFactory;
import org.apache.commons.compress.archivers.zip.ZipArchiveEntry;
import org.apache.commons.compress.archivers.zip.ZipArchiveOutputStream;
import org.apache.commons.compress.archivers.zip.ZipFile;
import org.comixed.adaptors.ArchiveType;
import org.comixed.model.library.Comic;
import org.comixed.model.library.Page;
import org.springframework.stereotype.Component;

/**
 * <code>ZipArchiveAdaptor</code> provides a concrete implementation of {@link ArchiveAdaptor} for
 * ZIP files.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ZipArchiveAdaptor extends AbstractArchiveAdaptor<ZipFile> {
  public ZipArchiveAdaptor() {
    super("cbz");
  }

  @Override
  protected void closeArchive(ZipFile archiveReference) throws ArchiveAdaptorException {
    try {
      archiveReference.close();
    } catch (IOException error) {
      throw new ArchiveAdaptorException("Failure closing archive", error);
    }
  }

  @Override
  protected List<String> getEntryFilenames(ZipFile archiveReference) {
    Enumeration<ZipArchiveEntry> entries = archiveReference.getEntries();
    List<String> entryNames = new ArrayList<>();

    while (entries.hasMoreElements()) {
      entryNames.add(entries.nextElement().getName());
    }

    return entryNames;
  }

  @Override
  protected void loadAllFiles(Comic comic, ZipFile archiveReference)
      throws ArchiveAdaptorException {
    this.log.debug("Processing entries for archive");
    comic.setArchiveType(ArchiveType.CBZ);

    Enumeration<ZipArchiveEntry> entries = archiveReference.getEntries();

    while (entries.hasMoreElements()) {
      ZipArchiveEntry entry = entries.nextElement();
      String filename = entry.getName();
      long fileSize = entry.getSize();
      this.log.debug("Loading file: name={} size={}", filename, fileSize);

      long started = System.currentTimeMillis();
      try {
        byte[] content =
            this.loadContent(filename, fileSize, archiveReference.getInputStream(entry));
        this.processContent(comic, filename, content);
      } catch (IOException error) {
        throw new ArchiveAdaptorException("failed to load entry: " + filename, error);
      }
      this.log.debug("Processing time: {}ms", (System.currentTimeMillis() - started));
    }
  }

  @Override
  protected byte[] loadSingleFileInternal(ZipFile archiveReference, String entryFilename)
      throws ArchiveAdaptorException {
    boolean done = false;
    Enumeration<ZipArchiveEntry> entries = archiveReference.getEntries();
    byte[] result = null;

    while (!done && entries.hasMoreElements()) {
      ZipArchiveEntry entry = entries.nextElement();

      try {
        // load the element's content
        byte[] content =
            this.loadContent(
                entryFilename, entry.getSize(), archiveReference.getInputStream(entry));

        if (entry.getName().equals(entryFilename)) {
          result = content;
          done = true;
        }
      } catch (IOException error) {
        throw new ArchiveAdaptorException("Error loading archive entry: " + entryFilename, error);
      }
    }

    return result;
  }

  @Override
  protected ZipFile openArchive(File comicFile) throws ArchiveAdaptorException {
    try {
      return new ZipFile(comicFile);
    } catch (IOException error) {
      throw new ArchiveAdaptorException(
          "Unable to open comic file: " + comicFile.getAbsolutePath(), error);
    }
  }

  @Override
  void saveComicInternal(Comic source, String filename, boolean renamePages)
      throws ArchiveAdaptorException, IOException {
    this.log.debug("Creating temporary file: " + filename);

    ZipArchiveOutputStream zoutput = null;
    try {
      ZipArchiveEntry entry;

      zoutput =
          (ZipArchiveOutputStream)
              new ArchiveStreamFactory()
                  .createArchiveOutputStream(
                      ArchiveStreamFactory.ZIP, new FileOutputStream(filename));

      this.log.debug("Adding the ComicInfo.xml entry");
      entry = new ZipArchiveEntry("ComicInfo.xml");
      byte[] content = comicInfoEntryAdaptor.saveContent(source);
      entry.setSize(content.length);
      zoutput.putArchiveEntry(entry);
      zoutput.write(content);
      zoutput.closeArchiveEntry();

      for (int index = 0; index < source.getPageCount(); index++) {
        Page page = source.getPage(index);
        if (page.isMarkedDeleted()) {
          this.log.debug("Skipping offset marked for deletion");
          continue;
        }
        String pagename =
            renamePages ? getFilenameForEntry(page.getFilename(), index) : page.getFilename();
        this.log.debug("Adding entry: " + pagename + " size=" + page.getContent().length);
        entry = new ZipArchiveEntry(pagename);
        entry.setSize(page.getContent().length);
        zoutput.putArchiveEntry(entry);
        zoutput.write(page.getContent());
        zoutput.closeArchiveEntry();
      }
    } catch (IOException | ArchiveException error) {
      throw new ArchiveAdaptorException("error creating comic archive", error);
    } finally {
      if (zoutput != null) {
        zoutput.finish();
        zoutput.close();
      }
    }
  }

  @Override
  public byte[] encodeFileToStream(Map<String, byte[]> content)
      throws ArchiveAdaptorException, IOException {
    this.log.debug("Encoding {} files", content.size());

    ByteArrayOutputStream result = new ByteArrayOutputStream();
    ZipArchiveOutputStream zoutput = null;

    try {
      zoutput =
          (ZipArchiveOutputStream)
              new ArchiveStreamFactory()
                  .createArchiveOutputStream(ArchiveStreamFactory.ZIP, result);
      ZipArchiveEntry zipEntry = null;

      for (String filename : content.keySet()) {
        this.log.debug("Adding entry: {}", filename);

        byte[] entryData = content.get(filename);
        zipEntry = new ZipArchiveEntry(filename);

        this.log.debug("Encoding {} bytes", entryData.length);
        zipEntry.setSize(entryData.length);
        zoutput.putArchiveEntry(zipEntry);
        zoutput.write(entryData);
        zoutput.closeArchiveEntry();
      }
    } catch (IOException | ArchiveException error) {
      throw new ArchiveAdaptorException("failed to encode files", error);
    } finally {
      if (zoutput != null) {
        zoutput.finish();
        zoutput.close();
      }
    }

    this.log.debug("Encoding to {} bytes", result.size());

    return result.toByteArray();
  }
}

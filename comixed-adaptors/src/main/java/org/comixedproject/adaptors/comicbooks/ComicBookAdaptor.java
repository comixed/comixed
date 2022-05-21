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

package org.comixedproject.adaptors.comicbooks;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import lombok.NonNull;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.compress.utils.FileNameUtils;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.StringUtils;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.adaptors.archive.model.ArchiveEntryType;
import org.comixedproject.adaptors.archive.model.ArchiveReadHandle;
import org.comixedproject.adaptors.archive.model.ArchiveWriteHandle;
import org.comixedproject.adaptors.archive.model.ComicArchiveEntry;
import org.comixedproject.adaptors.content.ComicMetadataContentAdaptor;
import org.comixedproject.adaptors.content.ContentAdaptor;
import org.comixedproject.adaptors.content.ContentAdaptorException;
import org.comixedproject.adaptors.file.FileAdaptor;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicpages.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>ComicBookAdaptor</code> provides APIs for working with comic book files.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComicBookAdaptor {
  @Autowired private FileTypeAdaptor fileTypeAdaptor;
  @Autowired private ComicFileAdaptor comicFileAdaptor;
  @Autowired private ComicPageAdaptor comicPageAdaptor;
  @Autowired private ComicMetadataContentAdaptor comicMetadataContentAdaptor;
  @Autowired private FileAdaptor fileAdaptor;

  /**
   * Creates a new comic. Determines the archive type for the underlying file.
   *
   * @param filename the comic filename
   * @return the comic
   * @throws AdaptorException if an archive error occurs
   */
  public ComicBook createComic(final String filename) throws AdaptorException {
    log.trace("Getting archive adaptor for comic file");
    final ArchiveAdaptor archiveAdaptor = this.fileTypeAdaptor.getArchiveAdaptorFor(filename);
    log.trace("Creating comic: {}", filename);
    return new ComicBook(filename, archiveAdaptor.getArchiveType());
  }

  /**
   * Loads the contents of the specified comicBook.
   *
   * @param comicBook the comicBook
   * @throws AdaptorException if an error occurs while loading the comicBook file
   */
  public void load(final ComicBook comicBook) throws AdaptorException {
    try {
      log.trace("Getting archive adaptor for comicBook file");
      final ArchiveAdaptor archiveAdaptor =
          this.fileTypeAdaptor.getArchiveAdaptorFor(comicBook.getFilename());
      log.trace("Opening comicBook file");
      final ArchiveReadHandle readHandle =
          archiveAdaptor.openArchiveForRead(comicBook.getFilename());
      log.trace("Loading comicBook file entries");
      final List<ComicArchiveEntry> entries = archiveAdaptor.getEntries(readHandle);
      for (int index = 0; index < entries.size(); index++) {
        final ComicArchiveEntry entry = entries.get(index);
        log.trace("Loading entry content: {}", entry.getFilename());
        final byte[] content = archiveAdaptor.readEntry(readHandle, entry.getFilename());
        log.trace("Getting content adaptor");
        final ContentAdaptor adaptor = this.fileTypeAdaptor.getContentAdaptorFor(content);
        if (adaptor != null) {
          log.trace("Invoking content adaptor");
          adaptor.loadContent(comicBook, entry.getFilename(), content);
        }
      }
      log.trace("Closing comicBook file");
      archiveAdaptor.closeArchiveForRead(readHandle);
    } catch (AdaptorException | ArchiveAdaptorException | ContentAdaptorException error) {
      throw new AdaptorException("Failed to load comicBook file", error);
    }
  }

  /**
   * Saves the comicBook using the supplied archive format. Removes deleted pages if the flag is
   * set. Renames pages if the flag is set.
   *
   * @param comicBook the comicBook
   * @param targetArchiveType the target format
   * @param removeDeletedPages remove deleted pages flag
   * @param pageRenamingRule the page renaming rule
   * @throws AdaptorException if an error occurs
   */
  public void save(
      final ComicBook comicBook,
      final ArchiveType targetArchiveType,
      final boolean removeDeletedPages,
      final String pageRenamingRule)
      throws AdaptorException {
    try {
      final ArchiveAdaptor sourceArchive =
          this.fileTypeAdaptor.getArchiveAdaptorFor(comicBook.getFilename());
      final ArchiveAdaptor destinationArchive =
          this.fileTypeAdaptor.getArchiveAdaptorFor(targetArchiveType);

      if (removeDeletedPages) {
        log.trace("Removing deleted pages from comicBook");
        comicBook.removeDeletedPages();
      }

      log.trace("Preparing to save comicBook file");
      final ArchiveReadHandle readHandle =
          sourceArchive.openArchiveForRead(comicBook.getFilename());

      final String temporaryFilename =
          File.createTempFile(
                  "comixed", targetArchiveType.getExtension(), FileUtils.getTempDirectory())
              .getAbsolutePath();

      final ArchiveWriteHandle writeHandle =
          destinationArchive.openArchiveForWrite(temporaryFilename);

      log.trace("Writing comic book metadata");
      destinationArchive.writeEntry(
          writeHandle, "ComicInfo.xml", this.comicMetadataContentAdaptor.createContent(comicBook));

      log.trace("Writing comicBook pages");
      final int length = String.valueOf(comicBook.getPages().size()).length();
      for (int index = 0; index < comicBook.getPages().size(); index++) {
        final Page page = comicBook.getPages().get(index);
        log.trace("Reading comicBook page content: {}", page.getFilename());
        final byte[] content = sourceArchive.readEntry(readHandle, page.getFilename());
        @NonNull String pageFilename = page.getFilename();
        if (StringUtils.isNotEmpty(pageRenamingRule)) {
          pageFilename =
              this.comicPageAdaptor.createFilenameFromRule(page, pageRenamingRule, index, length);
        }
        log.trace("Writing comicBook page content: {}", pageFilename);
        destinationArchive.writeEntry(writeHandle, pageFilename, content);
      }

      log.trace("Closing archives");
      sourceArchive.closeArchiveForRead(readHandle);
      destinationArchive.closeArchiveForWrite(writeHandle);

      log.trace("Replacing original file");
      this.fileAdaptor.deleteFile(comicBook.getFile());
      final String directory = comicBook.getFile().getAbsoluteFile().getParent();
      final String destinationFilename =
          this.comicFileAdaptor.findAvailableFilename(
              comicBook.getFilename(),
              directory + File.separator + FileNameUtils.getBaseName(comicBook.getFilename()),
              0,
              targetArchiveType.getExtension());
      log.trace("Copying file: {} => {}", temporaryFilename, destinationFilename);
      this.fileAdaptor.moveFile(new File(temporaryFilename), new File(destinationFilename));
      log.trace("Updating filename: {}", destinationFilename);
      comicBook.setFilename(destinationFilename);
      log.debug("Assigning archive type to comicBook: {}", targetArchiveType);
      comicBook.setArchiveType(targetArchiveType);
    } catch (AdaptorException
        | ArchiveAdaptorException
        | IOException
        | ContentAdaptorException error) {
      throw new AdaptorException("Failed to save comicBook file", error);
    }
  }

  /**
   * Retrieves the content for the specified page.
   *
   * @param comicBook the comicBook
   * @param pageNumber the page number
   * @return the page content
   * @throws AdaptorException if an error occurs loading the page
   */
  public byte[] loadPageContent(final ComicBook comicBook, final int pageNumber)
      throws AdaptorException {
    try {
      log.trace("Getting archive adaptor for comicBook file");
      final ArchiveAdaptor archiveAdaptor =
          this.fileTypeAdaptor.getArchiveAdaptorFor(comicBook.getFilename());
      log.trace("Opening archive");
      final ArchiveReadHandle readHandle =
          archiveAdaptor.openArchiveForRead(comicBook.getFilename());
      log.trace("Loading page content");
      final byte[] content =
          archiveAdaptor.readEntry(readHandle, comicBook.getPages().get(pageNumber).getFilename());
      log.trace("Closing archive");
      archiveAdaptor.closeArchiveForRead(readHandle);
      log.trace("Returning {} bytes", content.length);
      return content;
    } catch (AdaptorException | ArchiveAdaptorException error) {
      throw new AdaptorException("Failed to load page content", error);
    }
  }

  /**
   * Loads the first image from the specified file.
   *
   * @param filename the filename
   * @return the image content
   * @throws AdaptorException if an error occurs loading the cover
   */
  public byte[] loadCover(final String filename) throws AdaptorException {
    try {
      byte[] result = null;
      log.trace("Getting archive adaptor for file");
      final ArchiveAdaptor archiveAdaptor = this.fileTypeAdaptor.getArchiveAdaptorFor(filename);
      log.trace("Opening archive");
      final ArchiveReadHandle readHandle = archiveAdaptor.openArchiveForRead(filename);
      log.trace("Loading archive entries");
      final List<ComicArchiveEntry> entries = archiveAdaptor.getEntries(readHandle);
      log.trace("Finding first image in file");
      final Optional<ComicArchiveEntry> entry =
          entries.stream()
              .filter(
                  comicArchiveEntry ->
                      comicArchiveEntry.getArchiveEntryType() == ArchiveEntryType.IMAGE)
              .findFirst();
      if (entry.isPresent()) {
        result = archiveAdaptor.readEntry(readHandle, entry.get().getFilename());
      }
      log.trace("Closing archive");
      archiveAdaptor.closeArchiveForRead(readHandle);
      log.trace("Returning content: length={}", result != null ? result.length : 0);
      return result;
    } catch (AdaptorException | ArchiveAdaptorException error) {
      throw new AdaptorException("Failed to load page content", error);
    }
  }
}

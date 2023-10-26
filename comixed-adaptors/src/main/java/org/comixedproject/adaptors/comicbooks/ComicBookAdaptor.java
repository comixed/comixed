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

import java.io.*;
import java.util.List;
import java.util.Optional;
import lombok.NonNull;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.compress.utils.FileNameUtils;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
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
import org.comixedproject.adaptors.content.ContentAdaptorRules;
import org.comixedproject.adaptors.file.FileAdaptor;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
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
    log.trace("Getting archive adaptor for comic file: {}", filename);
    final ArchiveAdaptor archiveAdaptor = this.fileTypeAdaptor.getArchiveAdaptorFor(filename);
    log.trace("Creating comic: {}", filename);
    final ComicBook result = new ComicBook();
    log.trace("Creating comic detail");
    result.setComicDetail(new ComicDetail(result, filename, archiveAdaptor.getArchiveType()));
    return result;
  }

  /**
   * Loads the contents of the specified comicBook.
   *
   * @param comicBook the comic book
   * @param rules the content adaptor ruleset
   * @throws AdaptorException if an error occurs while loading the comic book file
   */
  public void load(final ComicBook comicBook, final ContentAdaptorRules rules)
      throws AdaptorException {
    try {
      log.trace(
          "Getting archive adaptor for comic book file: id={} rule={}",
          comicBook.getId(),
          rules.toString());
      final ArchiveAdaptor archiveAdaptor =
          this.fileTypeAdaptor.getArchiveAdaptorFor(comicBook.getComicDetail().getFilename());
      log.trace("Opening comic book file");
      final ArchiveReadHandle readHandle =
          archiveAdaptor.openArchiveForRead(comicBook.getComicDetail().getFilename());
      log.trace("Loading comic book file entries");
      final List<ComicArchiveEntry> entries = archiveAdaptor.getEntries(readHandle);
      for (int index = 0; index < entries.size(); index++) {
        final ComicArchiveEntry entry = entries.get(index);
        log.trace("Loading entry content: {}", entry.getFilename());
        final byte[] content = archiveAdaptor.readEntry(readHandle, entry.getFilename());
        if (content.length > 0) {
          log.trace("Getting content adaptor for entry: {}", entry.getFilename());
          final ContentAdaptor adaptor = this.fileTypeAdaptor.getContentAdaptorFor(content);
          if (adaptor != null) {
            log.trace("Invoking content adaptor");
            adaptor.loadContent(comicBook, entry.getFilename(), content, rules);
          }
        } else {
          log.trace("Content contains no data");
        }
      }
      log.trace("Closing comic book file");
      archiveAdaptor.closeArchiveForRead(readHandle);
    } catch (AdaptorException | ArchiveAdaptorException | ContentAdaptorException error) {
      throw new AdaptorException("Failed to load comic book file", error);
    }
  }

  /**
   * Saves the comic book using the supplied archive format. Removes deleted pages if the flag is
   * set. Renames pages if the flag is set.
   *
   * @param comicBook the comic book
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
    log.trace(
        "Saving comic book file: filename={} archive type={} remove deleted pages={} page renaming rule={}",
        comicBook.getComicDetail().getFilename(),
        targetArchiveType,
        removeDeletedPages,
        pageRenamingRule);
    try {
      final ArchiveAdaptor sourceArchive =
          this.fileTypeAdaptor.getArchiveAdaptorFor(comicBook.getComicDetail().getFilename());
      final ArchiveAdaptor destinationArchive =
          this.fileTypeAdaptor.getArchiveAdaptorFor(targetArchiveType);

      if (removeDeletedPages) {
        log.trace("Removing deleted pages from comic book");
        comicBook.removeDeletedPages();
      }

      log.trace("Preparing to save comic book file");
      final ArchiveReadHandle readHandle =
          sourceArchive.openArchiveForRead(comicBook.getComicDetail().getFilename());

      final String temporaryFilename =
          File.createTempFile(
                  "comixed", targetArchiveType.getExtension(), FileUtils.getTempDirectory())
              .getAbsolutePath();

      final ArchiveWriteHandle writeHandle =
          destinationArchive.openArchiveForWrite(temporaryFilename);

      log.trace("Writing comic book metadata");
      destinationArchive.writeEntry(
          writeHandle, "ComicInfo.xml", this.comicMetadataContentAdaptor.createContent(comicBook));

      log.trace("Writing comic book pages");
      final int length = String.valueOf(comicBook.getPages().size()).length();
      for (int index = 0; index < comicBook.getPages().size(); index++) {
        final Page page = comicBook.getPages().get(index);
        log.trace("Reading comic book page content: {}", page.getFilename());
        final byte[] content = sourceArchive.readEntry(readHandle, page.getFilename());
        @NonNull String pageFilename = page.getFilename();
        if (StringUtils.isNotEmpty(pageRenamingRule)) {
          pageFilename =
              this.comicPageAdaptor.createFilenameFromRule(page, pageRenamingRule, index, length);
        }
        log.trace("Writing comic book page content: {}", pageFilename);
        destinationArchive.writeEntry(writeHandle, pageFilename, content);
      }

      log.trace("Closing archives");
      sourceArchive.closeArchiveForRead(readHandle);
      destinationArchive.closeArchiveForWrite(writeHandle);

      final String comicDetailFilename = comicBook.getComicDetail().getFile().getAbsolutePath();
      final String temporaryDeleteFilename = comicDetailFilename + "-deleted";
      log.trace(
          "Moving original file to temporary file: {} => {}",
          comicDetailFilename,
          temporaryDeleteFilename);
      this.fileAdaptor.moveFile(
          comicBook.getComicDetail().getFile(), new File(temporaryDeleteFilename));
      log.trace("Replacing original file");
      final String directory = comicBook.getComicDetail().getFile().getAbsoluteFile().getParent();
      final String newComicDetailFilename =
          this.comicFileAdaptor.findAvailableFilename(
              comicBook.getComicDetail().getFilename(),
              directory
                  + File.separator
                  + FileNameUtils.getBaseName(comicBook.getComicDetail().getFilename()),
              0,
              targetArchiveType.getExtension());
      log.trace("Updating filename: {}", newComicDetailFilename);
      comicBook.getComicDetail().setFilename(newComicDetailFilename);
      log.trace("Moving file: {} => {}", temporaryFilename, newComicDetailFilename);
      this.fileAdaptor.moveFile(new File(temporaryFilename), comicBook.getComicDetail().getFile());
      log.trace("Assigning archive type to comic book: {}", targetArchiveType);
      comicBook.getComicDetail().setArchiveType(targetArchiveType);
      log.trace("Deleting temporary file: {}", temporaryDeleteFilename);
      this.fileAdaptor.deleteFile(new File(temporaryDeleteFilename));
    } catch (AdaptorException
        | ArchiveAdaptorException
        | IOException
        | ContentAdaptorException error) {
      throw new AdaptorException("Failed to save comic book file", error);
    }
  }

  /**
   * Writes the comic's metadata to a separate file. The file's name is based on that of the comic,
   * but with an extension of ".xml".
   *
   * @param comicBook the comic book
   * @throws AdaptorException if an error occurs while writing the file
   */
  public void saveMetadataFile(final ComicBook comicBook) throws AdaptorException {
    final String filename = this.getMetadataFilename(comicBook);
    log.trace(
        "Creating external metadata file for comic: id={} filename={}",
        comicBook.getId(),
        filename);
    try (OutputStream outstream = new FileOutputStream(new File(filename), false)) {
      log.trace("Writing metadata content");
      outstream.write(this.comicMetadataContentAdaptor.createContent(comicBook));
    } catch (IOException | ContentAdaptorException error) {
      throw new AdaptorException("failed to write metadata file: " + filename, error);
    }
  }

  public void deleteMetadataFile(final ComicBook comicBook) {
    final String filename = this.getMetadataFilename(comicBook);
    log.trace("Deleting external metadata file (if exists): {}", filename);
    this.fileAdaptor.deleteFile(new File(filename));
  }

  /**
   * Returns the external metadata filename for the given comic book.
   *
   * @param comicBook the comic book
   * @return the metadata filename
   */
  public String getMetadataFilename(ComicBook comicBook) {
    log.trace("Getting external metadata filename for comic book: id={}", comicBook.getId());
    return String.format(
        "%s.xml", FilenameUtils.removeExtension(comicBook.getComicDetail().getFilename()));
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
      log.trace("Getting archive adaptor for comic book file");
      final ArchiveAdaptor archiveAdaptor =
          this.fileTypeAdaptor.getArchiveAdaptorFor(comicBook.getComicDetail().getFilename());
      log.trace("Opening archive");
      final ArchiveReadHandle readHandle =
          archiveAdaptor.openArchiveForRead(comicBook.getComicDetail().getFilename());
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

  /**
   * Loads the content of a given file, by name.
   *
   * @param comicBook the comic book
   * @param entryName the filename
   * @return the content, or null if the file does not exist
   * @throws AdaptorException if an error occurs
   */
  public byte[] loadFile(final ComicBook comicBook, final String entryName)
      throws AdaptorException {
    log.trace(
        "Loading comic book file: file={} entry={}",
        comicBook.getComicDetail().getFilename(),
        entryName);
    byte[] result = null;
    try {
      log.trace("Getting archive adaptor for comic book");
      final ArchiveAdaptor archiveAdaptor =
          this.fileTypeAdaptor.getArchiveAdaptorFor(comicBook.getComicDetail().getArchiveType());
      log.trace("Opening comic book file");
      final ArchiveReadHandle readHandle =
          archiveAdaptor.openArchiveForRead(comicBook.getComicDetail().getFilename());
      log.trace("Loading comic book file entries");
      final List<ComicArchiveEntry> entries = archiveAdaptor.getEntries(readHandle);
      for (int index = 0; index < entries.size(); index++) {
        final ComicArchiveEntry entry = entries.get(index);
        log.trace("Loading entry content: {}", entry.getFilename());
        result = archiveAdaptor.readEntry(readHandle, entry.getFilename());
        if (entry.getFilename().equals(entryName)) {
          log.trace("File content found");
          break;
        }
        // reset the result value
        result = null;
      }
      log.trace("Closing comic book file");
      archiveAdaptor.closeArchiveForRead(readHandle);
    } catch (AdaptorException | ArchiveAdaptorException error) {
      throw new AdaptorException("Failed to load comic book file", error);
    }
    return result;
  }
}

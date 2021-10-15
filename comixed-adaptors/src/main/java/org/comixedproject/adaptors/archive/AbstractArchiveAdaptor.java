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

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.compress.archivers.ArchiveException;
import org.apache.commons.compress.utils.IOUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang.StringUtils;
import org.codehaus.plexus.util.FileUtils;
import org.comixedproject.adaptors.comicbooks.ComicFileAdaptor;
import org.comixedproject.adaptors.comicbooks.ComicInfoEntryAdaptor;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.adaptors.handlers.ComicFileHandler;
import org.comixedproject.adaptors.handlers.ComicFileHandlerException;
import org.comixedproject.adaptors.loaders.EntryLoader;
import org.comixedproject.adaptors.loaders.EntryLoaderException;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicFileEntry;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

/**
 * <code>AbstractArchiveAdaptor</code> provides a foundation for creating new instances of {@link
 * ArchiveAdaptor}.
 *
 * @param <I> the archive iterator type
 * @author Darryl L. Pierce
 */
@Component
@EnableConfigurationProperties
@PropertySource("entryloaders.properties")
@ConfigurationProperties(prefix = "comic.entry", ignoreUnknownFields = false)
@Log4j2
@RequiredArgsConstructor
public abstract class AbstractArchiveAdaptor<I> implements ArchiveAdaptor, InitializingBean {
  @Autowired private ApplicationContext context;
  @Autowired protected FileTypeAdaptor fileTypeAdaptor;
  @Autowired protected ComicInfoEntryAdaptor comicInfoEntryAdaptor;
  @Autowired protected ComicFileHandler comicFileHandler;
  @Autowired private ComicFileAdaptor comicFileAdaptor;

  @Getter @NonNull private String defaultExtension;
  @Getter protected List<EntryLoaderForType> loaders = new ArrayList<>();

  protected Map<String, EntryLoader> entryLoaders = new HashMap<>();
  private Set<String> imageTypes = new HashSet<>();

  @Override
  public void afterPropertiesSet() throws Exception {
    this.entryLoaders.clear();
    this.loaders.stream()
        .filter(EntryLoaderForType::isValid)
        .forEach(
            entry -> {
              if (this.context.containsBean(entry.getBean())) {
                this.entryLoaders.put(
                    entry.getType(), (EntryLoader) this.context.getBean(entry.getBean()));
                if (entry.getEntryType() == ArchiveEntryType.IMAGE) {
                  log.trace("Adding image adaptor: {}={}", entry.getEntryType(), entry.getBean());
                  this.imageTypes.add(entry.getType());
                }
              } else {
                log.trace("No such entry adaptor bean: {}", entry.getBean());
              }
            });
  }

  /**
   * Closes the specified archive file.
   *
   * @param archiveReference the archive reference
   * @throws ArchiveAdaptorException if an error occurs
   */
  protected abstract void closeArchive(I archiveReference) throws ArchiveAdaptorException;

  /**
   * Returns the list of filenames from the archive.
   *
   * @param archiveReference the archive reference
   * @return the list of filenames
   */
  protected abstract List<String> getEntryFilenames(I archiveReference);

  protected String getFilenameForEntry(String filename, int index) {
    return String.format("offset-%03d.%s", index, FileUtils.getExtension(filename));
  }

  protected EntryLoader getLoaderForContent(byte[] content) {
    String type = this.fileTypeAdaptor.subtypeFor(new ByteArrayInputStream(content));

    log.trace("Content type: {}", type);

    return this.entryLoaders.get(type);
  }

  public List<EntryLoaderForType> getLoaders() {
    return this.loaders;
  }

  @Override
  public void loadComic(final Comic comic) throws ArchiveAdaptorException {
    this.doLoadComic(comic, false);
  }

  @Override
  public void fillComic(final Comic comic) throws ArchiveAdaptorException {
    this.doLoadComic(comic, true);
  }

  private void doLoadComic(final Comic comic, final boolean ignoreMetadata)
      throws ArchiveAdaptorException {
    I archiveReference = null;

    log.trace("Reset comic pages");
    comic.getPages().clear();
    log.trace("Preparing to reload file entries");
    comic.getFileEntries().forEach(entry -> entry.setTouched(false));

    log.trace("Processing archive: {}", comic.getFilename());
    long started = System.currentTimeMillis();

    try {
      var comicFile = this.validateFile(comic);
      archiveReference = this.openArchive(comicFile);

      log.trace("Loading entire comic: {}", comic.getFilename());
      this.loadAllFiles(comic, archiveReference, ignoreMetadata);

      log.trace("Removing untouched file entries");
      comic
          .getFileEntries()
          .removeAll(
              comic.getFileEntries().stream()
                  .filter(entry -> entry.isTouched() == false)
                  .collect(Collectors.toList()));
    } finally {
      // clean up
      if (archiveReference != null) {
        log.trace("Closing archive: {}", comic.getFilename());
        this.closeArchive(archiveReference);
      }
      long duration = System.currentTimeMillis() - started;
      log.trace("Processing time: {}ms", duration);
    }
  }

  protected abstract void loadAllFiles(
      final Comic comic, final I archiveReference, final boolean ignoreMetadata)
      throws ArchiveAdaptorException;

  protected byte[] loadContent(final String filename, final long size, final InputStream input)
      throws IOException {
    log.trace("Loading entry: name={} size={}", filename, size);
    var content = new byte[(int) size];

    IOUtils.readFully(input, content);

    return content;
  }

  @Override
  public byte[] loadSingleFile(Comic comic, String entryName) throws ArchiveAdaptorException {
    log.trace("Loading single entry from comic: comic={} entry={}", comic.getFilename(), entryName);

    return this.loadSingleFile(comic.getFilename(), entryName);
  }

  @Override
  public byte[] loadSingleFile(String filename, String entryName) throws ArchiveAdaptorException {
    log.trace("Loading single entry from file: filename={} entry={}", filename, entryName);
    var archiveReference = this.openArchive(new File(filename));
    byte[] result = this.loadSingleFileInternal(archiveReference, entryName);
    this.closeArchive(archiveReference);

    return result;
  }

  /**
   * Loads the content for a single entry in the specified archive.
   *
   * @param archiveReference the archive
   * @param entryName the entry filename
   * @return the content of the entry
   * @throws ArchiveAdaptorException if an error occurs
   */
  protected abstract byte[] loadSingleFileInternal(I archiveReference, String entryName)
      throws ArchiveAdaptorException;

  /**
   * Opens the archive, returning an archive reference object.
   *
   * @param comicFile the comic file
   * @return the archive reference object
   * @throws ArchiveAdaptorException if an error occurs
   */
  protected abstract I openArchive(File comicFile) throws ArchiveAdaptorException;

  protected void processContent(
      final Comic comic,
      final String filename,
      final byte[] content,
      final boolean ignoreMetadata) {
    this.recordFileEntry(comic, filename, content);
    EntryLoader loader = this.getLoaderForContent(content);
    if (loader != null) {
      try {
        log.trace("Loading content: filename={} length={}", filename, content.length);
        loader.loadContent(comic, filename, content, ignoreMetadata);
      } catch (EntryLoaderException error) {
        log.error("Error loading content", error);
      }
    } else {
      log.trace("No registered adaptor for type");
    }
  }

  private void recordFileEntry(Comic comic, String filename, byte[] content) {
    final String fileType = this.fileTypeAdaptor.basetypeFor(new ByteArrayInputStream(content));
    final Optional<ComicFileEntry> entry =
        comic.getFileEntries().stream()
            .filter(comicFileEntry -> comicFileEntry.getFileName().equals(filename))
            .findFirst();
    if (entry.isPresent()) {
      log.trace("Updating file entry");
      entry.get().setFileSize(content.length);
      entry.get().setFileType(fileType);
      entry.get().setTouched(true);
    } else {
      log.trace("Adding file entry");
      final ComicFileEntry newEntry = new ComicFileEntry(comic, filename, content.length, fileType);
      newEntry.setTouched(true);
      comic.getFileEntries().add(newEntry);
    }
  }

  @Override
  public Comic saveComic(Comic comic, boolean renamePages)
      throws ArchiveAdaptorException, IOException {
    return this.saveComic(comic, renamePages, "");
  }

  protected Comic saveComic(Comic comic, boolean renamePages, String filename)
      throws ArchiveAdaptorException, IOException {
    log.trace("Saving comic: {}", comic.getFilename());

    String tempFilename = filename;
    if (StringUtils.isEmpty(tempFilename)) {
      try {
        tempFilename =
            File.createTempFile(
                    FilenameUtils.removeExtension(comic.getFilename()) + "-temporary", "tmp")
                .getAbsolutePath();
      } catch (IOException error) {
        throw new ArchiveAdaptorException("unable to write comic", error);
      }
    }

    var originalFile = comic.getFile();
    this.saveComicInternal(comic, tempFilename, renamePages);

    log.trace("Deleting original comic file");
    FileUtils.forceDelete(originalFile);

    String targetFilename =
        this.comicFileAdaptor.findAvailableFilename(
            FilenameUtils.removeExtension(comic.getFilename()), 0, this.defaultExtension);
    var sourceFile = new File(tempFilename);
    var targetFile = new File(targetFilename);
    try {
      log.trace("Copying {} to {}", tempFilename, targetFilename);
      FileUtils.copyFile(sourceFile, targetFile);
    } catch (IOException error) {
      throw new ArchiveAdaptorException("Unable to copy file", error);
    }

    comic.setFilename(targetFilename);

    return comic;
  }

  @Override
  public Comic updateComic(final Comic comic) throws ArchiveAdaptorException {
    log.trace("Updating comic: {}", comic.getFilename());

    String tempFilename;
    try {
      tempFilename =
          File.createTempFile(
                  FilenameUtils.removeExtension(comic.getFilename()) + "-temporary", "tmp")
              .getAbsolutePath();

      this.saveComicInternal(comic, tempFilename, false);
    } catch (IOException error) {
      throw new ArchiveAdaptorException("unable to write comic", error);
    }

    var file1 = new File(tempFilename);
    var file2 = new File(comic.getFilename());
    try {
      log.trace("Copying {} to {}", tempFilename, comic.getFilename());
      FileUtils.copyFile(file1, file2);
    } catch (IOException error) {
      throw new ArchiveAdaptorException("Unable to copy file", error);
    }

    try {
      this.comicFileHandler.loadComic(comic);
    } catch (ComicFileHandlerException error) {
      throw new ArchiveAdaptorException("Error loading updated comic", error);
    }

    return comic;
  }

  /**
   * Performs the underlying creation of the new comic.
   *
   * @param source the source comic
   * @param filename the new filename
   * @param renamePages rename pages
   * @throws ArchiveException if an error occurs
   * @throws IOException if an error occurs
   */
  abstract void saveComicInternal(Comic source, String filename, boolean renamePages)
      throws ArchiveAdaptorException, IOException;

  protected File validateFile(Comic comic) throws ArchiveAdaptorException {
    var file = new File(comic.getFilename());

    if (!file.exists())
      throw new ArchiveAdaptorException("File not found: " + file.getAbsolutePath());
    if (file.isDirectory())
      throw new ArchiveAdaptorException("Cannot open directory: " + file.getAbsolutePath());

    return file;
  }

  @Override
  public String getFirstImageFileName(String filename) throws ArchiveAdaptorException {
    var archiveRef = this.openArchive(new File(filename));

    // get the list of entries
    List<String> entries = this.getEntryFilenames(archiveRef);
    String result = null;

    for (String entry : entries) {
      byte[] content = this.loadSingleFileInternal(archiveRef, entry);
      String contentType = this.fileTypeAdaptor.subtypeFor(new ByteArrayInputStream(content));

      if (contentType != null && this.imageTypes.contains(contentType)) {
        result = entry;
        break;
      }
    }

    this.closeArchive(archiveRef);

    return result;
  }

  @Override
  public byte[] encodeFileToStream(Map<String, byte[]> entries)
      throws ArchiveAdaptorException, IOException {
    throw new ArchiveAdaptorException("Not supported");
  }

  protected ArchiveAdaptor getSourceArchiveAdaptor(final String filename)
      throws ArchiveAdaptorException {
    log.trace("Getting archive adaptor for file: {}", filename);
    ArchiveAdaptor result = null;
    try {
      result = this.comicFileHandler.getArchiveAdaptorFor(filename);
    } catch (ComicFileHandlerException error) {
      throw new ArchiveAdaptorException("could not find archive adaptor for comic", error);
    }
    log.trace("Creating temporary file: " + filename);
    return result;
  }
}

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
import lombok.extern.log4j.Log4j2;
import org.apache.commons.compress.archivers.ArchiveException;
import org.apache.commons.compress.utils.IOUtils;
import org.apache.commons.io.FilenameUtils;
import org.codehaus.plexus.util.FileUtils;
import org.comixedproject.adaptors.ComicInfoEntryAdaptor;
import org.comixedproject.handlers.ComicFileHandler;
import org.comixedproject.handlers.ComicFileHandlerException;
import org.comixedproject.loaders.EntryLoader;
import org.comixedproject.loaders.EntryLoaderException;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.utils.ComicFileUtils;
import org.comixedproject.utils.FileTypeIdentifier;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

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
public abstract class AbstractArchiveAdaptor<I> implements ArchiveAdaptor, InitializingBean {
  @Autowired private ApplicationContext context;
  @Autowired protected FileTypeIdentifier fileTypeIdentifier;
  @Autowired protected ComicInfoEntryAdaptor comicInfoEntryAdaptor;
  @Autowired protected ComicFileHandler comicFileHandler;
  protected List<EntryLoaderForType> loaders = new ArrayList<>();

  protected Map<String, EntryLoader> entryLoaders = new HashMap<>();
  private Set<String> imageTypes = new HashSet<>();
  private String defaultExtension;

  public AbstractArchiveAdaptor(String defaultExtension) {
    super();
    this.defaultExtension = defaultExtension;
  }

  @Override
  public void afterPropertiesSet() throws Exception {
    this.entryLoaders.clear();
    for (EntryLoaderForType entry : this.loaders) {
      if (entry.isValid()) {
        if (this.context.containsBean(entry.bean)) {
          this.entryLoaders.put(entry.type, (EntryLoader) this.context.getBean(entry.bean));
          if (entry.entryType == ArchiveEntryType.IMAGE) {
            log.debug("Adding image adaptor: {}={}", entry.entryType, entry.bean);
            this.imageTypes.add(entry.type);
          }
        } else {
          log.debug("No such entry adaptor bean: {}", entry.bean);
        }
      } else {
        if ((entry.type == null) || entry.type.isEmpty()) {
          log.debug("Missing type for entry adaptor");
        }
        if ((entry.bean == null) || entry.bean.isEmpty()) {
          log.debug("Missing bean for entry adaptor");
        }
      }
    }
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
    String type = this.fileTypeIdentifier.subtypeFor(new ByteArrayInputStream(content));

    log.debug("Content type: {}", type);

    return this.entryLoaders.get(type);
  }

  public List<EntryLoaderForType> getLoaders() {
    return this.loaders;
  }

  @Override
  public void loadComic(Comic comic) throws ArchiveAdaptorException {
    I archiveReference = null;

    log.debug("Processing archive: {}", comic.getFilename());
    long started = System.currentTimeMillis();

    try {
      File comicFile = this.validateFile(comic);
      archiveReference = this.openArchive(comicFile);

      log.debug("Loading entire comic: {}", comic.getFilename());
      this.loadAllFiles(comic, archiveReference);
    } finally {
      // clean up
      if (archiveReference != null) {
        log.debug("Closing archive: {}", comic.getFilename());
        this.closeArchive(archiveReference);
      }
      long duration = System.currentTimeMillis() - started;
      log.debug("Processing time: {}ms", duration);
    }
  }

  /**
   * Loads all archive entries.
   *
   * @param comic the comic
   * @param archiveReference the archive
   */
  protected abstract void loadAllFiles(Comic comic, I archiveReference)
      throws ArchiveAdaptorException;

  protected byte[] loadContent(String filename, long size, InputStream input) throws IOException {
    log.debug("Loading entry: name={} size={}", filename, size);
    byte[] content = new byte[(int) size];

    IOUtils.readFully(input, content);

    return content;
  }

  @Override
  public byte[] loadSingleFile(Comic comic, String entryName) throws ArchiveAdaptorException {
    log.debug("Loading single entry from comic: comic={} entry={}", comic.getFilename(), entryName);

    return this.loadSingleFile(comic.getFilename(), entryName);
  }

  @Override
  public byte[] loadSingleFile(String filename, String entryName) throws ArchiveAdaptorException {
    log.debug("Loading single entry from file: filename={} entry={}", filename, entryName);
    I archiveReference = this.openArchive(new File(filename));
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

  protected void processContent(Comic comic, String filename, byte[] content) {
    this.recordFileEntry(comic, filename, content);
    EntryLoader loader = this.getLoaderForContent(content);
    if (loader != null) {
      try {
        log.debug("Loading content: filename={} length={}", filename, content.length);
        loader.loadContent(comic, filename, content);
      } catch (EntryLoaderException error) {
        log.error("Error loading content", error);
      }
    } else {
      log.debug("No registered adaptor for type");
    }
  }

  private void recordFileEntry(Comic comic, String filename, byte[] content) {
    log.debug("Adding file entry");
    comic.addFileEntry(
        filename,
        content.length,
        this.fileTypeIdentifier.basetypeFor(new ByteArrayInputStream(content)));
  }

  @Override
  public Comic saveComic(Comic source, boolean renamePages)
      throws ArchiveAdaptorException, IOException {
    log.debug("Saving comic: {}", source.getFilename());

    String tempFilename;
    try {
      tempFilename =
          File.createTempFile(
                  FilenameUtils.removeExtension(source.getFilename()) + "-temporary", "tmp")
              .getAbsolutePath();
    } catch (IOException error) {
      throw new ArchiveAdaptorException("unable to write comic", error);
    }

    this.saveComicInternal(source, tempFilename, renamePages);

    String filename =
        ComicFileUtils.findAvailableFilename(
            FilenameUtils.removeExtension(source.getFilename()), 0, this.defaultExtension);
    File file1 = new File(tempFilename);
    File file2 = new File(filename);
    try {
      log.debug("Copying {} to {}", tempFilename, filename);
      FileUtils.copyFile(file1, file2);
    } catch (IOException error) {
      throw new ArchiveAdaptorException("Unable to copy file", error);
    }

    Comic result = new Comic();

    result.setFilename(filename);

    try {
      this.comicFileHandler.loadComic(result);
    } catch (ComicFileHandlerException error) {
      throw new ArchiveAdaptorException("Error loading new comic", error);
    }

    return result;
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
    File file = new File(comic.getFilename());

    if (!file.exists())
      throw new ArchiveAdaptorException("File not found: " + file.getAbsolutePath());
    if (file.isDirectory())
      throw new ArchiveAdaptorException("Cannot open directory: " + file.getAbsolutePath());

    return file;
  }

  @Override
  public String getFirstImageFileName(String filename) throws ArchiveAdaptorException {
    I archiveRef = this.openArchive(new File(filename));

    // get the list of entries
    List<String> entries = this.getEntryFilenames(archiveRef);
    String result = null;

    for (String entry : entries) {
      byte[] content = this.loadSingleFileInternal(archiveRef, entry);
      String contentType = this.fileTypeIdentifier.subtypeFor(new ByteArrayInputStream(content));

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
    throw new RuntimeException("Not supported");
  }

  protected ArchiveAdaptor getSourceArchiveAdaptor(final String filename)
      throws ArchiveAdaptorException {
    log.debug("Getting archive adaptor for file: {}", filename);
    ArchiveAdaptor result = null;
    try {
      result = this.comicFileHandler.getArchiveAdaptorFor(filename);
    } catch (ComicFileHandlerException error) {
      throw new ArchiveAdaptorException("could not find archive adaptor for comic", error);
    }
    log.debug("Creating temporary file: " + filename);
    return result;
  }

  public static class EntryLoaderForType {
    private String type;
    private String bean;
    private ArchiveEntryType entryType;

    public boolean isValid() {
      return !StringUtils.isEmpty(this.type)
          && !StringUtils.isEmpty(this.bean)
          && this.entryType != null;
    }

    public void setBean(String bean) {
      this.bean = bean;
    }

    public void setType(String type) {
      this.type = type;
    }

    public void setEntryType(ArchiveEntryType entryType) {
      this.entryType = entryType;
    }
  }
}

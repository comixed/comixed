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

package org.comixedproject.handlers;

import java.io.BufferedInputStream;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.*;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.ComicDataAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.utils.FileTypeIdentifier;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

/**
 * <code>ComicFileHandler</code> performs the actual loading and saving of the contents of a comic.
 *
 * @author Darryl L. Pierce
 */
@Component
@EnableConfigurationProperties
@PropertySource("archiveadaptors.properties")
@ConfigurationProperties(prefix = "comic.archive", ignoreUnknownFields = false)
@Log4j2
public class ComicFileHandler implements InitializingBean {
  @Autowired private ApplicationContext context;
  @Autowired private FileTypeIdentifier fileTypeIdentifier;
  @Autowired private Map<String, ArchiveAdaptor> archiveAdaptors;
  @Autowired private ComicDataAdaptor comicDataAdaptor;

  private List<ArchiveAdaptorEntry> adaptors = new ArrayList<>();
  private Map<String, ArchiveType> archiveTypes = new HashMap<>();
  private Map<ArchiveType, ArchiveAdaptor> adaptorForType = new EnumMap<>(ArchiveType.class);

  @Override
  public void afterPropertiesSet() throws Exception {
    log.debug("Initializing ComicFileHandler");
    this.archiveAdaptors.clear();
    this.archiveTypes.clear();
    for (ArchiveAdaptorEntry loader : this.adaptors) {
      if (loader.isValid()) {
        ArchiveAdaptor bean = (ArchiveAdaptor) this.context.getBean(loader.bean);

        if (this.context.containsBean(loader.bean)) {
          log.debug("Adding new archive adaptor: format=" + loader.format + " bean=" + loader.bean);
          this.archiveAdaptors.put(loader.format, bean);
          this.archiveTypes.put(loader.format, loader.archiveType);
          this.adaptorForType.put(loader.archiveType, bean);
        } else {
          log.warn("No such bean: name=" + loader.bean);
        }
      } else {
        if ((loader.format == null) || loader.format.isEmpty()) {
          log.warn("Missing type for archive adaptor");
        }
        if ((loader.bean == null) || loader.bean.isEmpty()) {
          log.warn("Missing name for archive adaptor");
        }
      }
    }
  }

  public List<ArchiveAdaptorEntry> getAdaptors() {
    return this.adaptors;
  }

  /**
   * Returns the {@link ArchiveAdaptor} for the specified filename.
   *
   * @param filename the comic filename
   * @return the adaptor, or <code>null</code> if no adaptor is registered
   * @throws ComicFileHandlerException if an error occurs
   */
  public ArchiveAdaptor getArchiveAdaptorFor(String filename) throws ComicFileHandlerException {
    log.debug("Fetching archive adaptor for file: {}", filename);

    String archiveType = null;

    try {
      InputStream input = new BufferedInputStream(new FileInputStream(filename));
      archiveType = this.fileTypeIdentifier.subtypeFor(input);
    } catch (FileNotFoundException error) {
      throw new ComicFileHandlerException("Unable to load comic file", error);
    }

    ArchiveAdaptor result = null;

    if (archiveType == null) {
      log.debug("Unable to determine the file type");
    } else {
      log.debug("Archive is of type={}", archiveType);
      result = this.archiveAdaptors.get(archiveType);
    }

    return result;
  }

  /**
   * Loads the given comic from disk.
   *
   * @param comic the comic
   * @throws ComicFileHandlerException if an error occurs
   */
  public void loadComic(Comic comic) throws ComicFileHandlerException {
    this.loadComic(comic, false);
  }

  /**
   * Loads the given comic from disk.
   *
   * @param comic the comic
   * @param ignoreComicInfoXml true if the ComicINfo.xml file is to be ignored.
   * @throws ComicFileHandlerException if an error occurs
   */
  public void loadComic(Comic comic, boolean ignoreComicInfoXml) throws ComicFileHandlerException {
    if (comic.isMissing()) {
      log.debug("Unable to load missing file: " + comic.getFilename());
      return;
    }

    log.debug("Loading comic: " + comic.getFilename());
    ArchiveAdaptor archiveAdaptor = this.getArchiveAdaptorFor(comic.getFilename());

    try {
      archiveAdaptor.loadComic(comic);
      if (ignoreComicInfoXml) {
        log.debug("Clearing out meta-data");
        this.comicDataAdaptor.clear(comic);
      }
    } catch (ArchiveAdaptorException error) {
      throw new ComicFileHandlerException("Unable to load comic", error);
    }
  }

  public void loadComicArchiveType(final Comic comic) throws ComicFileHandlerException {
    if (comic.isMissing()) {
      log.debug("Unable to determine type for missing file: file={}", comic.getFilename());
      return;
    }
    log.debug("Determining archive type: file={}", comic.getFilename());

    String archiveMimeSubtype = null;

    try {
      InputStream input = new BufferedInputStream(new FileInputStream(comic.getFilename()));
      archiveMimeSubtype = this.fileTypeIdentifier.subtypeFor(input);
    } catch (FileNotFoundException error) {
      throw new ComicFileHandlerException("Unable to load comic file", error);
    }

    if (archiveMimeSubtype == null) throw new ComicFileHandlerException("Unknown comic type");

    ArchiveType archiveType = this.archiveTypes.get(archiveMimeSubtype);
    log.debug("Archive type: {}", archiveType);
    comic.setArchiveType(archiveType);

    ArchiveAdaptor archiveAdaptor = this.archiveAdaptors.get(archiveMimeSubtype);

    if (archiveAdaptor == null)
      throw new ComicFileHandlerException(
          "No archive adaptor defined for type: " + archiveMimeSubtype);

    comic.setArchiveType(this.archiveTypes.get(archiveMimeSubtype));
  }

  /**
   * Returns an {@link ArchiveAdaptor} for the given {@link ArchiveType}.
   *
   * @param archiveType the archive type
   * @return the adaptor
   */
  public ArchiveAdaptor getArchiveAdaptorFor(final ArchiveType archiveType) {
    log.debug("Getting the archive adaptor for: type={}", archiveType);
    return this.adaptorForType.get(archiveType);
  }

  public static class ArchiveAdaptorEntry {
    private String format;
    private String bean;
    private ArchiveType archiveType;

    public boolean isValid() {
      return (this.format != null)
          && !this.format.isEmpty()
          && (this.bean != null)
          && !this.bean.isEmpty()
          && (this.archiveType != null);
    }

    public void setArchiveType(ArchiveType archiveType) {
      this.archiveType = archiveType;
    }

    public void setBean(String bean) {
      this.bean = bean;
    }

    public void setFormat(String format) {
      this.format = format;
    }
  }
}

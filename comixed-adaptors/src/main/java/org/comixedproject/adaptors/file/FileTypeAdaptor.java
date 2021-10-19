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

package org.comixedproject.adaptors.file;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.apache.tika.Tika;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.mime.MediaType;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.model.ArchiveEntryType;
import org.comixedproject.adaptors.content.ContentAdaptor;
import org.comixedproject.model.archives.ArchiveType;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

/**
 * <code>FileTypeAdaptor</code> identifies the mime type for a file or file entry.
 *
 * @author Darryl L. Pierce
 */
@Component
@EnableConfigurationProperties
@PropertySource("classpath:/comixed-adaptors.properties")
@ConfigurationProperties(prefix = "file-type")
@Log4j2
public class FileTypeAdaptor {
  @Autowired private ApplicationContext applicationContext;
  @Autowired private Tika tika;
  @Autowired private Metadata metadata;

  @Getter private List<ArchiveAdaptorDefinition> archiveAdaptors = new ArrayList<>();
  @Getter private List<EntryTypeDefinition> entryTypeLoaders = new ArrayList<>();

  /**
   * Returns the registered archive adaptor for the type of file specified.
   *
   * @param filename the filename
   * @return the archive adaptor
   * @throws AdaptorException if the file was not found or no archive adaptor was found
   */
  public ArchiveAdaptor getArchiveAdaptorFor(final String filename) throws AdaptorException {
    log.trace("Determining archive type for stream");
    final String subtype;
    try {
      subtype = this.getSubtype(new BufferedInputStream(new FileInputStream(filename)));
    } catch (FileNotFoundException error) {
      throw new AdaptorException("Failed to determine subtype", error);
    }
    return this.getArchiveAdaptor(
        this.archiveAdaptors.stream()
            .filter(definition -> definition.format.equals(subtype))
            .findFirst());
  }

  private ArchiveAdaptor getArchiveAdaptor(final Optional<ArchiveAdaptorDefinition> adaptor)
      throws AdaptorException {
    if (adaptor.isPresent()) {
      final ArchiveAdaptorDefinition definition = adaptor.get();
      if (definition.bean == null) {
        log.trace("Loading bean: {}", definition.name);
        definition.bean = this.getBean(definition.name, ArchiveAdaptor.class);
      }
      log.trace("Returning archive adaptor: {}", definition.name);
      return definition.bean;
    }
    throw new AdaptorException("No archive adaptor found");
  }

  /**
   * Returns the archive adaptor for the given archive type.
   *
   * @param archiveType the archive type
   * @return the archive adaptor
   * @throws AdaptorException if no archive adaptor was found
   */
  public ArchiveAdaptor getArchiveAdaptorFor(final ArchiveType archiveType)
      throws AdaptorException {
    return this.getArchiveAdaptor(
        this.archiveAdaptors.stream()
            .filter(definition -> definition.archiveType == archiveType)
            .findFirst());
  }

  /**
   * Returns the content adaptor for the given content type.
   *
   * @param content the content
   * @return the content adaptor
   * @throws AdaptorException if no entry loader was found
   */
  public ContentAdaptor getContentAdaptorFor(@NonNull final byte[] content)
      throws AdaptorException {
    log.trace("Determining entry loader for content");
    final String subtype = this.getSubtype(new ByteArrayInputStream(content));
    final Optional<EntryTypeDefinition> loader =
        this.entryTypeLoaders.stream()
            .filter(definition -> definition.type.equals(subtype))
            .findFirst();
    if (loader.isPresent()) {
      final EntryTypeDefinition definition = loader.get();
      if (definition.bean == null) {
        log.trace("Loading bean: {}", definition.name);
        definition.bean = this.getBean(definition.name, ContentAdaptor.class);
      }
      log.trace("Returning filetype adaptor: {}", definition.name);
      return definition.bean;
    }
    log.error("No loader found for type: {}", subtype);
    return null;
  }

  <T> T getBean(final String name, final Class<T> clazz) throws AdaptorException {
    try {
      return this.applicationContext.getBean(name, clazz);
    } catch (BeansException error) {
      throw new AdaptorException("Failed to load bean: " + name, error);
    }
  }

  /**
   * Returns the MIME subtype for the data in the provided stream.
   *
   * @param input the data stream
   * @return the MIME subtype
   */
  public String getSubtype(final InputStream input) {
    try {
      return this.getMimeType(input).getSubtype();
    } catch (IOException error) {
      log.error("Failed to get mime subtype for stream", error);
    }
    return null;
  }

  private MediaType getMimeType(final InputStream input) throws IOException {
    log.trace("Attempting to detect mime type for stream");
    MediaType result = null;

    input.mark(Integer.MAX_VALUE);
    result = this.tika.getDetector().detect(input, this.metadata);
    input.reset();

    log.trace("result={}", result);

    return result;
  }

  /**
   * Returns the MIME type for the data in the stream.
   *
   * @param input the data stream
   * @return the MIME type
   */
  public String getType(final InputStream input) {
    try {
      return this.getMimeType(input).getType();
    } catch (IOException error) {
      log.error("Failed to get mime type for stream", error);
    }
    return null;
  }

  public ArchiveEntryType getEntryTypeFor(final String mimeType) {
    final Optional<EntryTypeDefinition> loader =
        this.entryTypeLoaders.stream()
            .filter(entryTypeDefinition -> entryTypeDefinition.type.equals(mimeType))
            .findFirst();
    return loader.isPresent() ? loader.get().archiveEntryType : null;
  }

  public static class ArchiveAdaptorDefinition {
    @Setter @NonNull private String format;
    @Setter @NonNull private String name;
    @Setter @NonNull private ArchiveType archiveType;
    @Setter private ArchiveAdaptor bean = null;
  }

  private static class EntryTypeDefinition {
    @Setter @NonNull private String type;
    @Setter @NonNull private String name;
    @Setter @NonNull private ArchiveEntryType archiveEntryType;
    @Setter private ContentAdaptor bean = null;
  }
}

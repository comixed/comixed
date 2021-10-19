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

package org.comixedproject.adaptors.content;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FilenameUtils;
import org.comixedproject.model.comicbooks.Comic;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

/**
 * <code>FilenameContentAdaptor</code> takes a filename and decides from it which {@link
 * ContentAdaptor} bean to use.
 *
 * @author Darryl L. Pierce
 */
@Component
@EnableConfigurationProperties
@PropertySource("classpath:/comixed-adaptors.properties")
@ConfigurationProperties(prefix = "file-name")
@Log4j2
public class FilenameContentAdaptor extends AbstractContentAdaptor {
  @Getter private List<EntryLoaderEntry> entryNameLoaders = new ArrayList<>();

  @Override
  public void loadContent(final Comic comic, final String filename, final byte[] content)
      throws ContentAdaptorException {
    final String rootFilename = FilenameUtils.getName(filename);
    log.trace("Finding filename name: {}", rootFilename);
    final Optional<EntryLoaderEntry> loader =
        this.entryNameLoaders.stream()
            .filter(definition -> definition.mask.equals(rootFilename))
            .findFirst();
    if (loader.isPresent()) {
      final EntryLoaderEntry definition = loader.get();
      if (definition.bean == null) {
        definition.bean = this.getBean(definition.name);
      }
      log.trace("Invoking filename content adaptor: {}", definition.name);
      definition.bean.loadContent(comic, filename, content);
      return;
    }
    log.error("No content adaptor found for filename={}", filename);
  }

  public static class EntryLoaderEntry {
    @Setter @NonNull private String mask;
    @Setter @NonNull private String name;
    @Setter private ContentAdaptor bean;
  }
}

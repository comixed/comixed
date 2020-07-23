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

package org.comixedproject.loaders;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comic.Comic;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

/**
 * <code>FilenameEntryLoader</code> takes a filename and decides from it which {@link EntryLoader}
 * bean to use.
 *
 * @author Darryl L. Pierce
 */
@Component
@EnableConfigurationProperties
@ConfigurationProperties(prefix = "comic.filename-entry", ignoreUnknownFields = false)
@Log4j2
public class FilenameEntryLoader extends AbstractEntryLoader implements InitializingBean {
  @Autowired private ApplicationContext context;
  @Autowired private Map<String, EntryLoader> entryLoaders;
  private List<EntryLoaderEntry> loaders = new ArrayList<>();

  @Override
  public void afterPropertiesSet() throws Exception {
    this.entryLoaders = new HashMap<>();
    for (EntryLoaderEntry loader : this.loaders) {
      if (loader.isValid() && this.context.containsBean(loader.getBean())) {
        this.entryLoaders.put(loader.getMask(), (EntryLoader) this.context.getBean(loader.bean));
      }
    }
  }

  public List<EntryLoaderEntry> getLoaders() {
    return this.loaders;
  }

  @Override
  public void loadContent(Comic comic, String filename, byte[] content)
      throws EntryLoaderException {
    // get the filename.ext only
    String key = new File(filename).getName();
    log.debug("Determining filename adaptor for: " + filename);
    EntryLoader loader = this.entryLoaders.get(key);
    if (loader != null) {
      log.debug("Using adaptor: " + loader);
      loader.loadContent(comic, filename, content);
    } else {
      log.debug("No filename adaptor defined");
    }
  }

  public static class EntryLoaderEntry {
    private String mask;
    private String bean;

    public boolean isValid() {
      return (this.mask != null)
          && !this.mask.isEmpty()
          && (this.bean != null)
          && !this.bean.isEmpty();
    }

    public String getBean() {
      return bean;
    }

    public void setBean(String bean) {
      this.bean = bean;
    }

    public String getMask() {
      return mask;
    }

    public void setMask(String mask) {
      this.mask = mask;
    }
  }
}

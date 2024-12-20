/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

package org.comixedproject.service.library;

import jakarta.annotation.PreDestroy;
import java.io.File;
import java.util.Set;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.service.admin.ConfigurationChangedListener;
import org.comixedproject.service.admin.ConfigurationService;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.devtools.filewatch.ChangedFiles;
import org.springframework.boot.devtools.filewatch.FileChangeListener;
import org.springframework.boot.devtools.filewatch.FileSystemWatcher;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * <code>MissingFileScanner</code> performs checks for missing comic files, updating the library.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class MissingFileScanner
    implements InitializingBean, ConfigurationChangedListener, FileChangeListener {
  @Autowired private ConfigurationService configurationService;
  @Autowired private ComicBookService comicBookService;

  private static final Object SEMAPHORE = new Object();

  boolean active = false;
  FileSystemWatcher watcher;
  String rootDirectory = "";

  @Override
  public void afterPropertiesSet() throws Exception {
    this.configurationService.addConfigurationChangedListener(this);
    this.initialize(
        this.configurationService.getOptionValue(ConfigurationService.CFG_LIBRARY_ROOT_DIRECTORY));
  }

  @PreDestroy
  public void stopWatching() {
    if (this.watcher != null) {
      log.trace("Shutting down watcher");
      this.watcher.stop();
      this.watcher = null;
    }
  }

  @Override
  public void optionChanged(final String name, final String newValue) {
    if (name.equals(ConfigurationService.CFG_LIBRARY_ROOT_DIRECTORY)) {
      log.debug("Root directory changed");
      this.initialize(newValue);
    }
  }

  @Override
  public void onChange(final Set<ChangedFiles> changeSet) {
    changeSet.forEach(
        changeFiles -> {
          changeFiles
              .getFiles()
              .forEach(
                  changedFile -> {
                    final String filename =
                        new File(this.rootDirectory, changedFile.getRelativeName())
                            .getAbsolutePath();
                    if (this.comicBookService.filenameFound(filename)) {
                      switch (changedFile.getType()) {
                        case ADD -> this.comicBookService.markComicAsFound(filename);
                        case MODIFY -> this.comicBookService.markComicAsFound(filename);
                        case DELETE -> this.comicBookService.markComicAsMissing(filename);
                      }
                    }
                  });
        });
  }

  private void initialize(final String directory) {
    this.stopWatching();

    log.debug("Performing initial missing file scan");
    this.doExecute();

    this.rootDirectory = directory;

    if (StringUtils.hasLength(this.rootDirectory)) {
      log.trace("Watching library directory: {}", directory);
      this.watcher = new FileSystemWatcher();
      this.watcher.addListener(this);
      this.rootDirectory = directory;
      this.watcher.addSourceDirectory(new File(directory));
      this.watcher.start();
    }
  }

  private void doExecute() {
    synchronized (SEMAPHORE) {
      if (!this.active) {
        this.active = true;
        log.info("Updating currently missing comics");
        this.comicBookService
            .getAllComicDetails(true)
            .forEach(
                filename -> {
                  final File file = new File(filename);
                  if (file.exists()) {
                    log.trace("Missing comic file was found: {}", filename);
                    this.comicBookService.markComicAsFound(filename);
                  }
                });
        log.info("Scanning remaining comics");
        this.comicBookService
            .getAllComicDetails(false)
            .forEach(
                filename -> {
                  final File file = new File(filename);
                  if (!file.exists()) {
                    log.trace("Comic file is missing: {}", filename);
                    this.comicBookService.markComicAsMissing(filename);
                  }
                });
        this.active = false;
      } else {
        log.debug("Already scanning for missing files: ignoring request");
      }
    }
  }
}

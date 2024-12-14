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

import static java.nio.file.StandardWatchEventKinds.*;

import jakarta.annotation.PreDestroy;
import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FileUtils;
import org.comixedproject.service.admin.ConfigurationChangedListener;
import org.comixedproject.service.admin.ConfigurationService;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * <code>MissingFileScanner</code> performs checks for missing comic files, updating the library.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class MissingFileScanner implements InitializingBean, ConfigurationChangedListener {
  @Autowired private ConfigurationService configurationService;
  @Autowired private ComicBookService comicBookService;

  private static final Object SEMAPHORE = new Object();

  boolean active = false;
  WatchService watchService;
  Map<WatchKey, Path> keyMap = new HashMap<>();

  String rootDirectory = "";

  @Override
  public void afterPropertiesSet() throws Exception {
    this.configurationService.addConfigurationChangedListener(this);
    this.watchDirectory(
        this.configurationService.getOptionValue(ConfigurationService.CFG_LIBRARY_ROOT_DIRECTORY));
  }

  @PreDestroy
  public void stopWatching() throws IOException {
    if (this.watchService != null) {
      log.trace("Shutting down watcher");
      this.active = false;
      this.watchService.close();
      this.watchService = null;
    }
  }

  @Override
  public void optionChanged(final String name, final String newValue) {
    if (name.equals(ConfigurationService.CFG_LIBRARY_ROOT_DIRECTORY)) {
      log.debug("Root directory changed");
      try {
        this.watchDirectory(newValue);
      } catch (IOException | InterruptedException error) {
        log.error("Failed to change file scanning directory", error);
        Thread.currentThread().interrupt();
      }
    }
  }

  public void watchDirectory(final String directory) throws IOException, InterruptedException {
    this.stopWatching();

    this.rootDirectory = null;

    if (!StringUtils.hasLength(directory)) {
      log.error("No directory set");
      return;
    }

    final File root = new File(directory);
    if (!FileUtils.isDirectory(root)) {
      log.error("Not a directory: {}", root);
      return;
    }

    this.rootDirectory = directory;

    log.debug("Performing initial missing file scan");
    this.scanLibrary();

    this.watchService = FileSystems.getDefault().newWatchService();
    this.keyMap.clear();
    this.walkAndRegisterDirectories(Paths.get(this.rootDirectory));
    final Thread processingThread =
        new Thread() {
          @Override
          public void run() {
            MissingFileScanner.this.processEvents();
          }
        };
    processingThread.start();
  }

  private void walkAndRegisterDirectories(final Path start) throws IOException {
    Files.walkFileTree(
        start,
        new SimpleFileVisitor<Path>() {
          @Override
          public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs)
              throws IOException {
            registerDirectory(dir);
            return FileVisitResult.CONTINUE;
          }
        });
  }

  private void registerDirectory(Path dir) throws IOException {
    log.trace("Monitoring directory: {}", dir);
    WatchKey key = dir.register(watchService, ENTRY_CREATE, ENTRY_DELETE, ENTRY_MODIFY, OVERFLOW);
    this.keyMap.put(key, dir);
  }

  public void processEvents() {
    this.active = true;
    while (this.active) {
      final WatchKey key;
      key = this.watchService.poll();

      if (Objects.nonNull(key)) {
        for (WatchEvent<?> event : key.pollEvents()) {
          this.processWatchEvent(key, event);
          final boolean valid = key.reset();
          if (!valid) {
            this.keyMap.remove(key);
            if (this.keyMap.isEmpty()) {
              break;
            }
          }
        }
      }
    }
  }

  void processWatchEvent(final WatchKey key, final WatchEvent<?> event) {
    final Path dir = (Path) key.watchable();
    final Path name = Path.of(((WatchEvent<Path>) event).context().toString());
    final String filename = dir.resolve(name).toString();
    if (event.kind() != OVERFLOW) {
      if (this.comicBookService.filenameFound(filename)) {
        if (event.kind() == ENTRY_CREATE || event.kind() == ENTRY_MODIFY) {
          log.trace("File found: {}", filename);
          this.comicBookService.markComicAsFound(filename);
        } else if (event.kind() == ENTRY_DELETE) {
          log.trace("File deleted: {}", filename);
          this.comicBookService.markComicAsMissing(filename);
        } else {
          log.trace("Not a library file: {}", filename);
        }
      }
    }
  }

  private void scanLibrary() {
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

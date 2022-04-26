/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

package org.comixedproject.batch.comicbooks.readers;

import static org.comixedproject.service.admin.ConfigurationService.CFG_LIBRARY_DELETE_EMPTY_DIRECTORIES;
import static org.comixedproject.service.admin.ConfigurationService.CFG_LIBRARY_ROOT_DIRECTORY;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.service.admin.ConfigurationService;
import org.springframework.batch.item.ItemReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * <code>DeleteEmptyDirectoriesReader</code> loads all directories below the library root that
 * contain no contents.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class DeleteEmptyDirectoriesReader implements ItemReader<File> {
  @Autowired private ConfigurationService configurationService;

  List<File> directories;

  @Override
  public File read() throws Exception {
    if (this.directories == null) {
      this.directories = new ArrayList<>();
      final String rootDirectory =
          this.configurationService.getOptionValue(CFG_LIBRARY_ROOT_DIRECTORY);

      log.trace("Loading library root directory");
      if (!StringUtils.hasLength(rootDirectory)) {
        log.error("No root directory defined");
        return null;
      }
      log.trace("Checking if empty directories are to be deleted");
      final boolean deleteEmptyDirectories =
          Boolean.parseBoolean(
              this.configurationService.getOptionValue(
                  CFG_LIBRARY_DELETE_EMPTY_DIRECTORIES, Boolean.FALSE.toString()));
      if (!deleteEmptyDirectories) {
        log.trace("Not deleting empty directories: aborting...");
        return null;
      }
      log.trace("Searching for empty directories under: {}", rootDirectory);
      this.loadDirectories(new File(rootDirectory));
    }
    if (this.directories.isEmpty()) {
      log.trace("No empty directories left to process");
      this.directories = null;
      return null;
    }

    return this.directories.remove(0);
  }

  private void loadDirectories(final File rootDirectory) {
    this.loadDirectories(rootDirectory, false);
  }

  private void loadDirectories(final File rootDirectory, boolean addToList) {
    if (rootDirectory.isFile()) {
      return;
    }
    Arrays.stream(rootDirectory.listFiles())
        .sorted()
        .collect(Collectors.toList())
        .stream()
        .filter(File::isDirectory)
        .forEach(directory -> this.loadDirectories(directory, true));
    if (addToList) {
      log.trace("Adding directory: {}", rootDirectory.getAbsolutePath());
      this.directories.add(rootDirectory);
    }
  }
}

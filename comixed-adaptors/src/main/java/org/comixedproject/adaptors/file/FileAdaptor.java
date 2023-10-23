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

package org.comixedproject.adaptors.file;

import java.io.File;
import java.io.IOException;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOCase;
import org.apache.commons.lang.SystemUtils;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

/**
 * <code>FileAdaptor</code> provides methods for working with disk files.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class FileAdaptor {
  /**
   * Deletes an disk file file.
   *
   * @param file the file
   */
  public void deleteFile(final File file) {
    log.trace("Deleting file: {}", file);
    FileUtils.deleteQuietly(file);
  }

  /**
   * Deletes the contents of a directory.
   *
   * @param directory the directory
   * @throws IOException if an error occurs
   */
  public void deleteDirectoryContents(final String directory) throws IOException {
    log.trace("Deleting directory contents: {}", directory);
    FileUtils.cleanDirectory(new File(directory));
  }

  /**
   * Deletes a directory.
   *
   * @param directory the directory
   * @throws IOException if an error occurs
   */
  public void deleteDirectory(final File directory) throws IOException {
    log.trace("Deleting directory contents: {}", directory);
    FileUtils.deleteDirectory(directory);
  }

  /**
   * Creates the directory tree, including any needed parents, if necessary.
   *
   * @param directory the directory
   * @throws IOException if an error occurs
   */
  public void createDirectory(final File directory) throws IOException {
    if (!directory.exists()) {
      log.trace("Creating directory: {}", directory);
      FileUtils.forceMkdir(directory);
    }
  }

  /**
   * Copies a file from one location to another.
   *
   * @param source the source file
   * @param destination the destination file
   * @throws IOException if an error occurs
   */
  public void moveFile(final File source, final File destination) throws IOException {
    log.trace("Moving file: {} => {}", source.getAbsoluteFile(), destination.getAbsoluteFile());
    FileUtils.moveFile(source, destination);
  }

  /**
   * Checks if two File objects point to the same file.
   *
   * @param sourceFile the first file
   * @param targetFile the second file
   * @return true if they point to the same file
   */
  public boolean sameFile(@NonNull File sourceFile, @NonNull File targetFile) {
    log.trace("Checking if files match: {} & {}", sourceFile, targetFile);
    return FilenameUtils.equals(
        sourceFile.getAbsolutePath(),
        targetFile.getAbsolutePath(),
        false,
        SystemUtils.IS_OS_WINDOWS ? IOCase.INSENSITIVE : IOCase.SENSITIVE);
  }
}

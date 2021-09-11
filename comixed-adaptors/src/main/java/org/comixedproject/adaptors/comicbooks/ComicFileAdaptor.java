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

package org.comixedproject.adaptors.comicbooks;

import java.io.File;
import java.text.MessageFormat;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

/**
 * <code>ComicFileAdaptor</code> provides a set of utility methods related to comic files and
 * filenames.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComicFileAdaptor {
  /**
   * Looks for the next available filename for a comic file.
   *
   * @param filename the root filename
   * @param attempt the current attempt
   * @param defaultExtension the extension for the file
   * @return the filename to use
   */
  public String findAvailableFilename(
      final String filename, final int attempt, final String defaultExtension) {
    String candidate = null;

    if (attempt > 0) {
      candidate = MessageFormat.format("{0}-{1}.{2}", filename, attempt, defaultExtension);
    } else {
      candidate = MessageFormat.format("{0}.{1}", filename, defaultExtension);
    }

    var file = new File(candidate);
    return (!file.exists())
        ? candidate
        : findAvailableFilename(filename, attempt + 1, defaultExtension);
  }

  /**
   * Checks if the file is a comic file based on extension.
   *
   * @param file the file
   * @return true if it's comic file
   */
  public boolean isComicFile(File file) {
    String name = file.getName().toUpperCase();
    return (name.endsWith("CBZ") || name.endsWith("CBR") || name.endsWith("CB7"));
  }
}

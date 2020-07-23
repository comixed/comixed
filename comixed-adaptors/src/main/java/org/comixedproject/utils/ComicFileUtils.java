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

package org.comixedproject.utils;

import java.io.File;
import java.text.MessageFormat;
import lombok.extern.log4j.Log4j2;

/**
 * <code>ComicFileUtils</code> provides a set of utility methods related to comic files and
 * filenames.
 *
 * @author Darryl L. Pierce
 */
@Log4j2
public class ComicFileUtils {
  public static String findAvailableFilename(
      String filename, int attempt, String defaultExtension) {
    String candidate = filename;

    if (attempt > 0) {
      candidate = MessageFormat.format("{0}-{1}.{2}", filename, attempt, defaultExtension);
    } else {
      candidate = MessageFormat.format("{0}.{1}", filename, defaultExtension);
    }

    File file = new File(candidate);
    return (!file.exists())
        ? candidate
        : findAvailableFilename(filename, ++attempt, defaultExtension);
  }

  public static boolean isComicFile(File file) {
    String name = file.getName().toUpperCase();
    boolean result = (name.endsWith("CBZ") || name.endsWith("CBR") || name.endsWith("CB7"));
    return result;
  }
}

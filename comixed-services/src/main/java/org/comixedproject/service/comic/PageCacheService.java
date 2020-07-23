/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

package org.comixedproject.service.comic;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Log4j2
public class PageCacheService {
  @Value("${comixed.images.cache.location}")
  private String cacheDirectory;

  public byte[] findByHash(final String hash) throws IOException {
    log.debug("Searching for cached image: hash={}", hash);

    final File file = this.getFileForHash(hash);
    byte[] result = null;
    if (file != null && file.exists() && !file.isDirectory()) {
      log.debug("Loading cached image content: {} bytes", file.length());

      try (FileInputStream input = new FileInputStream(file)) {
        result = IOUtils.readFully(input, (int) file.length());
      } catch (Exception error) {
        log.error("Failed to load cached image", error);
      }

      return result;
    }

    log.debug("No image in cache");
    return null;
  }

  File getFileForHash(final String hash) {
    if (hash.length() != 32) {
      return null;
    }

    final String path =
        this.cacheDirectory
            + File.separator
            + hash.substring(0, 8)
            + File.separator
            + hash.substring(8, 16)
            + File.separator
            + hash.substring(16, 24)
            + File.separator
            + hash.substring(24, 32);
    return new File(path);
  }

  public void saveByHash(final String hash, final byte[] content) throws IOException {
    log.debug("Saving image to cache: hash={}", hash);
    final File file = this.getFileForHash(hash);
    file.getParentFile().mkdirs();
    IOUtils.write(content, new FileOutputStream(file, false));
  }

  /**
   * Returns the root directory for the image cache.
   *
   * @return the root directory
   */
  public String getRootDirectory() {
    log.debug("Getting the image cache root directory: {}", this.cacheDirectory);
    return this.cacheDirectory;
  }
}

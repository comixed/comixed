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

package org.comixed.service.library;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PageCacheService {
  protected final Logger logger = LoggerFactory.getLogger(this.getClass());

  @Value("${comixed.images.cache.location}")
  private String cacheDirectory;

  public byte[] findByHash(final String hash) throws IOException {
    this.logger.debug("Searching for cached image: hash={}", hash);

    final File file = this.getFileForHash(hash);
    if (file.exists() && !file.isDirectory()) {
      this.logger.debug("Loading cached image content: {} bytes", file.length());
      FileInputStream input = null;

      try {
        input = new FileInputStream(file);
        byte[] result = IOUtils.readFully(input, (int) file.length());
        input.close();
        return result;
      } catch (Exception error) {
        this.logger.error("Failed to load cached image", error);
      } finally {
        if (input != null) input.close();
      }
    }

    this.logger.debug("No image in cache");
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
    this.logger.debug("Saving image to cache: hash={}", hash);
    final File file = this.getFileForHash(hash);
    file.getParentFile().mkdirs();
    IOUtils.write(content, new FileOutputStream(file, false));
  }
}

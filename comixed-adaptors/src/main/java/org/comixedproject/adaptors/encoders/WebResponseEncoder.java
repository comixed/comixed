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

package org.comixedproject.adaptors.encoders;

import lombok.extern.log4j.Log4j2;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

/**
 * <code>WebResponseEncoder</code> provides methods to encode response content for HTTP requests.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class WebResponseEncoder {
  /**
   * Returns an encoded response body.
   *
   * @param length the content length
   * @param content the content
   * @param filename the filename
   * @param mediaType the MIME type
   * @param <T> the content type
   * @return the response body
   */
  public <T> ResponseEntity<T> encode(
      final int length, final T content, final String filename, final MediaType mediaType) {
    log.trace("Encoding web content from file: {}", filename);
    return ResponseEntity.ok()
        .contentLength(length)
        .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
        .contentType(mediaType)
        .body(content);
  }
}

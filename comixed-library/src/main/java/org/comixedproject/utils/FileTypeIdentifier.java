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

import java.io.IOException;
import java.io.InputStream;
import lombok.extern.log4j.Log4j2;
import org.apache.tika.Tika;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.mime.MediaType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>FileTypeIdentifier</code> identifies the mime type for a file or file entry.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class FileTypeIdentifier {
  @Autowired private Tika tika;
  @Autowired private Metadata metadata;

  private MediaType getMimeType(InputStream input) {
    log.debug("Attempting to detect mime type for stream");
    MediaType result = null;

    try {
      input.mark(Integer.MAX_VALUE);
      result = this.tika.getDetector().detect(input, this.metadata);
      input.reset();
    } catch (IOException error) {
      log.error("Error determining filetype from stream", error);
    }

    log.debug("result=" + result);

    return result;
  }

  /**
   * Returns the MIME subtype for the supplied input stream.
   *
   * @param input the input stream, which must support {@link InputStream#mark(int)} and {@link
   *     InputStream#reset()}
   * @return the MIME subtype
   */
  public String subtypeFor(InputStream input) {
    MediaType result = this.getMimeType(input);

    return result != null ? result.getSubtype() : null;
  }

  /**
   * Returns the MIME type for the supplied input stream.
   *
   * @param input the input stream, which must support {@link InputStream#mark(int)} and {@link
   *     InputStream#reset()}
   * @return the MIME type
   */
  public String typeFor(InputStream input) {
    MediaType result = this.getMimeType(input);

    return result != null ? result.getType() : null;
  }

  /**
   * Returns the base MIME type for the supplied input stream.
   *
   * @param input the input stream, which must support {@link InputStream#mark(int)} and {@link
   *     InputStream#reset()}
   * @return the MIME type
   */
  public String basetypeFor(InputStream input) {
    MediaType result = this.getMimeType(input);

    return result != null ? result.getBaseType().toString() : null;
  }
}

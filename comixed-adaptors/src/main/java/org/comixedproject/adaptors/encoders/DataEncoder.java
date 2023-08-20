/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

import java.util.Base64;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

/**
 * <code>DataEncoder</code> enables encoding and decoding byte streams.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class DataEncoder {
  /**
   * Encodes a stream of data to a string.
   *
   * @param content the data
   * @return the encoded data
   */
  public String encode(final byte[] content) {
    log.debug("Encoding {} byte{} of data", content.length, content.length == 1 ? "" : "s");
    return Base64.getEncoder().encodeToString(content);
  }

  /**
   * Decodes data to a byte array.
   *
   * @param content the data
   * @return the decoded data
   */
  public byte[] decode(final String content) {
    log.debug("Decoding data");
    return Base64.getDecoder().decode(content);
  }
}

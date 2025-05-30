/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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

package org.comixedproject.reader;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.lang.NonNull;

/**
 * <code>ReaderUtil</code> provides utility methods used by the protocol.
 *
 * @author Darryl L. Pierce
 */
@Log4j2
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class ReaderUtil {
  public static final String ENCODED_SLASH = "[SLASH]";

  /**
   * Generates a consistent and unique id for the provided value.
   *
   * @param value the value
   * @return the id
   */
  public static String generateId(@NonNull final String value) {
    return Long.toString(value.hashCode());
  }

  /**
   * Encodes a value.
   *
   * @param value the value
   * @return the encoded value
   */
  public static String urlEncode(@NonNull final String value) {
    try {
      return URLEncoder.encode(
          value.replace("/", ENCODED_SLASH), StandardCharsets.UTF_8.toString());
    } catch (UnsupportedEncodingException error) {
      log.error("Failed to encode string", error);
      return value;
    }
  }

  /**
   * Decodes a value.
   *
   * @param value the value
   * @return the decoded value
   */
  public static String urlDecode(@NonNull final String value) {
    try {
      return URLDecoder.decode(value, StandardCharsets.UTF_8.toString())
          .replace(ENCODED_SLASH, "/");
    } catch (UnsupportedEncodingException error) {
      log.error("Failed to decode string", error);
      return value;
    }
  }
}

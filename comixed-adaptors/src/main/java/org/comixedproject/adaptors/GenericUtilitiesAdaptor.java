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

package org.comixedproject.adaptors;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigInteger;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;
import org.springframework.util.DigestUtils;

/**
 * <code>GenericUtilitiesAdaptor</code> provides useful utility functions.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class GenericUtilitiesAdaptor {
  public String createHash(byte[] bytes) {
    var result = new StringBuilder(convertToHexString(DigestUtils.md5Digest(bytes)));
    while (result.length() < 32) result = result.insert(0, "0");
    return result.toString();
  }

  public String createHash(final InputStream inputStream) throws IOException {
    return convertToHexString(DigestUtils.md5Digest(inputStream));
  }

  private String convertToHexString(final byte[] content) {
    return new BigInteger(1, content).toString(16).toUpperCase();
  }
}

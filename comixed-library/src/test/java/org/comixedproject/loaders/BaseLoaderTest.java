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

package org.comixedproject.loaders;

import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.IOException;

public class BaseLoaderTest {

  public BaseLoaderTest() {
    super();
  }

  protected byte[] loadFile(String filename) throws IOException {
    FileInputStream input = new FileInputStream(filename);
    ByteArrayOutputStream output = new ByteArrayOutputStream();
    boolean done = false;
    byte[] buffer = new byte[65535];

    while (!done) {
      int read = input.read(buffer);

      if (read == -1) {
        done = true;
      } else {
        output.write(buffer, 0, read);
      }
    }

    input.close();

    return output.toByteArray();
  }
}

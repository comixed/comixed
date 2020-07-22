/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

package org.comixedproject.model.file;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class FileDetailsTest {
  private static final long TEST_FILE_SIZE = 32767L;
  private static final String TEST_WINDOWS_FILENAME =
      "C:\\Users\\comixeduser\\Downloads\\MyComicFile.cbz";
  private static final String TEST_ENCODED_WINDOWS_FILENAME =
      "C:/Users/comixeduser/Downloads/MyComicFile.cbz";
  private static final String TEST_FILENAME = "/Users/comixeduser/Documents/MyComicFile.cbz";
  private static final String TEST_BASE_FILENAME = "MyComicFile.cbz";

  @Test
  public void testCreateInstanceConvertsWindowsFilenames()
      throws IllegalArgumentException, IllegalAccessException {
    FileDetails fileDetails = new FileDetails(TEST_WINDOWS_FILENAME, TEST_FILE_SIZE);

    assertEquals(TEST_ENCODED_WINDOWS_FILENAME, fileDetails.getFilename());
    assertEquals(TEST_FILE_SIZE, fileDetails.getSize());
    assertEquals(TEST_BASE_FILENAME, fileDetails.getBaseFilename());
  }

  @Test
  public void testCreateInstance() throws IllegalArgumentException, IllegalAccessException {
    FileDetails fileDetails = new FileDetails(TEST_FILENAME, TEST_FILE_SIZE);

    assertEquals(TEST_FILENAME, fileDetails.getFilename());
    assertEquals(TEST_FILE_SIZE, fileDetails.getSize());
    assertEquals(TEST_BASE_FILENAME, fileDetails.getBaseFilename());
  }
}

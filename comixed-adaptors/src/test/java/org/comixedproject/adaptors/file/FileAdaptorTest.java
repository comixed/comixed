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

package org.comixedproject.adaptors.file;

import static junit.framework.TestCase.assertFalse;
import static junit.framework.TestCase.assertTrue;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import org.apache.commons.lang.SystemUtils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class FileAdaptorTest {

  private static final File TEST_DELETABLE_FILE = new File("target/test-classes/deletable-file");
  private static final File TEST_FILE_1 = new File("target/maven-javadoc-stale-data.txt");
  private static final File TEST_FILE_1_NAME_UPPER_CASE =
      new File(TEST_FILE_1.getAbsolutePath().toUpperCase());
  private static final File TEST_NOT_FILE_1 = new File("target/maven-javadoc-stale-data.txt");

  @InjectMocks private FileAdaptor adaptor;

  @Before
  public void setUp() throws IOException {
    FileWriter output = new FileWriter(TEST_DELETABLE_FILE);
    output.write("Here is some content");
    output.close();
  }

  @Test
  public void testDeleteFile() {
    adaptor.deleteFile(TEST_DELETABLE_FILE);

    assertFalse(TEST_DELETABLE_FILE.exists());
  }

  @Test
  public void testSameFile() {
    assertTrue(adaptor.sameFile(TEST_FILE_1, TEST_FILE_1));
  }

  @Test
  public void testSameFileNotSameFile() {
    assertTrue(adaptor.sameFile(TEST_FILE_1, TEST_NOT_FILE_1));
  }

  @Test
  public void testSameFileForWindows() {
    // since windows is case insensitive, this test ensures that both Windows and *nix are doing
    // what we expect
    final boolean result = adaptor.sameFile(TEST_FILE_1, TEST_FILE_1_NAME_UPPER_CASE);

    if (SystemUtils.IS_OS_WINDOWS) {
      assertTrue(result);
    } else {
      assertFalse(result);
    }
  }
}

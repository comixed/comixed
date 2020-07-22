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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import java.io.BufferedInputStream;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = UtilsContext.class)
@TestPropertySource(locations = "classpath:application.properties")
public class FileTypeIdentifierTest {
  private static final String TEST_CBZ_FILE = "src/test/resources/example.cbz";
  private static final String TEST_CBR_FILE = "src/test/resources/example.cbr";

  @Autowired FileTypeIdentifier fileTypeIdentifier;

  @Test
  public void testIdentifyZipFile() throws FileNotFoundException {
    String result =
        fileTypeIdentifier.subtypeFor(new BufferedInputStream(new FileInputStream(TEST_CBZ_FILE)));

    assertNotNull(result);
    assertEquals("zip", result);
  }

  @Test
  public void testIdentifyRarFile() throws FileNotFoundException {
    String result =
        fileTypeIdentifier.subtypeFor(new BufferedInputStream(new FileInputStream(TEST_CBR_FILE)));

    assertNotNull(result);
    assertEquals("x-rar-compressed", result);
  }
}

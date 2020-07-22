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

package org.comixedproject.importer;

import static org.junit.Assert.*;

import java.io.File;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class PathReplacementTest {
  private static final String TEST_SOURCE1 = "olddir";
  private static final String TEST_DESTINATION1 = "newdir";
  private static final String TEST_PATH1 = TEST_SOURCE1 + "=" + TEST_DESTINATION1;
  private static final String TEST_FILE_IN_DESTINATION =
      TEST_DESTINATION1 + File.separator + "comic.cbz";
  private static final String TEST_FILE_IN_SOURCE = TEST_SOURCE1 + File.separator + "comic.cbz";

  private PathReplacement replacement;

  @Before
  public void startUp() {
    replacement = new PathReplacement(TEST_PATH1);
  }

  @Test(expected = RuntimeException.class)
  public void testCreateFailsWhenMalformed() {
    new PathReplacement("thisrulehasnoequal");
  }

  @Test(expected = RuntimeException.class)
  public void testCreateWithMissingSource() {
    new PathReplacement("=destination");
  }

  @Test
  public void testCreateStripsTrailingSeparatorOnSource() {
    PathReplacement result =
        new PathReplacement(TEST_SOURCE1 + File.separator + "=" + TEST_DESTINATION1);

    assertEquals(TEST_SOURCE1, result.source);
  }

  @Test(expected = RuntimeException.class)
  public void testCreateWithMissingDestination() {
    new PathReplacement("source=");
  }

  @Test
  public void testCreateStripsTrailingSeparatorOnDestination() {
    PathReplacement result =
        new PathReplacement(TEST_SOURCE1 + "=" + TEST_DESTINATION1 + File.separator);

    assertEquals(TEST_DESTINATION1, result.destination);
  }

  @Test
  public void testIsMatchWhenDifferent() {
    assertFalse(replacement.isMatch(TEST_FILE_IN_DESTINATION));
  }

  @Test
  public void testIsMatchWhenSame() {
    assertTrue(replacement.isMatch(TEST_FILE_IN_SOURCE));
  }

  @Test
  public void testGetReplacement() {
    String result = replacement.getReplacement(TEST_FILE_IN_SOURCE);

    assertNotNull(result);
    assertEquals(TEST_FILE_IN_DESTINATION, result);
  }
}

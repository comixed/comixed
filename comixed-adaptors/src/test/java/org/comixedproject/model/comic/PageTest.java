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

package org.comixedproject.model.comic;

import static org.junit.Assert.*;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import javax.imageio.ImageIO;
import org.apache.commons.io.IOUtils;
import org.junit.Before;
import org.junit.Test;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(locations = {"application.properties"})
public class PageTest {
  private static final String TEST_JPG_FILE = "src/test/resources/example.jpg";
  private static String TEST_HASH;
  private static byte[] TEST_CONTENT;
  private static Integer TEST_WIDTH;
  private static Integer TEST_HEIGHT;

  static {
    File file = new File(TEST_JPG_FILE);
    TEST_CONTENT = new byte[(int) file.length()];
    FileInputStream input;
    try {
      input = new FileInputStream(file);
      IOUtils.readFully(input, TEST_CONTENT, 0, TEST_CONTENT.length);
      input.close();
      MessageDigest md = MessageDigest.getInstance("MD5");
      md.update(TEST_CONTENT);
      TEST_HASH = new BigInteger(1, md.digest()).toString(16).toUpperCase();
      final BufferedImage bimage = ImageIO.read(new ByteArrayInputStream(TEST_CONTENT));
      TEST_WIDTH = bimage.getWidth();
      TEST_HEIGHT = bimage.getHeight();
    } catch (IOException | NoSuchAlgorithmException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
  }

  private Page page;

  @Before
  public void setUp() throws IOException {
    page = new Page(TEST_JPG_FILE, new PageType(), TEST_HASH, TEST_WIDTH, TEST_HEIGHT);
  }

  @Test
  public void testHasFilename() {
    assertEquals(TEST_JPG_FILE, page.getFilename());
  }

  @Test
  public void testCanUpdateFilename() {
    String filename = TEST_JPG_FILE.substring(1);
    page.setFilename(filename);

    assertEquals(filename, page.getFilename());
  }

  @Test
  public void testHasHash() {
    assertEquals(TEST_HASH, page.getHash());
  }

  @Test
  public void testDelete() {
    // check the default
    assertFalse(page.isDeleted());
  }

  @Test
  public void testsetDeleted() {
    page.setDeleted(true);
    assertTrue(page.isDeleted());
  }
}

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

package org.comixedproject.adaptors.file;

import static org.junit.Assert.*;

import java.io.*;
import org.apache.commons.io.IOUtils;
import org.comixedproject.AdaptorTestContext;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.Cb7ArchiveAdaptor;
import org.comixedproject.adaptors.archive.CbrArchiveAdaptor;
import org.comixedproject.adaptors.archive.CbzArchiveAdaptor;
import org.comixedproject.adaptors.content.ContentAdaptor;
import org.comixedproject.adaptors.content.ImageContentAdaptor;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = AdaptorTestContext.class)
public class FileTypeAdaptorTest {
  private static final String TEST_CBZ_FILE = "src/test/resources/example.cbz";
  private static final String TEST_CBR_FILE = "src/test/resources/example.cbr";
  private static final String TEST_CB7_FILE = "src/test/resources/example.cb7";
  private static final String TEST_NONARCHIVE_FILE = "src/test/resources/example.jpg";
  private static final String TEST_JPG_FILE = "src/test/resources/example.jpg";
  private static final String TEST_WEBP_FILE = "src/test/resources/example.webp";
  private static final String TEST_UNSUPPORT_FILE =
      "target/classes/org/comixedproject/adaptors/file/FileTypeAdaptor.class";

  @Autowired private FileTypeAdaptor adaptor;

  @Test(expected = AdaptorException.class)
  public void testGetArchiveAdaptorForMissingFile() throws AdaptorException {
    adaptor.getArchiveAdaptorFor(TEST_CBZ_FILE.substring(1));
  }

  @Test
  public void testGetArchiveAdaptorForZip() throws AdaptorException {
    final ArchiveAdaptor result = adaptor.getArchiveAdaptorFor(TEST_CBZ_FILE);

    assertNotNull(result);
    assertSame(CbzArchiveAdaptor.class, result.getClass());
  }

  @Test
  public void testGetArchiveAdaptorFor7Zip() throws AdaptorException {
    final ArchiveAdaptor result = adaptor.getArchiveAdaptorFor(TEST_CB7_FILE);

    assertNotNull(result);
    assertSame(Cb7ArchiveAdaptor.class, result.getClass());
  }

  @Test
  public void testGetArchiveAdaptorForRar() throws AdaptorException {
    final ArchiveAdaptor result = adaptor.getArchiveAdaptorFor(TEST_CBR_FILE);

    assertNotNull(result);
    assertSame(CbrArchiveAdaptor.class, result.getClass());
  }

  @Test(expected = AdaptorException.class)
  public void testGetArchiveAdaptorForUnsupportedFile() throws AdaptorException {
    adaptor.getArchiveAdaptorFor(TEST_NONARCHIVE_FILE);
  }

  @Test
  public void testGetContentAdaptorForJpeg() throws IOException, AdaptorException {
    final ContentAdaptor result =
        adaptor.getContentAdaptorFor(this.loadContentForFile(TEST_JPG_FILE));

    assertNotNull(result);
    assertTrue(result instanceof ImageContentAdaptor);
  }

  @Test
  public void testGetContentAdaptorForWebp() throws IOException, AdaptorException {
    final ContentAdaptor result =
        adaptor.getContentAdaptorFor(this.loadContentForFile(TEST_WEBP_FILE));

    assertNotNull(result);
    assertTrue(result instanceof ImageContentAdaptor);
  }

  @Test
  public void testGetContentAdaptorForUnknownType() throws IOException, AdaptorException {
    final ContentAdaptor result =
        adaptor.getContentAdaptorFor(this.loadContentForFile(TEST_UNSUPPORT_FILE));

    assertNull(result);
  }

  private byte[] loadContentForFile(final String filename) throws IOException {
    final ByteArrayOutputStream output = new ByteArrayOutputStream();
    IOUtils.copy(new FileInputStream(filename), output);
    return output.toByteArray();
  }

  @Test
  public void testGetTypeForCbz() throws FileNotFoundException {
    String result = adaptor.getType(new BufferedInputStream(new FileInputStream(TEST_CBZ_FILE)));

    assertNotNull(result);
    assertEquals("application", result);
  }

  @Test
  public void testGetTypeForCb7() throws FileNotFoundException {
    String result = adaptor.getType(new BufferedInputStream(new FileInputStream(TEST_CB7_FILE)));

    assertNotNull(result);
    assertEquals("application", result);
  }

  @Test
  public void testGetTypeForCbr() throws FileNotFoundException {
    String result = adaptor.getType(new BufferedInputStream(new FileInputStream(TEST_CBR_FILE)));

    assertNotNull(result);
    assertEquals("application", result);
  }

  @Test
  public void testGetSubtypeForCbz() throws FileNotFoundException {
    String result = adaptor.getSubtype(new BufferedInputStream(new FileInputStream(TEST_CBZ_FILE)));

    assertNotNull(result);
    assertEquals("zip", result);
  }

  @Test
  public void testGetSubtypeForCb7() throws FileNotFoundException {
    String result = adaptor.getSubtype(new BufferedInputStream(new FileInputStream(TEST_CB7_FILE)));

    assertNotNull(result);
    assertEquals("x-7z-compressed", result);
  }

  @Test
  public void testGetSubtypeForCbr() throws FileNotFoundException {
    String result = adaptor.getSubtype(new BufferedInputStream(new FileInputStream(TEST_CBR_FILE)));

    assertNotNull(result);
    assertEquals("x-rar-compressed", result);
  }

  @Test(expected = AdaptorException.class)
  public void testGetBeanNoSuchBean() throws AdaptorException {
    adaptor.getBean("NOPE", this.getClass());
  }
}

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

package org.comixedproject.service.comic;

import static junit.framework.TestCase.*;

import java.io.File;
import java.io.IOException;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@ContextConfiguration(classes = {PageCacheService.class})
@TestPropertySource("classpath:application.properties")
public class PageCacheServiceTest {
  private static final String TEST_MISSING_PAGE_HASH = "4C6DD238138491B89A3DB9BC6E3A3E2D";
  private static final String TEST_PAGE_HASH = "D5397C1B6053B093CB133CA3B7081C9E";

  @Autowired private PageCacheService pageCacheService;

  @Before
  public void setUp() {
    // clean up any remnant
    final File file = pageCacheService.getFileForHash(TEST_MISSING_PAGE_HASH);
    if (file.exists()) {
      file.delete();
    }
  }

  @Test
  public void testFindByHashNotCached() throws IOException {
    final byte[] result = pageCacheService.findByHash(TEST_MISSING_PAGE_HASH);

    assertNull(result);
  }

  @Test
  public void testFindByHash() throws IOException {
    final byte[] result = pageCacheService.findByHash(TEST_PAGE_HASH);

    assertNotNull(result);
  }

  @Test
  public void testSaveByHash() throws IOException {
    pageCacheService.saveByHash(TEST_MISSING_PAGE_HASH, TEST_MISSING_PAGE_HASH.getBytes());

    assertTrue(pageCacheService.getFileForHash(TEST_MISSING_PAGE_HASH).exists());
  }
}

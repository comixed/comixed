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

package org.comixedproject.importer.adaptors;

import static org.junit.Assert.*;

import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.comixedproject.model.comic.Comic;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ComicRackBackupAdaptorTest {
  private static final File TEST_COMICRACK_BACKUP_FILE =
      new File("src/test/resources/comicrack-backup.xml");
  private static final Map<String, String> CURRENT_PAGES = new HashMap<>();
  @InjectMocks private ComicRackBackupAdaptor adaptor;

  @Test
  public void testLoadLoadsComics() throws ImportAdaptorException {
    List<Comic> result =
        this.adaptor.load(TEST_COMICRACK_BACKUP_FILE, CURRENT_PAGES, new HashMap<>());

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(8, result.size());
  }

  @Test
  public void testLoadLoadsLists() throws ImportAdaptorException {

    Map<String, String> guids = new HashMap<>();

    this.adaptor.load(TEST_COMICRACK_BACKUP_FILE, CURRENT_PAGES, guids);
    Map<String, Object> result = this.adaptor.loadLists(TEST_COMICRACK_BACKUP_FILE, guids);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(8, result.size());
    assertEquals(2, ((List<String>) result.get("Manual")).size());
  }
}

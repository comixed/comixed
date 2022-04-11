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

package org.comixedproject.opds.rest;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertFalse;
import static org.junit.Assert.assertNotNull;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.opds.model.OPDSNavigationFeed;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class OPDSLibraryControllerTest {
  @InjectMocks private OPDSLibraryController controller;

  private List<Comic> comicList = new ArrayList<>();

  @Test
  public void testGetRoot() {
    OPDSNavigationFeed result = controller.getRootFeed();

    assertNotNull(result);
    assertNotNull(result.getAuthor());
    assertNotNull(result.getTitle());
    assertNotNull(result.getId());
    assertEquals("/opds/library/", result.getEntries().get(0).getLinks().get(0).getReference());
    assertEquals("/opds/lists/", result.getEntries().get(1).getLinks().get(0).getReference());
  }

  @Test
  public void testGetLibraryFeed() {
    OPDSNavigationFeed result = controller.getLibraryFeed();

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(
        "/opds/collections/publishers/",
        result.getEntries().get(0).getLinks().get(0).getReference());
    assertEquals(
        "/opds/collections/series/", result.getEntries().get(1).getLinks().get(0).getReference());
    assertEquals(
        "/opds/collections/characters/",
        result.getEntries().get(2).getLinks().get(0).getReference());
    assertEquals(
        "/opds/collections/teams/", result.getEntries().get(3).getLinks().get(0).getReference());
    assertEquals(
        "/opds/collections/locations/",
        result.getEntries().get(4).getLinks().get(0).getReference());
    assertEquals(
        "/opds/collections/stories/", result.getEntries().get(5).getLinks().get(0).getReference());
  }
}

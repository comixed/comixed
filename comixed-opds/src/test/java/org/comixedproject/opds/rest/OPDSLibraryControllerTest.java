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
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.opds.model.OPDSNavigationFeed;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class OPDSLibraryControllerTest {
  private static final boolean TEST_UNREAD = RandomUtils.nextBoolean();

  @InjectMocks private OPDSLibraryController controller;

  private List<ComicBook> comicBookList = new ArrayList<>();

  @Test
  public void testGetRoot() {
    OPDSNavigationFeed result = controller.getRootFeed();

    assertNotNull(result);
    assertNotNull(result.getAuthor());
    assertNotNull(result.getTitle());
    assertNotNull(result.getId());
    assertEquals("/opds/library/", result.getEntries().get(0).getLinks().get(0).getReference());
    assertEquals(
        "/opds/library/?unread=true", result.getEntries().get(1).getLinks().get(0).getReference());
  }

  @Test
  public void testGetLibraryFeed() {
    OPDSNavigationFeed result = controller.getLibraryFeed(TEST_UNREAD);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(
        "/opds/dates/released/?unread=" + String.valueOf(TEST_UNREAD),
        result.getEntries().get(0).getLinks().get(0).getReference());
    assertEquals(
        "/opds/collections/publishers/?unread=" + String.valueOf(TEST_UNREAD),
        result.getEntries().get(1).getLinks().get(0).getReference());
    assertEquals(
        "/opds/collections/series/?unread=" + String.valueOf(TEST_UNREAD),
        result.getEntries().get(2).getLinks().get(0).getReference());
    assertEquals(
        "/opds/collections/characters/?unread=" + String.valueOf(TEST_UNREAD),
        result.getEntries().get(3).getLinks().get(0).getReference());
    assertEquals(
        "/opds/collections/teams/?unread=" + String.valueOf(TEST_UNREAD),
        result.getEntries().get(4).getLinks().get(0).getReference());
    assertEquals(
        "/opds/collections/locations/?unread=" + String.valueOf(TEST_UNREAD),
        result.getEntries().get(5).getLinks().get(0).getReference());
    assertEquals(
        "/opds/collections/stories/?unread=" + String.valueOf(TEST_UNREAD),
        result.getEntries().get(6).getLinks().get(0).getReference());
  }
}

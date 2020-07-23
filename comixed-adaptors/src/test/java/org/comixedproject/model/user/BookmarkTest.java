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

package org.comixedproject.model.user;

import static org.junit.Assert.assertEquals;

import org.comixedproject.model.comic.Comic;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class BookmarkTest {

  private static final long TEST_COMIC_ID = 100;
  private static final String TEST_BOOKMARK = "10";

  @Mock private Comic comic;
  @Mock private ComiXedUser user;
  private Bookmark bookmark = new Bookmark(user, comic, TEST_BOOKMARK);

  @Test
  public void testCanUpdateMark() {
    String newMark = "11";
    bookmark.setMark(newMark);
    assertEquals(newMark, bookmark.getMark());
  }
}

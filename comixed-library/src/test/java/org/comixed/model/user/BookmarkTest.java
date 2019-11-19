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

package org.comixed.model.user;

import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.*;

public class BookmarkTest {

    private static final long BOOK_ID = 100;
    private static final String MARK = "10";

    private Bookmark bookmark;

    @Before
    public void setUp() {
        ComiXedUser user = new ComiXedUser();
        bookmark = new Bookmark(user, BOOK_ID, MARK);
    }

    @Test
    public void testHasBook() {
        assertEquals(BOOK_ID, bookmark.getBook());
    }

    @Test
    public void testCanUpdateBook() {
        long newBookId = 105;
        bookmark.setBook(newBookId);
        assertEquals(newBookId, bookmark.getBook());
    }

    @Test
    public void testHasMark() {
        assertEquals(MARK, bookmark.getMark());
    }

    @Test
    public void testCanUpdateMark() {
        String newMark = "11";
        bookmark.setMark(newMark);
        assertEquals(newMark, bookmark.getMark());
    }


}

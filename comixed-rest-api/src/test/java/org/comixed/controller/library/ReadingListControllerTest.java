/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project.
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.controller.library;

import org.comixed.model.library.Comic;
import org.comixed.model.library.ReadingList;
import org.comixed.model.library.ReadingListEntry;
import org.comixed.model.user.ComiXedUser;
import org.comixed.net.UpdateReadingListRequest;
import org.comixed.service.library.ComicException;
import org.comixed.service.library.NoSuchReadingListException;
import org.comixed.service.library.ReadingListNameException;
import org.comixed.service.library.ReadingListService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

import java.security.Principal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertSame;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ReadingListControllerTest {
    private static final String TEST_READING_LIST_NAME = "Test Reading List";
    private static final String TEST_READING_LIST_SUMMARY = "Test Reading List Description";
    private static final String TEST_USER_EMAIL = "reader@localhost.com";
    private static final long TEST_READING_LIST_ID = 78;
    private static final List<Long> TEST_READING_LIST_ENTRIES = new ArrayList<>();

    private static final Long TEST_COMIC_ID_1 = 1000L;
    private static final Long TEST_COMIC_ID_2 = 1001L;
    private static final Long TEST_COMIC_ID_3 = 1002L;
    private static final Long TEST_COMIC_ID_4 = 1003L;
    private static final Long TEST_COMIC_ID_5 = 1004L;

    static {
        TEST_READING_LIST_ENTRIES.add(TEST_COMIC_ID_1);
        TEST_READING_LIST_ENTRIES.add(TEST_COMIC_ID_2);
        TEST_READING_LIST_ENTRIES.add(TEST_COMIC_ID_3);
        TEST_READING_LIST_ENTRIES.add(TEST_COMIC_ID_4);
        TEST_READING_LIST_ENTRIES.add(TEST_COMIC_ID_5);
    }

    @InjectMocks private ReadingListController controller;
    @Mock private ReadingListService readingListService;

    @Mock private ReadingList readingList;
    @Mock private Principal principal;
    @Mock private ComiXedUser user;
    @Mock private List<ReadingList> readingLists;
    @Mock private Comic comic;
    @Captor private ArgumentCaptor<ReadingListEntry> readingListEntry;

    @Test
    public void testCreateReadingList()
            throws
            NoSuchReadingListException,
            ReadingListNameException,
            ComicException {
        Mockito.when(principal.getName())
               .thenReturn(TEST_USER_EMAIL);
        Mockito.when(readingListService.createReadingList(Mockito.anyString(),
                                                          Mockito.anyString(),
                                                          Mockito.anyString(),
                                                          Mockito.anyList()))
               .thenReturn(readingList);

        ReadingList result = controller.createReadingList(principal,
                                                          TEST_READING_LIST_NAME,
                                                          TEST_READING_LIST_SUMMARY,
                                                          TEST_READING_LIST_ENTRIES);

        assertNotNull(result);
        assertSame(result,
                   readingList);

        Mockito.verify(principal,
                       Mockito.times(1))
               .getName();
        Mockito.verify(readingListService,
                       Mockito.times(1))
               .createReadingList(TEST_USER_EMAIL,
                                  TEST_READING_LIST_NAME,
                                  TEST_READING_LIST_SUMMARY,
                                  TEST_READING_LIST_ENTRIES);
    }

    @Test
    public void testGetReadingListsForUser() {
        Mockito.when(principal.getName())
               .thenReturn(TEST_USER_EMAIL);
        Mockito.when(readingListService.getReadingListsForUser(Mockito.anyString()))
               .thenReturn(readingLists);

        List<ReadingList> result = controller.getReadingListsForUser(principal);

        assertNotNull(result);
        assertSame(readingLists,
                   result);

        Mockito.verify(readingListService,
                       Mockito.times(1))
               .getReadingListsForUser(TEST_USER_EMAIL);
        Mockito.verify(principal,
                       Mockito.atLeast(1))
               .getName();
    }

    @Test(expected = NoSuchReadingListException.class)
    public void testGetReadingListForOtherUser()
            throws
            NoSuchReadingListException {
        Mockito.when(principal.getName())
               .thenReturn(TEST_USER_EMAIL);
        Mockito.when(readingListService.getReadingListForUser(Mockito.anyString(),
                                                              Mockito.anyLong()))
               .thenThrow(NoSuchReadingListException.class);

        try {
            controller.getReadingList(principal,
                                      TEST_READING_LIST_ID);
        }
        finally {
            Mockito.verify(principal,
                           Mockito.times(1))
                   .getName();
            Mockito.verify(readingListService,
                           Mockito.times(1))
                   .getReadingListForUser(TEST_USER_EMAIL,
                                          TEST_READING_LIST_ID);
        }
    }

    @Test
    public void testGetReadingListForUser()
            throws
            NoSuchReadingListException {
        Mockito.when(principal.getName())
               .thenReturn(TEST_USER_EMAIL);
        Mockito.when(readingListService.getReadingListForUser(Mockito.anyString(),
                                                              Mockito.anyLong()))
               .thenReturn(readingList);

        final ReadingList result = controller.getReadingList(principal,
                                                             TEST_READING_LIST_ID);

        assertNotNull(result);
        assertSame(readingList,
                   result);

        Mockito.verify(principal,
                       Mockito.times(1))
               .getName();
        Mockito.verify(readingListService,
                       Mockito.times(1))
               .getReadingListForUser(TEST_USER_EMAIL,
                                      TEST_READING_LIST_ID);

    }

    @Test
    public void testUpdateReadingList()
            throws
            NoSuchReadingListException,
            ComicException {
        Set<ReadingListEntry> entries = new HashSet<>();

        Mockito.when(principal.getName())
               .thenReturn(TEST_USER_EMAIL);
        Mockito.when(readingListService.updateReadingList(Mockito.anyString(),
                                                          Mockito.anyLong(),
                                                          Mockito.anyString(),
                                                          Mockito.anyString(),
                                                          Mockito.anyList()))
               .thenReturn(readingList);

        final UpdateReadingListRequest request = new UpdateReadingListRequest();
        request.setName(TEST_READING_LIST_NAME);
        request.setSummary(TEST_READING_LIST_SUMMARY);
        request.setEntries(TEST_READING_LIST_ENTRIES);

        ReadingList result = controller.updateReadingList(principal,
                                                          TEST_READING_LIST_ID,
                                                          request);

        assertNotNull(result);
        assertSame(readingList,
                   result);

        Mockito.verify(principal,
                       Mockito.atLeast(1))
               .getName();
        Mockito.verify(readingListService,
                       Mockito.times(1))
               .updateReadingList(TEST_USER_EMAIL,
                                  TEST_READING_LIST_ID,
                                  TEST_READING_LIST_NAME,
                                  TEST_READING_LIST_SUMMARY,
                                  TEST_READING_LIST_ENTRIES);
    }
}

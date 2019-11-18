/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project.
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

package org.comixed.controller.library;

import org.comixed.model.library.*;
import org.comixed.net.SetBlockingStateRequest;
import org.comixed.service.library.PageException;
import org.comixed.service.library.PageService;
import org.comixed.utils.FileTypeIdentifier;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.*;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class PageControllerTest {
    private static final long TEST_PAGE_TYPE_ID = 717;
    private static final long TEST_PAGE_ID = 129;
    private static final String[] TEST_PAGE_HASH_LIST = {"12345",
                                                         "23456",
                                                         "34567"};
    private static final List<DuplicatePage> TEST_DUPLICATE_PAGES = new ArrayList<>();
    private static final int TEST_PAGE_INDEX = 7;
    private static final long TEST_COMIC_ID = 1002L;
    private static final byte[] TEST_PAGE_CONTENT = new byte[53253];
    private static final int TEST_DELETED_PAGE_COUNT = 17;
    private static final String TEST_PAGE_HASH = "12345";
    private static final String TEST_PAGE_CONTENT_TYPE = "application";
    private static final String TEST_PAGE_CONTENT_SUBTYPE = "image";
    private static final Boolean TEST_BLOCKING = true;

    @InjectMocks private PageController pageController;
    @Mock private PageService pageService;
    @Mock private Page page;
    @Mock private BlockedPageHash blockedPageHash = new BlockedPageHash();
    @Mock private List<Page> pageList;
    @Mock private Comic comic;
    @Mock private List<PageType> pageTypes;
    @Mock private FileTypeIdentifier fileTypeIdentifier;
    @Mock private List<DuplicatePage> duplicatePageList;

    @Captor private ArgumentCaptor<InputStream> inputStream;

    @Test
    public void testSetPageType()
            throws
            PageException {
        Mockito.when(pageService.updateTypeForPage(Mockito.anyLong(),
                                                   Mockito.anyLong()))
               .thenReturn(page);

        final Page result = pageController.updateTypeForPage(TEST_PAGE_ID,
                                                             TEST_PAGE_TYPE_ID);

        assertNotNull(result);
        assertSame(page,
                   result);

        Mockito.verify(pageService,
                       Mockito.times(1))
               .updateTypeForPage(TEST_PAGE_ID,
                                  TEST_PAGE_TYPE_ID);
    }

    @Test
    public void testAddBlockedPageHash()
            throws
            PageException {
        Mockito.when(pageService.addBlockedPageHash(Mockito.anyLong(),
                                                    Mockito.anyString()))
               .thenReturn(comic);

        final Comic result = pageController.addBlockedPageHash(TEST_PAGE_ID,
                                                               TEST_PAGE_HASH);

        assertNotNull(result);
        assertSame(comic,
                   result);

        Mockito.verify(pageService,
                       Mockito.times(1))
               .addBlockedPageHash(TEST_PAGE_ID,
                                   TEST_PAGE_HASH);
    }

    @Test
    public void testRemoveBlockedPageHash()
            throws
            PageException {
        Mockito.when(pageService.removeBlockedPageHash(Mockito.anyLong(),
                                                       Mockito.anyString()))
               .thenReturn(comic);

        final Comic result = pageController.removeBlockedPageHash(TEST_PAGE_ID,
                                                                  TEST_PAGE_HASH);

        assertNotNull(result);
        assertSame(comic,
                   result);

        Mockito.verify(pageService,
                       Mockito.times(1))
               .removeBlockedPageHash(TEST_PAGE_ID,
                                      TEST_PAGE_HASH);
    }

    @Test
    public void testGetBlockedPageHashes() {
        Mockito.when(pageService.getAllBlockedPageHashes())
               .thenReturn(TEST_PAGE_HASH_LIST);

        String[] result = pageController.getAllBlockedPageHashes();

        assertSame(TEST_PAGE_HASH_LIST,
                   result);

        Mockito.verify(pageService,
                       Mockito.times(1))
               .getAllBlockedPageHashes();
    }

    @Test
    public void testGetDuplicatePages() {

        Mockito.when(pageService.getDuplicatePages())
               .thenReturn(TEST_DUPLICATE_PAGES);

        List<DuplicatePage> result = pageController.getDuplicatePages();

        assertNotNull(result);
        assertSame(TEST_DUPLICATE_PAGES,
                   result);

        Mockito.verify(pageService,
                       Mockito.times(1))
               .getDuplicatePages();
    }

    @Test
    public void testGetImageInComicByIndex() {
        Mockito.when(pageService.getPageInComicByIndex(Mockito.anyLong(),
                                                       Mockito.anyInt()))
               .thenReturn(page);
        Mockito.when(page.getContent())
               .thenReturn(TEST_PAGE_CONTENT);
        Mockito.when(fileTypeIdentifier.typeFor(inputStream.capture()))
               .thenReturn(TEST_PAGE_CONTENT_TYPE);
        Mockito.when(fileTypeIdentifier.subtypeFor(inputStream.capture()))
               .thenReturn(TEST_PAGE_CONTENT_SUBTYPE);

        ResponseEntity<byte[]> result = pageController.getImageInComicByIndex(TEST_COMIC_ID,
                                                                              TEST_PAGE_INDEX);

        assertNotNull(result);
        assertSame(TEST_PAGE_CONTENT,
                   result.getBody());

        Mockito.verify(pageService,
                       Mockito.times(1))
               .getPageInComicByIndex(TEST_COMIC_ID,
                                      TEST_PAGE_INDEX);
        Mockito.verify(page,
                       Mockito.times(1))
               .getContent();
        Mockito.verify(fileTypeIdentifier,
                       Mockito.times(1))
               .typeFor(inputStream.getAllValues()
                                   .get(0));
        Mockito.verify(fileTypeIdentifier,
                       Mockito.times(1))
               .subtypeFor(inputStream.getAllValues()
                                      .get(1));
    }

    @Test
    public void testDeletePageInvalidId() {
        Mockito.when(pageService.deletePage(Mockito.anyLong()))
               .thenReturn(null);

        assertFalse(pageController.deletePage(TEST_PAGE_ID));

        Mockito.verify(pageService,
                       Mockito.times(1))
               .deletePage(TEST_PAGE_ID);
    }

    @Test
    public void testDeletePage() {
        Mockito.when(pageService.deletePage(Mockito.anyLong()))
               .thenReturn(page);

        assertTrue(pageController.deletePage(TEST_PAGE_ID));

        Mockito.verify(pageService,
                       Mockito.times(1))
               .deletePage(TEST_PAGE_ID);
    }

    @Test
    public void testUndeletePageForNonexistentPage() {
        Mockito.when(pageService.undeletePage(Mockito.anyLong()))
               .thenReturn(null);

        assertFalse(pageController.undeletePage(TEST_PAGE_ID));

        Mockito.verify(pageService,
                       Mockito.times(1))
               .undeletePage(TEST_PAGE_ID);
    }

    @Test
    public void testUndeletePage() {
        Mockito.when(pageService.undeletePage(Mockito.anyLong()))
               .thenReturn(page);

        assertTrue(pageController.undeletePage(TEST_PAGE_ID));

        Mockito.verify(pageService,
                       Mockito.times(1))
               .undeletePage(TEST_PAGE_ID);
    }

    @Test
    public void testGetPageContentForNonexistentPage() {
        Mockito.when(pageService.findById(Mockito.anyLong()))
               .thenReturn(null);

        assertNull(pageController.getPageContent(TEST_PAGE_ID));

        Mockito.verify(pageService,
                       Mockito.times(1))
               .findById(TEST_PAGE_ID);
    }

    @Test
    public void testGetPageContent()
            throws
            IOException {
        Mockito.when(pageService.findById(TEST_PAGE_ID))
               .thenReturn(page);
        Mockito.when(page.getContent())
               .thenReturn(TEST_PAGE_CONTENT);
        Mockito.when(fileTypeIdentifier.typeFor(inputStream.capture()))
               .thenReturn(TEST_PAGE_CONTENT_TYPE);
        Mockito.when(fileTypeIdentifier.subtypeFor(inputStream.capture()))
               .thenReturn(TEST_PAGE_CONTENT_SUBTYPE);

        ResponseEntity<byte[]> result = pageController.getPageContent(TEST_PAGE_ID);

        assertNotNull(result);
        assertEquals(TEST_PAGE_CONTENT,
                     result.getBody());
        assertEquals(HttpStatus.OK,
                     result.getStatusCode());

        Mockito.verify(pageService,
                       Mockito.times(1))
               .findById(TEST_PAGE_ID);
        Mockito.verify(page,
                       Mockito.times(1))
               .getContent();
        Mockito.verify(fileTypeIdentifier,
                       Mockito.times(1))
               .typeFor(inputStream.getAllValues()
                                   .get(0));
        Mockito.verify(fileTypeIdentifier,
                       Mockito.times(1))
               .subtypeFor(inputStream.getAllValues()
                                      .get(1));
    }

    @Test
    public void testGetPageInComicWithIndexNonexistentComic() {
        Mockito.when(pageService.getPageInComicByIndex(Mockito.anyLong(),
                                                       Mockito.anyInt()))
               .thenReturn(null);

        assertNull(pageController.getPageInComicByIndex(TEST_COMIC_ID,
                                                        TEST_PAGE_INDEX));

        Mockito.verify(pageService,
                       Mockito.times(1))
               .getPageInComicByIndex(TEST_COMIC_ID,
                                      TEST_PAGE_INDEX);
    }

    @Test
    public void testGetPageInComicWithInvalidIndex() {
        Mockito.when(pageService.getPageInComicByIndex(Mockito.anyLong(),
                                                       Mockito.anyInt()))
               .thenReturn(null);

        assertNull(pageController.getPageInComicByIndex(TEST_COMIC_ID,
                                                        TEST_PAGE_INDEX));

        Mockito.verify(pageService,
                       Mockito.times(1))
               .getPageInComicByIndex(TEST_COMIC_ID,
                                      TEST_PAGE_INDEX);
    }

    @Test
    public void testGetPageInComic() {
        Mockito.when(pageService.getPageInComicByIndex(Mockito.anyLong(),
                                                       Mockito.anyInt()))
               .thenReturn(page);

        Page result = pageController.getPageInComicByIndex(TEST_COMIC_ID,
                                                           TEST_PAGE_INDEX);

        assertNotNull(result);
        assertSame(page,
                   result);

        Mockito.verify(pageService,
                       Mockito.times(1))
               .getPageInComicByIndex(TEST_COMIC_ID,
                                      TEST_PAGE_INDEX);
    }

    @Test
    public void testGetAllPagesForComic() {
        Mockito.when(pageService.getAllPagesForComic(Mockito.anyLong()))
               .thenReturn(pageList);

        List<Page> result = pageController.getAllPagesForComic(TEST_COMIC_ID);

        assertNotNull(result);
        assertSame(pageList,
                   result);

        Mockito.verify(pageService,
                       Mockito.times(1))
               .getAllPagesForComic(TEST_COMIC_ID);
    }

    @Test
    public void testGetPageTypes() {
        Mockito.when(pageService.getPageTypes())
               .thenReturn(pageTypes);

        assertSame(pageTypes,
                   pageController.getPageTypes());

        Mockito.verify(pageService,
                       Mockito.times(1))
               .getPageTypes();
    }

    @Test
    public void testDeletePagesByHash() {
        Mockito.when(pageService.deleteAllWithHash(Mockito.anyString()))
               .thenReturn(TEST_DELETED_PAGE_COUNT);

        int result = pageController.deleteAllWithHash(TEST_PAGE_HASH);

        assertEquals(TEST_DELETED_PAGE_COUNT,
                     result);

        Mockito.verify(pageService,
                       Mockito.times(1))
               .deleteAllWithHash(TEST_PAGE_HASH);
    }

    @Test
    public void testUndeletePagesByHash() {
        Mockito.when(pageService.undeleteAllWithHash(Mockito.anyString()))
               .thenReturn(TEST_DELETED_PAGE_COUNT);

        int result = pageController.undeleteAllWithHash(TEST_PAGE_HASH);

        assertEquals(TEST_DELETED_PAGE_COUNT,
                     result);

        Mockito.verify(pageService,
                       Mockito.times(1))
               .undeleteAllWithHash(TEST_PAGE_HASH);
    }

    @Test
    public void testSetBlockingState() {
        Mockito.when(pageService.setBlockingState(Mockito.any(String[].class),
                                                  Mockito.anyBoolean()))
               .thenReturn(duplicatePageList);

        final List<DuplicatePage> result = pageController.setBlockingState(new SetBlockingStateRequest(TEST_PAGE_HASH_LIST,
                                                                                                       TEST_BLOCKING));

        assertNotNull(result);
        assertSame(duplicatePageList,
                   result);

        Mockito.verify(pageService,
                       Mockito.times(1))
               .setBlockingState(TEST_PAGE_HASH_LIST,
                                 TEST_BLOCKING);
    }
}

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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.web.controllers;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import org.comixed.library.model.BlockedPageHash;
import org.comixed.library.model.Comic;
import org.comixed.library.model.Page;
import org.comixed.library.model.PageType;
import org.comixed.library.utils.FileTypeIdentifier;
import org.comixed.repositories.BlockedPageHashRepository;
import org.comixed.repositories.ComicRepository;
import org.comixed.repositories.PageRepository;
import org.comixed.repositories.PageTypeRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class PageControllerTest
{
    private static final long PAGE_TYPE_ID = 717;
    private static final long TEST_PAGE_ID = 129;
    private static final String BLOCKED_PAGE_HASH_VALUE = "0123456789abcdef";
    private static final String[] BLOCKED_HASH_LIST =
    {"12345",
     "23456",
     "34567"};
    private static final List<Page> TEST_DUPLICATE_PAGES = new ArrayList<Page>();
    private static final int TEST_PAGE_INDEX = 7;
    private static final long TEST_COMIC_ID = 1002L;
    private static final byte[] TEST_PAGE_CONTENT = new byte[53253];
    private static final int TEST_DELETED_PAGE_COUNT = 17;
    private static final String TEST_PAGE_HASH = "12345";
    private static final String TEST_PAGE_CONTENT_TYPE = "application";
    private static final String TEST_PAGE_CONTENT_SUBTYPE = "image";

    @InjectMocks
    private PageController pageController;

    @Mock
    private PageRepository pageRepository;

    @Mock
    private ComicRepository comicRepository;

    @Mock
    private Page page;

    @Mock
    private PageTypeRepository pageTypeRepository;

    @Mock
    private PageType pageType;

    @Captor
    private ArgumentCaptor<BlockedPageHash> blockedPageHashCaptor;

    @Mock
    private BlockedPageHashRepository blockedPageHashRepository;

    @Mock
    private BlockedPageHash blockedPageHash = new BlockedPageHash();

    @Mock
    private List<Page> pageList;

    @Mock
    private Comic comic;

    @Mock
    private List<PageType> pageTypes;

    @Mock
    private FileTypeIdentifier fileTypeIdentifier;

    @Captor
    private ArgumentCaptor<InputStream> inputStream;

    @Test
    public void testSetPageTypeForNonexistentPage()
    {
        Mockito.when(pageRepository.findOne(TEST_PAGE_ID)).thenReturn(null);

        pageController.updateTypeForPage(TEST_PAGE_ID, PAGE_TYPE_ID);

        Mockito.verify(pageRepository, Mockito.times(1)).findOne(TEST_PAGE_ID);
        Mockito.verify(pageTypeRepository, Mockito.never()).findOne(PAGE_TYPE_ID);
        Mockito.verify(pageRepository, Mockito.never()).save(Mockito.any(Page.class));
    }

    @Test
    public void testSetPageTypeWithNonexistentType()
    {
        Mockito.when(pageRepository.findOne(TEST_PAGE_ID)).thenReturn(page);
        Mockito.when(pageTypeRepository.findOne(PAGE_TYPE_ID)).thenReturn(null);

        pageController.updateTypeForPage(TEST_PAGE_ID, PAGE_TYPE_ID);

        Mockito.verify(pageRepository, Mockito.times(1)).findOne(TEST_PAGE_ID);
        Mockito.verify(pageTypeRepository, Mockito.times(1)).findOne(PAGE_TYPE_ID);
        Mockito.verify(pageRepository, Mockito.never()).save(Mockito.any(Page.class));
    }

    @Test
    public void testSetPageType()
    {
        Mockito.when(pageRepository.findOne(TEST_PAGE_ID)).thenReturn(page);
        Mockito.when(pageTypeRepository.findOne(PAGE_TYPE_ID)).thenReturn(pageType);
        Mockito.doNothing().when(page).setPageType(pageType);
        Mockito.when(pageRepository.save(Mockito.any(Page.class))).thenReturn(page);

        pageController.updateTypeForPage(TEST_PAGE_ID, PAGE_TYPE_ID);

        Mockito.verify(pageRepository, Mockito.times(1)).findOne(TEST_PAGE_ID);
        Mockito.verify(pageTypeRepository, Mockito.times(1)).findOne(PAGE_TYPE_ID);
        Mockito.verify(page, Mockito.times(1)).setPageType(pageType);
        Mockito.verify(pageRepository, Mockito.times(1)).save(page);
    }

    @Test
    public void testAddBlockedPageHash()
    {
        Mockito.when(blockedPageHashRepository.findByHash(BLOCKED_PAGE_HASH_VALUE)).thenReturn(null);
        Mockito.when(blockedPageHashRepository.save(Mockito.any(BlockedPageHash.class)))
               .thenReturn(blockedPageHashCaptor.capture());

        pageController.addBlockedPageHash(BLOCKED_PAGE_HASH_VALUE);

        Mockito.verify(blockedPageHashRepository, Mockito.times(1)).save(Mockito.any(BlockedPageHash.class));
        Mockito.verify(blockedPageHashRepository, Mockito.times(1)).findByHash(BLOCKED_PAGE_HASH_VALUE);
    }

    @Test
    public void testAddBlockedPageHashForExistingHash()
    {
        Mockito.when(blockedPageHashRepository.findByHash(BLOCKED_PAGE_HASH_VALUE)).thenReturn(blockedPageHash);

        pageController.addBlockedPageHash(BLOCKED_PAGE_HASH_VALUE);

        Mockito.verify(blockedPageHashRepository, Mockito.times(0)).save(Mockito.any(BlockedPageHash.class));
        Mockito.verify(blockedPageHashRepository, Mockito.times(1)).findByHash(BLOCKED_PAGE_HASH_VALUE);
    }

    @Test
    public void testRemoveBlockedPageHash()
    {
        Mockito.when(blockedPageHashRepository.findByHash(BLOCKED_PAGE_HASH_VALUE)).thenReturn(blockedPageHash);
        Mockito.doNothing().when(blockedPageHashRepository).delete(Mockito.any(BlockedPageHash.class));

        pageController.removeBlockedPageHash(BLOCKED_PAGE_HASH_VALUE);

        Mockito.verify(blockedPageHashRepository, Mockito.times(1)).delete(blockedPageHash);
        Mockito.verify(blockedPageHashRepository, Mockito.times(1)).findByHash(BLOCKED_PAGE_HASH_VALUE);
    }

    @Test
    public void testRemoveNonexistingBlockedPageHash()
    {
        Mockito.when(blockedPageHashRepository.findByHash(BLOCKED_PAGE_HASH_VALUE)).thenReturn(null);

        pageController.removeBlockedPageHash(BLOCKED_PAGE_HASH_VALUE);

        Mockito.verify(blockedPageHashRepository, Mockito.times(1)).findByHash(BLOCKED_PAGE_HASH_VALUE);
    }

    @Test
    public void testGetBlockedPageHashes()
    {
        Mockito.when(blockedPageHashRepository.getAllHashes()).thenReturn(BLOCKED_HASH_LIST);

        String[] result = pageController.getAllBlockedPageHashes();

        assertSame(BLOCKED_HASH_LIST, result);

        Mockito.verify(blockedPageHashRepository, Mockito.times(1)).getAllHashes();
    }

    @Test
    public void testGetDuplicatePages()
    {

        Mockito.when(pageRepository.getDuplicatePages()).thenReturn(TEST_DUPLICATE_PAGES);

        List<Page> result = pageController.getDuplicatePages();

        assertNotNull(result);
        assertSame(TEST_DUPLICATE_PAGES, result);

        Mockito.verify(pageRepository, Mockito.times(1)).getDuplicatePages();
    }

    @Test
    public void testGetImageInComicByIndexForMissingComic()
    {
        Mockito.when(comicRepository.findOne(Mockito.anyLong())).thenReturn(null);

        ResponseEntity<byte[]> result = pageController.getImageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX);

        assertNull(result);

        Mockito.verify(comicRepository, Mockito.times(1)).findOne(TEST_COMIC_ID);
    }

    @Test
    public void testGetImageInComicByIndexOutOfBounds()
    {
        Mockito.when(comicRepository.findOne(Mockito.anyLong())).thenReturn(comic);
        Mockito.when(comic.getPageCount()).thenReturn(TEST_PAGE_INDEX - 1);

        ResponseEntity<byte[]> result = pageController.getImageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX);

        assertNull(result);

        Mockito.verify(comicRepository, Mockito.times(1)).findOne(TEST_COMIC_ID);
        Mockito.verify(comic, Mockito.atLeast(1)).getPageCount();
    }

    @Test
    public void testGetImageInComicByIndex()
    {
        Mockito.when(comicRepository.findOne(Mockito.anyLong())).thenReturn(comic);
        Mockito.when(comic.getPageCount()).thenReturn(TEST_PAGE_INDEX + 1);
        Mockito.when(comic.getPage(Mockito.anyInt())).thenReturn(page);
        Mockito.when(page.getContent()).thenReturn(TEST_PAGE_CONTENT);
        Mockito.when(fileTypeIdentifier.typeFor(inputStream.capture())).thenReturn(TEST_PAGE_CONTENT_TYPE);
        Mockito.when(fileTypeIdentifier.subtypeFor(inputStream.capture())).thenReturn(TEST_PAGE_CONTENT_SUBTYPE);

        ResponseEntity<byte[]> result = pageController.getImageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX);

        assertNotNull(result);
        assertSame(TEST_PAGE_CONTENT, result.getBody());

        Mockito.verify(comicRepository, Mockito.times(1)).findOne(TEST_COMIC_ID);
        Mockito.verify(comic, Mockito.atLeast(1)).getPageCount();
        Mockito.verify(comic, Mockito.times(1)).getPage(TEST_PAGE_INDEX);
        Mockito.verify(page, Mockito.times(1)).getContent();
        Mockito.verify(fileTypeIdentifier, Mockito.times(1)).typeFor(inputStream.getAllValues().get(0));
        Mockito.verify(fileTypeIdentifier, Mockito.times(1)).subtypeFor(inputStream.getAllValues().get(1));
    }

    @Test
    public void testDeletePageInvalidId()
    {
        Mockito.when(pageRepository.findOne(Mockito.anyLong())).thenReturn(null);

        assertFalse(pageController.deletePage(TEST_PAGE_ID));

        Mockito.verify(pageRepository, Mockito.times(1)).findOne(TEST_PAGE_ID);
    }

    @Test
    public void testDeletePage()
    {
        Mockito.when(pageRepository.findOne(Mockito.anyLong())).thenReturn(page);
        Mockito.doNothing().when(page).markDeleted(Mockito.anyBoolean());
        Mockito.when(pageRepository.save(Mockito.any(Page.class))).thenReturn(page);

        assertTrue(pageController.deletePage(TEST_PAGE_ID));

        Mockito.verify(pageRepository, Mockito.times(1)).findOne(TEST_PAGE_ID);
        Mockito.verify(page, Mockito.times(1)).markDeleted(true);
        Mockito.verify(pageRepository, Mockito.times(1)).save(page);
    }

    @Test
    public void testUndeletePageForNonexistentPage()
    {
        Mockito.when(pageRepository.findOne(Mockito.anyLong())).thenReturn(null);

        assertFalse(pageController.undeletePage(TEST_PAGE_ID));

        Mockito.verify(pageRepository, Mockito.times(1)).findOne(TEST_PAGE_ID);
    }

    @Test
    public void testUndeletePage()
    {
        Mockito.when(pageRepository.findOne(Mockito.anyLong())).thenReturn(page);
        Mockito.doNothing().when(page).markDeleted(Mockito.anyBoolean());
        Mockito.when(pageRepository.save(Mockito.any(Page.class))).thenReturn(page);

        assertTrue(pageController.undeletePage(TEST_PAGE_ID));

        Mockito.verify(pageRepository, Mockito.times(1)).findOne(TEST_PAGE_ID);
        Mockito.verify(page, Mockito.times(1)).markDeleted(false);
        Mockito.verify(pageRepository, Mockito.times(1)).save(page);
    }

    @Test
    public void testGetPageContentForNonexistentPage()
    {
        Mockito.when(pageRepository.findOne(Mockito.anyLong())).thenReturn(null);

        assertNull(pageController.getPageContent(TEST_PAGE_ID));

        Mockito.verify(pageRepository, Mockito.times(1)).findOne(TEST_PAGE_ID);
    }

    @Test
    public void testGetPageContent() throws IOException
    {
        Mockito.when(pageRepository.findOne(Mockito.anyLong())).thenReturn(page);
        Mockito.when(page.getContent()).thenReturn(TEST_PAGE_CONTENT);
        Mockito.when(fileTypeIdentifier.typeFor(inputStream.capture())).thenReturn(TEST_PAGE_CONTENT_TYPE);
        Mockito.when(fileTypeIdentifier.subtypeFor(inputStream.capture())).thenReturn(TEST_PAGE_CONTENT_SUBTYPE);

        ResponseEntity<byte[]> result = pageController.getPageContent(TEST_PAGE_ID);

        assertNotNull(result);
        assertEquals(TEST_PAGE_CONTENT, result.getBody());
        assertEquals(HttpStatus.OK, result.getStatusCode());

        Mockito.verify(pageRepository, Mockito.times(1)).findOne(TEST_PAGE_ID);
        Mockito.verify(page, Mockito.times(1)).getContent();
        Mockito.verify(fileTypeIdentifier, Mockito.times(1)).typeFor(inputStream.getAllValues().get(0));
        Mockito.verify(fileTypeIdentifier, Mockito.times(1)).subtypeFor(inputStream.getAllValues().get(1));
    }

    @Test
    public void testGetPageInComicWithIndexNonexistentComic()
    {
        Mockito.when(comicRepository.findOne(Mockito.anyLong())).thenReturn(null);

        assertNull(pageController.getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX));

        Mockito.verify(comicRepository, Mockito.times(1)).findOne(TEST_COMIC_ID);
    }

    @Test
    public void testGetPageInComicWithInvalidIndex()
    {
        Mockito.when(comicRepository.findOne(Mockito.anyLong())).thenReturn(comic);
        Mockito.when(comic.getPageCount()).thenReturn(TEST_PAGE_INDEX - 1);

        assertNull(pageController.getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX));

        Mockito.verify(comicRepository, Mockito.times(1)).findOne(TEST_COMIC_ID);
        Mockito.verify(comic, Mockito.atLeast(1)).getPageCount();
    }

    @Test
    public void testGetPageInComic()
    {
        Mockito.when(comicRepository.findOne(Mockito.anyLong())).thenReturn(comic);
        Mockito.when(comic.getPageCount()).thenReturn(TEST_PAGE_INDEX + 1);
        Mockito.when(comic.getPage(Mockito.anyInt())).thenReturn(page);

        Page result = pageController.getPageInComicByIndex(TEST_COMIC_ID, TEST_PAGE_INDEX);

        assertNotNull(result);
        assertSame(page, result);

        Mockito.verify(comicRepository, Mockito.times(1)).findOne(TEST_COMIC_ID);
        Mockito.verify(comic, Mockito.atLeast(1)).getPageCount();
        Mockito.verify(comic, Mockito.times(1)).getPage(TEST_PAGE_INDEX);
    }

    @Test
    public void testGetAllPagesForComicWithIndexNonexistentComic()
    {
        Mockito.when(comicRepository.findOne(Mockito.anyLong())).thenReturn(null);

        assertNull(pageController.getAll(TEST_COMIC_ID));

        Mockito.verify(comicRepository, Mockito.times(1)).findOne(TEST_COMIC_ID);
    }

    @Test
    public void testAllGetPagesForComic()
    {
        Mockito.when(comicRepository.findOne(Mockito.anyLong())).thenReturn(comic);
        Mockito.when(comic.getPages()).thenReturn(pageList);

        List<Page> result = pageController.getAll(TEST_COMIC_ID);

        assertNotNull(result);
        assertSame(pageList, result);

        Mockito.verify(comicRepository, Mockito.times(1)).findOne(TEST_COMIC_ID);
        Mockito.verify(comic, Mockito.atLeast(1)).getPages();
    }

    @Test
    public void testGetPageTypes()
    {
        Mockito.when(pageTypeRepository.findAll()).thenReturn(pageTypes);

        assertSame(pageTypes, pageController.getPageTypes());

        Mockito.verify(pageTypeRepository, Mockito.times(1)).findAll();
    }

    @Test
    public void testDeletePagesByHash()
    {
        Mockito.when(pageRepository.updateDeleteOnAllWithHash(Mockito.anyString(), Mockito.anyBoolean()))
               .thenReturn(TEST_DELETED_PAGE_COUNT);

        int result = pageController.deleteAllWithHash(TEST_PAGE_HASH);

        assertEquals(TEST_DELETED_PAGE_COUNT, result);

        Mockito.verify(pageRepository, Mockito.times(1)).updateDeleteOnAllWithHash(TEST_PAGE_HASH, true);
    }

    @Test
    public void testUndeletePagesByHash()
    {
        Mockito.when(pageRepository.updateDeleteOnAllWithHash(Mockito.anyString(), Mockito.anyBoolean()))
               .thenReturn(TEST_DELETED_PAGE_COUNT);

        int result = pageController.undeleteAllWithHash(TEST_PAGE_HASH);

        assertEquals(TEST_DELETED_PAGE_COUNT, result);

        Mockito.verify(pageRepository, Mockito.times(1)).updateDeleteOnAllWithHash(TEST_PAGE_HASH, false);
    }
}

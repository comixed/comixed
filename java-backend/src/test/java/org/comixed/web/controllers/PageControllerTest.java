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
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.comixed.library.model.BlockedPageHash;
import org.comixed.library.model.Page;
import org.comixed.library.model.PageType;
import org.comixed.repositories.BlockedPageHashRepository;
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

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class PageControllerTest
{
    private static final long PAGE_TYPE_ID = 717;
    private static final long PAGE_ID = 129;
    private static final String BLOCKED_PAGE_HASH_VALUE = "0123456789abcdef";
    private static final String[] BLOCKED_HASH_LIST =
    {"12345",
     "23456",
     "34567"};
    private static final String DUPLICATE_PAGE_HASH_1 = "01234567890ABCDEF";
    private static final String DUPLICATE_PAGE_HASH_2 = "1234567890ABCDEF1";
    private static final String DUPLICATE_PAGE_HASH_3 = "234567890ABCDEF01";
    private static final String DUPLICATE_PAGE_HASH_4 = "34567890ABCDEF012";
    private static final String DUPLICATE_PAGE_HASH_5 = "4567890ABCDEF0123";
    private static final List<String> TEST_DUPLICATE_PAGE_HASHES = Arrays.asList(new String[]
    {DUPLICATE_PAGE_HASH_1,
     DUPLICATE_PAGE_HASH_2,
     DUPLICATE_PAGE_HASH_3,
     DUPLICATE_PAGE_HASH_4,
     DUPLICATE_PAGE_HASH_5,});

    @InjectMocks
    private PageController pageController;

    @Mock
    private PageRepository pageRepository;

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

    @Test
    public void testSetPageTypeForNonexistentPage()
    {
        Mockito.when(pageRepository.findOne(PAGE_ID)).thenReturn(null);

        pageController.updateTypeForPage(PAGE_ID, PAGE_TYPE_ID);

        Mockito.verify(pageRepository, Mockito.times(1)).findOne(PAGE_ID);
        Mockito.verify(pageTypeRepository, Mockito.never()).findOne(PAGE_TYPE_ID);
        Mockito.verify(pageRepository, Mockito.never()).save(Mockito.any(Page.class));
    }

    @Test
    public void testSetPageTypeWithNonexistentType()
    {
        Mockito.when(pageRepository.findOne(PAGE_ID)).thenReturn(page);
        Mockito.when(pageTypeRepository.findOne(PAGE_TYPE_ID)).thenReturn(null);

        pageController.updateTypeForPage(PAGE_ID, PAGE_TYPE_ID);

        Mockito.verify(pageRepository, Mockito.times(1)).findOne(PAGE_ID);
        Mockito.verify(pageTypeRepository, Mockito.times(1)).findOne(PAGE_TYPE_ID);
        Mockito.verify(pageRepository, Mockito.never()).save(Mockito.any(Page.class));
    }

    @Test
    public void testSetPageType()
    {
        Mockito.when(pageRepository.findOne(PAGE_ID)).thenReturn(page);
        Mockito.when(pageTypeRepository.findOne(PAGE_TYPE_ID)).thenReturn(pageType);
        Mockito.doNothing().when(page).setPageType(pageType);
        Mockito.when(pageRepository.save(Mockito.any(Page.class))).thenReturn(page);

        pageController.updateTypeForPage(PAGE_ID, PAGE_TYPE_ID);

        Mockito.verify(pageRepository, Mockito.times(1)).findOne(PAGE_ID);
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
    public void testGetDuplicatePageHashesNoHashes()
    {
        Mockito.when(pageRepository.getDuplicatePageHashes()).thenReturn(new ArrayList<String>());

        List<String> result = pageController.getDuplicatePageHashes();

        assertNotNull(result);
        assertTrue(result.isEmpty());

        Mockito.verify(pageRepository, Mockito.times(1)).getDuplicatePageHashes();
    }

    @Test
    public void testGetDuplicatePageHashes()
    {

        Mockito.when(pageRepository.getDuplicatePageHashes()).thenReturn(TEST_DUPLICATE_PAGE_HASHES);

        List<String> result = pageController.getDuplicatePageHashes();

        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals(TEST_DUPLICATE_PAGE_HASHES, result);

        Mockito.verify(pageRepository, Mockito.times(1)).getDuplicatePageHashes();
    }
}

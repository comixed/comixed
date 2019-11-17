/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

package org.comixed.repositories;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.util.Arrays;
import java.util.List;

import org.comixed.model.library.Page;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.context.support.DependencyInjectionTestExecutionListener;
import org.springframework.test.context.support.DirtiesContextTestExecutionListener;
import org.springframework.test.context.transaction.TransactionalTestExecutionListener;

import com.github.springtestdbunit.DbUnitTestExecutionListener;
import com.github.springtestdbunit.annotation.DatabaseSetup;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = RepositoryContext.class)
@TestPropertySource(locations = "classpath:application.properties")
@DatabaseSetup("classpath:test-comics.xml")
@TestExecutionListeners(
{DependencyInjectionTestExecutionListener.class,
 DirtiesContextTestExecutionListener.class,
 TransactionalTestExecutionListener.class,
 DbUnitTestExecutionListener.class})
public class PageRepositoryTest
{
    private static final Long BLOCKED_PAGE_ID = 1000L;
    private static final Long UNBLOCKED_PAGE_ID = 1001L;
    private static final String TEST_DUPLICATE_PAGE_HASH_1 = "12345";
    private static final String TEST_DUPLICATE_PAGE_HASH_2 = "12346";
    private static final String TEST_DUPLICATE_PAGE_HASH_3 = "12347";
    private static final List<String> TEST_DUPLICATE_PAGE_HASHES = Arrays.asList(new String[]
    {TEST_DUPLICATE_PAGE_HASH_1,
     TEST_DUPLICATE_PAGE_HASH_2,
     TEST_DUPLICATE_PAGE_HASH_3,});
    @Autowired
    private PageRepository repository;

    @Test
    public void testGetPageWithBlockedHash()
    {
        Page result = repository.findById(BLOCKED_PAGE_ID).get();

        assertTrue(result.isBlocked());
    }

    @Test
    public void testGetPageWithNonBlockedHash()
    {
        Page result = repository.findById(UNBLOCKED_PAGE_ID).get();

        assertFalse(result.isBlocked());
    }

    @Test
    public void testGetDuplicatePages()
    {
        List<Page> result = repository.getDuplicatePages();

        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals(11, result.size());
        for (Page page : result)
        {
            assertTrue(TEST_DUPLICATE_PAGE_HASHES.contains(page.getHash()));
        }
    }

    @Test
    public void testUpdateDeleteOnAllWithHashAsDeleted()
    {
        int result = repository.updateDeleteOnAllWithHash(TEST_DUPLICATE_PAGE_HASH_1, true);

        assertEquals(3, result);

        Iterable<Page> pages = repository.findAll();
        for (Page page : pages)
        {
            if (page.getHash().equals(TEST_DUPLICATE_PAGE_HASH_1))
            {
                assertTrue(page.isMarkedDeleted());
            }
        }
    }

    @Test
    public void testUpdateDeleteOnAllWithHashAsNotDeleted()
    {
        int result = repository.updateDeleteOnAllWithHash(TEST_DUPLICATE_PAGE_HASH_1, false);

        assertEquals(3, result);

        Iterable<Page> pages = repository.findAll();
        for (Page page : pages)
        {
            if (page.getHash().equals(TEST_DUPLICATE_PAGE_HASH_1))
            {
                assertFalse(page.isMarkedDeleted());
            }
        }
    }
}

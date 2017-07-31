/*
 * ComixEd - A digital comic book library management application.
 * Copyright (C) 2017, Darryl L. Pierce
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

package org.comixed.repositories;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;

import java.util.List;

import org.comixed.library.model.Page;
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
@TestPropertySource(locations = "classpath:test-application.properties")
@DatabaseSetup("classpath:test-comics.xml")
@TestExecutionListeners(
{DependencyInjectionTestExecutionListener.class,
 DirtiesContextTestExecutionListener.class,
 TransactionalTestExecutionListener.class,
 DbUnitTestExecutionListener.class})
public class PageRepositoryTest
{
    @Autowired
    private PageRepository repository;

    @Test
    public void testGetDuplicatePageList()
    {
        List<Page> result = repository.getDuplicatePageList();

        assertFalse(result.isEmpty());
        assertEquals(3, result.size());
        assertEquals(1000L, result.get(0).getComic().getId().longValue());
        assertEquals(1001L, result.get(1).getComic().getId().longValue());
        assertEquals(1002L, result.get(2).getComic().getId().longValue());
    }

    @Test
    public void testGetDuplicatePageCount()
    {
        assertEquals(3, repository.getDuplicatePageCount());
    }
}

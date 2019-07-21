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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.repositories;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

import org.apache.commons.lang.time.DateUtils;
import org.comixed.model.library.Comic;
import org.comixed.model.library.ComicFormat;
import org.comixed.model.library.Page;
import org.comixed.model.library.ScanType;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
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
public class ComicRepositoryTest
{
    private static final String TEST_COMIC_SORT_NAME = "My First Comic";
    private static final String TEST_COMIC_VINE_ID = "ABCDEFG";
    private static final long TEST_COMIC = 1000L;
    private static final long TEST_COMIC_WITH_BLOCKED_PAGES = 1001L;
    private static final Long TEST_COMIC_WITH_DELETED_PAGES = 1002L;
    private static final String TEST_IMPRINT = "This is an imprint";
    private static final Long TEST_USER_ID = 1000L;

    @Autowired
    private ComicRepository repository;

    @Autowired
    private PageTypeRepository pageTypeRepository;

    @Autowired
    private ScanTypeRepository scanTypeRepository;

    @Autowired
    private ComicFormatRepository comicFormatRepository;

    private Comic comic;

    @Before
    public void setUp() throws Exception
    {
        comic = repository.findById(TEST_COMIC).get();
    }

    @Test(expected = DataIntegrityViolationException.class)
    public void testFilenameIsRequired()
    {
        comic.setFilename(null);
        repository.save(comic);
    }

    @Test(expected = DataIntegrityViolationException.class)
    public void testFilenameMustBeUnique()
    {
        Comic newComic = new Comic();
        newComic.setFilename(comic.getFilename());

        repository.save(newComic);
    }

    @Test
    public void testFilenameIsUpdatable()
    {
        String filename = comic.getFilename().substring(1);
        comic.setFilename(filename);
        repository.save(comic);

        Comic result = repository.findById(comic.getId()).get();

        assertEquals(filename, result.getFilename());
    }

    @Test
    public void testComicVineId()
    {
        assertEquals(TEST_COMIC_VINE_ID, comic.getComicVineId());
    }

    @Test
    public void testComicVineIdIsNullable()
    {
        comic.setComicVineId(null);
        repository.save(comic);

        Comic result = repository.findById(comic.getId()).get();

        assertNull(result.getComicVineId());
    }

    @Test
    public void testComicVineIdIsUpdatable()
    {
        String id = comic.getComicVineId().substring(1);
        comic.setComicVineId(id);
        repository.save(comic);

        Comic result = repository.findById(comic.getId()).get();

        assertEquals(id, result.getComicVineId());
    }

    @Test
    public void testDateAddedCannotBeUpdated()
    {
        comic.setDateAdded(new Date());

        repository.save(comic);

        Comic result = repository.findById(comic.getId()).get();

        assertNotEquals(DateUtils.truncate(comic.getDateAdded(), Calendar.SECOND),
                        DateUtils.truncate(result.getDateAdded(), Calendar.SECOND));
    }

    @Test
    public void testCoverDateCanBeNull()
    {
        comic.setCoverDate(null);

        repository.save(comic);

        Comic result = repository.findById(comic.getId()).get();

        assertNull(result.getCoverDate());
    }

    @Test
    public void testCoverDateCanBeUpdated()
    {
        comic.setCoverDate(new Date());

        repository.save(comic);

        Comic result = repository.findById(comic.getId()).get();

        assertEquals(DateUtils.truncate(comic.getCoverDate(), Calendar.DAY_OF_MONTH),
                     DateUtils.truncate(result.getCoverDate(), Calendar.DAY_OF_MONTH));
    }

    @Test
    public void testVolumeCanBeNull()
    {
        comic.setVolume(null);

        repository.save(comic);

        Comic result = repository.findById(comic.getId()).get();

        assertNull(result.getVolume());
    }

    @Test
    public void testVolumeCanBeUpdated()
    {
        String volume = comic.getVolume().substring(1);
        comic.setVolume(volume);

        repository.save(comic);

        Comic result = repository.findById(comic.getId()).get();

        assertEquals(volume, result.getVolume());
    }

    @Test
    public void testIssueNumberCanBeNull()
    {
        comic.setIssueNumber(null);

        repository.save(comic);

        Comic result = repository.findById(comic.getId()).get();

        assertNull(result.getIssueNumber());
    }

    @Test
    public void testIssueNumberCanBeUpdated()
    {
        String issueno = comic.getIssueNumber().substring(1);
        comic.setIssueNumber(issueno);

        repository.save(comic);

        Comic result = repository.findById(comic.getId()).get();

        assertEquals(issueno, result.getIssueNumber());
    }

    @Test
    public void testDescriptionCanBeNull()
    {
        comic.setDescription(null);

        repository.save(comic);

        Comic result = repository.findById(comic.getId()).get();

        assertNull(result.getDescription());
    }

    @Test
    public void testDescriptionCanBeUpdated()
    {
        String description = comic.getDescription().substring(1);
        comic.setDescription(description);

        repository.save(comic);

        Comic result = repository.findById(comic.getId()).get();

        assertEquals(description, result.getDescription());
    }

    @Test
    public void testSummaryCanBeNull()
    {
        comic.setSummary(null);

        repository.save(comic);

        Comic result = repository.findById(comic.getId()).get();

        assertNull(result.getSummary());
    }

    @Test
    public void testSummaryCanBeUpdated()
    {
        String summary = comic.getSummary().substring(1);
        comic.setSummary(summary);

        repository.save(comic);

        Comic result = repository.findById(comic.getId()).get();

        assertEquals(summary, result.getSummary());
    }

    @Test
    public void testStoryArcs()
    {
        assertEquals(2, comic.getStoryArcCount());
    }

    @Test
    public void testTeams()
    {
        assertEquals(5, comic.getTeamCount());
    }

    @Test
    public void testCharacters()
    {
        assertEquals(1, comic.getCharacterCount());
    }

    @Test
    public void testLocations()
    {
        assertEquals(3, comic.getLocationCount());
    }

    @Test
    public void testPageCount()
    {
        assertEquals(5, comic.getPageCount());
    }

    @Test
    public void testPagesCanBeDeleted()
    {
        int count = comic.getPageCount() - 1;
        comic.deletePage(0);
        repository.save(comic);

        Comic result = repository.findById(comic.getId()).get();

        assertEquals(count, result.getPageCount());
    }

    @Test
    public void testPagesCanBeAdded()
    {
        int count = comic.getPageCount() + 1;
        Page page = new Page("src/test/example.jpg", new byte[0], pageTypeRepository.getDefaultPageType());
        comic.addPage(0, page);
        repository.save(comic);

        Comic result = repository.findById(comic.getId()).get();

        assertEquals(count, result.getPageCount());
        assertEquals(page, result.getPage(0));
    }

    @Test
    public void testComicsReturnTheirBlockedPageCount()
    {
        Comic result = repository.findById(TEST_COMIC_WITH_BLOCKED_PAGES).get();

        assertEquals(2, result.getBlockedPageCount());
    }

    @Test
    public void testComicsReturnTheirDeletedPageCount()
    {
        Comic result = repository.findById(TEST_COMIC_WITH_DELETED_PAGES).get();

        assertEquals(3, result.getDeletedPageCount());
    }

    @Test
    public void testComicReturnWithTheirScanType()
    {
        Comic result = repository.findById(TEST_COMIC).get();

        assertNotNull(result.getScanType());
        assertEquals(1, result.getScanType().getId());
    }

    @Test
    public void testComicScanTypeCanBeChanged()
    {
        ScanType scanType = scanTypeRepository.findById(2L).get();

        Comic record = repository.findById(TEST_COMIC).get();
        record.setScanType(scanType);

        repository.save(record);

        Comic result = repository.findById(TEST_COMIC).get();
        assertEquals(scanType.getId(), result.getScanType().getId());
    }

    @Test
    public void testComicReturnWithTheirFormat()
    {
        Comic result = repository.findById(TEST_COMIC).get();

        assertNotNull(result.getFormat());
        assertEquals(1L, result.getFormat().getId());
    }

    @Test
    public void testComicFormatCanBeChanged()
    {
        ComicFormat format = comicFormatRepository.findById(2L).get();

        Comic record = repository.findById(TEST_COMIC).get();
        record.setFormat(format);

        repository.save(record);

        Comic result = repository.findById(TEST_COMIC).get();
        assertEquals(format.getId(), result.getFormat().getId());
    }

    @Test
    public void testComicsReturnWithTheirImprint()
    {
        Comic result = repository.findById(TEST_COMIC).get();

        assertNotNull(result.getImprint());
        assertEquals("Marvel Digital", result.getImprint());
    }

    @Test
    public void testComicsImprintCanBeChanged()
    {
        Comic record = repository.findById(TEST_COMIC).get();
        record.setImprint(TEST_IMPRINT);

        repository.save(record);

        Comic result = repository.findById(TEST_COMIC).get();
        assertEquals(TEST_IMPRINT, result.getImprint());
    }

    @Test
    public void testComicsReturnWithSortName()
    {
        Comic result = repository.findById(TEST_COMIC).get();

        assertNotNull(result.getSortName());
        assertEquals(TEST_COMIC_SORT_NAME, result.getSortName());
    }

    @Test
    public void testComicSortNameCanBeChanged()
    {
        Comic record = repository.findById(TEST_COMIC).get();

        record.setSortName("Farkle");
        repository.save(record);

        Comic result = repository.findById(TEST_COMIC).get();
        assertEquals("Farkle", result.getSortName());
    }

    @Test
    public void testFindAllUnreadByUser()
    {
        List<Comic> result = repository.findAllUnreadByUser(TEST_USER_ID);

        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals(3, result.size());
    }
}

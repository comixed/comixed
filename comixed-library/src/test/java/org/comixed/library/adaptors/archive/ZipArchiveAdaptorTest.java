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

package org.comixed.library.adaptors.archive;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

import org.apache.commons.compress.archivers.zip.ZipFile;
import org.comixed.ComiXedTestContext;
import org.comixed.library.model.Comic;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = ComiXedTestContext.class)
@TestPropertySource(locations = "classpath:test-application.properties")
public class ZipArchiveAdaptorTest
{
    private static final String TEST_FILE_ENTRY_3 = "exampleCBR.jpg";
    private static final String TEST_FILE_ENTRY_2 = "example.png";
    private static final String TEST_FILE_ENTRY_1 = "example.jpg";
    private static final String TEST_FILE_ENTRY_0 = "example.jpeg";
    private static final String TEST_CBZ_FILE = "target/test-classes/example.cbz";
    private static final String TEST_CBR_FILE = "target/test-classes/example.cbr";
    private static final Object TEST_FILE_ENTRY_RENAMED_0 = "offset-000.jpeg";
    private static final Object TEST_FILE_ENTRY_RENAMED_1 = "offset-001.jpg";
    private static final Object TEST_FILE_ENTRY_RENAMED_2 = "offset-002.png";
    private static final Object TEST_FILE_ENTRY_RENAMED_3 = "offset-003.jpg";

    @Autowired
    private AbstractArchiveAdaptor<ZipFile> archiveAdaptor;

    private Comic comic;

    @Before
    public void setUp()
    {
        comic = new Comic();
        comic.setFilename(TEST_CBZ_FILE);
    }

    @Test(expected = ArchiveAdaptorException.class)
    public void testOpenFileNotFound() throws ArchiveAdaptorException
    {
        comic.setFilename(TEST_CBZ_FILE.substring(1));
        archiveAdaptor.loadComic(comic);
    }

    @Test(expected = ArchiveAdaptorException.class)
    public void testOpenFileIsDirectory() throws ArchiveAdaptorException
    {
        comic.setFilename("src/test/resources");
        archiveAdaptor.loadComic(comic);
    }

    @Test(expected = ArchiveAdaptorException.class)
    public void testOpenInvalidFile() throws ArchiveAdaptorException
    {
        comic.setFilename(TEST_CBR_FILE);
        archiveAdaptor.loadComic(comic);
    }

    @Test
    public void testLoadComic() throws ArchiveAdaptorException
    {
        archiveAdaptor.loadComic(comic);

        assertEquals(4, comic.getPageCount());
        assertEquals(TEST_FILE_ENTRY_0, comic.getPage(0).getFilename());
        assertEquals(TEST_FILE_ENTRY_1, comic.getPage(1).getFilename());
        assertEquals(TEST_FILE_ENTRY_2, comic.getPage(2).getFilename());
        assertEquals(TEST_FILE_ENTRY_3, comic.getPage(3).getFilename());
    }

    @Test
    public void testGetSingleFile() throws ArchiveAdaptorException
    {
        byte[] result = archiveAdaptor.loadSingleFile(comic, TEST_FILE_ENTRY_1);

        assertNotNull(result);
        assertEquals(7443280, result.length);
    }

    @Test
    public void testGetSingleFileNotFound() throws ArchiveAdaptorException
    {
        byte[] result = archiveAdaptor.loadSingleFile(comic, TEST_FILE_ENTRY_1.substring(1));

        assertNull(result);
    }

    @Test
    public void testSaveComic() throws ArchiveAdaptorException
    {
        // load an existing comic
        archiveAdaptor.loadComic(comic);

        // now save it and reload it
        Comic result = archiveAdaptor.saveComic(comic, false);

        assertEquals(4, result.getPageCount());
        assertEquals(TEST_FILE_ENTRY_0, result.getPage(0).getFilename());
        assertEquals(TEST_FILE_ENTRY_1, result.getPage(1).getFilename());
        assertEquals(TEST_FILE_ENTRY_2, result.getPage(2).getFilename());
        assertEquals(TEST_FILE_ENTRY_3, result.getPage(3).getFilename());
    }

    @Test
    public void testSaveComicRenamePages() throws ArchiveAdaptorException
    {
        // load an existing comic
        archiveAdaptor.loadComic(comic);

        // now save it and reload it
        Comic result = archiveAdaptor.saveComic(comic, true);

        assertEquals(4, result.getPageCount());
        assertEquals(TEST_FILE_ENTRY_RENAMED_0, result.getPage(0).getFilename());
        assertEquals(TEST_FILE_ENTRY_RENAMED_1, result.getPage(1).getFilename());
        assertEquals(TEST_FILE_ENTRY_RENAMED_2, result.getPage(2).getFilename());
        assertEquals(TEST_FILE_ENTRY_RENAMED_3, result.getPage(3).getFilename());
    }

    @Test
    public void testSaveComicDeletePages() throws ArchiveAdaptorException
    {
        // load an existing comic
        archiveAdaptor.loadComic(comic);

        comic.getPage(1).markDeleted(true);

        // now save it and reload it
        Comic result = archiveAdaptor.saveComic(comic, false);

        assertEquals(3, result.getPageCount());
        assertEquals(TEST_FILE_ENTRY_0, result.getPage(0).getFilename());
        assertEquals(TEST_FILE_ENTRY_2, result.getPage(1).getFilename());
        assertEquals(TEST_FILE_ENTRY_3, result.getPage(2).getFilename());
    }

    @Test
    public void testGetFirstImageFileName() throws ArchiveAdaptorException
    {
        assertEquals(TEST_FILE_ENTRY_0, archiveAdaptor.getFirstImageFileName(TEST_CBZ_FILE));
    }

    @Test
    public void testLoadSingleFile() throws ArchiveAdaptorException
    {
        byte[] result = archiveAdaptor.loadSingleFile(TEST_CBZ_FILE, TEST_FILE_ENTRY_1);

        assertNotNull(result);
        assertEquals(7443280, result.length);
    }
}

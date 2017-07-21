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

package org.comixed.library.loaders;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

import org.comixed.ComixEdTestContext;
import org.comixed.library.model.Comic;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = ComixEdTestContext.class)
@TestPropertySource(locations = "classpath:test-application.properties")
public class ZipArchiveLoaderTest
{
    private static final String TEST_FILE_ENTRY_3 = "exampleCBR.jpg";
    private static final String TEST_FILE_ENTRY_2 = "example.png";
    private static final String TEST_FILE_ENTRY_1 = "example.jpg";
    private static final String TEST_FILE_ENTRY_0 = "example.jpeg";
    private static final String TEST_CBZ_FILE = "target/test-classes/example.cbz";
    private static final String TEST_CBR_FILE = "target/test-classes/example.cbr";

    @Autowired
    private ZipArchiveLoader archiveLoader;

    private Comic comic;

    @Before
    public void setUp()
    {
        comic = new Comic();
        comic.setFilename(TEST_CBZ_FILE);
    }

    @Test(expected = ArchiveLoaderException.class)
    public void testOpenFileNotFound() throws ArchiveLoaderException
    {
        comic.setFilename(TEST_CBZ_FILE.substring(1));
        archiveLoader.loadComic(comic);
    }

    @Test(expected = ArchiveLoaderException.class)
    public void testOpenFileIsDirectory() throws ArchiveLoaderException
    {
        comic.setFilename("src/test/resources");
        archiveLoader.loadComic(comic);
    }

    @Test(expected = ArchiveLoaderException.class)
    public void testOpenInvalidFile() throws ArchiveLoaderException
    {
        comic.setFilename(TEST_CBR_FILE);
        archiveLoader.loadComic(comic);
    }

    @Test
    public void testLoadComic() throws ArchiveLoaderException
    {
        archiveLoader.loadComic(comic);

        assertEquals(4, comic.getPageCount());
        assertEquals(TEST_FILE_ENTRY_0, comic.getPage(0).getFilename());
        assertEquals(TEST_FILE_ENTRY_1, comic.getPage(1).getFilename());
        assertEquals(TEST_FILE_ENTRY_2, comic.getPage(2).getFilename());
        assertEquals(TEST_FILE_ENTRY_3, comic.getPage(3).getFilename());
    }

    @Test
    public void testGetSingleFile() throws ArchiveLoaderException
    {
        byte[] result = archiveLoader.loadSingleFile(comic, TEST_FILE_ENTRY_1);

        assertNotNull(result);
        assertEquals(7443280, result.length);
    }

    @Test
    public void testGetSingleFileNotFound() throws ArchiveLoaderException
    {
        byte[] result = archiveLoader.loadSingleFile(comic, TEST_FILE_ENTRY_1.substring(1));

        assertNull(result);
    }

    @Test
    public void testSaveComic() throws ArchiveLoaderException
    {
        // load an existing comic
        archiveLoader.loadComic(comic);

        // now save it and reload it
        Comic result = archiveLoader.saveComic(comic);

        assertEquals(4, result.getPageCount());
        assertEquals(TEST_FILE_ENTRY_0, result.getPage(0).getFilename());
        assertEquals(TEST_FILE_ENTRY_1, result.getPage(1).getFilename());
        assertEquals(TEST_FILE_ENTRY_2, result.getPage(2).getFilename());
        assertEquals(TEST_FILE_ENTRY_3, result.getPage(3).getFilename());
    }
}

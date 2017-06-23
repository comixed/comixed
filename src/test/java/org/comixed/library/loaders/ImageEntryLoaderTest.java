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

import java.io.IOException;

import org.comixed.library.model.Comic;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
@TestPropertySource(locations = "classpath:test-application.properties")
public class ImageEntryLoaderTest extends BaseLoaderTest
{
    private static final String TEST_FILENAME = "src/test/resources/example.jpg";

    @InjectMocks
    private ImageEntryLoader loader;

    private Comic comic;

    @Before
    public void setUp()
    {
        comic = new Comic();
    }

    @Test
    public void testLoadImage() throws IOException
    {
        byte[] content = loadFile(TEST_FILENAME);

        loader.loadContent(comic, TEST_FILENAME, content);

        assertEquals(1, comic.getPageCount());
        assertNotNull(comic.getPage(0));
        assertEquals(content, comic.getPage(0).getContent());
    }
}

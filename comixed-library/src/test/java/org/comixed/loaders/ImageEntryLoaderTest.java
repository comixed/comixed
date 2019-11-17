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

package org.comixed.loaders;

import org.comixed.model.library.Comic;
import org.comixed.model.library.PageType;
import org.comixed.repositories.PageTypeRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.io.IOException;

import static org.junit.Assert.*;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
@TestPropertySource(locations = "classpath:application.properties")
public class ImageEntryLoaderTest
        extends BaseLoaderTest {
    private static final String TEST_FILENAME = "src/test/resources/example.jpg";

    @InjectMocks private ImageEntryLoader loader;

    @Mock private PageTypeRepository pageTypeRepository;

    @Mock private PageType pageType;

    private Comic comic;

    @Before
    public void setUp() {
        comic = new Comic();
    }

    @Test
    public void testLoadImage()
            throws
            IOException {
        Mockito.when(pageTypeRepository.getDefaultPageType())
               .thenReturn(pageType);

        byte[] content = loadFile(TEST_FILENAME);

        loader.loadContent(comic,
                           TEST_FILENAME,
                           content);

        Mockito.verify(pageTypeRepository,
                       Mockito.times(1))
               .getDefaultPageType();

        assertEquals(1,
                     comic.getPageCount());
        assertNotNull(comic.getPage(0));
        //        assertEquals(content, comic.getPage(0).getContent());
        assertSame(pageType,
                   comic.getPage(0)
                        .getPageType());
    }
}

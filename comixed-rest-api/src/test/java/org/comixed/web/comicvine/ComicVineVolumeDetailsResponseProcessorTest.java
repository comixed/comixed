/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

package org.comixed.web.comicvine;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.comixed.model.library.Comic;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = {ComicVineVolumeDetailsResponseProcessor.class,
                           ComicVineResponseAdaptor.class,
                           ObjectMapper.class})
public class ComicVineVolumeDetailsResponseProcessorTest {
    private static final byte[] TEST_BAD_CONTENT = "This is invalid content".getBytes();
    private static final byte[] TEST_GOOD_CONTENT = "{\"error\":\"OK\",\"limit\":1,\"offset\":0,\"number_of_page_results\":1,\"number_of_total_results\":1,\"status_code\":1,\"results\":{\"name\":\"Harley Quinn\",\"publisher\":{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/publisher\\/4010-10\\/\",\"id\":10,\"name\":\"DC Comics\"},\"start_year\":\"2016\"},\"version\":\"1.0\"}".getBytes();

    @Autowired private ComicVineVolumeDetailsResponseProcessor processor;
    @Mock private Comic comic;

    @Test(expected = ComicVineAdaptorException.class)
    public void testProcessBadContent()
            throws
            ComicVineAdaptorException {
        processor.process(TEST_BAD_CONTENT,
                          comic);
    }

    @Test
    public void testProcess()
            throws
            ComicVineAdaptorException {
        Mockito.doNothing()
               .when(comic)
               .setVolume(Mockito.anyString());

        String result = processor.process(TEST_GOOD_CONTENT,
                                          comic);

        assertNotNull(result);
        assertEquals("10",
                     result);

        Mockito.verify(comic,
                       Mockito.times(1))
               .setVolume("2016");
        Mockito.verify(comic,
                       Mockito.times(1))
               .setSeries("Harley Quinn");
    }
}

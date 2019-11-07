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
import org.comixed.web.model.ScrapingVolume;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.*;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = {ComicVineVolumesResponseProcessor.class,
                           ComicVineResponseAdaptor.class,
                           ObjectMapper.class})
public class ComicVineVolumesResponseProcessorTest {
    private static final byte[] TEST_BAD_CONTENT = "Just some random data".getBytes();
    private static final byte[] TEST_GOOD_CONTENT_FIRST_PAGE = "{\"error\":\"OK\",\"limit\":1,\"offset\":0,\"number_of_page_results\":1,\"number_of_total_results\":1489,\"status_code\":1,\"results\":[{\"count_of_issues\":716,\"id\":796,\"image\":{\"icon_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/square_avatar\\/3421824-2.png\",\"medium_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/scale_medium\\/3421824-2.png\",\"screen_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/screen_medium\\/3421824-2.png\",\"screen_large_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/screen_kubrick\\/3421824-2.png\",\"small_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/scale_small\\/3421824-2.png\",\"super_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/scale_large\\/3421824-2.png\",\"thumb_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/scale_avatar\\/3421824-2.png\",\"tiny_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/square_mini\\/3421824-2.png\",\"original_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/original\\/3421824-2.png\",\"image_tags\":\"All Images\"},\"name\":\"Batman\",\"publisher\":{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/publisher\\/4010-10\\/\",\"id\":10,\"name\":\"DC Comics\"},\"start_year\":\"1940\",\"resource_type\":\"volume\"}],\"version\":\"1.0\"}".getBytes();
    private static final byte[] TEST_GOOD_CONTENT_LAST_PAGE = "{\"error\":\"OK\",\"limit\":1,\"offset\":1488,\"number_of_page_results\":1,\"number_of_total_results\":1489,\"status_code\":1,\"results\":[{\"count_of_issues\":0,\"id\":55645,\"image\":{\"icon_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/square_avatar\\/2800657-2800654-601995.jpeg\",\"medium_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/scale_medium\\/2800657-2800654-601995.jpeg\",\"screen_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/screen_medium\\/2800657-2800654-601995.jpeg\",\"screen_large_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/screen_kubrick\\/2800657-2800654-601995.jpeg\",\"small_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/scale_small\\/2800657-2800654-601995.jpeg\",\"super_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/scale_large\\/2800657-2800654-601995.jpeg\",\"thumb_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/scale_avatar\\/2800657-2800654-601995.jpeg\",\"tiny_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/square_mini\\/2800657-2800654-601995.jpeg\",\"original_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/original\\/2800657-2800654-601995.jpeg\",\"image_tags\":\"All Images\"},\"name\":\"Superman & Batman: World's Finest\",\"publisher\":null,\"start_year\":null,\"resource_type\":\"volume\"}],\"version\":\"1.0\"}".getBytes();

    @Autowired private ComicVineVolumesResponseProcessor processor;

    private List<ScrapingVolume> volumes = new ArrayList<>();

    @Test(expected = ComicVineAdaptorException.class)
    public void testProcessWithBadContent()
            throws
            ComicVineAdaptorException {
        processor.process(volumes,
                          TEST_BAD_CONTENT);
    }

    @Test
    public void testProcessFirstPage()
            throws
            ComicVineAdaptorException {
        boolean result = processor.process(volumes,
                                           TEST_GOOD_CONTENT_FIRST_PAGE);

        assertFalse(result);
        assertEquals(1,
                     volumes.size());

        ScrapingVolume volume = volumes.get(0);
        assertEquals("Batman",
                     volume.getName());
        assertEquals(717,
                     volume.getIssueCount());
        assertEquals(796,
                     volume.getId());
        assertEquals("1940",
                     volume.getStartYear());
        assertEquals("DC Comics",
                     volume.getPublisher());
    }

    @Test
    public void testProcessLastPage()
            throws
            ComicVineAdaptorException {
        boolean result = processor.process(volumes,
                                           TEST_GOOD_CONTENT_LAST_PAGE);

        assertTrue(result);
        assertEquals(1,
                     volumes.size());

        ScrapingVolume volume = volumes.get(0);
        assertEquals("Superman & Batman: World's Finest",
                     volume.getName());
        assertEquals(1,
                     volume.getIssueCount());
        assertEquals(55645,
                     volume.getId());
        assertEquals("",
                     volume.getStartYear());
        assertEquals("",
                     volume.getPublisher());
    }
}

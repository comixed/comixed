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
import org.comixed.web.model.ScrapingIssue;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = {ComicVineIssueResponseProcessor.class,
                           ComicVineResponseAdaptor.class,
                           ObjectMapper.class})
public class ComicVineIssueResponseProcessorTest {
    private static final byte[] TEST_BAD_CONTENT = "This is invalid content".getBytes();
    private static final byte[] TEST_GOOD_CONTENT = "{\"error\":\"OK\",\"limit\":100,\"offset\":0,\"number_of_page_results\":1,\"number_of_total_results\":1,\"status_code\":1,\"results\":[{\"cover_date\":\"2018-04-30\",\"description\":\"<p><em>\\u201cANGRY BIRD\\u201d part two! The Penguin didn\\u2019t come to Brooklyn alone this time...he\\u2019s put out an open invitation for some of Gotham City\\u2019s worst to join him in his new criminal empire, as long as they\\u2019re willing to hold off Harley Quinn! And when we say \\u201cworst,\\u201d we mean worst! Film Freak? Egghead? Condiment King?! Nateman\\u2019s Hot Dogs is gonna have a lot to say about that...<\\/em><\\/p><h4>List of covers and their creators:<\\/h4><table data-max-width=\\\"true\\\"><thead><tr><th scope=\\\"col\\\">Cover<\\/th><th scope=\\\"col\\\">Name<\\/th><th scope=\\\"col\\\">Creator(s)<\\/th><th scope=\\\"col\\\">Sidebar Location<\\/th><\\/tr><\\/thead><tbody><tr><td>Reg<\\/td><td>Regular Cover<\\/td><td>Darwyn Cooke, Amanda Conner &amp; Paul Mounts<\\/td><td>1<\\/td><\\/tr><tr><td>Var<\\/td><td>Variant Cover<\\/td><td>Frank Cho &amp; Sabine Rich<\\/td><td>2<\\/td><\\/tr><\\/tbody><\\/table>\",\"id\":660635,\"image\":{\"icon_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/square_avatar\\/6291970-38.jpg\",\"medium_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/scale_medium\\/6291970-38.jpg\",\"screen_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/screen_medium\\/6291970-38.jpg\",\"screen_large_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/screen_kubrick\\/6291970-38.jpg\",\"small_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/scale_small\\/6291970-38.jpg\",\"super_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/scale_large\\/6291970-38.jpg\",\"thumb_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/scale_avatar\\/6291970-38.jpg\",\"tiny_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/square_mini\\/6291970-38.jpg\",\"original_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/image\\/original\\/6291970-38.jpg\",\"image_tags\":\"All Images\"},\"issue_number\":\"38\",\"name\":\"Angry Bird Part Two\",\"store_date\":\"2018-02-21\",\"volume\":{\"api_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/api\\/volume\\/4050-92750\\/\",\"id\":92750,\"name\":\"Harley Quinn\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/harley-quinn\\/4050-92750\\/\"}}],\"version\":\"1.0\"}".getBytes();

    @Autowired private ComicVineIssueResponseProcessor processor;

    @Test(expected = ComicVineAdaptorException.class)
    public void testProcessWithBadContent()
            throws
            ComicVineAdaptorException {
        processor.process(TEST_BAD_CONTENT);
    }

    @Test
    public void testProcess()
            throws
            ComicVineAdaptorException {
        ScrapingIssue result = processor.process(TEST_GOOD_CONTENT);

        assertNotNull(result);

        assertEquals(660635,
                     result.getId());
        assertEquals("38",
                     result.getIssueNumber());
        assertEquals("2018-04-30",
                     result.getCoverDate());
        assertEquals("https://comicvine.gamespot.com/api/image/original/6291970-38.jpg",
                     result.getCoverUrl());
        assertEquals("Harley Quinn",
                     result.getVolumeName());
        assertEquals(92750,
                     result.getVolumeId());
    }
}

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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;

import java.io.IOException;
import java.util.List;

import org.comixed.web.model.ComicVolume;
import org.junit.Before;
import org.junit.Test;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;

public class ComicVineVolumeQueryResultTest
{
    private static final int TEST_STATUS_CODE = 1;
    private static final int TEST_LIMIT = 5;
    private static final int TEST_PAGE = 0;
    private static final int TEST_TOTAL_PAGES = 5;
    private static final int TEST_TOTAL_RESULTS = 67;
    private static final String TEST_STATUS_TEXT = "OK";
    private static final int TEST_ID = 72;
    private static final int TEST_ISSUE_COUNT = 17;
    private static final String TEST_VOLUME_NAME = "Test Volume";
    private static final String TEST_VOLUME_IMAGE_URL = "http://someplace.online/cover.png";
    private static final int TEST_VOLUME_START_YEAR = 1994;
    private static final String TEST_PUBLISHER = "ComiXed Publications";

    private ComicVineVolumesReponseProcessor subject;

    private ComicVineVolume volume;

    @Before
    public void setUp() throws JsonParseException, JsonMappingException, IOException
    {
        subject = new ComicVineVolumesReponseProcessor();
        subject.statusText = TEST_STATUS_TEXT;
        subject.limit = TEST_LIMIT;
        subject.page = TEST_PAGE;
        subject.totalPages = TEST_TOTAL_PAGES;
        subject.totalResults = TEST_TOTAL_RESULTS;
        subject.statusCode = TEST_STATUS_CODE;

        volume = new ComicVineVolume();
        volume.id = TEST_ID;
        volume.issueCount = TEST_ISSUE_COUNT;
        volume.name = TEST_VOLUME_NAME;
        volume.imageURLs.put(ComicVineVolume.IMAGE_URL_TO_USE_KEY, TEST_VOLUME_IMAGE_URL);
        volume.startYear = TEST_VOLUME_START_YEAR;
        volume.publisher.put(ComicVineVolume.PUBLISHER_NAME_KEY, TEST_PUBLISHER);

        subject.getVolumes().add(volume);
    }

    @Test
    public void testResultHasStatusText()
    {
        assertEquals(TEST_STATUS_TEXT, subject.getStatusText());
    }

    @Test
    public void testResultHasLimit()
    {
        assertEquals(TEST_LIMIT, subject.getLimit());
    }

    @Test
    public void testResultHasPage()
    {
        assertEquals(TEST_PAGE, subject.getPage());
    }

    @Test
    public void testResultHasTotalPages()
    {
        assertEquals(TEST_TOTAL_PAGES, subject.getTotalPages());
    }

    @Test
    public void testResultHasTotalResults()
    {
        assertEquals(TEST_TOTAL_RESULTS, subject.getTotalResults());
    }

    @Test
    public void testResultHasStatusCode()
    {
        assertEquals(TEST_STATUS_CODE, subject.getStatusCode());
    }

    @Test
    public void testResultHasCorrectNumberOfVolumes()
    {
        assertEquals(1, subject.getVolumes().size());
    }

    @Test
    public void testResultHasCorrectStartYear()
    {
        assertEquals(TEST_VOLUME_START_YEAR, subject.getVolumes().get(0).getStartYear());
    }

    @Test
    public void testResultHashCorrectPublisher()
    {
        assertEquals(TEST_PUBLISHER, subject.getVolumes().get(0).getPublisher());
    }

    @Test
    public void testTransform()
    {
        List<ComicVolume> result = subject.transform();

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals(TEST_ID, result.get(0).getId());
        // ComicVine reports 1 fewer issues on volumes for some reason
        assertEquals(TEST_ISSUE_COUNT + 1, result.get(0).getIssueCount());
        assertEquals(TEST_VOLUME_NAME, result.get(0).getName());
        assertEquals(TEST_VOLUME_IMAGE_URL, result.get(0).getImageURL());
        assertEquals(TEST_PUBLISHER, result.get(0).getPublisher());
    }
}

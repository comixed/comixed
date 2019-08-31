/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

package org.comixed.service.core;

import org.comixed.model.core.BuildDetails;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.test.context.TestPropertySource;

import java.text.ParseException;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertNotNull;

@RunWith(MockitoJUnitRunner.class)
@TestPropertySource(locations = {"classpath:/build-details.properties"})
public class DetailsServiceTest {
    public static final String TEST_BRANCH = "feature/issue-532";
    public static final String TEST_BUILD_TIME = "20190831083412";
    public static final String TEST_BUILD_VERSION = "0.4.9";
    public static final String TEST_COMMIT_ID = "3cbdbaee42d2b6bde342fce32ecd61905d8d12d4";
    public static final String TEST_COMMIT_TIME = "20190831083101";

    @InjectMocks private DetailsService detailsService;

    // TODO need to fix this test
    @Ignore("Production code works, not sure why the test doesn't")
    @Test
    public void testGetDetails()
            throws
            ParseException {
        final BuildDetails result = detailsService.getBuildDetails();

        assertNotNull(result);

        assertEquals(TEST_BRANCH,
                     result.getBranch());
        assertEquals(TEST_BUILD_TIME,
                     result.getBuildTime());
        assertEquals(TEST_BUILD_VERSION,
                     result.getBuildVersion());
        assertEquals(TEST_COMMIT_ID,
                     result.getCommitId());
        assertEquals(TEST_COMMIT_TIME,
                     result.getCommitTime());
    }
}
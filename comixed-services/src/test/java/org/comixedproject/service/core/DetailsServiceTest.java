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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject.service.core;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertNotNull;

import java.text.ParseException;
import java.util.Calendar;
import org.comixedproject.model.core.BuildDetails;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = DetailsService.class)
@TestPropertySource(locations = {"classpath:/build-details.properties"})
public class DetailsServiceTest {
  private static final String TEST_BRANCH = "feature/issue-189";
  private static final String TEST_BUILD_HOST = "buildmachine.local";
  private static final Calendar TEST_BUILD_TIME = Calendar.getInstance();
  private static final String TEST_BUILD_VERSION = "0.4.9";
  private static final String TEST_COMMIT_ID = "3cbdbaee42d2b6bde342fce32ecd61905d8d12d4";
  private static final Calendar TEST_COMMIT_TIME = Calendar.getInstance();
  private static final String TEST_COMMIT_MESSAGE =
      "[Issue #189] Moved build metadata into build-details.properties.";
  private static final String TEST_COMMIT_EMAIL = "mcpierce@gmail.com";
  private static final String TEST_COMMIT_USER = "Darryl L. Pierce";
  private static final boolean TEST_COMMIT_DIRTY = true;
  private static final String TEST_REMOTE_ORIGIN_URL = "git@github.com:mcpierce/comixed.git";

  static {
    TEST_BUILD_TIME.clear();
    TEST_BUILD_TIME.set(2019, 7, 31, 8, 34, 12);
    TEST_COMMIT_TIME.clear();
    TEST_COMMIT_TIME.set(2019, 7, 31, 8, 31, 01);
  }

  @Autowired private DetailsService detailsService;

  @Test
  public void testGetDetails() throws ParseException {
    final BuildDetails result = detailsService.getBuildDetails();

    assertNotNull(result);

    assertEquals(TEST_BRANCH, result.getBranch());
    assertEquals(TEST_BUILD_HOST, result.getBuildHost());
    assertEquals(TEST_BUILD_TIME.getTime(), result.getBuildTime());
    assertEquals(TEST_BUILD_VERSION, result.getBuildVersion());
    assertEquals(TEST_COMMIT_ID, result.getCommitId());
    assertEquals(TEST_COMMIT_TIME.getTime(), result.getCommitTime());
    assertEquals(TEST_COMMIT_MESSAGE, result.getCommitMessage());
    assertEquals(TEST_COMMIT_EMAIL, result.getCommitEmail());
    assertEquals(TEST_COMMIT_USER, result.getCommitUser());
    assertEquals(TEST_COMMIT_DIRTY, result.isDirty());
    assertEquals(TEST_REMOTE_ORIGIN_URL, result.getRemoteOriginURL());
  }
}

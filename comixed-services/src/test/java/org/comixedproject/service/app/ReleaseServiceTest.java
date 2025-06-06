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

package org.comixedproject.service.app;

import static junit.framework.TestCase.*;

import java.text.ParseException;
import org.comixedproject.model.app.BuildDetails;
import org.comixedproject.model.net.app.LatestReleaseDetails;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class ReleaseServiceTest {
  private static final String TEST_BRANCH = "feature/issue-189";
  private static final String TEST_BUILD_HOST = "buildmachine.local";
  private static final String TEST_BUILD_TIME = "20190831083412";
  private static final String TEST_BUILD_VERSION = "1.0.1-2";
  private static final String TEST_NEWER_VERSION = "1.0.1-3";
  private static final String TEST_COMMIT_TIME = "20190831083101";
  private static final String TEST_COMMIT_DIRTY = Boolean.TRUE.toString();
  private static final String TEST_REMOTE_ORIGIN_URL = "git@github.com:mcpierce/comixed.git";
  private static final String TEST_DATASOURCE_URL = "jdbc:mysql://localhost:3306/comixed";

  @InjectMocks private ReleaseService service;
  @Mock private GetLatestReleaseAction getLatestReleaseAction;
  @Mock private LatestReleaseDetails latestReleaseDetails;

  @BeforeEach
  public void setUp() {
    ReflectionTestUtils.setField(service, "branch", TEST_BRANCH);
    ReflectionTestUtils.setField(service, "buildHost", TEST_BUILD_HOST);
    ReflectionTestUtils.setField(service, "buildTime", TEST_BUILD_TIME);
    ReflectionTestUtils.setField(service, "buildVersion", TEST_BUILD_VERSION);
    ReflectionTestUtils.setField(service, "commitTime", TEST_COMMIT_TIME);
    ReflectionTestUtils.setField(service, "dirty", TEST_COMMIT_DIRTY);
    ReflectionTestUtils.setField(service, "remoteOriginURL", TEST_REMOTE_ORIGIN_URL);
    ReflectionTestUtils.setField(service, "jdbcUrl", TEST_DATASOURCE_URL);
  }

  @Test
  void GetCurrentReleaseDetails() throws ParseException {
    final BuildDetails result = service.getCurrentReleaseDetails();

    assertNotNull(result);

    assertEquals(TEST_BRANCH, result.getBranch());
    assertEquals(TEST_BUILD_HOST, result.getBuildHost());
    assertNotNull(TEST_BUILD_TIME, result.getBuildTime());
    assertEquals(TEST_BUILD_VERSION, result.getBuildVersion());
    assertNotNull(TEST_COMMIT_TIME, result.getCommitTime());
    assertEquals(Boolean.parseBoolean(TEST_COMMIT_DIRTY), result.isDirty());
    assertEquals(TEST_REMOTE_ORIGIN_URL, result.getRemoteOriginURL());
    assertEquals(System.getProperty("java.runtime.version"), result.getJavaVersion());
    assertEquals(System.getProperty("java.vendor"), result.getJavaVendor());
    assertEquals(System.getProperty("os.name"), result.getOsName());
    assertEquals(System.getProperty("os.arch"), result.getOsArch());
    assertEquals(System.getProperty("os.version"), result.getOsVersion());
  }

  @Test
  void getLatestReleaseDetails_sameVersion() {
    Mockito.when(latestReleaseDetails.getVersion()).thenReturn("v" + TEST_BUILD_VERSION);
    Mockito.when(getLatestReleaseAction.execute()).thenReturn(latestReleaseDetails);

    final LatestReleaseDetails result = service.getLatestReleaseDetails();

    assertNotNull(result);
    assertSame(latestReleaseDetails, result);

    Mockito.verify(getLatestReleaseAction, Mockito.times(1)).execute();
    Mockito.verify(latestReleaseDetails, Mockito.times(1)).setNewer(false);
  }

  @Test
  void getLatestReleaseDetailsDifferentVersion() {
    Mockito.when(latestReleaseDetails.getVersion()).thenReturn("v" + TEST_NEWER_VERSION);
    Mockito.when(getLatestReleaseAction.execute()).thenReturn(latestReleaseDetails);

    final LatestReleaseDetails result = service.getLatestReleaseDetails();

    assertNotNull(result);
    assertSame(latestReleaseDetails, result);

    Mockito.verify(getLatestReleaseAction, Mockito.times(1)).execute();
    Mockito.verify(latestReleaseDetails, Mockito.times(1)).setNewer(true);
  }
}

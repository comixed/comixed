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

package org.comixedproject.rest.metadata;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertSame;

import java.util.List;
import org.comixedproject.metadata.MetadataException;
import org.comixedproject.metadata.model.IssueMetadata;
import org.comixedproject.metadata.model.VolumeMetadata;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.metadata.MetadataAuditLogEntry;
import org.comixedproject.model.net.metadata.LoadIssueMetadataRequest;
import org.comixedproject.model.net.metadata.LoadVolumeMetadataRequest;
import org.comixedproject.model.net.metadata.ScrapeComicRequest;
import org.comixedproject.service.metadata.MetadataService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class MetadataControllerTest {
  private static final Long TEST_METADATA_SOURCE_ID = 73L;
  private static final String TEST_SERIES_NAME = "Awesome Comic";
  private static final Integer TEST_MAX_RECORDS = 37;
  private static final Integer TEST_VOLUME = 2018;
  private static final String TEST_ISSUE_NUMBER = "15";
  private static final long TEST_COMIC_ID = 213L;
  private static final Integer TEST_ISSUE_ID = 48132;
  private static final boolean TEST_SKIP_CACHE = true;

  @InjectMocks private MetadataController controller;
  @Mock private MetadataService metadataService;
  @Mock private List<VolumeMetadata> comicVolumeList;
  @Mock private IssueMetadata comicIssue;
  @Mock private Comic comic;
  @Mock private List<MetadataAuditLogEntry> auditLogEntryList;

  @Test(expected = MetadataException.class)
  public void testLoadScrapingVolumesAdaptorRaisesException() throws MetadataException {
    Mockito.when(
            metadataService.getVolumes(
                Mockito.anyLong(), Mockito.anyString(), Mockito.anyInt(), Mockito.anyBoolean()))
        .thenThrow(MetadataException.class);

    try {
      controller.loadScrapingVolumes(
          TEST_METADATA_SOURCE_ID,
          new LoadVolumeMetadataRequest(TEST_SERIES_NAME, TEST_MAX_RECORDS, false));
    } finally {
      Mockito.verify(metadataService, Mockito.times(1))
          .getVolumes(TEST_METADATA_SOURCE_ID, TEST_SERIES_NAME, TEST_MAX_RECORDS, false);
    }
  }

  @Test
  public void testLoadScrapingVolumes() throws MetadataException {
    Mockito.when(
            metadataService.getVolumes(
                Mockito.anyLong(), Mockito.anyString(), Mockito.anyInt(), Mockito.anyBoolean()))
        .thenReturn(comicVolumeList);

    final List<VolumeMetadata> response =
        controller.loadScrapingVolumes(
            TEST_METADATA_SOURCE_ID,
            new LoadVolumeMetadataRequest(TEST_SERIES_NAME, TEST_MAX_RECORDS, false));

    assertNotNull(response);
    assertSame(comicVolumeList, response);

    Mockito.verify(metadataService, Mockito.times(1))
        .getVolumes(TEST_METADATA_SOURCE_ID, TEST_SERIES_NAME, TEST_MAX_RECORDS, false);
  }

  @Test
  public void testLoadScrapingVolumesSkipCache() throws MetadataException {
    Mockito.when(
            metadataService.getVolumes(
                Mockito.anyLong(), Mockito.anyString(), Mockito.anyInt(), Mockito.anyBoolean()))
        .thenReturn(comicVolumeList);

    final List<VolumeMetadata> response =
        controller.loadScrapingVolumes(
            TEST_METADATA_SOURCE_ID,
            new LoadVolumeMetadataRequest(TEST_SERIES_NAME, TEST_MAX_RECORDS, true));

    assertNotNull(response);
    assertSame(comicVolumeList, response);

    Mockito.verify(metadataService, Mockito.times(1))
        .getVolumes(TEST_METADATA_SOURCE_ID, TEST_SERIES_NAME, TEST_MAX_RECORDS, true);
  }

  @Test(expected = MetadataException.class)
  public void testLoadScrapingIssueAdaptorRaisesException() throws MetadataException {
    Mockito.when(
            metadataService.getIssue(
                Mockito.anyLong(), Mockito.anyInt(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenThrow(MetadataException.class);

    try {
      controller.loadScrapingIssue(
          TEST_METADATA_SOURCE_ID,
          TEST_VOLUME,
          TEST_ISSUE_NUMBER,
          new LoadIssueMetadataRequest(TEST_SKIP_CACHE));
    } finally {
      Mockito.verify(metadataService, Mockito.times(1))
          .getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME, TEST_ISSUE_NUMBER, TEST_SKIP_CACHE);
    }
  }

  @Test
  public void testLoadScrapingIssue() throws MetadataException {
    Mockito.when(
            metadataService.getIssue(
                Mockito.anyLong(), Mockito.anyInt(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(comicIssue);

    IssueMetadata response =
        controller.loadScrapingIssue(
            TEST_METADATA_SOURCE_ID,
            TEST_VOLUME,
            TEST_ISSUE_NUMBER,
            new LoadIssueMetadataRequest(TEST_SKIP_CACHE));

    assertNotNull(response);
    assertSame(comicIssue, response);

    Mockito.verify(metadataService, Mockito.times(1))
        .getIssue(TEST_METADATA_SOURCE_ID, TEST_VOLUME, TEST_ISSUE_NUMBER, TEST_SKIP_CACHE);
  }

  @Test(expected = MetadataException.class)
  public void testScrapeComicScrapingAdaptorRaisesException() throws MetadataException {
    Mockito.when(
            metadataService.scrapeComic(
                Mockito.anyLong(), Mockito.anyLong(), Mockito.anyInt(), Mockito.anyBoolean()))
        .thenThrow(MetadataException.class);

    try {
      controller.scrapeComic(
          TEST_METADATA_SOURCE_ID,
          TEST_COMIC_ID,
          new ScrapeComicRequest(TEST_ISSUE_ID, TEST_SKIP_CACHE));
    } finally {
      Mockito.verify(metadataService, Mockito.times(1))
          .scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, TEST_SKIP_CACHE);
    }
  }

  @Test
  public void testScrapeComic() throws MetadataException {
    Mockito.when(
            metadataService.scrapeComic(
                Mockito.anyLong(), Mockito.anyLong(), Mockito.anyInt(), Mockito.anyBoolean()))
        .thenReturn(comic);

    Comic response =
        controller.scrapeComic(
            TEST_METADATA_SOURCE_ID,
            TEST_COMIC_ID,
            new ScrapeComicRequest(TEST_ISSUE_ID, TEST_SKIP_CACHE));

    assertNotNull(response);
    assertSame(comic, response);

    Mockito.verify(metadataService, Mockito.times(1))
        .scrapeComic(TEST_METADATA_SOURCE_ID, TEST_COMIC_ID, TEST_ISSUE_ID, TEST_SKIP_CACHE);
  }

  @Test
  public void testLoadAuditLog() {
    Mockito.when(metadataService.loadAuditLogEntries()).thenReturn(auditLogEntryList);

    final List<MetadataAuditLogEntry> response = controller.loadAuditLog();

    assertNotNull(response);
    assertSame(auditLogEntryList, response);

    Mockito.verify(metadataService, Mockito.times(1)).loadAuditLogEntries();
  }

  @Test
  public void testClearAuditLog() {
    controller.clearAuditLog();

    Mockito.verify(metadataService, Mockito.times(1)).clearAuditLog();
  }
}

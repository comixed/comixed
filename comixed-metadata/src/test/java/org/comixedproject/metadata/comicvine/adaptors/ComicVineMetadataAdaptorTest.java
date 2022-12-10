/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

package org.comixedproject.metadata.comicvine.adaptors;

import static junit.framework.TestCase.*;

import com.fasterxml.jackson.core.JsonProcessingException;
import java.util.*;
import org.comixedproject.metadata.MetadataException;
import org.comixedproject.metadata.comicvine.actions.ComicVineGetIssueAction;
import org.comixedproject.metadata.comicvine.actions.ComicVineGetIssueDetailsAction;
import org.comixedproject.metadata.comicvine.actions.ComicVineGetVolumesAction;
import org.comixedproject.metadata.model.IssueDetailsMetadata;
import org.comixedproject.metadata.model.IssueMetadata;
import org.comixedproject.metadata.model.VolumeMetadata;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.model.metadata.MetadataSourceProperty;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;

@RunWith(MockitoJUnitRunner.class)
public class ComicVineMetadataAdaptorTest {
  private static final Random RANDOM = new Random();
  private static final String TEST_API_KEY = "TEST.API.KEY";
  private static final String TEST_SERIES_NAME = "Super Awesome ComicBook";
  private static final Integer TEST_MAX_RECORDS = RANDOM.nextInt();
  private static final String TEST_VOLUME_ID = "129";
  private static final String TEST_ISSUE_NUMBER = "17";
  private static final String TEST_ISSUE_ID = "327";

  @InjectMocks private ComicVineMetadataAdaptor scrapingAdaptor;
  @Mock private ObjectFactory<ComicVineGetVolumesAction> getVolumesActionObjectFactory;
  @Mock private ComicVineGetVolumesAction getVolumesAction;
  @Mock private ObjectFactory<ComicVineGetIssueAction> getIssueActionObjectFactory;
  @Mock private ComicVineGetIssueAction getIssueAction;
  @Mock private ObjectFactory<ComicVineGetIssueDetailsAction> getIssueDetailsActionObjectFactory;
  @Mock private ComicVineGetIssueDetailsAction getIssueDetailsAction;
  @Mock private VolumeMetadata volumeMetadata;
  @Mock private IssueMetadata issueMetadata;
  @Mock private IssueDetailsMetadata issueDetailsMetadata;
  @Mock private MetadataSource metadataSource;

  private List<VolumeMetadata> volumeMetadataList = new ArrayList<>();
  private List<IssueMetadata> issueMetadataList = new ArrayList<>();
  private List<String> entries = new ArrayList<>();
  private Set<MetadataSourceProperty> metadataSourceProperties = new HashSet<>();

  @Before
  public void setUp() {
    Mockito.when(metadataSource.getProperties()).thenReturn(metadataSourceProperties);
    metadataSourceProperties.add(
        new MetadataSourceProperty(metadataSource, ComicVineMetadataAdaptor.API_KEY, TEST_API_KEY));
  }

  @Test(expected = MetadataException.class)
  public void testGetVolumesMissingApiKey() throws MetadataException {
    metadataSourceProperties.clear();
    Mockito.when(getVolumesActionObjectFactory.getObject()).thenReturn(getVolumesAction);

    try {
      scrapingAdaptor.getVolumes(TEST_SERIES_NAME, TEST_MAX_RECORDS, metadataSource);
    } finally {
      Mockito.verify(getVolumesAction, Mockito.times(1))
          .setBaseUrl(ComicVineMetadataAdaptor.BASE_URL);
    }
  }

  @Test(expected = MetadataException.class)
  public void testGetVolumesUnsetApiKey() throws MetadataException {
    metadataSourceProperties.stream()
        .filter(property -> property.getName().equals(ComicVineMetadataAdaptor.API_KEY))
        .findFirst()
        .get()
        .setValue("");
    Mockito.when(getVolumesActionObjectFactory.getObject()).thenReturn(getVolumesAction);

    try {
      scrapingAdaptor.getVolumes(TEST_SERIES_NAME, TEST_MAX_RECORDS, metadataSource);
    } finally {
      Mockito.verify(getVolumesAction, Mockito.times(1))
          .setBaseUrl(ComicVineMetadataAdaptor.BASE_URL);
    }
  }

  @Test
  public void testGetVolumesNoResults() throws MetadataException, JsonProcessingException {
    Mockito.when(getVolumesActionObjectFactory.getObject()).thenReturn(getVolumesAction);
    Mockito.when(getVolumesAction.execute()).thenReturn(volumeMetadataList);

    final List<VolumeMetadata> result =
        scrapingAdaptor.getVolumes(TEST_SERIES_NAME, TEST_MAX_RECORDS, metadataSource);

    assertNotNull(result);
    assertTrue(result.isEmpty());

    Mockito.verify(getVolumesAction, Mockito.times(1))
        .setBaseUrl(ComicVineMetadataAdaptor.BASE_URL);
    Mockito.verify(getVolumesAction, Mockito.times(1)).setApiKey(TEST_API_KEY);
    Mockito.verify(getVolumesAction, Mockito.times(1)).setSeries(TEST_SERIES_NAME);
    Mockito.verify(getVolumesAction, Mockito.times(1)).setMaxRecords(TEST_MAX_RECORDS);
  }

  @Test
  public void testGetVolumes() throws MetadataException, JsonProcessingException {
    for (int index = 0; index < 200; index++) volumeMetadataList.add(volumeMetadata);

    Mockito.when(getVolumesActionObjectFactory.getObject()).thenReturn(getVolumesAction);
    Mockito.when(getVolumesAction.execute()).thenReturn(volumeMetadataList);

    final List<VolumeMetadata> result =
        scrapingAdaptor.getVolumes(TEST_SERIES_NAME, TEST_MAX_RECORDS, metadataSource);

    assertNotNull(result);
    assertEquals(volumeMetadataList.size(), result.size());

    Mockito.verify(getVolumesAction, Mockito.times(1))
        .setBaseUrl(ComicVineMetadataAdaptor.BASE_URL);
    Mockito.verify(getVolumesAction, Mockito.times(1)).setApiKey(TEST_API_KEY);
    Mockito.verify(getVolumesAction, Mockito.times(1)).setSeries(TEST_SERIES_NAME);
    Mockito.verify(getVolumesAction, Mockito.times(1)).setMaxRecords(TEST_MAX_RECORDS);
  }

  @Test
  public void testGetIssueNoResults() throws MetadataException, JsonProcessingException {
    Mockito.when(getIssueActionObjectFactory.getObject()).thenReturn(getIssueAction);
    Mockito.when(getIssueAction.execute()).thenReturn(issueMetadataList);

    final IssueMetadata result =
        scrapingAdaptor.getIssue(TEST_VOLUME_ID, TEST_ISSUE_NUMBER, metadataSource);

    assertNull(result);

    Mockito.verify(getIssueAction, Mockito.times(1)).setBaseUrl(ComicVineMetadataAdaptor.BASE_URL);
    Mockito.verify(getIssueAction, Mockito.times(1)).setApiKey(TEST_API_KEY);
    Mockito.verify(getIssueAction, Mockito.times(1)).setVolumeId(TEST_VOLUME_ID);
  }

  @Test
  public void testGetIssue() throws MetadataException, JsonProcessingException {
    issueMetadataList.add(issueMetadata);

    Mockito.when(getIssueActionObjectFactory.getObject()).thenReturn(getIssueAction);
    Mockito.when(getIssueAction.execute()).thenReturn(issueMetadataList);

    final IssueMetadata result =
        scrapingAdaptor.getIssue(TEST_VOLUME_ID, TEST_ISSUE_NUMBER, metadataSource);

    assertNotNull(result);
    assertSame(issueMetadata, result);

    Mockito.verify(getIssueAction, Mockito.times(1)).setBaseUrl(ComicVineMetadataAdaptor.BASE_URL);
    Mockito.verify(getIssueAction, Mockito.times(1)).setApiKey(TEST_API_KEY);
    Mockito.verify(getIssueAction, Mockito.times(1)).setVolumeId(TEST_VOLUME_ID);
    Mockito.verify(getIssueAction, Mockito.times(1)).setIssueNumber(TEST_ISSUE_NUMBER);
  }

  @Test
  public void testGetIssueWhenIssueNumberHasLeadingZeroes()
      throws MetadataException, JsonProcessingException {
    issueMetadataList.add(issueMetadata);

    Mockito.when(getIssueActionObjectFactory.getObject()).thenReturn(getIssueAction);
    Mockito.when(getIssueAction.execute()).thenReturn(issueMetadataList);

    final IssueMetadata result =
        scrapingAdaptor.getIssue(TEST_VOLUME_ID, "0000" + TEST_ISSUE_NUMBER, metadataSource);

    assertNotNull(result);
    assertSame(issueMetadata, result);

    Mockito.verify(getIssueAction, Mockito.times(1)).setBaseUrl(ComicVineMetadataAdaptor.BASE_URL);
    Mockito.verify(getIssueAction, Mockito.times(1)).setApiKey(TEST_API_KEY);
    Mockito.verify(getIssueAction, Mockito.times(1)).setVolumeId(TEST_VOLUME_ID);
    Mockito.verify(getIssueAction, Mockito.times(1)).setIssueNumber(TEST_ISSUE_NUMBER);
  }

  @Test
  public void testGetIssueWhenIssueNumberIsZero()
      throws MetadataException, JsonProcessingException {
    issueMetadataList.add(issueMetadata);

    Mockito.when(getIssueActionObjectFactory.getObject()).thenReturn(getIssueAction);
    Mockito.when(getIssueAction.execute()).thenReturn(issueMetadataList);

    final IssueMetadata result = scrapingAdaptor.getIssue(TEST_VOLUME_ID, "000", metadataSource);

    assertNotNull(result);
    assertSame(issueMetadata, result);

    Mockito.verify(getIssueAction, Mockito.times(1)).setBaseUrl(ComicVineMetadataAdaptor.BASE_URL);
    Mockito.verify(getIssueAction, Mockito.times(1)).setApiKey(TEST_API_KEY);
    Mockito.verify(getIssueAction, Mockito.times(1)).setVolumeId(TEST_VOLUME_ID);
    Mockito.verify(getIssueAction, Mockito.times(1)).setIssueNumber("0");
  }

  @Test
  public void testGetIssueDetailsNoResults() throws MetadataException {
    Mockito.when(getIssueDetailsActionObjectFactory.getObject()).thenReturn(getIssueDetailsAction);
    Mockito.when(getIssueDetailsAction.execute()).thenReturn(issueDetailsMetadata);

    final IssueDetailsMetadata result =
        scrapingAdaptor.getIssueDetails(TEST_ISSUE_ID, metadataSource);

    assertNotNull(result);
    assertSame(issueDetailsMetadata, result);

    Mockito.verify(getIssueDetailsAction, Mockito.times(1)).setApiKey(TEST_API_KEY);
    Mockito.verify(getIssueDetailsAction, Mockito.times(1)).setIssueId(TEST_ISSUE_ID);
  }

  @Test
  public void testGetIssueDetails() throws MetadataException {
    Mockito.when(getIssueDetailsActionObjectFactory.getObject()).thenReturn(getIssueDetailsAction);
    Mockito.when(getIssueDetailsAction.execute()).thenReturn(issueDetailsMetadata);

    final IssueDetailsMetadata result =
        scrapingAdaptor.getIssueDetails(TEST_ISSUE_ID, metadataSource);

    assertNotNull(result);
    assertSame(issueDetailsMetadata, result);

    Mockito.verify(getIssueDetailsAction, Mockito.times(1)).setApiKey(TEST_API_KEY);
    Mockito.verify(getIssueDetailsAction, Mockito.times(1)).setIssueId(TEST_ISSUE_ID);
  }
}

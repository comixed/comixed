/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

package org.comixedproject.service.metadata;

import static org.junit.Assert.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.model.metadata.MetadataSourceProperty;
import org.comixedproject.repositories.metadata.MetadataSourceRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class MetadataSourceServiceTest {
  private static final long TEST_SOURCE_ID = 723L;
  private static final String TEST_SOURCE_NAME = "Metadata Source Name";
  private static final String TEST_BEAN_NAME = "metadataSourceBean";
  private static final String TEST_EXISTING_PROPERTY_NAME = "property-one";
  private static final String TEST_EXISTING_PROPERTY_VALUE = "Property value 1";
  private static final String TEST_CREATED_PROPERTY_NAME = "property-two";
  private static final String TEST_CREATED_PROPERTY_VALUE = "Property value 2";
  private static final String TEST_REMOVED_PROPERTY_NAME = "property-three";
  private static final String TEST_REMOVED_PROPERTY_VALUE = "Property value 3";

  @InjectMocks private MetadataSourceService service;
  @Mock private MetadataSourceRepository metadataSourceRepository;
  @Mock private List<MetadataSource> metadataSourceList;
  @Mock private MetadataSource existingSource;
  @Mock private MetadataSource incomingSource;
  @Mock private MetadataSource savedSource;

  @Captor ArgumentCaptor<MetadataSource> metadataSourceArgumentCaptor;

  private Set<MetadataSourceProperty> sourceProperties = new HashSet<>();

  @Before
  public void setUp() {
    Mockito.when(incomingSource.getName()).thenReturn(TEST_SOURCE_NAME);
    Mockito.when(incomingSource.getBeanName()).thenReturn(TEST_BEAN_NAME);
    sourceProperties.add(
        new MetadataSourceProperty(
            incomingSource, TEST_EXISTING_PROPERTY_NAME, TEST_EXISTING_PROPERTY_VALUE));
    sourceProperties.add(
        new MetadataSourceProperty(
            incomingSource, TEST_CREATED_PROPERTY_NAME, TEST_CREATED_PROPERTY_VALUE));
    Mockito.when(incomingSource.getProperties()).thenReturn(sourceProperties);
  }

  @Test
  public void testLoadMetadataSources() {
    Mockito.when(metadataSourceRepository.loadMetadataSources()).thenReturn(metadataSourceList);

    final List<MetadataSource> result = service.loadMetadataSources();

    assertNotNull(result);
    assertSame(metadataSourceList, result);

    Mockito.verify(metadataSourceRepository, Mockito.times(1)).loadMetadataSources();
  }

  @Test(expected = MetadataSourceException.class)
  public void testGetByIdInvalidId() throws MetadataSourceException {
    Mockito.when(metadataSourceRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.getById(TEST_SOURCE_ID);
    } finally {
      Mockito.verify(metadataSourceRepository, Mockito.times(1)).getById(TEST_SOURCE_ID);
    }
  }

  @Test
  public void testGetById() throws MetadataSourceException {
    Mockito.when(metadataSourceRepository.getById(Mockito.anyLong())).thenReturn(existingSource);

    final MetadataSource result = service.getById(TEST_SOURCE_ID);

    assertNotNull(result);
    assertSame(existingSource, result);

    Mockito.verify(metadataSourceRepository, Mockito.times(1)).getById(TEST_SOURCE_ID);
  }

  @Test(expected = MetadataSourceException.class)
  public void testCreateExceptionOnSave() throws MetadataSourceException {
    Mockito.when(metadataSourceRepository.save(metadataSourceArgumentCaptor.capture()))
        .thenThrow(RuntimeException.class);

    try {
      service.create(incomingSource);
    } finally {
      Mockito.verify(metadataSourceRepository, Mockito.times(1))
          .save(metadataSourceArgumentCaptor.getValue());
    }
  }

  @Test
  public void testCreate() throws MetadataSourceException {
    Mockito.when(metadataSourceRepository.save(metadataSourceArgumentCaptor.capture()))
        .thenReturn(savedSource);

    final MetadataSource result = service.create(incomingSource);

    assertNotNull(result);
    assertSame(savedSource, result);

    final MetadataSource record = metadataSourceArgumentCaptor.getValue();
    assertNotNull(record);
    assertEquals(TEST_SOURCE_NAME, record.getName());
    assertEquals(TEST_BEAN_NAME, record.getBeanName());
    assertFalse(record.getProperties().isEmpty());
    assertTrue(
        record
            .getProperties()
            .contains(
                new MetadataSourceProperty(
                    record, TEST_EXISTING_PROPERTY_NAME, TEST_EXISTING_PROPERTY_VALUE)));
    assertTrue(
        record
            .getProperties()
            .contains(
                new MetadataSourceProperty(
                    record, TEST_CREATED_PROPERTY_NAME, TEST_CREATED_PROPERTY_VALUE)));
    assertFalse(
        record
            .getProperties()
            .contains(
                new MetadataSourceProperty(
                    record, TEST_REMOVED_PROPERTY_NAME, TEST_REMOVED_PROPERTY_VALUE)));

    Mockito.verify(metadataSourceRepository, Mockito.times(1))
        .save(metadataSourceArgumentCaptor.getValue());
  }

  @Test(expected = MetadataSourceException.class)
  public void testUpdateInvalidId() throws MetadataSourceException {
    Mockito.when(metadataSourceRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.update(TEST_SOURCE_ID, incomingSource);
    } finally {
      Mockito.verify(metadataSourceRepository, Mockito.times(1)).getById(TEST_SOURCE_ID);
    }
  }

  @Test(expected = MetadataSourceException.class)
  public void testUpdateExceptionOnSave() throws MetadataSourceException {
    Mockito.when(metadataSourceRepository.getById(Mockito.anyLong())).thenReturn(savedSource);
    Mockito.when(metadataSourceRepository.save(metadataSourceArgumentCaptor.capture()))
        .thenThrow(RuntimeException.class);

    try {
      service.update(TEST_SOURCE_ID, incomingSource);
    } finally {
      Mockito.verify(metadataSourceRepository, Mockito.times(1)).getById(TEST_SOURCE_ID);
      Mockito.verify(metadataSourceRepository, Mockito.times(1))
          .save(metadataSourceArgumentCaptor.getValue());
    }
  }

  @Test
  public void testUpdate() throws MetadataSourceException {
    final Set<MetadataSourceProperty> properties = new HashSet<>();

    properties.add(
        new MetadataSourceProperty(
            incomingSource, TEST_EXISTING_PROPERTY_NAME, TEST_EXISTING_PROPERTY_VALUE));
    properties.add(
        new MetadataSourceProperty(
            incomingSource, TEST_REMOVED_PROPERTY_NAME, TEST_REMOVED_PROPERTY_VALUE));

    Mockito.when(metadataSourceRepository.getById(Mockito.anyLong())).thenReturn(savedSource);
    Mockito.when(savedSource.getProperties()).thenReturn(properties);
    Mockito.when(metadataSourceRepository.save(metadataSourceArgumentCaptor.capture()))
        .thenReturn(savedSource);

    final MetadataSource result = service.update(TEST_SOURCE_ID, incomingSource);

    assertNotNull(result);
    assertSame(savedSource, result);

    final MetadataSource record = metadataSourceArgumentCaptor.getValue();
    assertNotNull(record);
    assertSame(savedSource, record);

    Mockito.verify(savedSource, Mockito.times(1)).setName(TEST_SOURCE_NAME);
    Mockito.verify(savedSource, Mockito.times(1)).setBeanName(TEST_BEAN_NAME);

    assertFalse(properties.isEmpty());

    assertTrue(
        properties.contains(
            new MetadataSourceProperty(
                record, TEST_EXISTING_PROPERTY_NAME, TEST_EXISTING_PROPERTY_VALUE)));
    assertTrue(
        properties.contains(
            new MetadataSourceProperty(
                record, TEST_CREATED_PROPERTY_NAME, TEST_CREATED_PROPERTY_VALUE)));
    assertFalse(
        properties.contains(
            new MetadataSourceProperty(
                record, TEST_REMOVED_PROPERTY_NAME, TEST_REMOVED_PROPERTY_VALUE)));

    Mockito.verify(metadataSourceRepository, Mockito.times(1)).getById(TEST_SOURCE_ID);
    Mockito.verify(metadataSourceRepository, Mockito.times(1))
        .save(metadataSourceArgumentCaptor.getValue());
  }

  @Test(expected = MetadataSourceException.class)
  public void testDeleteInvalidId() throws MetadataSourceException {
    Mockito.when(metadataSourceRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.delete(TEST_SOURCE_ID);
    } finally {
      Mockito.verify(metadataSourceRepository, Mockito.times(1)).getById(TEST_SOURCE_ID);
    }
  }

  @Test(expected = MetadataSourceException.class)
  public void testDeleteRepositoryException() throws MetadataSourceException {
    Mockito.when(metadataSourceRepository.getById(Mockito.anyLong())).thenReturn(savedSource);
    Mockito.doThrow(RuntimeException.class)
        .when(metadataSourceRepository)
        .delete(Mockito.any(MetadataSource.class));

    try {
      service.delete(TEST_SOURCE_ID);
    } finally {
      Mockito.verify(metadataSourceRepository, Mockito.times(1)).getById(TEST_SOURCE_ID);
      Mockito.verify(metadataSourceRepository, Mockito.times(1)).delete(savedSource);
    }
  }

  @Test
  public void testDelete() throws MetadataSourceException {
    Mockito.when(metadataSourceRepository.getById(Mockito.anyLong())).thenReturn(savedSource);

    service.delete(TEST_SOURCE_ID);

    Mockito.verify(metadataSourceRepository, Mockito.times(1)).getById(TEST_SOURCE_ID);
    Mockito.verify(metadataSourceRepository, Mockito.times(1)).delete(savedSource);
  }
}

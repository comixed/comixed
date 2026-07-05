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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

import java.util.*;
import lombok.NonNull;
import org.comixedproject.metadata.MetadataAdaptorProvider;
import org.comixedproject.metadata.MetadataAdaptorRegistry;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.model.metadata.MetadataSourceProperty;
import org.comixedproject.model.net.metadata.UpdateMetadataSourceProperty;
import org.comixedproject.repositories.metadata.MetadataSourceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class MetadataSourceServiceTest {
  private static final long TEST_SOURCE_ID = 723L;
  private static final String TEST_ADAPTOR_NAME = "Metadata Adaptor Name";
  private static final String TEST_EXISTING_PROPERTY_NAME = "property-one";
  private static final String TEST_EXISTING_PROPERTY_VALUE = "Property value 1";
  private static final @NonNull String TEST_UPDATED_EXISTING_VALUE = "Property value 1.1";
  private static final String TEST_CREATED_PROPERTY_NAME = "property-two";
  private static final String TEST_CREATED_PROPERTY_VALUE = "Property value 2";
  private static final String TEST_REMOVED_PROPERTY_NAME = "property-three";
  private static final String TEST_REMOVED_PROPERTY_VALUE = "Property value 3";
  private static final String TEST_METADATA_ADAPTOR_NAME = "The adaptor's name";
  private static final String TEST_METADATA_ADAPTOR_PROVIDER_PROPERTY =
      "The provider property name";

  @Captor ArgumentCaptor<MetadataSource> metadataSourceArgumentCaptor;
  @InjectMocks private MetadataSourceService service;
  @Mock private MetadataSourceRepository metadataSourceRepository;
  @Mock private MetadataAdaptorRegistry metadataAdaptorRegistry;
  @Mock private MetadataSource existingSource;
  @Mock private MetadataSource incomingSource;
  @Mock private MetadataSource savedSource;
  @Mock private MetadataAdaptorProvider metadataAdaptorProvider;
  @Mock private MetadataSource existingMetadataSource;
  @Mock private MetadataSource savedMetadataSource;
  @Mock private MetadataSourceProperty existingProperty;

  private Set<MetadataSourceProperty> sourceProperties = new HashSet<>();
  private List<MetadataAdaptorProvider> metadatAdaptorList = new ArrayList<>();
  private List<MetadataSource> metadataSourceList = new ArrayList<>();
  private Set<MetadataSourceProperty> existingProperties = new HashSet<>();
  private Set<String> metadataAdaptorProviderPropertyList = new HashSet<>();
  private List<UpdateMetadataSourceProperty> incomingProperties = new ArrayList<>();

  @BeforeEach
  void setUp() {
    metadataAdaptorProviderPropertyList.add(TEST_METADATA_ADAPTOR_PROVIDER_PROPERTY);
    when(metadataAdaptorProvider.getProperties()).thenReturn(metadataAdaptorProviderPropertyList);
    when(metadataAdaptorProvider.getName()).thenReturn(TEST_METADATA_ADAPTOR_NAME);
    metadatAdaptorList.add(metadataAdaptorProvider);
    when(metadataAdaptorRegistry.getAdaptors()).thenReturn(metadatAdaptorList);

    existingProperties.add(existingProperty);
    when(existingMetadataSource.getAdaptorName()).thenReturn(TEST_METADATA_ADAPTOR_NAME);
    metadataSourceList.add(existingMetadataSource);

    when(metadataSourceRepository.save(metadataSourceArgumentCaptor.capture()))
        .thenReturn(savedMetadataSource);

    when(incomingSource.getAdaptorName()).thenReturn(TEST_ADAPTOR_NAME);
    when(incomingSource.getPreferred()).thenReturn(false);
    sourceProperties.add(
        new MetadataSourceProperty(
            incomingSource, TEST_EXISTING_PROPERTY_NAME, TEST_EXISTING_PROPERTY_VALUE));
    sourceProperties.add(
        new MetadataSourceProperty(
            incomingSource, TEST_CREATED_PROPERTY_NAME, "  " + TEST_CREATED_PROPERTY_VALUE + "  "));
    when(incomingSource.getProperties()).thenReturn(sourceProperties);
  }

  @Test
  void loadMetadataSources_noneAvailable() {
    when(metadataAdaptorProvider.getName()).thenReturn(TEST_METADATA_ADAPTOR_NAME.substring(1));
    when(metadataSourceRepository.loadMetadataSources()).thenReturn(metadataSourceList);

    final List<MetadataSource> result = service.loadMetadataSources();

    assertNotNull(result);
    assertFalse(result.isEmpty());

    verify(metadataSourceRepository, times(2)).loadMetadataSources();
  }

  @Test
  void loadMetadataSources_newSourceFound() {
    final List<MetadataSource> emptyMetadataSourceList = new ArrayList<>();
    when(metadataSourceRepository.loadMetadataSources())
        .thenReturn(emptyMetadataSourceList, metadataSourceList);

    final List<MetadataSource> result = service.loadMetadataSources();

    final MetadataSource metadataSource = metadataSourceArgumentCaptor.getValue();
    assertNotNull(metadataSource);
    assertFalse(metadataSource.getProperties().isEmpty());
    assertTrue(
        metadataSource
            .getProperties()
            .contains(
                new MetadataSourceProperty(
                    metadataSource, TEST_METADATA_ADAPTOR_PROVIDER_PROPERTY, "")));

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertSame(existingMetadataSource, result.get(0));

    verify(metadataSourceRepository, times(2)).loadMetadataSources();
    verify(metadataSourceRepository).save(metadataSource);
  }

  @Test
  void loadMetadataSources() {
    when(metadataSourceRepository.loadMetadataSources()).thenReturn(metadataSourceList);

    final List<MetadataSource> result = service.loadMetadataSources();

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertSame(existingMetadataSource, result.get(0));

    verify(metadataSourceRepository, times(2)).loadMetadataSources();
  }

  @Test
  void getById_invalidId() {
    when(metadataSourceRepository.getById(anyLong())).thenReturn(null);

    assertThrows(MetadataSourceException.class, () -> service.getById(TEST_SOURCE_ID));
  }

  @Test
  void getById() throws MetadataSourceException {
    when(metadataSourceRepository.getById(anyLong())).thenReturn(existingSource);

    final MetadataSource result = service.getById(TEST_SOURCE_ID);

    assertNotNull(result);
    assertSame(existingSource, result);

    verify(metadataSourceRepository).getById(TEST_SOURCE_ID);
  }

  @Test
  void getByBean_nameNotFound() {
    when(metadataSourceRepository.getByAdaptorName(Mockito.anyString())).thenReturn(null);

    final MetadataSource result = service.getByAdaptorName(TEST_ADAPTOR_NAME);

    assertNull(result);

    verify(metadataSourceRepository).getByAdaptorName(TEST_ADAPTOR_NAME);
  }

  @Test
  void getByBeanName() {
    when(metadataSourceRepository.getByAdaptorName(anyString())).thenReturn(existingSource);

    final MetadataSource result = service.getByAdaptorName(TEST_ADAPTOR_NAME);

    assertNotNull(result);
    assertSame(existingSource, result);

    verify(metadataSourceRepository).getByAdaptorName(TEST_ADAPTOR_NAME);
  }

  @Test
  void getByName_notFound() {
    when(metadataSourceRepository.getByName(anyString())).thenReturn(null);

    final MetadataSource result = service.getByName(TEST_ADAPTOR_NAME);

    assertNull(result);

    verify(metadataSourceRepository).getByName(TEST_ADAPTOR_NAME);
  }

  @Test
  void getByName() {
    when(metadataSourceRepository.getByName(anyString())).thenReturn(existingSource);

    final MetadataSource result = service.getByName(TEST_ADAPTOR_NAME);

    assertNotNull(result);
    assertSame(existingSource, result);

    verify(metadataSourceRepository).getByName(TEST_ADAPTOR_NAME);
  }

  @Test
  void create_nullName() {
    assertThrows(NullPointerException.class, () -> service.create(null, true, incomingProperties));
  }

  @Test
  void create_nullPreferred() {
    assertThrows(
        NullPointerException.class,
        () -> service.create(TEST_ADAPTOR_NAME, null, incomingProperties));
  }

  @Test
  void create_nullProperties() {
    assertThrows(NullPointerException.class, () -> service.create(TEST_ADAPTOR_NAME, true, null));
  }

  @Test
  void create_exceptionOnSave() {
    when(metadataSourceRepository.save(metadataSourceArgumentCaptor.capture()))
        .thenThrow(RuntimeException.class);

    assertThrows(
        MetadataSourceException.class,
        () -> service.create(TEST_ADAPTOR_NAME, true, incomingProperties));
  }

  @Test
  void create() throws MetadataSourceException {
    existingProperties.add(existingProperty);
    when(existingProperty.getName()).thenReturn(TEST_EXISTING_PROPERTY_NAME);
    when(existingProperty.getValue()).thenReturn(TEST_EXISTING_PROPERTY_VALUE);
    when(existingMetadataSource.getProperties()).thenReturn(existingProperties);

    incomingProperties.add(
        new UpdateMetadataSourceProperty(
            TEST_EXISTING_PROPERTY_NAME, TEST_EXISTING_PROPERTY_VALUE));
    incomingProperties.add(
        new UpdateMetadataSourceProperty(TEST_CREATED_PROPERTY_NAME, TEST_CREATED_PROPERTY_VALUE));

    when(metadataSourceRepository.save(metadataSourceArgumentCaptor.capture()))
        .thenReturn(savedSource);

    final MetadataSource result = service.create(TEST_ADAPTOR_NAME, false, incomingProperties);

    assertNotNull(result);
    assertSame(savedSource, result);

    final MetadataSource foundSource = metadataSourceArgumentCaptor.getValue();
    assertNotNull(foundSource);
    assertEquals(TEST_ADAPTOR_NAME, foundSource.getAdaptorName());
    assertTrue(
        foundSource
            .getProperties()
            .contains(
                new MetadataSourceProperty(
                    foundSource, TEST_EXISTING_PROPERTY_NAME, TEST_EXISTING_PROPERTY_VALUE)));
    assertTrue(
        foundSource
            .getProperties()
            .contains(
                new MetadataSourceProperty(
                    foundSource, TEST_CREATED_PROPERTY_NAME, TEST_CREATED_PROPERTY_VALUE)));
    assertFalse(
        foundSource
            .getProperties()
            .contains(
                new MetadataSourceProperty(
                    foundSource, TEST_REMOVED_PROPERTY_NAME, TEST_REMOVED_PROPERTY_VALUE)));

    verify(metadataSourceRepository).save(metadataSourceArgumentCaptor.getValue());
  }

  @Test
  void create_newPreferredSource() throws MetadataSourceException {
    when(incomingSource.getPreferred()).thenReturn(true);
    when(metadataSourceRepository.save(metadataSourceArgumentCaptor.capture()))
        .thenReturn(savedSource);

    final MetadataSource result = service.create(TEST_ADAPTOR_NAME, true, incomingProperties);

    assertNotNull(result);
    assertSame(savedSource, result);

    verify(metadataSourceRepository).clearPreferredSource();
  }

  @Test
  void update_nullId() {
    assertThrows(
        NullPointerException.class,
        () -> service.update(null, TEST_ADAPTOR_NAME, true, incomingProperties));
  }

  @Test
  void update_nullSourceName() {
    assertThrows(
        NullPointerException.class,
        () -> service.update(TEST_SOURCE_ID, null, true, incomingProperties));
  }

  @Test
  void update_nullPreferred() {
    assertThrows(
        NullPointerException.class,
        () -> service.update(TEST_SOURCE_ID, TEST_ADAPTOR_NAME, null, incomingProperties));
  }

  @Test
  void update_nullProperties() {
    assertThrows(
        NullPointerException.class,
        () -> service.update(TEST_SOURCE_ID, TEST_ADAPTOR_NAME, true, null));
  }

  @Test
  void update_invalidId() {
    when(metadataSourceRepository.getById(anyLong())).thenReturn(null);

    assertThrows(
        MetadataSourceException.class,
        () -> service.update(TEST_SOURCE_ID, TEST_ADAPTOR_NAME, false, incomingProperties));
  }

  @Test
  void update_exceptionOnSave() {
    when(metadataSourceRepository.getById(anyLong())).thenReturn(savedSource);
    when(metadataSourceRepository.save(metadataSourceArgumentCaptor.capture()))
        .thenThrow(RuntimeException.class);

    assertThrows(
        MetadataSourceException.class,
        () -> service.update(TEST_SOURCE_ID, TEST_ADAPTOR_NAME, true, incomingProperties));
  }

  @Test
  void update() throws MetadataSourceException {
    existingProperties.add(existingProperty);
    when(existingProperty.getName()).thenReturn(TEST_EXISTING_PROPERTY_NAME);
    when(existingProperty.getValue()).thenReturn(TEST_EXISTING_PROPERTY_VALUE);
    when(existingMetadataSource.getProperties()).thenReturn(existingProperties);

    when(metadataSourceRepository.getById(anyLong())).thenReturn(savedSource);
    when(savedSource.getProperties()).thenReturn(existingProperties);
    when(metadataSourceRepository.save(metadataSourceArgumentCaptor.capture()))
        .thenReturn(savedSource);

    incomingProperties.add(
        new UpdateMetadataSourceProperty(TEST_EXISTING_PROPERTY_NAME, TEST_UPDATED_EXISTING_VALUE));
    incomingProperties.add(
        new UpdateMetadataSourceProperty(TEST_CREATED_PROPERTY_NAME, TEST_CREATED_PROPERTY_VALUE));

    final MetadataSource result =
        service.update(TEST_SOURCE_ID, TEST_ADAPTOR_NAME, false, incomingProperties);

    assertNotNull(result);
    assertSame(savedSource, result);

    final MetadataSource foundSource = metadataSourceArgumentCaptor.getValue();
    assertNotNull(foundSource);
    assertSame(savedSource, foundSource);

    assertFalse(existingProperties.isEmpty());

    assertTrue(existingProperties.contains(existingProperty));
    assertTrue(
        existingProperties.contains(
            new MetadataSourceProperty(
                foundSource, TEST_CREATED_PROPERTY_NAME, TEST_CREATED_PROPERTY_VALUE)));
    assertFalse(
        existingProperties.contains(
            new MetadataSourceProperty(
                foundSource, TEST_REMOVED_PROPERTY_NAME, TEST_REMOVED_PROPERTY_VALUE)));

    verify(metadataSourceRepository).getById(TEST_SOURCE_ID);
    verify(metadataSourceRepository).save(metadataSourceArgumentCaptor.getValue());
    verify(existingProperty).setValue(TEST_UPDATED_EXISTING_VALUE);
  }

  @Test
  void update_preferredSource() throws MetadataSourceException {
    when(incomingSource.getPreferred()).thenReturn(true);
    when(metadataSourceRepository.getById(anyLong())).thenReturn(savedSource);
    when(metadataSourceRepository.save(metadataSourceArgumentCaptor.capture()))
        .thenReturn(savedSource);

    final MetadataSource result =
        service.update(TEST_SOURCE_ID, TEST_ADAPTOR_NAME, true, incomingProperties);

    assertNotNull(result);
    assertSame(savedSource, result);

    verify(metadataSourceRepository).getById(TEST_SOURCE_ID);
    verify(metadataSourceRepository).clearPreferredSource();
  }

  @Test
  void delete_invalidId() {
    when(metadataSourceRepository.getById(anyLong())).thenReturn(null);

    assertThrows(MetadataSourceException.class, () -> service.delete(TEST_SOURCE_ID));
  }

  @Test
  void delete_repositoryException() {
    when(metadataSourceRepository.getById(anyLong())).thenReturn(savedSource);
    doThrow(RuntimeException.class)
        .when(metadataSourceRepository)
        .delete(ArgumentMatchers.<MetadataSource>any(MetadataSource.class));

    assertThrows(MetadataSourceException.class, () -> service.delete(TEST_SOURCE_ID));
  }

  @Test
  void delete() throws MetadataSourceException {
    when(metadataSourceRepository.getById(anyLong())).thenReturn(savedSource);
    when(metadataSourceRepository.loadMetadataSources()).thenReturn(metadataSourceList);

    final List<MetadataSource> result = service.delete(TEST_SOURCE_ID);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertTrue(result.contains(existingMetadataSource));

    verify(metadataSourceRepository).getById(TEST_SOURCE_ID);
    verify(metadataSourceRepository).delete(savedSource);
  }
}

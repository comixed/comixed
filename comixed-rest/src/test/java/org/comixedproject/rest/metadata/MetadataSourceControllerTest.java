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

package org.comixedproject.rest.metadata;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;
import static org.junit.Assert.assertThrows;

import java.util.List;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.service.metadata.MetadataSourceException;
import org.comixedproject.service.metadata.MetadataSourceService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MetadataSourceControllerTest {
  private static final Long TEST_SOURCE_ID = 237L;

  @InjectMocks private MetadataSourceController controller;
  @Mock private MetadataSourceService metadataSourceService;
  @Mock private List<MetadataSource> metadataSourceList;
  @Mock private MetadataSource incomingSource;
  @Mock private MetadataSource savedSource;

  @Test
  void loadMetadataSources() {
    Mockito.when(metadataSourceService.loadMetadataSources()).thenReturn(metadataSourceList);

    final List<MetadataSource> result = controller.loadMetadataSources();

    assertNotNull(result);
    assertSame(metadataSourceList, result);

    Mockito.verify(metadataSourceService, Mockito.times(1)).loadMetadataSources();
  }

  @Test
  void createAndServiceThrowsException() throws MetadataSourceException {
    Mockito.when(metadataSourceService.create(Mockito.any(MetadataSource.class)))
        .thenThrow(MetadataSourceException.class);

    assertThrows(MetadataSourceException.class, () -> controller.create(incomingSource));
  }

  @Test
  void create() throws MetadataSourceException {
    Mockito.when(metadataSourceService.create(Mockito.any(MetadataSource.class)))
        .thenReturn(savedSource);

    final MetadataSource response = controller.create(incomingSource);

    assertNotNull(response);
    assertSame(savedSource, response);

    Mockito.verify(metadataSourceService, Mockito.times(1)).create(incomingSource);
  }

  @Test
  void getOneServiceException() throws MetadataSourceException {
    Mockito.when(metadataSourceService.getById(Mockito.anyLong()))
        .thenThrow(MetadataSourceException.class);

    assertThrows(MetadataSourceException.class, () -> controller.getOne(TEST_SOURCE_ID));
  }

  @Test
  void getOne() throws MetadataSourceException {
    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(savedSource);

    final MetadataSource result = controller.getOne(TEST_SOURCE_ID);

    assertNotNull(result);
    assertSame(savedSource, result);

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_SOURCE_ID);
  }

  @Test
  void updateAndServiceThrowsException() throws MetadataSourceException {
    Mockito.when(metadataSourceService.update(Mockito.anyLong(), Mockito.any(MetadataSource.class)))
        .thenThrow(MetadataSourceException.class);

    assertThrows(
        MetadataSourceException.class, () -> controller.update(TEST_SOURCE_ID, incomingSource));
  }

  @Test
  void update() throws MetadataSourceException {
    Mockito.when(metadataSourceService.update(Mockito.anyLong(), Mockito.any(MetadataSource.class)))
        .thenReturn(savedSource);

    final MetadataSource response = controller.update(TEST_SOURCE_ID, incomingSource);

    assertNotNull(response);
    assertSame(savedSource, response);

    Mockito.verify(metadataSourceService, Mockito.times(1)).update(TEST_SOURCE_ID, incomingSource);
  }

  @Test
  void deleteAndServiceThrowsException() throws MetadataSourceException {
    Mockito.when(metadataSourceService.delete(Mockito.anyLong()))
        .thenThrow(MetadataSourceException.class);

    assertThrows(MetadataSourceException.class, () -> controller.delete(TEST_SOURCE_ID));
  }

  @Test
  void delete() throws MetadataSourceException {
    Mockito.when(metadataSourceService.delete(Mockito.anyLong())).thenReturn(metadataSourceList);

    final List<MetadataSource> result = controller.delete(TEST_SOURCE_ID);

    assertNotNull(result);
    assertSame(metadataSourceList, result);

    Mockito.verify(metadataSourceService, Mockito.times(1)).delete(TEST_SOURCE_ID);
  }
}

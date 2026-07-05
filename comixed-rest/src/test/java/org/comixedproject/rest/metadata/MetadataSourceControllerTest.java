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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import org.apache.commons.lang3.RandomUtils;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.model.net.metadata.UpdateMetadataSourceProperty;
import org.comixedproject.model.net.metadata.UpdateMetadataSourceRequest;
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
  private static final String TEST_SOURCE_NAME = "My Metadata Source";
  private static final Boolean TEST_PREFERRED = RandomUtils.secure().randomBoolean();

  @InjectMocks private MetadataSourceController controller;
  @Mock private MetadataSourceService metadataSourceService;
  @Mock private List<MetadataSource> metadataSourceList;
  @Mock private MetadataSource savedSource;
  @Mock private List<UpdateMetadataSourceProperty> sourceProperties;

  @Test
  void loadMetadataSources() {
    when(metadataSourceService.loadMetadataSources()).thenReturn(metadataSourceList);

    final List<MetadataSource> result = controller.loadMetadataSources();

    assertNotNull(result);
    assertSame(metadataSourceList, result);

    verify(metadataSourceService).loadMetadataSources();
  }

  @Test
  void create_serviceException() throws MetadataSourceException {
    when(metadataSourceService.create(Mockito.anyString(), Mockito.anyBoolean(), Mockito.anyList()))
        .thenThrow(MetadataSourceException.class);

    assertThrows(
        MetadataSourceException.class,
        () ->
            controller.create(
                new UpdateMetadataSourceRequest(
                    TEST_SOURCE_NAME, TEST_PREFERRED, sourceProperties)));
  }

  @Test
  void create() throws MetadataSourceException {
    when(metadataSourceService.create(Mockito.anyString(), Mockito.anyBoolean(), Mockito.anyList()))
        .thenReturn(savedSource);

    final MetadataSource response =
        controller.create(
            new UpdateMetadataSourceRequest(TEST_SOURCE_NAME, TEST_PREFERRED, sourceProperties));

    assertNotNull(response);
    assertSame(savedSource, response);

    verify(metadataSourceService).create(TEST_SOURCE_NAME, TEST_PREFERRED, sourceProperties);
  }

  @Test
  void getOne_serviceException() throws MetadataSourceException {
    when(metadataSourceService.getById(Mockito.anyLong())).thenThrow(MetadataSourceException.class);

    assertThrows(MetadataSourceException.class, () -> controller.getOne(TEST_SOURCE_ID));
  }

  @Test
  void getOne() throws MetadataSourceException {
    when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(savedSource);

    final MetadataSource result = controller.getOne(TEST_SOURCE_ID);

    assertNotNull(result);
    assertSame(savedSource, result);

    verify(metadataSourceService).getById(TEST_SOURCE_ID);
  }

  @Test
  void updateAndServiceThrowsException() throws MetadataSourceException {
    when(metadataSourceService.update(
            Mockito.anyLong(), Mockito.anyString(), Mockito.anyBoolean(), Mockito.anyList()))
        .thenThrow(MetadataSourceException.class);

    assertThrows(
        MetadataSourceException.class,
        () ->
            controller.update(
                TEST_SOURCE_ID,
                new UpdateMetadataSourceRequest(
                    TEST_SOURCE_NAME, TEST_PREFERRED, sourceProperties)));
  }

  @Test
  void update() throws MetadataSourceException {
    when(metadataSourceService.update(
            Mockito.anyLong(), Mockito.anyString(), Mockito.anyBoolean(), Mockito.anyList()))
        .thenReturn(savedSource);

    final MetadataSource response =
        controller.update(
            TEST_SOURCE_ID,
            new UpdateMetadataSourceRequest(TEST_SOURCE_NAME, TEST_PREFERRED, sourceProperties));

    assertNotNull(response);
    assertSame(savedSource, response);

    verify(metadataSourceService)
        .update(TEST_SOURCE_ID, TEST_SOURCE_NAME, TEST_PREFERRED, sourceProperties);
  }

  @Test
  void deleteAndServiceThrowsException() throws MetadataSourceException {
    when(metadataSourceService.delete(Mockito.anyLong())).thenThrow(MetadataSourceException.class);

    assertThrows(MetadataSourceException.class, () -> controller.delete(TEST_SOURCE_ID));
  }

  @Test
  void delete() throws MetadataSourceException {
    when(metadataSourceService.delete(Mockito.anyLong())).thenReturn(metadataSourceList);

    final List<MetadataSource> result = controller.delete(TEST_SOURCE_ID);

    assertNotNull(result);
    assertSame(metadataSourceList, result);

    verify(metadataSourceService).delete(TEST_SOURCE_ID);
  }
}

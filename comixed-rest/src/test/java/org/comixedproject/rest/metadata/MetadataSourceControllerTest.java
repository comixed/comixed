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

import java.util.List;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.service.metadata.MetadataSourceException;
import org.comixedproject.service.metadata.MetadataSourceService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class MetadataSourceControllerTest {
  private static final Long TEST_SOURCE_ID = 237L;

  @InjectMocks private MetadataSourceController controller;
  @Mock private MetadataSourceService metadataSourceService;
  @Mock private List<MetadataSource> metadataSourceList;
  @Mock private MetadataSource incomingSource;
  @Mock private MetadataSource savedSource;

  @Test
  public void testLoadMetadataSources() {
    Mockito.when(metadataSourceService.loadMetadataSources()).thenReturn(metadataSourceList);

    final List<MetadataSource> result = controller.loadMetadataSources();

    assertNotNull(result);
    assertSame(metadataSourceList, result);

    Mockito.verify(metadataSourceService, Mockito.times(1)).loadMetadataSources();
  }

  @Test(expected = MetadataSourceException.class)
  public void testCreateAndServiceThrowsException() throws MetadataSourceException {
    Mockito.when(metadataSourceService.create(Mockito.any(MetadataSource.class)))
        .thenThrow(MetadataSourceException.class);

    try {
      controller.create(incomingSource);
    } finally {
      Mockito.verify(metadataSourceService, Mockito.times(1)).create(incomingSource);
    }
  }

  @Test
  public void testCreate() throws MetadataSourceException {
    Mockito.when(metadataSourceService.create(Mockito.any(MetadataSource.class)))
        .thenReturn(savedSource);

    final MetadataSource response = controller.create(incomingSource);

    assertNotNull(response);
    assertSame(savedSource, response);

    Mockito.verify(metadataSourceService, Mockito.times(1)).create(incomingSource);
  }

  @Test(expected = MetadataSourceException.class)
  public void testGetOneServiceException() throws MetadataSourceException {
    Mockito.when(metadataSourceService.getById(Mockito.anyLong()))
        .thenThrow(MetadataSourceException.class);

    try {
      controller.getOne(TEST_SOURCE_ID);
    } finally {
      Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_SOURCE_ID);
    }
  }

  @Test
  public void testGetOne() throws MetadataSourceException {
    Mockito.when(metadataSourceService.getById(Mockito.anyLong())).thenReturn(savedSource);

    final MetadataSource result = controller.getOne(TEST_SOURCE_ID);

    assertNotNull(result);
    assertSame(savedSource, result);

    Mockito.verify(metadataSourceService, Mockito.times(1)).getById(TEST_SOURCE_ID);
  }

  @Test(expected = MetadataSourceException.class)
  public void testUpdateAndServiceThrowsException() throws MetadataSourceException {
    Mockito.when(metadataSourceService.update(Mockito.anyLong(), Mockito.any(MetadataSource.class)))
        .thenThrow(MetadataSourceException.class);

    try {
      controller.update(TEST_SOURCE_ID, incomingSource);
    } finally {
      Mockito.verify(metadataSourceService, Mockito.times(1))
          .update(TEST_SOURCE_ID, incomingSource);
    }
  }

  @Test
  public void testUpdate() throws MetadataSourceException {
    Mockito.when(metadataSourceService.update(Mockito.anyLong(), Mockito.any(MetadataSource.class)))
        .thenReturn(savedSource);

    final MetadataSource response = controller.update(TEST_SOURCE_ID, incomingSource);

    assertNotNull(response);
    assertSame(savedSource, response);

    Mockito.verify(metadataSourceService, Mockito.times(1)).update(TEST_SOURCE_ID, incomingSource);
  }

  @Test(expected = MetadataSourceException.class)
  public void testDeleteAndServiceThrowsException() throws MetadataSourceException {
    Mockito.when(metadataSourceService.delete(Mockito.anyLong()))
        .thenThrow(MetadataSourceException.class);

    try {
      controller.delete(TEST_SOURCE_ID);
    } finally {
      Mockito.verify(metadataSourceService, Mockito.times(1)).delete(TEST_SOURCE_ID);
    }
  }

  @Test
  public void testDelete() throws MetadataSourceException {
    Mockito.when(metadataSourceService.delete(Mockito.anyLong())).thenReturn(metadataSourceList);

    final List<MetadataSource> result = controller.delete(TEST_SOURCE_ID);

    assertNotNull(result);
    assertSame(metadataSourceList, result);

    Mockito.verify(metadataSourceService, Mockito.times(1)).delete(TEST_SOURCE_ID);
  }
}

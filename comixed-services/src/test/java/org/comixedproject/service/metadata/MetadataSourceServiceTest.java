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

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertSame;

import java.util.List;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.repositories.metadata.MetadataSourceRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class MetadataSourceServiceTest {
  private static final Long TEST_SOURCE_ID = 723L;

  @InjectMocks private MetadataSourceService service;
  @Mock private MetadataSourceRepository metadataSourceRepository;
  @Mock private List<MetadataSource> metadataSourceList;
  @Mock private MetadataSource metadataSource;

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
      Mockito.verify(metadataSourceRepository, Mockito.times(1))
          .getById(TEST_SOURCE_ID.longValue());
    }
  }

  @Test
  public void testGetById() throws MetadataSourceException {
    Mockito.when(metadataSourceRepository.getById(Mockito.anyLong())).thenReturn(metadataSource);

    final MetadataSource result = service.getById(TEST_SOURCE_ID);

    assertNotNull(result);
    assertSame(metadataSource, result);

    Mockito.verify(metadataSourceRepository, Mockito.times(1)).getById(TEST_SOURCE_ID.longValue());
  }
}

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

package org.comixedproject.service.comic;

import static junit.framework.TestCase.*;

import org.comixedproject.model.comic.Publisher;
import org.comixedproject.repositories.comic.PublisherRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class PublisherServiceTest {
  private static final String TEST_PUBLISHER_NAME = "Publisher Name";

  @InjectMocks private PublisherService publisherService;
  @Mock private PublisherRepository publisherRepository;
  @Mock private Publisher publisher;

  @Test
  public void testGetByNameMissing() {
    Mockito.when(publisherRepository.findByName(Mockito.anyString())).thenReturn(null);

    Publisher result = publisherService.getByName(TEST_PUBLISHER_NAME);

    assertNull(result);

    Mockito.verify(publisherRepository, Mockito.times(1)).findByName(TEST_PUBLISHER_NAME);
  }

  @Test
  public void testGetByName() {
    Mockito.when(publisherRepository.findByName(Mockito.anyString())).thenReturn(publisher);

    Publisher result = publisherService.getByName(TEST_PUBLISHER_NAME);

    assertNotNull(result);
    assertSame(publisher, result);

    Mockito.verify(publisherRepository, Mockito.times(1)).findByName(TEST_PUBLISHER_NAME);
  }
}

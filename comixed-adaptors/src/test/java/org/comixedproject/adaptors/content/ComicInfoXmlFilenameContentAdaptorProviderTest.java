/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

package org.comixedproject.adaptors.content;

import static org.junit.Assert.*;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ComicInfoXmlFilenameContentAdaptorProviderTest {
  @InjectMocks private ComicInfoXmlFilenameContentAdaptorProvider provider;

  @Test
  public void testCreate() {
    assertNotNull(provider.create());
  }

  @Test
  public void testSupportsWithSimpleFilename() {
    assertTrue(provider.supports("ComicInfo.xml"));
  }

  @Test
  public void testSupportsIgnorsCase() {
    assertTrue(provider.supports("comicinfo.XML"));
  }

  @Test
  public void testSupportsWithSubdirectory() {
    assertTrue(provider.supports("subdir/ComicInfo.XML"));
  }
}

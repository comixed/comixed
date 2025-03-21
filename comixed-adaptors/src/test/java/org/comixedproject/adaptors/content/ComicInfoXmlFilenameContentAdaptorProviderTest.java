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

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ComicInfoXmlFilenameContentAdaptorProviderTest {
  @InjectMocks private ComicInfoXmlFilenameContentAdaptorProvider provider;

  @Test
  void create() {
    assertNotNull(provider.create());
  }

  @Test
  void supports_simpleFilename() {
    assertTrue(provider.supports("ComicInfo.xml"));
  }

  @Test
  void supports_ignorsCase() {
    assertTrue(provider.supports("comicinfo.XML"));
  }

  @Test
  void supports_withSubdirectory() {
    assertTrue(provider.supports("subdir/ComicInfo.XML"));
  }
}

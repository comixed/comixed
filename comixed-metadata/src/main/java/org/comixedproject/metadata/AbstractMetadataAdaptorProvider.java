/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

package org.comixedproject.metadata;

import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * <code>AbstractMetadataAdaptorProvider</code> provides a foundation for building new {@link
 * MetadataAdaptorProvider} types.
 *
 * @author Darryl L. Pierce
 */
@RequiredArgsConstructor
public abstract class AbstractMetadataAdaptorProvider implements MetadataAdaptorProvider {
  @Getter private final String name;

  private final Set<String> properties = new HashSet<>();

  @Override
  public final Set<String> getProperties() {
    return this.properties;
  }

  protected void addProperty(final String name) {
    this.properties.add(name);
  }
}

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

package org.comixedproject.adaptors.content;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * <code>ContentAdaptorRules</code> contains the rules to be applied when importing content from a
 * comic file.
 */
@NoArgsConstructor
public class ContentAdaptorRules {
  @Getter @Setter private boolean skipMetadata = false;

  @Override
  public String toString() {
    return "ContentAdaptorRules{" + "skipMetadata=" + skipMetadata + '}';
  }
}

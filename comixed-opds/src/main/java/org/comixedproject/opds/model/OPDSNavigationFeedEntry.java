/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

package org.comixedproject.opds.model;

import lombok.NonNull;

/**
 * <code>OPDSNavigationFeedEntry</code> is a single entry in an OPDS navigation feed.
 *
 * @author Darryl L. Pierce
 */
public class OPDSNavigationFeedEntry extends OPDSFeedEntry<OPDSNavigationFeedContent> {
  public OPDSNavigationFeedEntry(@NonNull final String title, @NonNull final String id) {
    super(title, id);
  }
}

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

package org.comixedproject.model.batch;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * <code>RecreateComicFilesEvent</code> is fired to begin the process of recreating comic files.
 *
 * @author Darryl L. Pierce
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class RecreateComicFilesEvent {
  public static final RecreateComicFilesEvent instance = new RecreateComicFilesEvent();
}

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

package org.comixedproject.model.comic;

/**
 * <code>ComicState</code> represents the current state for a comic.
 *
 * @author Darryl L. Pierce
 */
public enum ComicState {
  // the comic has been added to the database but has not been processed
  ADDED,
  // the comic is unprocessed and needs to be loaded
  UNPROCESSED,
  // the comic has been processed and its contents match the database
  STABLE,
  // the details in the database have been changed but the comic has not been updated
  CHANGED,
  // the comic has been  marked for deletion
  DELETED,
  // removed from the database, comics never actually reach this state
  REMOVED;
}

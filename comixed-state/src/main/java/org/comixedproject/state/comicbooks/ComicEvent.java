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

package org.comixedproject.state.comicbooks;

/**
 * <code>ComicEvent</code> represents the events that can occur to a comic that affect its state.
 *
 * @author Darryl L. Pierce
 */
public enum ComicEvent {
  recordInserted, // the record has been inserted into the database
  readyForProcessing, // the record is ready for processing
  fileContentsLoaded, // the file entries have been loaded
  blockedPagesMarked, // blocked pages have been marked
  fileDetailsLoadedAction, // the file details have been created
  contentsProcessed, // the contents have been processed
  rescanComic, // rescan a comic,
  updateMetadata, // prepare to update the metadata within the physical comic file
  metadataUpdated, // the metadata within the physical comic file has been updated
  scraped,
  detailsUpdated,
  metadataCleared,
  archiveRecreated,
  comicMoved,
  markedForRemoval,
  unmarkedForRemoval;
}

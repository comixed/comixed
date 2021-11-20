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
  // the record has been inserted into the database
  recordInserted,
  // the record is ready for processing
  readyForProcessing,
  // the file entries have been loaded
  fileContentsLoaded,
  // blocked pages have been marked
  blockedPagesMarked,
  // the file details have been created
  fileDetailsLoadedAction,
  // the contents have been processed
  contentsProcessed,
  // rescan a comic,
  rescanComic,
  // prepare to update the metadata within the physical comic file
  updateMetadata,
  // the metadata within the physical comic file has been updated
  metadataUpdated,
  // marks the comic for consolidation
  consolidateComic,
  // the comic has been consolidated
  comicConsolidated,
  // the comic is being marked for removal
  deleteComic,
  // the comic is being unmarked for removal
  undeleteComic,
  // recreate the comic file
  recreateComicFile,
  // the comic file was recreated
  comicFileRecreated,
  // the comic has been marked as read by a user
  markAsRead,
  // the comic has been marked as unread by a user
  markAsUnread,
  scraped,
  // some detail of the comic was changed
  detailsUpdated,
  metadataCleared,
  comicMoved,
  markedForRemoval,
  unmarkedForRemoval,
  // prepares the comic for purging
  prepareToPurge,
  // the comic has been purged from the library
  comicPurged;
}

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
  // the comic was discovered
  comicDiscovered,
  // the discovered comic was imported
  imported,
  // the comic book was created
  readyForProcessing,
  // the file entries have been loaded
  fileContentsLoaded,
  // the page hashes were loaded
  pagesHashesLoaded,
  // rescan a comic,
  rescanComic,
  // the metadata within the physical comic file has been updated
  metadataUpdated,
  // the comic is being marked for removal
  deleteComic,
  // the comic is being unmarked for removal
  undeleteComic,
  // the comic file was recreated
  comicFileRecreated,
  // the comic's metadata was updated
  scraped,
  // start the process of updating details for some comics
  updateDetails,
  // some detail of the comic was changed
  detailsUpdated,
  metadataCleared,
  // a file in the library was deleted from disk
  markAsMissing,
  markAsFound,
  markedForRemoval,
  unmarkedForRemoval,
  // the comic has been purged from the library
  comicPurged;
}

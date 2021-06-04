/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

package org.comixedproject.views;

/**
 * <code>View</code> provides interfaces used to decide what details are included in JSON responses
 * sent to the front end.
 *
 * @author Darryl L. Pierce
 */
public class View {
  /** Used when retrieving the list of comic formats. */
  public interface ComicFormatList {}

  /** Used when retrieving the list of scan types. */
  public interface ScanTypeList {}

  /** Used when viewing a list of comics. */
  public interface ComicListView {}

  /** Used when viewing the details of comics. */
  public interface ComicDetailsView extends ComicListView {}

  /** Used when viewing a list of deleted comics. */
  public interface DeletedComicList {}

  /** Used when viewing the details of a deleted comic. */
  public interface PageDetails extends PageList {}

  /** Used when viewing a list of pages. */
  public interface PageList {}

  /** Used when viewing a list of users. */
  public interface UserList {}

  /** Used when viewing the details of a user. */
  public interface UserDetailsView extends UserList {}

  /** Used when viewing the list of reading lists. */
  public interface ReadingList {}

  /** Used when viewing the list of smart reading lists. */
  public interface SmartReadingList {}

  /** Used when viewing the list of duplicate pages. */
  public interface DuplicatePageList {}

  /** Used when fetching library updates. */
  public interface LibraryUpdate {}

  /** Used when viewing the list of plugins. */
  public interface PluginList {}

  /** Used when viewing a list of audit log entries. */
  public interface AuditLogEntryList {}

  /** Used when viewing a list of audit log detail. */
  public interface AuditLogEntryDetail {}

  /** Used when viewing a list of comic files. */
  public interface ComicFileList {}

  /** Used when viewing the build details for the server. */
  public interface BuildDetails {}

  /** Used when viewing a list of blocked pages. */
  public interface BlockedPageList {}

  /** Used when viewing the details of a blocked page. */
  public interface BlockedPageDetail extends BlockedPageList {}

  /** Used when viewing the last read dates for a user. */
  public interface LastReadList {}
}

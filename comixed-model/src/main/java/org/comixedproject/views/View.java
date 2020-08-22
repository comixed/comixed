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
  /** The parent type for all views. */
  public interface ApiResponse {}

  /** Show full details on a single comic. */
  public interface ComicDetails extends ComicList {}

  /** Show minimal details for more than one comic. */
  public interface ComicList extends ApiResponse {}

  /** Used when deleting comics. */
  public interface DeletedComicList {}

  /** Show full details on a single page. */
  public interface PageDetails extends PageList {}

  /** Show minimal information for more than one page. */
  public interface PageList {}

  public interface UserList {}

  /** Show full details on a user. */
  public interface UserDetails extends UserList {}

  /** Used when doing a database backup. */
  public interface DatabaseBackup {}

  /** Used when fetching a reading list. */
  public interface ReadingList {}

  /** Used when fetching a smart reading list. */
  public interface SmartReadingList {}

  /** Used when fetching the list of duplicate pages. */
  public interface DuplicatePageList {}

  /** Used when fetching library updates. */
  public interface LibraryUpdate {}

  /** Used when viewing the list of plugins. */
  public interface PluginList {}

  /** Uses when viewing a list of audit log entries. */
  public interface AuditLogEntryList extends ApiResponse {}
}

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
public interface View {
  /** Used when returning the generic response. */
  public interface GenericObjectView {}

  /** Used when retrieving the state of the library. */
  public interface RemoteLibraryState {}

  /** Used when viewing a list of comics. */
  public interface ComicListView {}

  /** Used when viewing the details of comics. */
  public interface ComicView extends ComicListView {}

  /** Used when viewing a list of duplicate comics. */
  public interface DuplicateComicListView {}

  /** Used when viewing a list of pages. */
  public interface PageListView {}

  /** Used when viewing a list of users. */
  public interface UserListView {}

  /** Used when viewing the details of a user. */
  public interface UserView extends UserListView {}

  /** Used when viewing user statistics. */
  public interface UserStatsView {}

  /** Used when viewing the list of reading lists. */
  public interface ReadingListListView {}

  /** Used when viewing the details for a reading list. */
  public interface ReadingListView extends ReadingListListView {}

  /** Used when viewing the list of duplicate pages. */
  public interface DuplicatePageListView {}

  /** Used when viewing the details of a duplicate page. */
  public interface DuplicatePageView extends DuplicatePageListView {}

  /** Used when viewing the list of plugins. */
  public interface LibraryPluginListView {}

  /** Used when viewing the list of plugin languages. */
  public interface PluginLanguageListView {}

  /** Used when viewing a list of comic files. */
  public interface ComicFileListView {}

  /** Used when viewing the build details for the server. */
  public interface ReleaseDetailsView {}

  /** Used when viewing a list of blocked hashes. */
  public interface BlockedHashListView {}

  /** Used when viewing the details of a blocked hashes. */
  public interface BlockedHashView extends BlockedHashListView {}

  /** Used when viewing the last read dates for a user. */
  public interface LastReadListView {}

  /** Used when retrieving the configuration list. */
  public interface ConfigurationListView {}

  /** Used when retrieving the filename scraping rules. */
  public interface FilenameScrapingRuleListView {}

  /** Used when retrieving the list of imprints. */
  public interface ImprintListView {}

  /** Used when retrieving a list of stories. */
  public interface StoryListView {}

  /** Used when retrieving a story. */
  public interface StoryView extends StoryListView {}

  /** Used when retrieving a list of metadata sources. */
  public interface MetadataSourceListView {}

  /** Used when retrieving a single metadata source. */
  public interface MetadataSourceView extends MetadataSourceListView {}

  /** Used when marshalling a metadata process update. */
  public interface MetadataUpdateProcessStateView {}

  /** Used when show the list of deleted pages. */
  public interface DeletedPageListView {}

  /** Used when downloading a page of collection entries. */
  public interface CollectionEntryListView {}
}

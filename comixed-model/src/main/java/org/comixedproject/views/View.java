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

  /** Used when retrieving the list of comic formats. */
  public interface ComicFormatList {}

  /** Used when retrieving the list of scan types. */
  public interface ScanTypeList {}

  /** Used when retrieving the state of the library. */
  public interface RemoteLibraryState {}

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

  /** Used when viewing user statistics. */
  public interface UserStatistics {}

  /** Used when viewing the list of reading lists. */
  public interface ReadingLists {}

  /** Used when viewing the details for a reading list. */
  public interface ReadingListDetail extends ReadingLists {}

  /** Used when viewing the list of smart reading lists. */
  public interface SmartReadingList {}

  /** Used when viewing the list of duplicate pages. */
  public interface DuplicatePageList {}

  /** Used when viewing the details of a duplicate page. */
  public interface DuplicatePageDetail extends DuplicatePageList {}

  /** Used when viewing the list of plugins. */
  public interface LibraryPluginList {}

  /** Used when viewing the list of plugin languages. */
  public interface PluginLanguageList {}

  /** Used when viewing a list of comic files. */
  public interface ComicFileList {}

  /** Used when viewing the build details for the server. */
  public interface ReleaseDetails {}

  /** Used when viewing a list of blocked hashes. */
  public interface BlockedHashList {}

  /** Used when viewing the details of a blocked hashes. */
  public interface BlockedHashDetail extends BlockedHashList {}

  /** Used when viewing the last read dates for a user. */
  public interface LastReadList {}

  /** Used when retrieving the configuration list. */
  public interface ConfigurationList {}

  /** Used when retrieving the filename scraping rules. */
  public interface FilenameScrapingRuleList {}

  /** Used when retrieving the list of imprints. */
  public interface ImprintListView {}

  /** Used when retrieving a list of stories. */
  public interface StoryList {}

  /** Used when retrieving a story. */
  public interface StoryDetail extends StoryList {}

  /** Used when retrieving a list of metadata sources. */
  public interface MetadataSourceList {}

  /** Used when retrieving a single metadata source. */
  public interface MetadataSourceDetail extends MetadataSourceList {}

  /** Used when marshalling a metadata process update. */
  public interface MetadataUpdateProcessState {}

  /** Used when show the list of deleted pages. */
  public interface DeletedPageList {}

  /** Used when downloading a page of collection entries. */
  public interface CollectionEntryList {}
}

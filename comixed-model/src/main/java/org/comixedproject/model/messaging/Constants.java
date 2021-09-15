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

package org.comixedproject.model.messaging;

/**
 * <code>Constants</code> is a namespace for constant values used by the messaging system.
 *
 * @author Darryl L. Pierce
 */
public interface Constants {
  /** Topic which receives comic list updates in real time. */
  String COMIC_LIST_UPDATE_TOPIC = "/topic/comic-list.update";

  /** Topic which receives individual comic updates in real time. */
  String COMIC_BOOK_UPDATE_TOPIC = "/topic/comic-book.%d.update";

  /** Topic which receives blocked page updates in real time. */
  String BLOCKED_PAGE_LIST_UPDATE_TOPIC = "/topic/blocked-page-list.update";

  /** Topic which receives blocked page removals in real time. */
  String BLOCKED_PAGE_LIST_REMOVAL_TOPIC = "/topic/blocked-page-list.removal";

  /** Topic which receives updates on the current user." */
  String CURRENT_USER_UPDATE_TOPIC = "/topic/user/current";

  /** Topic which receives notices when last read entries are updated. */
  String LAST_READ_UPDATE_TOPIC = "/topic/last-read-list.update";

  /** Topic which receives notices when last read entries are removed. */
  String LAST_READ_REMOVAL_TOPIC = "/topic/last-read-list.removal";

  /** Topic which receives notices when the duplicate page list is updated. */
  String DUPLICATE_PAGE_LIST_TOPIC = "/topic/duplicate-page-list.update";
}

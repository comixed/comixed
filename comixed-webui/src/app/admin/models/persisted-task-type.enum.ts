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

export enum PersistedTaskType {
  MONITOR_TASK_QUEUE = 'MONITOR_TASK_QUEUE',
  ADD_COMIC = 'ADD_COMIC',
  PROCESS_COMIC = 'PROCESS_COMIC',
  RESCAN_COMIC = 'RESCAN_COMIC',
  RESCAN_COMICS = 'RESCAN_COMICS',
  MARK_COMIC_FOR_REMOVAL = 'MARK_COMIC_FOR_REMOVAL',
  MARK_COMICS_FOR_REMOVAL = 'MARK_COMICS_FOR_REMOVAL',
  UNMARK_COMIC_FOR_REMOVAL = 'UNMARK_COMIC_FOR_REMOVAL',
  UNMARK_COMICS_FOR_REMOVAL = 'UNMARK_COMICS_FOR_REMOVAL',
  MOVE_COMIC = 'MOVE_COMIC',
  MOVE_COMICS = 'MOVE_COMICS',
  CONVERT_COMIC = 'CONVERT_COMIC',
  QUEUE_COMICS = 'QUEUE_COMICS'
}

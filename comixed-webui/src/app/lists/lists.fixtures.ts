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

import { ReadingList } from './models/reading-list';
import { USER_READER } from '../user/user.fixtures';
import { Story } from '@app/lists/models/story';

export const READING_LIST_1: ReadingList = {
  id: 1,
  name: 'Reading List 1',
  summary: 'Reading list 1',
  owner: USER_READER,
  createdOn: new Date().getTime(),
  lastModifiedOn: new Date().getTime(),
  comicBooks: []
};

export const READING_LIST_2: ReadingList = {
  id: 2,
  name: 'Reading List 2',
  summary: 'Reading list 2',
  owner: USER_READER,
  createdOn: new Date().getTime(),
  lastModifiedOn: new Date().getTime(),
  comicBooks: []
};

export const READING_LIST_3: ReadingList = {
  id: 3,
  name: 'Reading List 3',
  summary: 'Reading list 3',
  owner: USER_READER,
  createdOn: new Date().getTime(),
  lastModifiedOn: new Date().getTime(),
  comicBooks: []
};

export const READING_LIST_4: ReadingList = {
  id: 4,
  name: 'Reading List 4',
  summary: 'Reading list 4',
  owner: USER_READER,
  createdOn: new Date().getTime(),
  lastModifiedOn: new Date().getTime(),
  comicBooks: []
};

export const READING_LIST_5: ReadingList = {
  id: 5,
  name: 'Reading List 5',
  summary: 'Reading list 5',
  owner: USER_READER,
  createdOn: new Date().getTime(),
  lastModifiedOn: new Date().getTime(),
  comicBooks: []
};

export const STORY_1: Story = {
  id: 1,
  name: 'Story 1',
  publisher: 'Publisher 1',
  comicVineId: null,
  entries: [],
  createdOn: new Date().getTime(),
  modifiedOn: new Date().getTime()
};

export const STORY_2: Story = {
  id: 2,
  name: 'Story 1',
  publisher: 'Publisher 2',
  comicVineId: null,
  entries: [],
  createdOn: new Date().getTime(),
  modifiedOn: new Date().getTime()
};

export const STORY_3: Story = {
  id: 3,
  name: 'Story 1',
  publisher: 'Publisher 3',
  comicVineId: null,
  entries: [],
  createdOn: new Date().getTime(),
  modifiedOn: new Date().getTime()
};

export const STORY_4: Story = {
  id: 4,
  name: 'Story 1',
  publisher: 'Publisher 4',
  comicVineId: null,
  entries: [],
  createdOn: new Date().getTime(),
  modifiedOn: new Date().getTime()
};

export const STORY_5: Story = {
  id: 5,
  name: 'Story 1',
  publisher: 'Publisher 5',
  comicVineId: null,
  entries: [],
  createdOn: new Date().getTime(),
  modifiedOn: new Date().getTime()
};

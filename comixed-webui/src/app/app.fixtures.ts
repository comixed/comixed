/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import { CurrentRelease } from './models/current-release';
import { LatestRelease } from '@app/models/latest-release';
import { ComicsReadStatistic } from '@app/models/ui/comics-read-statistic';

export const CURRENT_RELEASE: CurrentRelease = {
  branch: 'branch-name',
  buildTime: new Date().getTime(),
  buildHost: 'build-host',
  buildVersion: 'v1.0.3-1',
  commitId: 'commit-id',
  commitTime: new Date().getTime(),
  commitMessage: 'commit-message',
  commitUser: 'commit-user',
  commitEmail: 'commit@email.com',
  dirty: Math.random() > 0.5,
  remoteOriginURL: 'http://remote.origin.url',
  jdbcUrl: 'jdbc:h2:mem://localhost/comixed'
};

export const LATEST_RELEASE: LatestRelease = {
  version: 'v1.0.3-2',
  url: 'http://latest.release.link',
  updated: new Date().getTime(),
  newer: true
};

export const COMICS_READ_STATISTICS_1: ComicsReadStatistic = {
  publisher: 'Publisher 1',
  count: 804
};

export const COMICS_READ_STATISTICS_2: ComicsReadStatistic = {
  publisher: 'Publisher 2',
  count: 129
};

export const COMICS_READ_STATISTICS_3: ComicsReadStatistic = {
  publisher: 'Publisher 3',
  count: 717
};

export const COMICS_READ_STATISTICS_4: ComicsReadStatistic = {
  publisher: 'Publisher 4',
  count: 320
};

export const COMICS_READ_STATISTICS_5: ComicsReadStatistic = {
  publisher: 'Publisher 5',
  count: 921
};

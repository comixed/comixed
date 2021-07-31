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

import { BuildDetails } from './models/build-details';

export const BUILD_DETAILS: BuildDetails = {
  branch: 'branch-name',
  buildTime: new Date().getTime(),
  buildHost: 'build-host',
  buildVersion: 'build-version',
  commitId: 'commit-id',
  commitTime: new Date().getTime(),
  commitMessage: 'commit-message',
  commitUser: 'commit-user',
  commitEmail: 'commit@email.com',
  dirty: Math.random() > 0.5,
  remoteOriginURL: 'http://remote.origin.url',
  jdbcUrl: 'jdbc:h2:mem://localhost/comixed'
};

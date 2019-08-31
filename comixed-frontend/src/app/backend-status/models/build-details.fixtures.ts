/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { BuildDetails } from 'app/backend-status/models/build-details';

export const BUILD_DETAILS: BuildDetails = {
  branch: 'release/0.5.0',
  build_host: 'localhost',
  build_time: new Date(),
  build_version: '0.5.0',
  commit_id: 'OICU812',
  commit_time: new Date(),
  commit_message: 'This is a feature',
  commit_user: 'Joey Baggodonuts',
  commit_email: 'comixedcoder@localhost',
  dirty: false,
  remote_origin_url: 'git@github.com:comixed.git'
};

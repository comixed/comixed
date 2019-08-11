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

import * as _ from 'lodash';

export const API_ROOT_URL = '/api';

export function interpolate(template: string, values: any = {}): string {
  const vals = _.merge(values, { API_ROOT_URL: API_ROOT_URL });
  _.templateSettings.interpolate = /\${([\s\S]+?)}/g;
  const compiled = _.template(template);
  const result = compiled(values);

  return result;
}

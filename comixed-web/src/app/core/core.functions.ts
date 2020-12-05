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

import * as _ from 'lodash';

export const API_ROOT_URL = '/api';

/** Interpolates the given values into the provided string. */
export function interpolate(template: string, values: any = {}): string {
  _.merge(values, { API_ROOT_URL });
  _.templateSettings.interpolate = /\${([\s\S]+?)}/g;
  const compiled = _.template(template);
  const result = compiled(values);

  return result;
}

/** Compare two values for sorting purposes. */
export function compare(
  a: number | string,
  b: number | string,
  ascending: boolean
): number {
  return (a < b ? -1 : 1) * (ascending ? 1 : -1);
}
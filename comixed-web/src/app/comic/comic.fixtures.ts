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

import { ComicFormat } from './models/comic-format';
import { ScanType } from './models/scan-type';

export const FORMAT_1: ComicFormat = {
  id: 1,
  name: 'standard'
};

export const FORMAT_2: ComicFormat = {
  id: 2,
  name: 'trade-paperback'
};

export const FORMAT_3: ComicFormat = {
  id: 3,
  name: 'graphic-novel'
};

export const FORMAT_4: ComicFormat = {
  id: 4,
  name: 'deluxe-edition'
};

export const FORMAT_5: ComicFormat = {
  id: 5,
  name: 'treasury'
};

export const SCAN_TYPE_1: ScanType = {
  id: 1,
  name: 'digital'
};

export const SCAN_TYPE_2: ScanType = {
  id: 2,
  name: 'print'
};

export const SCAN_TYPE_3: ScanType = {
  id: 3,
  name: 'scan_c2c'
};

export const SCAN_TYPE_4: ScanType = {
  id: 4,
  name: 'fiche'
};

export const SCAN_TYPE_5: ScanType = {
  id: 5,
  name: 'hybrid'
};

export const SCAN_TYPE_6: ScanType = {
  id: 6,
  name: 'partial'
};

export const SCAN_TYPE_7: ScanType = {
  id: 7,
  name: 'scanalation'
};

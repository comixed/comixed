/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

export interface FilenameScrapingRule {
  filenameScrapingRuleId: number;
  name: string;
  rule: string;
  priority: number;
  seriesPosition: number | null;
  volumePosition: number | null;
  issueNumberPosition: number | null;
  coverDatePosition: number | null;
  dateFormat: string | null;
}

export const EMPTY_FILENAME_SCRAPING_RULE: FilenameScrapingRule = {
  filenameScrapingRuleId: new Date().getTime(),
  name: '',
  rule: '',
  priority: 999,
  seriesPosition: null,
  volumePosition: null,
  issueNumberPosition: null,
  coverDatePosition: null,
  dateFormat: null
};

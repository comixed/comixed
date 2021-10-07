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

import { WebAuditLogEntry } from './models/web-audit-log-entry';
import { ConfigurationOption } from '@app/admin/models/configuration-option';
import { FilenameScrapingRule } from '@app/admin/models/filename-scraping-rule';

export const WEB_AUDIT_LOG_ENTRY_1: WebAuditLogEntry = {
  id: 1,
  remoteIp: '4.4.4.4',
  url: '',
  method: 'GET',
  requestContent: '{}',
  responseContent: '{}',
  email: '',
  startTime: new Date().getTime(),
  endTime: new Date().getTime(),
  successful: true,
  exception: null
};

export const WEB_AUDIT_LOG_ENTRY_2: WebAuditLogEntry = {
  id: 2,
  remoteIp: '4.4.4.4',
  url: '',
  method: 'GET',
  requestContent: '{}',
  responseContent: '{}',
  email: '',
  startTime: new Date().getTime(),
  endTime: new Date().getTime(),
  successful: true,
  exception: null
};

export const WEB_AUDIT_LOG_ENTRY_3: WebAuditLogEntry = {
  id: 3,
  remoteIp: '4.4.4.4',
  url: '',
  method: 'GET',
  requestContent: '{}',
  responseContent: '{}',
  email: '',
  startTime: new Date().getTime(),
  endTime: new Date().getTime(),
  successful: true,
  exception: null
};

export const WEB_AUDIT_LOG_ENTRY_4: WebAuditLogEntry = {
  id: 4,
  remoteIp: '4.4.4.4',
  url: '',
  method: 'GET',
  requestContent: '{}',
  responseContent: '{}',
  email: '',
  startTime: new Date().getTime(),
  endTime: new Date().getTime(),
  successful: true,
  exception: null
};

export const WEB_AUDIT_LOG_ENTRY_5: WebAuditLogEntry = {
  id: 5,
  remoteIp: '4.4.4.4',
  url: '',
  method: 'GET',
  requestContent: '{}',
  responseContent: '{}',
  email: '',
  startTime: new Date().getTime(),
  endTime: new Date().getTime(),
  successful: true,
  exception: null
};

export const CONFIGURATION_OPTION_1: ConfigurationOption = {
  name: 'OPTION1',
  value: 'VALUE1'
};

export const CONFIGURATION_OPTION_2: ConfigurationOption = {
  name: 'OPTION2',
  value: 'VALUE2'
};

export const CONFIGURATION_OPTION_3: ConfigurationOption = {
  name: 'OPTION3',
  value: 'VALUE3'
};

export const CONFIGURATION_OPTION_4: ConfigurationOption = {
  name: 'OPTION4',
  value: 'VALUE4'
};

export const CONFIGURATION_OPTION_5: ConfigurationOption = {
  name: 'OPTION5',
  value: 'VALUE5'
};

export const FILENAME_SCRAPING_RULE_1: FilenameScrapingRule = {
  id: 1,
  name: 'Rule 1',
  rule: 'rule text',
  priority: 1,
  seriesPosition: 1,
  volumePosition: 2,
  issueNumberPosition: 3,
  coverDatePosition: 4,
  dateFormat: 'MMMMM yyyy'
};

export const FILENAME_SCRAPING_RULE_2: FilenameScrapingRule = {
  id: 2,
  name: 'Rule 2',
  rule: 'rule text',
  priority: 2,
  seriesPosition: 1,
  volumePosition: 2,
  issueNumberPosition: 3,
  coverDatePosition: 4,
  dateFormat: 'MMMMM yyyy'
};

export const FILENAME_SCRAPING_RULE_3: FilenameScrapingRule = {
  id: 3,
  name: 'Rule 3',
  rule: 'rule text',
  priority: 3,
  seriesPosition: 1,
  volumePosition: 2,
  issueNumberPosition: 3,
  coverDatePosition: 4,
  dateFormat: 'MMMMM yyyy'
};

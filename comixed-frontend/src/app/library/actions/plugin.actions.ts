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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { Action } from '@ngrx/store';
import { PluginDescriptor } from 'app/library/models/plugin-descriptor';

export enum PluginActionTypes {
  GetAll = '[PLUGIN] Get all plugins',
  AllReceived = '[PLUGIN] All plugins received',
  GetAllFailed = '[PLUGIN] Get all plugins failed',
  Reload = '[PLUGIN] Reload plugins',
  Reloaded = '[PLUGIN] Plugins reloaded',
  ReloadFailed = '[PLUGIN] Reload plugins failed'
}

export class GetAllPlugins implements Action {
  readonly type = PluginActionTypes.GetAll;

  constructor() {}
}

export class AllPluginsReceived implements Action {
  readonly type = PluginActionTypes.AllReceived;

  constructor(public payload: { pluginDescriptors: PluginDescriptor[] }) {}
}

export class GetAllPluginsFailed implements Action {
  readonly type = PluginActionTypes.GetAllFailed;

  constructor() {}
}

export class ReloadPlugins implements Action {
  readonly type = PluginActionTypes.Reload;

  constructor() {}
}

export class PluginsReloaded implements Action {
  readonly type = PluginActionTypes.Reloaded;

  constructor(public payload: { pluginDescriptors: PluginDescriptor[] }) {}
}

export class ReloadPluginsFailed implements Action {
  readonly type = PluginActionTypes.ReloadFailed;

  constructor() {}
}

export type PluginActions =
  | GetAllPlugins
  | AllPluginsReceived
  | GetAllPluginsFailed
  | ReloadPlugins
  | PluginsReloaded
  | ReloadPluginsFailed;

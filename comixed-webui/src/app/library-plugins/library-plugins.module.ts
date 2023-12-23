/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibraryPluginsRouting } from '@app/library-plugins/library-plugins.routing';
import { StoreModule } from '@ngrx/store';
import { libraryPluginFeature } from '@app/library-plugins/reducers/library-plugin.reducer';
import { EffectsModule } from '@ngrx/effects';
import { LibraryPluginEffects } from '@app/library-plugins/effects/library-plugin.effects';
import { pluginLanguageFeature } from '@app/library-plugins/reducers/plugin-language.reducer';
import { PluginLanguageEffects } from '@app/library-plugins/effects/plugin-language.effects';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    LibraryPluginsRouting,
    StoreModule.forFeature(libraryPluginFeature),
    StoreModule.forFeature(pluginLanguageFeature),
    EffectsModule.forFeature([LibraryPluginEffects, PluginLanguageEffects])
  ]
})
export class LibraryPluginsModule {}

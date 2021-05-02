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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import {
  COMIC_FORMAT_FEATURE_KEY,
  reducer as comicFormatReducer
} from './reducers/comic-format.reducer';
import { EffectsModule } from '@ngrx/effects';
import { ComicFormatEffects } from './effects/comic-format.effects';
import {
  reducer as scanTypeReducer,
  SCAN_TYPE_FEATURE_KEY
} from './reducers/scan-type.reducer';
import { ScanTypeEffects } from './effects/scan-type.effects';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature(COMIC_FORMAT_FEATURE_KEY, comicFormatReducer),
    StoreModule.forFeature(SCAN_TYPE_FEATURE_KEY, scanTypeReducer),
    EffectsModule.forFeature([ComicFormatEffects, ScanTypeEffects])
  ],
  exports: [CommonModule]
})
export class ComicModule {}

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
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';
import { lastReadListFeature } from '@app/last-read/reducers/last-read-list.reducer';
import { EffectsModule } from '@ngrx/effects';
import { LastReadListEffects } from './effects/last-read-list.effects';
import { comicBooksReadFeature } from '@app/last-read/reducers/comic-books-read.reducer';
import { ComicBooksReadEffects } from '@app/last-read/effects/comic-books-read.effects';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    LoggerModule.forRoot(),
    TranslateModule.forRoot(),
    StoreModule.forFeature(lastReadListFeature),
    StoreModule.forFeature(comicBooksReadFeature),
    EffectsModule.forFeature([LastReadListEffects, ComicBooksReadEffects])
  ],
  exports: [CommonModule]
})
export class LastReadModule {}

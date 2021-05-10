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
import {
  COMIC_FEATURE_KEY,
  reducer as comicReducer
} from './reducers/comic.reducer';
import { ComicEffects } from './effects/comic.effects';
import { ComicRouting } from './comic.routing';
import { ComicDetailsPageComponent } from './pages/comic-details-page/comic-details-page.component';
import { ComicDetailsDialogComponent } from './components/comic-details-dialog/comic-details-dialog.component';
import { ComicEditComponent } from './components/comic-edit/comic-edit.component';
import { ComicOverviewComponent } from './components/comic-overview/comic-overview.component';
import { ComicPageComponent } from './components/comic-page/comic-page.component';
import { ComicPagesComponent } from './components/comic-pages/comic-pages.component';
import { ComicStoryComponent } from './components/comic-story/comic-story.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { ComicDetailCardComponent } from '@app/comic/components/comic-detail-card/comic-detail-card.component';

@NgModule({
  declarations: [
    ComicDetailsPageComponent,
    ComicDetailsPageComponent,
    ComicDetailsDialogComponent,
    ComicEditComponent,
    ComicOverviewComponent,
    ComicPageComponent,
    ComicPagesComponent,
    ComicStoryComponent,
    ComicDetailCardComponent
  ],
  imports: [
    CommonModule,
    ComicRouting,
    StoreModule.forFeature(COMIC_FORMAT_FEATURE_KEY, comicFormatReducer),
    StoreModule.forFeature(SCAN_TYPE_FEATURE_KEY, scanTypeReducer),
    StoreModule.forFeature(COMIC_FEATURE_KEY, comicReducer),
    EffectsModule.forFeature([
      ComicFormatEffects,
      ScanTypeEffects,
      ComicEffects
    ]),
    MatToolbarModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTooltipModule,
    MatMenuModule,
    MatExpansionModule
  ],
  exports: [CommonModule, ComicPageComponent, ComicEditComponent]
})
export class ComicModule {}

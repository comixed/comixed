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
import { EffectsModule } from '@ngrx/effects';
import { TranslateModule } from '@ngx-translate/core';
import { BlockedHashListPageComponent } from './pages/blocked-hash-list-page/blocked-hash-list-page.component';
import { ComicPagesRouting } from './comic-pages.routing';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BlockedHashDetailPageComponent } from './pages/blocked-hash-detail-page/blocked-hash-detail-page.component';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { blockedHashesFeature } from '@app/comic-pages/reducers/blocked-hashes.reducer';
import { BlockedHashesEffects } from '@app/comic-pages/effects/blocked-hashes.effects';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  DELETE_BLOCKED_PAGES_FEATURE_KEY,
  reducer as deleteBlockedPagesReducer
} from '@app/comic-pages/reducers/delete-blocked-pages.reducer';
import { DeleteBlockedPagesEffects } from '@app/comic-pages/effects/delete-blocked-pages.effects';
import { DeletedPageListPageComponent } from './pages/deleted-page-list-page/deleted-page-list-page.component';
import { ComicBooksModule } from '@app/comic-books/comic-books.module';
import { MatSortModule } from '@angular/material/sort';
import { MatDividerModule } from '@angular/material/divider';
import { BlockedHashToolbarComponent } from './components/blocked-hash-toolbar/blocked-hash-toolbar.component';
import {
  DELETED_PAGE_FEATURE_KEY,
  reducer as deletedPageReducer
} from '@app/comic-pages/reducers/deleted-pages.reducer';
import { DeletedPagesEffects } from '@app/comic-pages/effects/deleted-pages.effects';
import { BlockedHashThumbnailUrlPipe } from './pipes/blocked-hash-thumbnail-url.pipe';

@NgModule({
  declarations: [
    BlockedHashListPageComponent,
    BlockedHashDetailPageComponent,
    DeletedPageListPageComponent,
    BlockedHashToolbarComponent,
    BlockedHashThumbnailUrlPipe
  ],
  imports: [
    CommonModule,
    ComicPagesRouting,
    TranslateModule.forRoot(),
    StoreModule.forFeature(blockedHashesFeature),
    StoreModule.forFeature(
      DELETE_BLOCKED_PAGES_FEATURE_KEY,
      deleteBlockedPagesReducer
    ),
    StoreModule.forFeature(DELETED_PAGE_FEATURE_KEY, deletedPageReducer),
    EffectsModule.forFeature([
      BlockedHashesEffects,
      DeleteBlockedPagesEffects,
      DeletedPagesEffects
    ]),
    MatTableModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatPaginatorModule,
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    ComicBooksModule,
    MatSortModule,
    MatDividerModule
  ],
  exports: [CommonModule]
})
export class ComicPagesModule {}

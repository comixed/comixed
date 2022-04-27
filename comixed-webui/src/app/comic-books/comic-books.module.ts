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

import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { ComicBooksRouting } from './comic-books.routing';
import { ComicBookPageComponent } from './pages/comic-book-page/comic-book-page.component';
import { ComicEditComponent } from './components/comic-edit/comic-edit.component';
import { ComicOverviewComponent } from './components/comic-overview/comic-overview.component';
import { ComicPagesComponent } from './components/comic-pages/comic-pages.component';
import { ComicPageComponent } from './components/comic-page/comic-page.component';
import { ComicMetadataComponent } from './components/comic-metadata/comic-metadata.component';
import { ComicStoryComponent } from './components/comic-story/comic-story.component';
import { IssueMetadataDetailComponent } from './components/issue-metadata-detail/issue-metadata-detail.component';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { ComicDetailCardComponent } from '@app/comic-books/components/comic-detail-card/comic-detail-card.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { ComicCoverUrlPipe } from '@app/comic-books/pipes/comic-cover-url.pipe';
import { ComicPageUrlPipe } from '@app/comic-books/pipes/comic-page-url.pipe';
import { ComicTitlePipe } from '@app/comic-books/pipes/comic-title.pipe';
import { IssueMetadataTitlePipe } from '@app/comic-metadata/pipes/issue-metadata-title.pipe';
import {
  reducer as scrapingReducer,
  METADATA_FEATURE_KEY
} from '@app/comic-metadata/reducers/metadata.reducer';
import {
  COMIC_LIST_FEATURE_KEY,
  reducer as comicListReducer
} from '@app/comic-books/reducers/comic-list.reducer';
import {
  COMIC_FEATURE_KEY,
  reducer as comicReducer
} from '@app/comic-books/reducers/comic.reducer';
import { MetadataEffects } from '@app/comic-metadata/effects/metadata.effects';
import { ComicListEffects } from '@app/comic-books/effects/comic-list.effects';
import { ComicEffects } from '@app/comic-books/effects/comic.effects';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatSortModule } from '@angular/material/sort';
import { CoreModule } from '@app/core/core.module';
import { MatGridListModule } from '@angular/material/grid-list';
import { PageHashUrlPipe } from './pipes/page-hash-url.pipe';
import { MarkComicsDeletedEffects } from '@app/comic-books/effects/mark-comics-deleted.effects';
import {
  MARK_COMICS_DELETED_FEATURE_KEY,
  reducer as markComicsDeletedReducer
} from '@app/comic-books/reducers/mark-comics-deleted.reducer';
import { MatDividerModule } from '@angular/material/divider';
import {
  IMPRINT_LIST_FEATURE_KEY,
  reducer as imprintListReducer
} from '@app/comic-books/reducers/imprint-list.reducer';
import { ImprintListEffects } from '@app/comic-books/effects/imprint-list.effects';
import { FlexModule } from '@angular/flex-layout';
import { MatBadgeModule } from '@angular/material/badge';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CoverDateFilterPipe } from './pipes/cover-date-filter.pipe';

@NgModule({
  declarations: [
    ComicBookPageComponent,
    ComicEditComponent,
    ComicOverviewComponent,
    ComicPagesComponent,
    ComicPageComponent,
    ComicMetadataComponent,
    ComicStoryComponent,
    IssueMetadataDetailComponent,
    ComicDetailCardComponent,
    ComicCoverUrlPipe,
    ComicPageUrlPipe,
    ComicTitlePipe,
    IssueMetadataTitlePipe,
    PageHashUrlPipe,
    CoverDateFilterPipe
  ],
  imports: [
    CommonModule,
    ComicBooksRouting,
    StoreModule.forFeature(METADATA_FEATURE_KEY, scrapingReducer),
    StoreModule.forFeature(COMIC_LIST_FEATURE_KEY, comicListReducer),
    StoreModule.forFeature(COMIC_FEATURE_KEY, comicReducer),
    StoreModule.forFeature(IMPRINT_LIST_FEATURE_KEY, imprintListReducer),
    StoreModule.forFeature(
      MARK_COMICS_DELETED_FEATURE_KEY,
      markComicsDeletedReducer
    ),
    EffectsModule.forFeature([
      MetadataEffects,
      ComicListEffects,
      ComicEffects,
      ImprintListEffects,
      MarkComicsDeletedEffects
    ]),
    TranslateModule.forRoot(),
    MatCardModule,
    MatTooltipModule,
    MatIconModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatInputModule,
    MatExpansionModule,
    MatPaginatorModule,
    MatTableModule,
    MatToolbarModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatChipsModule,
    MatSortModule,
    CoreModule,
    MatGridListModule,
    MatDividerModule,
    FlexModule,
    MatBadgeModule,
    DragDropModule
  ],
  exports: [
    CommonModule,
    ComicPageComponent,
    ComicEditComponent,
    ComicMetadataComponent,
    ComicDetailCardComponent,
    ComicTitlePipe,
    ComicCoverUrlPipe,
    PageHashUrlPipe,
    CoverDateFilterPipe
  ]
})
export class ComicBooksModule {
  static forRoot(): ModuleWithProviders<ComicBooksModule> {
    return {
      ngModule: ComicBooksModule,
      providers: [ComicTitlePipe]
    };
  }
}

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
import { ComicScrapingComponent } from './components/comic-scraping/comic-scraping.component';
import { ComicDetailEditComponent } from './components/comic-detail-edit/comic-detail-edit.component';
import { ComicPagesComponent } from './components/comic-pages/comic-pages.component';
import { ComicPageComponent } from './components/comic-page/comic-page.component';
import { ComicScrapingVolumeSelectionComponent } from './components/comic-scraping-volume-selection/comic-scraping-volume-selection.component';
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
import { IssueMetadataTitlePipe } from '@app/comic-books/pipes/issue-metadata-title.pipe';
import { comicBookListFeature } from '@app/comic-books/reducers/comic-book-list.reducer';
import { comicBookFeature } from '@app/comic-books/reducers/comic-book.reducer';
import { ComicBookListEffects } from '@app/comic-books/effects/comic-book-list.effects';
import { ComicBookEffects } from '@app/comic-books/effects/comic-book.effects';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatSortModule } from '@angular/material/sort';
import { CoreModule } from '@app/core/core.module';
import { MatGridListModule } from '@angular/material/grid-list';
import { PageHashUrlPipe } from './pipes/page-hash-url.pipe';
import { DeleteComicBooksEffects } from '@app/comic-books/effects/delete-comic-books.effects';
import { markComicsDeletedFeature } from '@app/comic-books/reducers/delete-comic-books.reducer';
import { MatDividerModule } from '@angular/material/divider';
import { imprintListFeature } from '@app/comic-books/reducers/imprint-list.reducer';
import { ImprintListEffects } from '@app/comic-books/effects/imprint-list.effects';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CoverDateFilterPipe } from './pipes/cover-date-filter.pipe';
import { VolumeMetadataTableComponent } from '@app/comic-books/components/volume-metadata-table/volume-metadata-table.component';
import { VolumeMetadataTitlePipe } from '@app/comic-books/pipes/volume-metadata-title.pipe';
import { ComicDetailListViewComponent } from './components/comic-detail-list-view/comic-detail-list-view.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FlexLayoutModule } from '@angular-ru/cdk/flex-layout';
import { ComicDetailFilterComponent } from './components/comic-detail-filter/comic-detail-filter.component';
import { ComicDetailsListEffects } from '@app/comic-books/effects/comic-details-list.effects';
import { comicDetailsListFeature } from '@app/comic-books/reducers/comic-details-list.reducer';
import { comicBookSelectionFeature } from '@app/comic-books/reducers/comic-book-selection.reducer';
import { ComicBookSelectionEffects } from '@app/comic-books/effects/comic-book-selection.effects';
import { lastReadListFeature } from '@app/comic-books/reducers/last-read-list.reducer';
import { comicBooksReadFeature } from '@app/comic-books/reducers/comic-books-read.reducer';
import { LastReadListEffects } from '@app/comic-books/effects/last-read-list.effects';
import { ComicBooksReadEffects } from '@app/comic-books/effects/comic-books-read.effects';

@NgModule({
  declarations: [
    ComicBookPageComponent,
    ComicScrapingComponent,
    ComicDetailEditComponent,
    ComicPagesComponent,
    ComicPageComponent,
    ComicScrapingVolumeSelectionComponent,
    ComicStoryComponent,
    IssueMetadataDetailComponent,
    ComicDetailCardComponent,
    ComicCoverUrlPipe,
    ComicPageUrlPipe,
    ComicTitlePipe,
    IssueMetadataTitlePipe,
    PageHashUrlPipe,
    CoverDateFilterPipe,
    VolumeMetadataTableComponent,
    VolumeMetadataTitlePipe,
    ComicDetailListViewComponent,
    ComicDetailFilterComponent
  ],
  imports: [
    CommonModule,
    ComicBooksRouting,
    StoreModule.forFeature(comicBookListFeature),
    StoreModule.forFeature(comicBookFeature),
    StoreModule.forFeature(imprintListFeature),
    StoreModule.forFeature(markComicsDeletedFeature),
    StoreModule.forFeature(comicDetailsListFeature),
    StoreModule.forFeature(comicBookSelectionFeature),
    StoreModule.forFeature(lastReadListFeature),
    StoreModule.forFeature(comicBooksReadFeature),
    EffectsModule.forFeature([
      ComicBookListEffects,
      ComicBookEffects,
      ImprintListEffects,
      DeleteComicBooksEffects,
      ComicDetailsListEffects,
      ComicBookSelectionEffects,
      LastReadListEffects,
      ComicBooksReadEffects
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
    FlexLayoutModule,
    DragDropModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  exports: [
    CommonModule,
    ComicPageComponent,
    ComicScrapingComponent,
    ComicScrapingVolumeSelectionComponent,
    ComicDetailCardComponent,
    ComicTitlePipe,
    ComicCoverUrlPipe,
    PageHashUrlPipe,
    CoverDateFilterPipe,
    VolumeMetadataTableComponent,
    ComicDetailListViewComponent,
    VolumeMetadataTitlePipe
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

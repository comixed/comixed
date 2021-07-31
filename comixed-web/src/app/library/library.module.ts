/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import { CoreModule } from '../core/core.module';
import { LibraryRouting } from '@app/library/library.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { MatTableModule } from '@angular/material/table';
import { FlexModule } from '@angular/flex-layout';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  LIBRARY_FEATURE_KEY,
  reducer as libraryReducer
} from '@app/library/reducers/library.reducer';
import { LibraryEffects } from '@app/library/effects/library.effects';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { LibraryPageComponent } from './pages/library-page/library-page.component';
import {
  DISPLAY_FEATURE_KEY,
  reducer as displayReducer
} from '@app/library/reducers/display.reducer';
import { DisplayEffects } from '@app/library/effects/display.effects';
import { ComicDisplayOptionsComponent } from './components/comic-display-options/comic-display-options.component';
import { MatSliderModule } from '@angular/material/slider';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTreeModule } from '@angular/material/tree';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ComicCoversComponent } from './components/comic-covers/comic-covers.component';
import { LibraryToolbarComponent } from './components/library-toolbar/library-toolbar.component';
import { SelectedComicsComponent } from './components/selected-comics/selected-comics.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { ComicDetailsDialogComponent } from './components/comic-details-dialog/comic-details-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { DeletedComicsPipe } from './pipes/deleted-comics.pipe';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ScrapingPageComponent } from '@app/library/pages/scraping-page/scraping-page.component';
import { ComicBookModule } from '@app/comic-book/comic-book.module';
import { UnreadComicsPipe } from './pipes/unread-comics.pipe';

@NgModule({
  declarations: [
    LibraryPageComponent,
    ComicDisplayOptionsComponent,
    LibraryToolbarComponent,
    SelectedComicsComponent,
    ComicDetailsDialogComponent,
    DeletedComicsPipe,
    ScrapingPageComponent,
    ComicCoversComponent,
    UnreadComicsPipe
  ],
  providers: [],
  imports: [
    CommonModule,
    CoreModule,
    ComicBookModule,
    LibraryRouting,
    ReactiveFormsModule,
    TranslateModule.forRoot(),
    StoreModule.forFeature(DISPLAY_FEATURE_KEY, displayReducer),
    StoreModule.forFeature(LIBRARY_FEATURE_KEY, libraryReducer),
    EffectsModule.forFeature([DisplayEffects, LibraryEffects]),
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    FlexModule,
    MatCheckboxModule,
    MatSortModule,
    MatCardModule,
    MatTooltipModule,
    FormsModule,
    MatTabsModule,
    MatToolbarModule,
    MatExpansionModule,
    MatSliderModule,
    MatListModule,
    MatPaginatorModule,
    MatTreeModule,
    MatBadgeModule,
    MatSidenavModule,
    OverlayModule,
    MatMenuModule,
    MatProgressBarModule
  ],
  exports: [CommonModule, CoreModule, ComicCoversComponent]
})
export class LibraryModule {}

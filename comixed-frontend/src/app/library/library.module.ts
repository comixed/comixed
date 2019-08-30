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
 * along with this program. If not, see <http:/www.gnu.org/licenses/>.package
 * org.comixed;
 */

import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import * as fromLibrary from './reducers/library.reducer';
import { EffectsModule } from '@ngrx/effects';
import { LibraryEffects } from './effects/library.effects';
import { LibraryService } from './services/library.service';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../../environments/environment';
import { LibraryAdaptor } from './adaptors/library.adaptor';
import { CardModule } from 'primeng/card';
import * as fromImport from './reducers/import.reducer';
import { ImportEffects } from './effects/import.effects';
import { ImportAdaptor } from 'app/library/adaptors/import.adaptor';
import { ImportService } from 'app/library/services/import.service';
import * as fromSelection from 'app/library/reducers/selection.reducer';
import { SelectionAdaptor } from 'app/library/adaptors/selection.adaptor';
import * as fromReadingList from './reducers/reading-list.reducer';
import { ReadingListEffects } from './effects/reading-list.effects';
import { ReadingListService } from 'app/library/services/reading-list.service';
import { ReadingListAdaptor } from 'app/library/adaptors/reading-list.adaptor';

@NgModule({
  imports: [
    CommonModule,
    EffectsModule.forFeature([
      LibraryEffects,
      ImportEffects,
      ReadingListEffects
    ]),
    StoreDevtoolsModule.instrument({
      name: 'NgRx Testing Store DevTools',
      logOnly: environment.production
    }),
    StoreModule.forFeature(
      fromLibrary.LIBRARY_FEATURE_KEY,
      fromLibrary.reducer
    ),
    StoreModule.forFeature(fromImport.IMPORT_FEATURE_KEY, fromImport.reducer),
    StoreModule.forFeature(
      fromSelection.SELECTION_FEATURE_KEY,
      fromSelection.reducer
    ),
    StoreModule.forFeature(
      fromReadingList.READING_LIST_FEATURE_KEY,
      fromReadingList.reducer
    )
  ],
  declarations: [],
  providers: [
    LibraryService,
    LibraryAdaptor,
    ImportService,
    ImportAdaptor,
    SelectionAdaptor,
    ReadingListService,
    ReadingListAdaptor
  ],
  exports: [CommonModule]
})
export class LibraryModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: LibraryModule
    };
  }

  constructor(@Optional() @SkipSelf() parentModule?: LibraryModule) {
    if (parentModule) {
      throw new Error(
        'LibraryModule is already loaded. Import it in the AppModule only'
      );
    }
  }
}

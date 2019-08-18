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

@NgModule({
  imports: [
    CommonModule,
    EffectsModule.forFeature([LibraryEffects]),
    StoreDevtoolsModule.instrument({
      name: 'NgRx Testing Store DevTools',
      logOnly: environment.production
    }),
    StoreModule.forFeature(
      fromLibrary.LIBRARY_FEATURE_KEY,
      fromLibrary.reducer
    ),
    CardModule
  ],
  exports: [],
  declarations: [],
  providers: [LibraryService, LibraryAdaptor]
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

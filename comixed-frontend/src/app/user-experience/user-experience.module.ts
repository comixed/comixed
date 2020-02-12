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

import { CommonModule } from '@angular/common';
import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf
} from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { ContextMenuAdaptor } from 'app/user-experience/adaptors/context-menu.adaptor';
import * as fromContextMenu from './reducers/context-menu.reducer';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature(
      fromContextMenu.CONTEXT_MENU_FEATURE_KEY,
      fromContextMenu.reducer
    )
  ],
  providers: [ContextMenuAdaptor]
})
export class UserExperienceModule {
  constructor(@Optional() @SkipSelf() parentModule?: UserExperienceModule) {
    if (parentModule) {
      throw new Error(
        'UserExperienceModule is already loaded. Import it in the AppModule only'
      );
    }
  }

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: UserExperienceModule
    };
  }
}

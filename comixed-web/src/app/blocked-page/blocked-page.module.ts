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
  BLOCKED_PAGE_FEATURE_KEY,
  reducer as blockedPageReducer
} from './reducers/blocked-page.reducer';
import { EffectsModule } from '@ngrx/effects';
import { BlockedPageEffects } from './effects/blocked-page.effects';
import { BlockedPageHashesComponent } from '@app/blocked-page/pages/blocked-page-hashes/blocked-page-hashes.component';
import { BlockedPageRouting } from '@app/blocked-page/blocked-page.routing';
import { MatCardModule } from '@angular/material/card';
import { BlockedPageUrlPipe } from './pipes/blocked-page-url.pipe';
import { CoreModule } from '@app/core/core.module';

@NgModule({
  declarations: [BlockedPageHashesComponent, BlockedPageUrlPipe],
  imports: [
    CommonModule,
    BlockedPageRouting,
    StoreModule.forFeature(BLOCKED_PAGE_FEATURE_KEY, blockedPageReducer),
    EffectsModule.forFeature([BlockedPageEffects]),
    MatCardModule,
    CoreModule
  ],
  exports: [CommonModule]
})
export class BlockedPageModule {}

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
import { AdminRouting } from './admin.routing';
import { StoreModule } from '@ngrx/store';
import {
  reducer as webAuditLogReducer,
  WEB_AUDIT_LOG_FEATURE_KEY
} from '@app/admin/reducers/web-audit-log.reducer';
import { EffectsModule } from '@ngrx/effects';
import { WebAuditLogEffects } from '@app/admin/effects/web-audit-log.effects';
import { WebAuditLogPageComponent } from './pages/web-audit-log-page/web-audit-log-page.component';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '@app/core/core.module';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { ConfigurationPageComponent } from './pages/configuration-page/configuration-page.component';
import { ComicVineConfigurationComponent } from './components/comic-vine-configuration/comic-vine-configuration.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import {
  CONFIGURATION_OPTION_LIST_FEATURE_KEY,
  reducer as configurationOptionListReducer
} from '@app/admin/reducers/configuration-option-list.reducer';
import { ConfigurationOptionListEffects } from '@app/admin/effects/configuration-option-list.effects';
import {
  reducer as saveConfigurationOptionsReducer,
  SAVE_CONFIGURATION_OPTIONS_FEATURE_KEY
} from '@app/admin/reducers/save-configuration-options.reducer';
import { SaveConfigurationOptionsEffects } from '@app/admin/effects/save-configuration-options.effects';
import { MatTabsModule } from '@angular/material/tabs';
import { LibraryConfigurationComponent } from './components/library-configuration/library-configuration.component';
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
  declarations: [
    WebAuditLogPageComponent,
    ConfigurationPageComponent,
    ComicVineConfigurationComponent,
    LibraryConfigurationComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    AdminRouting,
    TranslateModule.forRoot(),
    StoreModule.forFeature(
      CONFIGURATION_OPTION_LIST_FEATURE_KEY,
      configurationOptionListReducer
    ),
    StoreModule.forFeature(
      SAVE_CONFIGURATION_OPTIONS_FEATURE_KEY,
      saveConfigurationOptionsReducer
    ),
    StoreModule.forFeature(WEB_AUDIT_LOG_FEATURE_KEY, webAuditLogReducer),
    EffectsModule.forFeature([
      ConfigurationOptionListEffects,
      SaveConfigurationOptionsEffects,
      WebAuditLogEffects
    ]),
    MatTableModule,
    MatToolbarModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatSidenavModule,
    MatCardModule,
    ReactiveFormsModule,
    MatInputModule,
    MatTabsModule,
    MatExpansionModule
  ],
  exports: [CommonModule, CoreModule]
})
export class AdminModule {}

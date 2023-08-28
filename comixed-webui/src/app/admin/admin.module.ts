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
import { EffectsModule } from '@ngrx/effects';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { FilenameScrapingRulesConfigurationComponent } from './components/filename-scraping-rules-configuration/filename-scraping-rules-configuration.component';
import {
  FILENAME_SCRAPING_RULES_FEATURE_KEY,
  reducer as filenameScrapingRulesReducer
} from '@app/admin/reducers/filename-scraping-rule-list.reducer';
import { FilenameScrapingRuleListEffects } from '@app/admin/effects/filename-scraping-rule-list.effects';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ServerRuntimeComponent } from './components/server-runtime/server-runtime.component';
import {
  reducer as serverRuntimeReducer,
  SERVER_RUNTIME_FEATURE_KEY
} from '@app/admin/reducers/server-runtime.reducer';
import { ServerRuntimeEffects } from '@app/admin/effects/server-runtime.effects';
import { MetadataSourceListComponent } from './components/metadata-source-list/metadata-source-list.component';
import { MetadataSourceDetailComponent } from '@app/admin/components/metadata-source-detail/metadata-source-detail.component';
import { MatDividerModule } from '@angular/material/divider';
import { ComicBooksModule } from '@app/comic-books/comic-books.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  METRICS_FEATURE_KEY,
  reducer as metricsReducer
} from '@app/admin/reducers/metrics.reducer';
import { MetricsEffects } from '@app/admin/effects/metrics.effects';
import { ServerMetricsComponent } from './components/server-metrics/server-metrics.component';
import { MatSelectModule } from '@angular/material/select';
import { ServerMetricDetailsComponent } from './components/server-metric-details/server-metric-details.component';
import { MetricMeasurementPipe } from './pipes/metric-measurement.pipe';
import { MatListModule } from '@angular/material/list';
import { FlexLayoutModule } from '@angular-ru/cdk/flex-layout';
import {
  BATCH_PROCESSES_FEATURE_KEY,
  reducer as batchProcessesReducer
} from '@app/admin/reducers/batch-processes.reducer';
import { BatchProcessesEffects } from '@app/admin/effects/batch-processes.effects';
import { BatchProcessListPageComponent } from './pages/batch-process-list-page/batch-process-list-page.component';
import { MetadataSourcesViewComponent } from '@app/admin/components/metadata-sources-view/metadata-sources-view.component';

@NgModule({
  declarations: [
    ConfigurationPageComponent,
    LibraryConfigurationComponent,
    FilenameScrapingRulesConfigurationComponent,
    ServerRuntimeComponent,
    MetadataSourceListComponent,
    MetadataSourceDetailComponent,
    MetadataSourcesViewComponent,
    ServerMetricsComponent,
    ServerMetricDetailsComponent,
    MetricMeasurementPipe,
    BatchProcessListPageComponent
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
    StoreModule.forFeature(
      FILENAME_SCRAPING_RULES_FEATURE_KEY,
      filenameScrapingRulesReducer
    ),
    StoreModule.forFeature(SERVER_RUNTIME_FEATURE_KEY, serverRuntimeReducer),
    StoreModule.forFeature(METRICS_FEATURE_KEY, metricsReducer),
    StoreModule.forFeature(BATCH_PROCESSES_FEATURE_KEY, batchProcessesReducer),
    EffectsModule.forFeature([
      ConfigurationOptionListEffects,
      SaveConfigurationOptionsEffects,
      FilenameScrapingRuleListEffects,
      ServerRuntimeEffects,
      MetricsEffects,
      BatchProcessesEffects
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
    MatExpansionModule,
    MatTooltipModule,
    DragDropModule,
    FlexLayoutModule,
    MatDividerModule,
    ComicBooksModule,
    MatCheckboxModule,
    MatSelectModule,
    MatListModule
  ],
  exports: [CommonModule, CoreModule]
})
export class AdminModule {}

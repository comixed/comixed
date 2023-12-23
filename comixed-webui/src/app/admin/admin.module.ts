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
import { configurationOptionListFeature } from '@app/admin/reducers/configuration-option-list.reducer';
import { ConfigurationOptionListEffects } from '@app/admin/effects/configuration-option-list.effects';
import { saveConfigurationOptionsFeature } from '@app/admin/reducers/save-configuration-options.reducer';
import { SaveConfigurationOptionsEffects } from '@app/admin/effects/save-configuration-options.effects';
import { MatTabsModule } from '@angular/material/tabs';
import { LibraryConfigurationComponent } from './components/library-configuration/library-configuration.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FilenameScrapingRulesConfigurationComponent } from './components/filename-scraping-rules-configuration/filename-scraping-rules-configuration.component';
import { filenameScrapingRulesFeature } from '@app/admin/reducers/filename-scraping-rule-list.reducer';
import { FilenameScrapingRuleListEffects } from '@app/admin/effects/filename-scraping-rule-list.effects';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ServerRuntimeComponent } from './components/server-runtime/server-runtime.component';
import { serverRuntimeFeature } from '@app/admin/reducers/server-runtime.reducer';
import { ServerRuntimeEffects } from '@app/admin/effects/server-runtime.effects';
import { MetadataSourceListComponent } from './components/metadata-source-list/metadata-source-list.component';
import { MetadataSourceDetailComponent } from '@app/admin/components/metadata-source-detail/metadata-source-detail.component';
import { MatDividerModule } from '@angular/material/divider';
import { ComicBooksModule } from '@app/comic-books/comic-books.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { metricsFeature } from '@app/admin/reducers/metrics.reducer';
import { MetricsEffects } from '@app/admin/effects/metrics.effects';
import { ServerMetricsComponent } from './components/server-metrics/server-metrics.component';
import { MatSelectModule } from '@angular/material/select';
import { ServerMetricDetailsComponent } from './components/server-metric-details/server-metric-details.component';
import { MetricMeasurementPipe } from './pipes/metric-measurement.pipe';
import { MatListModule } from '@angular/material/list';
import { FlexLayoutModule } from '@angular-ru/cdk/flex-layout';
import { batchProcessFeature } from '@app/admin/reducers/batch-processes.reducer';
import { BatchProcessesEffects } from '@app/admin/effects/batch-processes.effects';
import { BatchProcessListPageComponent } from './pages/batch-process-list-page/batch-process-list-page.component';
import { LibraryPluginsConfigurationComponent } from '@app/admin/components/library-plugins-configuration/library-plugins-configuration.component';
import { CreatePluginDialogComponent } from '@app/admin/components/create-plugin-dialog/create-plugin-dialog.component';

@NgModule({
  declarations: [
    ConfigurationPageComponent,
    LibraryConfigurationComponent,
    FilenameScrapingRulesConfigurationComponent,
    ServerRuntimeComponent,
    MetadataSourceListComponent,
    MetadataSourceDetailComponent,
    ServerMetricsComponent,
    ServerMetricDetailsComponent,
    MetricMeasurementPipe,
    BatchProcessListPageComponent,
    LibraryPluginsConfigurationComponent,
    CreatePluginDialogComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    AdminRouting,
    TranslateModule.forRoot(),
    StoreModule.forFeature(configurationOptionListFeature),
    StoreModule.forFeature(saveConfigurationOptionsFeature),
    StoreModule.forFeature(filenameScrapingRulesFeature),
    StoreModule.forFeature(serverRuntimeFeature),
    StoreModule.forFeature(metricsFeature),
    StoreModule.forFeature(batchProcessFeature),
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

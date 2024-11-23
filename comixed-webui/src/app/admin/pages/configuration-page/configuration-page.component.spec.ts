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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ConfigurationPageComponent } from './configuration-page.component';
import {
  CONFIGURATION_OPTION_LIST_FEATURE_KEY,
  initialState as initialConfigurationOptionListState
} from '@app/admin/reducers/configuration-option-list.reducer';
import {
  CONFIGURATION_OPTION_1,
  CONFIGURATION_OPTION_2,
  CONFIGURATION_OPTION_3,
  CONFIGURATION_OPTION_4,
  CONFIGURATION_OPTION_5
} from '@app/admin/admin.fixtures';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import {
  COMICVINE_API_KEY,
  LIBRARY_COMIC_RENAMING_RULE
} from '@app/admin/admin.constants';
import { LibraryConfigurationComponent } from '@app/admin/components/library-configuration/library-configuration.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { ServerRuntimeComponent } from '@app/admin/components/server-runtime/server-runtime.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { FilenameScrapingRulesConfigurationComponent } from '@app/admin/components/filename-scraping-rules-configuration/filename-scraping-rules-configuration.component';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MetadataSourceListComponent } from '@app/admin/components/metadata-source-list/metadata-source-list.component';
import { MetadataSourceDetailComponent } from '@app/admin/components/metadata-source-detail/metadata-source-detail.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {
  initialState as initialServerRuntimeState,
  SERVER_RUNTIME_FEATURE_KEY
} from '@app/admin/reducers/server-runtime.reducer';
import {
  initialState as initialMetadataSourceListState,
  METADATA_SOURCE_LIST_FEATURE_KEY
} from '@app/comic-metadata/reducers/metadata-source-list.reducer';
import {
  initialState as initialMetadataSourceState,
  METADATA_SOURCE_FEATURE_KEY
} from '@app/comic-metadata/reducers/metadata-source.reducer';
import {
  FILENAME_SCRAPING_RULES_FEATURE_KEY,
  initialState as initialFilenameScrapingRulesState
} from '@app/admin/reducers/filename-scraping-rules.reducer';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ServerMetricsComponent } from '@app/admin/components/server-metrics/server-metrics.component';
import { MatSelectModule } from '@angular/material/select';
import { ServerMetricDetailsComponent } from '@app/admin/components/server-metric-details/server-metric-details.component';
import {
  initialState as initialMetricState,
  METRICS_FEATURE_KEY
} from '@app/admin/reducers/metrics.reducer';
import { LibraryPluginsConfigurationComponent } from '@app/admin/components/library-plugins-configuration/library-plugins-configuration.component';
import { MatSortModule } from '@angular/material/sort';
import {
  initialState as initialLibraryPluginState,
  LIBRARY_PLUGIN_FEATURE_KEY
} from '@app/library-plugins/reducers/library-plugin.reducer';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('ConfigurationPageComponent', () => {
  const OPTIONS = [
    { ...CONFIGURATION_OPTION_1, name: COMICVINE_API_KEY },
    { ...CONFIGURATION_OPTION_2, name: LIBRARY_COMIC_RENAMING_RULE },
    CONFIGURATION_OPTION_3,
    CONFIGURATION_OPTION_4,
    CONFIGURATION_OPTION_5
  ];
  const initialState = {
    [SERVER_RUNTIME_FEATURE_KEY]: initialServerRuntimeState,
    [CONFIGURATION_OPTION_LIST_FEATURE_KEY]: {
      ...initialConfigurationOptionListState,
      options: OPTIONS
    },
    [METADATA_SOURCE_LIST_FEATURE_KEY]: initialMetadataSourceListState,
    [METADATA_SOURCE_FEATURE_KEY]: initialMetadataSourceState,
    [FILENAME_SCRAPING_RULES_FEATURE_KEY]: initialFilenameScrapingRulesState,
    [METRICS_FEATURE_KEY]: initialMetricState,
    [LIBRARY_PLUGIN_FEATURE_KEY]: initialLibraryPluginState
  };

  let component: ConfigurationPageComponent;
  let fixture: ComponentFixture<ConfigurationPageComponent>;
  let store: MockStore<any>;
  let translateService: TranslateService;
  let titleService: TitleService;
  let setTitleSpy: jasmine.Spy;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [
          ConfigurationPageComponent,
          ServerMetricsComponent,
          ServerMetricDetailsComponent,
          LibraryConfigurationComponent,
          ServerRuntimeComponent,
          FilenameScrapingRulesConfigurationComponent,
          MetadataSourceListComponent,
          MetadataSourceDetailComponent,
          LibraryPluginsConfigurationComponent
        ],
        imports: [
          NoopAnimationsModule,
          RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
          FormsModule,
          ReactiveFormsModule,
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          MatFormFieldModule,
          MatInputModule,
          MatIconModule,
          MatButtonModule,
          MatToolbarModule,
          MatDialogModule,
          MatTabsModule,
          MatCardModule,
          MatExpansionModule,
          MatTableModule,
          MatTooltipModule,
          MatCheckboxModule,
          DragDropModule,
          MatSelectModule,
          MatSortModule,
          MatSnackBarModule
        ],
        providers: [provideMockStore({ initialState }), TitleService]
      }).compileComponents();

      fixture = TestBed.createComponent(ConfigurationPageComponent);
      component = fixture.componentInstance;
      store = TestBed.inject(MockStore);
      spyOn(store, 'dispatch');
      translateService = TestBed.inject(TranslateService);
      titleService = TestBed.inject(TitleService);
      setTitleSpy = spyOn(titleService, 'setTitle');
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sets the title', () => {
    expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      setTitleSpy.calls.reset();
      translateService.use('fr');
    });

    it('updates the title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});

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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PluginsPageComponent } from './plugins-page.component';
import { TableModule } from 'primeng/table';
import { StoreModule } from '@ngrx/store';
import {
  PLUGIN_FEATURE_KEY,
  reducer
} from 'app/library/reducers/plugin.reducer';
import { EffectsModule } from '@ngrx/effects';
import { PluginEffects } from 'app/library/effects/plugin.effects';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LoggerModule } from '@angular-ru/logger';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { PluginAdaptor } from 'app/library/adaptors/plugin.adaptor';
import { ButtonModule, ToolbarModule, TooltipModule } from 'primeng/primeng';

describe('PluginsPageComponent', () => {
  let component: PluginsPageComponent;
  let fixture: ComponentFixture<PluginsPageComponent>;
  let translateService: TranslateService;
  let breadcrumbAdaptor: BreadcrumbAdaptor;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        LoggerModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(PLUGIN_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([PluginEffects]),
        TableModule,
        TooltipModule,
        ButtonModule,
        ToolbarModule
      ],
      declarations: [PluginsPageComponent],
      providers: [MessageService, BreadcrumbAdaptor, PluginAdaptor]
    }).compileComponents();

    fixture = TestBed.createComponent(PluginsPageComponent);
    component = fixture.componentInstance;
    translateService = TestBed.get(TranslateService);
    breadcrumbAdaptor = TestBed.get(BreadcrumbAdaptor);

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      spyOn(breadcrumbAdaptor, 'loadEntries');
      translateService.use('fr');
    });

    it('reloads the breadcrumb trails', () => {
      expect(breadcrumbAdaptor.loadEntries).toHaveBeenCalled();
    });
  });
});

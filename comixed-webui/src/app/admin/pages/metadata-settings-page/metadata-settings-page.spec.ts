/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetadataSettingsPage } from './metadata-settings-page';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { provideMockStore } from '@ngrx/store/testing';
import { provideRouter } from '@angular/router';
import {
  initialMetadataSourceListState,
  METADATA_SOURCE_LIST_FEATURE_KEY,
  metadataSourceListAdapter
} from '@app/metadata/reducers/metadata-source-list.reducer';
import { beforeEach, Mock } from 'vitest';
import {
  METADATA_SOURCE_1,
  METADATA_SOURCE_2
} from '@app/metadata/metadata-fixtures';

describe('MetadataSettingsPage', () => {
  const TEST_METADATA_SOURCE_LIST = [METADATA_SOURCE_1, METADATA_SOURCE_2];
  const initialState = {
    [METADATA_SOURCE_LIST_FEATURE_KEY]: metadataSourceListAdapter.setAll(
      TEST_METADATA_SOURCE_LIST,
      initialMetadataSourceListState
    )
  };

  let component: MetadataSettingsPage;
  let fixture: ComponentFixture<MetadataSettingsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetadataSettingsPage],
      providers: [
        provideRouter([{ path: '*', redirectTo: '' }]),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockStore({ initialState })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MetadataSettingsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the language changes', () => {
    let setTitleSpy: Mock;

    beforeEach(() => {
      setTitleSpy = vi.spyOn(component.titleService, 'setTitle');
      component.translateService.use('fr');
    });

    it('should update the tab title', () => {
      expect(setTitleSpy).toHaveBeenCalled();
    });
  });
});

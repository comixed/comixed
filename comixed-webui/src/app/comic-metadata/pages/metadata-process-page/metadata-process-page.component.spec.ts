/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

import { MetadataProcessPageComponent } from './metadata-process-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  initialState as initialLibrarySelectionsState,
  LIBRARY_SELECTIONS_FEATURE_KEY
} from '@app/library/reducers/library-selections.reducer';
import { TitleService } from '@app/core/services/title.service';

describe('MetadataProcessPageComponent', () => {
  const IDS = [4, 17, 6];
  const initialState = {
    [LIBRARY_SELECTIONS_FEATURE_KEY]: initialLibrarySelectionsState
  };

  let component: MetadataProcessPageComponent;
  let fixture: ComponentFixture<MetadataProcessPageComponent>;
  let store: MockStore<any>;
  let titleService: TitleService;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MetadataProcessPageComponent],
      imports: [LoggerModule.forRoot(), TranslateModule.forRoot()],
      providers: [provideMockStore({ initialState }), TitleService]
    }).compileComponents();

    fixture = TestBed.createComponent(MetadataProcessPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    titleService = TestBed.inject(TitleService);
    spyOn(titleService, 'setTitle');
    translateService = TestBed.inject(TranslateService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('selection changes', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [LIBRARY_SELECTIONS_FEATURE_KEY]: { ...initialState, ids: IDS }
      });
    });

    it('updates the list of selected ids', () => {
      expect(component.selectedIds).toEqual(IDS);
    });
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('updates the page title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});

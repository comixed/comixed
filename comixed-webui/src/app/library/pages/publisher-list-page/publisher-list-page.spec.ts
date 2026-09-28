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
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { CollectionService } from '@app/library/services/collection-service';
import { beforeEach, Mock } from 'vitest';
import { provideRouter } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import {
  initialPublisherListState,
  PUBLISHER_LIST_FEATURE_KEY
} from '@app/library/reducers/publisher-list.reducer';
import { PublisherListPage } from '@app/library/pages/publisher-list-page/publisher-list-page';

describe('PublisherListPage', () => {
  const initialState = {
    [PUBLISHER_LIST_FEATURE_KEY]: initialPublisherListState
  };

  let component: PublisherListPage;
  let fixture: ComponentFixture<PublisherListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublisherListPage],
      providers: [
        provideRouter([{ path: '*', redirectTo: '' }]),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockStore({ initialState }),
        CollectionService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PublisherListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('changing the language', () => {
    let setTitleSpy: Mock;

    beforeEach(() => {
      setTitleSpy = vi.spyOn(component.titleService, 'setTitle');
      component.translateService.use('fr');
    });

    it('should update the page title', () => {
      expect(setTitleSpy).toHaveBeenCalled();
    });
  });
});

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
import { PublisherListPage } from './publisher-list-page';
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

describe('PublisherListPage', () => {
  const initialState = {
    [PUBLISHER_LIST_FEATURE_KEY]: initialPublisherListState
  };
  const TEST_TITLE_TRANSLATED = 'The translated title';

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

  describe('when the language changes', () => {
    let setTitleSpy: Mock;
    let instantSpy: Mock;

    beforeEach(() => {
      setTitleSpy = vi.spyOn(component.titleService, 'setTitle');
      instantSpy = vi
        .spyOn(component.translateService, 'instant')
        .mockReturnValue(TEST_TITLE_TRANSLATED);
      component.translateService.use('fr');
    });

    it('translates the title', () => {
      expect(instantSpy).toHaveBeenCalled();
    });

    it('updates the title', () => {
      expect(setTitleSpy).toHaveBeenCalledWith(TEST_TITLE_TRANSLATED);
    });
  });
});

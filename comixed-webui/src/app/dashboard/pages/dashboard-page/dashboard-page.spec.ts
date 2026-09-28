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
import { DashboardPage } from '@app/dashboard/pages/dashboard-page/dashboard-page';
import { provideTranslateService } from '@ngx-translate/core';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideRouter } from '@angular/router';
import { beforeEach, Mock } from 'vitest';
import { provideMockStore } from '@ngrx/store/testing';
import {
  initialRemoteLibraryState,
  REMOTE_LIBRARY_FEATURE_KEY
} from '@app/library/reducers/remote-library.reducer';
import { RemoteLibrarySegment } from '@app/library/models/net/remote-library-segment';

describe('DashboardPage', () => {
  const initialState = {
    [REMOTE_LIBRARY_FEATURE_KEY]: initialRemoteLibraryState
  };
  const TEST_STATISTICS: RemoteLibrarySegment[] = [
    { name: 'First Segment', count: 29 },
    { name: 'Second Segment', count: 20 },
    { name: 'Third Segment', count: 17 },
    { name: 'Fourth Segment', count: 17 },
    {
      name: 'Fifth Segment',
      count: 20
    }
  ];
  const TEST_TITLE = 'The Segment Title';
  const TEST_MAX_RECORDS = 0;

  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        provideRouter([{ path: '*', redirectTo: '' }]),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService({ fallbackLang: 'en' }),
        provideMockStore({ initialState })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
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

    it('updates the title', () => {
      expect(setTitleSpy).toHaveBeenCalled();
    });
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

  describe('zooming on a library segment card', () => {
    beforeEach(() => {
      component.zoomedTitle.set('');
      component.zoomedStatistics.set([]);
      component.zoomedRecords.set(0);
      component.onZoom(TEST_STATISTICS, TEST_TITLE, TEST_MAX_RECORDS);
    });

    it('should set the data', () => {
      expect(component.zoomedStatistics()).toStrictEqual(TEST_STATISTICS);
    });

    it('should set the title', () => {
      expect(component.zoomedTitle()).toStrictEqual(TEST_TITLE);
    });

    it('should set the max records', () => {
      expect(component.zoomedRecords()).toStrictEqual(TEST_MAX_RECORDS);
    });
  });

  describe('when the user unzooms on a library segment', () => {
    beforeEach(() => {
      component.zoomedStatistics.set(TEST_STATISTICS);
      component.onUnzoom();
    });

    it('srehould set the data', () => {
      expect(component.zoomedStatistics()).toStrictEqual([]);
    });
  });
});

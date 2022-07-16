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
import { CollectionsChartComponent } from './collections-chart.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { CollectionType } from '@app/collections/models/comic-collection.enum';
import { initialState as initialLibraryState } from '@app/library/reducers/library.reducer';

describe('CollectionsChartComponent', () => {
  const LIBRARY_STATE = {
    ...initialLibraryState,
    publishers: [
      { name: 'Publisher 1', count: 17 },
      { name: 'Publisher 2', count: 3 }
    ]
  };

  let component: CollectionsChartComponent;
  let fixture: ComponentFixture<CollectionsChartComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CollectionsChartComponent],
      imports: [
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        NgxChartsModule,
        MatFormFieldModule,
        MatSelectModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionsChartComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the library state is loaded', () => {
    beforeEach(() => {
      component.collectionData = [];
      component.libraryState = LIBRARY_STATE;
    });

    it('loads the set of charts', () => {
      expect(component.collectionData).not.toEqual([]);
    });

    describe('changing the current chart', () => {
      beforeEach(() => {
        component.currentCollection = 0;
        component.onSwitchCollection(1);
      });

      it('changes the current chart', () => {
        expect(component.currentCollection).toEqual(1);
      });
    });
  });

  describe('when the page is resized', () => {
    const WIDTH = 200;
    const HEIGHT = 200;

    beforeEach(() => {
      component.chartWidth$.next(0);
      component.chartHeight$.next(0);
      component.onWindowResized({
        nativeElement: { innerWidth: WIDTH, innerHeight: HEIGHT }
      });
    });

    it('sets the chart width', () => {
      expect(component.chartWidth$.value).not.toEqual(0);
    });

    it('sets the chart height', () => {
      expect(component.chartHeight$.value).not.toEqual(0);
    });
  });

  describe('when a collection is selected', () => {
    const COLLECTION_TYPE = CollectionType.PUBLISHERS;
    const COLLECTION_NAME = 'the collection';

    beforeEach(() => {
      component.onCollectionSelected(
        COLLECTION_TYPE.toString(),
        COLLECTION_NAME
      );
    });

    it('redirects the browser', () => {
      expect(router.navigate).toHaveBeenCalledWith([
        'library',
        'collections',
        COLLECTION_TYPE,
        COLLECTION_NAME
      ]);
    });
  });

  describe('when an unknown collection is selected', () => {
    const COLLECTION_TYPE = CollectionType.PUBLISHERS;
    const COLLECTION_NAME = null;

    beforeEach(() => {
      component.onCollectionSelected(
        COLLECTION_TYPE.toString(),
        COLLECTION_NAME
      );
    });

    it('redirects the browser', () => {
      expect(router.navigate).toHaveBeenCalledWith([
        'library',
        'collections',
        COLLECTION_TYPE,
        '[UNKNOWN]'
      ]);
    });
  });
});

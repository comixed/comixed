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
import { MetadataSourceListComponent } from './metadata-source-list.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  initialState as initialMetadataSourceListState,
  METADATA_SOURCE_LIST_FEATURE_KEY
} from '@app/comic-metadata/reducers/metadata-source-list.reducer';
import { METADATA_SOURCE_1 } from '@app/comic-metadata/comic-metadata.fixtures';
import { loadMetadataSource } from '@app/comic-metadata/actions/metadata-source.actions';
import { TranslateModule } from '@ngx-translate/core';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { preferMetadataSource } from '@app/comic-metadata/actions/metadata-source-list.actions';

describe('MetadataSourceListComponent', () => {
  const SOURCE = METADATA_SOURCE_1;
  const initialState = {
    [METADATA_SOURCE_LIST_FEATURE_KEY]: initialMetadataSourceListState
  };

  let component: MetadataSourceListComponent;
  let fixture: ComponentFixture<MetadataSourceListComponent>;
  let store: MockStore<any>;
  let confirmationService: ConfirmationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MetadataSourceListComponent],
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule
      ],
      providers: [provideMockStore({ initialState }), ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(MetadataSourceListComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    confirmationService = TestBed.inject(ConfirmationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when a source is selected', () => {
    beforeEach(() => {
      component.onSelectSource(SOURCE);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        loadMetadataSource({ id: SOURCE.id })
      );
    });
  });

  describe('sorting metadata sources', () => {
    it('can sort for preferred', () => {
      expect(
        component.dataSource.sortingDataAccessor(
          { ...SOURCE, preferred: true },
          'preferred'
        )
      ).toEqual(1);
    });

    it('can sort for not preferred', () => {
      expect(
        component.dataSource.sortingDataAccessor(
          { ...SOURCE, preferred: false },
          'preferred'
        )
      ).toEqual(0);
    });

    it('can sort by name', () => {
      expect(component.dataSource.sortingDataAccessor(SOURCE, 'name')).toEqual(
        SOURCE.name
      );
    });

    it('can sort by bean name', () => {
      expect(
        component.dataSource.sortingDataAccessor(SOURCE, 'bean-name')
      ).toEqual(SOURCE.beanName);
    });
  });

  describe('marking a metadata source as preferred', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onMarkPreferred(SOURCE.id);
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        preferMetadataSource({ id: SOURCE.id })
      );
    });
  });
});

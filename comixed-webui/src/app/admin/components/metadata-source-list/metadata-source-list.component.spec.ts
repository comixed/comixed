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

describe('MetadataSourceListComponent', () => {
  const SOURCE = METADATA_SOURCE_1;
  const initialState = {
    [METADATA_SOURCE_LIST_FEATURE_KEY]: initialMetadataSourceListState
  };

  let component: MetadataSourceListComponent;
  let fixture: ComponentFixture<MetadataSourceListComponent>;
  let store: MockStore<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MetadataSourceListComponent],
      imports: [LoggerModule.forRoot()],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(MetadataSourceListComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
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
});

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
import { MetadataSourcesViewComponent } from './metadata-sources-view.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import {
  initialState as initialMetadataSourceState,
  METADATA_SOURCE_FEATURE_KEY
} from '@app/comic-metadata/reducers/metadata-source.reducer';
import {
  clearMetadataSource,
  deleteMetadataSource,
  metadataSourceLoaded,
  saveMetadataSource
} from '@app/comic-metadata/actions/metadata-source.actions';
import { MetadataSourceDetailComponent } from '@app/admin/components/metadata-source-detail/metadata-source-detail.component';
import { MetadataSourceListComponent } from '@app/admin/components/metadata-source-list/metadata-source-list.component';
import { METADATA_SOURCE_1 } from '@app/comic-metadata/comic-metadata.fixtures';
import {
  initialState as initialMetadataSourceListState,
  METADATA_SOURCE_LIST_FEATURE_KEY
} from '@app/comic-metadata/reducers/metadata-source-list.reducer';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';
import createSpy = jasmine.createSpy;
import createSpyObj = jasmine.createSpyObj;
import { METADATA_SOURCE_TEMPLATE } from '@app/comic-metadata/comic-metadata.constants';

describe('MetadataSourcesViewComponent', () => {
  const SOURCE = METADATA_SOURCE_1;
  const initialState = {
    [METADATA_SOURCE_LIST_FEATURE_KEY]: initialMetadataSourceListState,
    [METADATA_SOURCE_FEATURE_KEY]: initialMetadataSourceState
  };
  let component: MetadataSourcesViewComponent;
  let fixture: ComponentFixture<MetadataSourcesViewComponent>;
  let store: MockStore<any>;
  let sourceDetail: MetadataSourceDetailComponent;
  let confirmationService: ConfirmationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MetadataSourcesViewComponent,
        MetadataSourceListComponent,
        MetadataSourceDetailComponent
      ],
      imports: [
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatDialogModule,
        MatToolbarModule,
        MatIconModule,
        MatTooltipModule,
        MatTableModule,
        MatInputModule,
        MatButtonModule
      ],
      providers: [provideMockStore({ initialState }), ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(MetadataSourcesViewComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    confirmationService = TestBed.inject(ConfirmationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('returning to the source list', () => {
    beforeEach(() => {
      component.onReturnToList();
    });

    it('dispatches an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(clearMetadataSource());
    });
  });

  describe('when the reset form button is pressed', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [METADATA_SOURCE_FEATURE_KEY]: {
          ...initialMetadataSourceState,
          source: SOURCE
        }
      });
      component.onResetSource();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        metadataSourceLoaded({ source: { ...SOURCE } })
      );
    });
  });

  describe('adding a new property', () => {
    beforeEach(() => {
      component.sourceDetail =
        jasmine.createSpyObj<MetadataSourceDetailComponent>(
          'MetadataSourceDetailComponent',
          ['addSourceProperty']
        );
      component.onAddProperty();
    });

    it('adds a new property to the detail view', () => {
      expect(component.sourceDetail.addSourceProperty).toHaveBeenCalledWith(
        '',
        ''
      );
    });
  });

  describe('saving a metadata source', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.sourceDetail =
        jasmine.createSpyObj<MetadataSourceDetailComponent>(
          'MetadataSourceDetailComponent',
          ['encodeForm']
        );
      (
        component.sourceDetail as jasmine.SpyObj<MetadataSourceDetailComponent>
      ).encodeForm.and.returnValue(SOURCE);
      component.onSaveSource();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        saveMetadataSource({ source: SOURCE })
      );
    });
  });

  describe('deleting a metadata source', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.currentSource = SOURCE;
      component.onDeleteSource();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        deleteMetadataSource({ source: SOURCE })
      );
    });
  });

  describe('creating a metadata source', () => {
    beforeEach(() => {
      component.onCreateSource();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        metadataSourceLoaded({ source: METADATA_SOURCE_TEMPLATE })
      );
    });
  });
});

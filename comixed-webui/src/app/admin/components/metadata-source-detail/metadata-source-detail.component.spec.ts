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
import { MetadataSourceDetailComponent } from './metadata-source-detail.component';
import {
  initialState as initialMetadataSourceState,
  METADATA_SOURCE_FEATURE_KEY
} from '@app/comic-metadata/reducers/metadata-source.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { METADATA_SOURCE_1 } from '@app/comic-metadata/comic-metadata.fixtures';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

describe('MetadataSourceDetailComponent', () => {
  const SOURCE = METADATA_SOURCE_1;
  const PROPERTY_NAME = 'new-property.name';
  const PROPERTY_VALUE = 'new-property.value';
  const initialState = {
    [METADATA_SOURCE_FEATURE_KEY]: initialMetadataSourceState
  };

  let component: MetadataSourceDetailComponent;
  let fixture: ComponentFixture<MetadataSourceDetailComponent>;
  let store: MockStore<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MetadataSourceDetailComponent],
      imports: [
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatTooltipModule
      ],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(MetadataSourceDetailComponent);
    component = fixture.componentInstance;
    let store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('setting the source', () => {
    beforeEach(() => {
      component.source = SOURCE;
    });

    it('returns the correct value', () => {
      expect(component.source).toEqual(SOURCE);
    });

    it('encodes the correct value', () => {
      expect(component.encodeForm()).toEqual(SOURCE);
    });

    describe('resetting the source', () => {
      beforeEach(() => {
        component.sourceForm.controls.name.setValue(SOURCE.name.substr(1));
        component.sourceForm.controls.beanName.setValue(
          SOURCE.beanName.substr(1)
        );
        component.source = SOURCE;
      });

      it('updates the name input field', () => {
        expect(component.sourceForm.controls.name.value).toEqual(SOURCE.name);
      });

      it('updates the bean name input field', () => {
        expect(component.sourceForm.controls.beanName.value).toEqual(
          SOURCE.beanName
        );
      });
    });
  });

  describe('adding a property', () => {
    let propertyCount: number;

    beforeEach(() => {
      component.source = SOURCE;
      propertyCount = component.properties.length;
      component.addSourceProperty(PROPERTY_NAME, PROPERTY_VALUE);
    });

    it('adds a new input field', () => {
      expect(component.properties.length).toEqual(propertyCount + 1);
    });
  });

  describe('deleting a property', () => {
    let propertyCount: number;

    beforeEach(() => {
      component.source = SOURCE;
      propertyCount = component.properties.length;
      component.onDeleteProperty(SOURCE.properties[0].name);
    });

    it('removes the property input field', () => {
      expect(component.properties.length).toEqual(propertyCount - 1);
    });
  });
});

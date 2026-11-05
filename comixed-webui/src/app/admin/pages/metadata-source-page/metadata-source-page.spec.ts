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
import { MetadataSourcePage } from './metadata-source-page';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { Confirmation, ConfirmationService } from '@openng/optimus-ui/api';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  initialMetadataSourceListState,
  METADATA_SOURCE_LIST_FEATURE_KEY,
  metadataSourceListAdapter
} from '@app/settings/reducers/metadata-source-list.reducer';
import {
  METADATA_SOURCE_1,
  METADATA_SOURCE_2
} from '@app/settings/settings-fixtures';
import { beforeEach, Mock } from 'vitest';
import { provideMockActions } from '@ngrx/effects/testing';
import { Subject } from 'rxjs';
import { MetadataSourceListActions } from '@app/settings/actions/metadata-source-list.actions';
import { MetadataSource } from '@app/settings/models/metadata-source';

describe('MetadataSourcePage', () => {
  const TEST_SOURCE = METADATA_SOURCE_1;
  const TEST_METADATA_SOURCE_LIST = [TEST_SOURCE, METADATA_SOURCE_2];
  const initialState = {
    [METADATA_SOURCE_LIST_FEATURE_KEY]: metadataSourceListAdapter.setAll(
      TEST_METADATA_SOURCE_LIST,
      initialMetadataSourceListState
    )
  };

  const actions$ = new Subject<unknown>();
  let component: MetadataSourcePage;
  let fixture: ComponentFixture<MetadataSourcePage>;
  let store: MockStore;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetadataSourcePage],
      providers: [
        provideRouter([
          {
            path: '*',
            redirectTo: ''
          }
        ]),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockStore({ initialState }),
        provideMockActions(() => actions$),
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MetadataSourcePage);
    component = fixture.componentInstance;
    component.source = TEST_SOURCE;
    store = TestBed.inject(MockStore);
    router = TestBed.inject(Router);
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

  describe('resetting the form', () => {
    beforeEach(() => {
      component.sourceForm.controls['preferred'].setValue(
        !TEST_SOURCE.preferred
      );
      component.sourceForm.markAsTouched();
      fixture.detectChanges();
      expect(component.sourceForm.controls['preferred'].value).not.toBe(
        TEST_SOURCE.preferred
      );
      const button: HTMLButtonElement = fixture.nativeElement.querySelector(
        '#reset-metadata-source-button button'
      );
      button.click();
      fixture.detectChanges();
    });

    it('should restore the preferred setting', () => {
      expect(component.sourceForm.controls['preferred'].value).toBe(
        TEST_SOURCE.preferred
      );
    });
  });

  describe('saving the form', () => {
    let confirmSpy: Mock;
    let dispatchSpy: Mock;
    let encodedForm: MetadataSource;

    beforeEach(() => {
      confirmSpy = vi
        .spyOn(component.confirmationService, 'confirm')
        .mockImplementation((confirm: Confirmation) => {
          confirm.accept?.();
          return component.confirmationService;
        });
      dispatchSpy = vi.spyOn(store, 'dispatch');
      const button: HTMLButtonElement = fixture.nativeElement.querySelector(
        '#save-metadata-source-button button'
      );
      button.click();
      fixture.detectChanges();
      encodedForm = component.doEncodeForm();
    });

    it('should encode the source', () => {
      expect(encodedForm.name).toStrictEqual(TEST_SOURCE.name);
      expect(encodedForm.preferred).toBe(TEST_SOURCE.preferred);
    });

    it('should confirm with the user', () => {
      expect(confirmSpy).toHaveBeenCalled();
    });

    it('should dispatch an action', () => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        MetadataSourceListActions.save({ source: encodedForm })
      );
    });
  });

  it('should redirect the browser on successful save', () => {
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');
    actions$.next(
      MetadataSourceListActions.saveSuccess({ entry: TEST_SOURCE })
    );
    fixture.detectChanges();
    expect(navigateSpy).toHaveBeenCalledWith('/admin/settings/metadata');
  });
});

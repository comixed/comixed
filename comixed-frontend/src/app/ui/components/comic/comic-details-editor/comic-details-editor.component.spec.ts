/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { Store, StoreModule } from '@ngrx/store';
import { AppState } from '../../../../app.state';
import { userReducer } from '../../../../reducers/user.reducer';
import * as UserActions from '../../../../actions/user.actions';
import { ADMIN_USER, READER_USER } from '../../../../models/user/user.fixtures';
import { singleComicScrapingReducer } from '../../../../reducers/single-comic-scraping.reducer';
import * as ScrapingActions from '../../../../actions/single-comic-scraping.actions';
import { SINGLE_COMIC_SCRAPING_STATE } from '../../../../models/scraping/single-comic-scraping.fixtures';
import {
  COMIC_1000,
  COMIC_1001
} from '../../../../models/comics/comic.fixtures';
import { VOLUME_1000 } from '../../../../models/comics/volume.fixtures';
import { ISSUE_1000 } from '../../../../models/scraping/issue.fixtures';
import { COMICVINE_API_KEY } from '../../../../models/user/preferences.constants';
import { ButtonModule } from 'primeng/button';
import { SplitButtonModule } from 'primeng/splitbutton';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { InplaceModule } from 'primeng/inplace';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { UserService } from '../../../../services/user.service';
import { UserServiceMock } from '../../../../services/user.service.mock';
import { ComicService } from '../../../../services/comic.service';
import { ComicServiceMock } from '../../../../services/comic.service.mock';
import { VolumeListComponent } from '../../scraping/volume-list/volume-list.component';
import { ComicDetailsEditorComponent } from './comic-details-editor.component';

describe('ComicDetailsEditorComponent', () => {
  const API_KEY = '1234567890';
  let component: ComicDetailsEditorComponent;
  let fixture: ComponentFixture<ComicDetailsEditorComponent>;
  let api_key_input: DebugElement;
  let series_input: DebugElement;
  let volume_input: DebugElement;
  let issue_number_input: DebugElement;
  let save_button: DebugElement;
  let fetch_button: DebugElement;
  let reset_button: DebugElement;
  let user_service: UserService;
  let comic_service: ComicService;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({
          user: userReducer,
          single_comic_scraping: singleComicScrapingReducer
        }),
        ButtonModule,
        SplitButtonModule,
        BlockUIModule,
        ProgressBarModule,
        TooltipModule,
        InplaceModule,
        TableModule,
        CardModule
      ],
      declarations: [ComicDetailsEditorComponent, VolumeListComponent],
      providers: [
        FormBuilder,
        { provide: UserService, useClass: UserServiceMock },
        { provide: ComicService, useClass: ComicServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicDetailsEditorComponent);
    component = fixture.componentInstance;

    user_service = TestBed.get(UserService);
    comic_service = TestBed.get(ComicService);
    store = TestBed.get(Store);

    spyOn(store, 'dispatch').and.callThrough();

    fixture.detectChanges();

    api_key_input = fixture.debugElement.query(By.css('#api_key_input'));
    series_input = fixture.debugElement.query(By.css('#series_input'));
    volume_input = fixture.debugElement.query(By.css('#volume_input'));
    issue_number_input = fixture.debugElement.query(
      By.css('#issue_number_input')
    );
    save_button = fetch_button = fixture.debugElement.query(
      By.css('#save_data_button')
    );
    fetch_button = fixture.debugElement.query(By.css('#fetch_volumes_button'));
    reset_button = fixture.debugElement.query(By.css('#reset_comic_button'));
  }));

  describe('form state', () => {
    beforeEach(() => {
      store.dispatch(
        new ScrapingActions.SingleComicScrapingSetup({
          api_key: API_KEY,
          comic: COMIC_1000,
          series: COMIC_1000.series,
          volume: COMIC_1000.volume,
          issue_number: COMIC_1000.issue_number
        })
      );
      expect(fetch_button).not.toBe(null);
    });

    it('enables the fetch button when all fields are filled', () => {
      expect(fetch_button.nativeElement.disabled).toBeFalsy();
    });

    it('enables the save button when all fields are filled', () => {
      expect(component.form.valid).toBeTruthy();
    });

    it('disables the fetch button if the api key field is empty', () => {
      component.form.controls['api_key'].setValue('');

      expect(fetch_button.nativeElement.disabled).toBeFalsy();
    });

    it('disables the fetch button if the series field is empty', () => {
      component.form.controls['series'].setValue('');

      expect(fetch_button.nativeElement.disabled).toBeFalsy();
    });

    it('disables the fetch button if the volume field is empty', () => {
      component.form.controls['volume'].setValue('');

      expect(fetch_button.nativeElement.disabled).toBeFalsy();
    });

    it('disables the fetch button if the issue number field is empty', () => {
      component.form.controls['issue_number'].setValue('');

      expect(fetch_button.nativeElement.disabled).toBeFalsy();
    });

    it('disables the reset button', () => {
      expect(component.form.dirty).toBeFalsy();
      expect(reset_button.nativeElement.disabled).toBeTruthy();
    });

    xit('enables the reset button on changes');
  });

  describe('#ngOnInit()', () => {
    it('should subscribe to changes in the current user', () => {
      store.dispatch(new UserActions.UserLoaded({ user: ADMIN_USER }));

      expect(component.user.email).toEqual(ADMIN_USER.email);
    });

    it('should subscribe to changes in the scraping data', () => {
      store.dispatch(
        new ScrapingActions.SingleComicScrapingSetup({
          api_key: API_KEY,
          comic: COMIC_1000,
          series: COMIC_1000.series,
          volume: COMIC_1000.volume,
          issue_number: COMIC_1000.issue_number
        })
      );

      expect(component.form.controls['api_key'].value).toEqual(API_KEY);
      expect(component.form.controls['series'].value).toEqual(
        COMIC_1000.series
      );
      expect(component.form.controls['volume'].value).toEqual(
        COMIC_1000.volume
      );
      expect(component.form.controls['issue_number'].value).toEqual(
        COMIC_1000.issue_number
      );
    });
  });

  describe('#comic', () => {
    beforeEach(() => {
      component.comic = COMIC_1001;
    });

    it('sets a new value for the series', () => {
      expect(component.form.controls['series'].value).toEqual(
        COMIC_1001.series
      );
    });

    it('sets a new value for the volume', () => {
      expect(component.form.controls['volume'].value).toEqual(
        COMIC_1001.volume
      );
    });

    it('sets a new value for the issue number', () => {
      expect(component.form.controls['issue_number'].value).toEqual(
        COMIC_1001.issue_number
      );
    });
  });

  describe('#fetch_candidates()', () => {
    beforeEach(() => {
      component.form.controls['api_key'].setValue(API_KEY);
      component.comic = COMIC_1001;
    });

    it('sets the skip_cache to false when supplied', () => {
      component.fetch_candidates(false);

      expect(component.skip_cache).toBeFalsy();
      expect(store.dispatch).toHaveBeenCalledWith(
        new ScrapingActions.SingleComicScrapingFetchVolumes({
          api_key: API_KEY,
          series: COMIC_1001.series,
          volume: COMIC_1001.volume,
          issue_number: COMIC_1001.issue_number,
          skip_cache: false
        })
      );
    });

    it('sets the skip_cache to true when supplied', () => {
      component.fetch_candidates(true);

      expect(component.skip_cache).toBeTruthy();
      expect(store.dispatch).toHaveBeenCalledWith(
        new ScrapingActions.SingleComicScrapingFetchVolumes({
          api_key: API_KEY,
          series: COMIC_1001.series,
          volume: COMIC_1001.volume,
          issue_number: COMIC_1001.issue_number,
          skip_cache: true
        })
      );
    });
  });

  describe('#select_volume()', () => {
    beforeEach(() => {
      component.form.controls['api_key'].setValue(API_KEY);
      component.comic = COMIC_1001;
    });

    it('handles when a volume is selected', () => {
      component.select_volume(VOLUME_1000);
      expect(store.dispatch).toHaveBeenCalledWith(
        new ScrapingActions.SingleComicScrapingSetCurrentVolume({
          api_key: API_KEY,
          volume: VOLUME_1000,
          issue_number: COMIC_1001.issue_number,
          skip_cache: component.skip_cache
        })
      );
    });

    it('handles when a volume is deselected', () => {
      component.select_volume(null);
      expect(store.dispatch).toHaveBeenCalledWith(
        new ScrapingActions.SingleComicScrapingClearCurrentVolume()
      );
    });
  });

  describe('#select_issue()', () => {
    beforeEach(() => {
      component.form.controls['api_key'].setValue(API_KEY);
      component.comic = COMIC_1000;
      component.single_comic_scraping = SINGLE_COMIC_SCRAPING_STATE;
      component.single_comic_scraping.current_issue = ISSUE_1000;
    });

    it('notifies the store to fetch the issue\'s metadata', () => {
      component.select_issue();

      expect(store.dispatch).toHaveBeenCalledWith(
        new ScrapingActions.SingleComicScrapingScrapeMetadata({
          api_key: API_KEY,
          comic: COMIC_1000,
          issue_id: ISSUE_1000.id,
          skip_cache: false,
          multi_comic_mode: false
        })
      );
    });
  });

  describe('#cancel_selection()', () => {
    beforeEach(() => {
      component.form.controls['api_key'].setValue(API_KEY);
      component.comic = COMIC_1000;
      component.single_comic_scraping = SINGLE_COMIC_SCRAPING_STATE;
      component.single_comic_scraping.current_issue = ISSUE_1000;
    });

    it('resets the scraping setup', () => {
      component.cancel_selection();

      expect(store.dispatch).toHaveBeenCalledWith(
        new ScrapingActions.SingleComicScrapingSetup({
          api_key: API_KEY,
          comic: COMIC_1000,
          series: COMIC_1000.series,
          volume: COMIC_1000.volume,
          issue_number: COMIC_1000.issue_number
        })
      );
    });
  });

  describe('#save_changes()', () => {
    it('saves the current states', () => {
      component.form.controls['api_key'].setValue(API_KEY);
      component.comic = COMIC_1000;
      component.form.controls['series'].setValue('Replacement Series');
      component.form.controls['volume'].setValue('1965');
      component.form.controls['issue_number'].setValue('275');

      component.save_changes();

      expect(store.dispatch).toHaveBeenCalledWith(
        new ScrapingActions.SingleComicScrapingSaveLocalChanges({
          api_key: API_KEY,
          comic: COMIC_1000,
          series: 'Replacement Series',
          volume: '1965',
          issue_number: '275'
        })
      );
    });
  });

  describe('#reset_changes()', () => {
    beforeEach(() => {
      store.dispatch(
        new ScrapingActions.SingleComicScrapingSetup({
          api_key: API_KEY,
          comic: COMIC_1000,
          series: COMIC_1000.series,
          volume: COMIC_1000.volume,
          issue_number: COMIC_1000.issue_number
        })
      );
      component.form.controls['series'].setValue('XXXXX');
      series_input.nativeElement.dispatchEvent(new Event('input'), 'XXXXX');
      component.form.controls['volume'].setValue('9999');
      volume_input.nativeElement.dispatchEvent(new Event('input'), '9999');
      component.form.controls['issue_number'].setValue('199');
      issue_number_input.nativeElement.dispatchEvent(new Event('input'), '199');

      fixture.detectChanges();

      component.reset_changes();
    });

    it('reverts all local changes', () => {
      expect(component.form.controls['api_key'].value).toEqual(API_KEY);
      expect(component.form.controls['series'].value).toEqual(
        COMIC_1000.series
      );
      expect(component.form.controls['volume'].value).toEqual(
        COMIC_1000.volume
      );
      expect(component.form.controls['issue_number'].value).toEqual(
        COMIC_1000.issue_number
      );
    });

    it('sets the form back to pristine', () => {
      expect(component.form.dirty).toBeFalsy();
    });
  });

  describe('#save_api_key()', () => {
    it('submits the entered key', () => {
      component.form.controls['api_key'].setValue(API_KEY);

      component.save_api_key();

      expect(store.dispatch).toHaveBeenCalledWith(
        new UserActions.UserSetPreference({
          name: COMICVINE_API_KEY,
          value: API_KEY
        })
      );
    });
  });
});

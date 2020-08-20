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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppState } from 'app/comics';
import { ComicAdaptor } from 'app/comics/adaptors/comic.adaptor';
import {
  COMIC_1,
  SCRAPING_ISSUE_1000,
  SCRAPING_VOLUME_1000
} from 'app/comics/comics.fixtures';
import { VolumeListComponent } from 'app/comics/components/volume-list/volume-list.component';
import { ComicEffects } from 'app/comics/effects/comic.effects';
import { ScrapingIssueCoverUrlPipe } from 'app/comics/pipes/scraping-issue-cover-url.pipe';
import { ScrapingIssueTitlePipe } from 'app/comics/pipes/scraping-issue-title.pipe';
import { COMIC_FEATURE_KEY, reducer } from 'app/comics/reducers/comic.reducer';
import { AuthenticationAdaptor, COMICVINE_API_KEY } from 'app/user';
import { UserModule } from 'app/user/user.module';
import { LoggerModule } from '@angular-ru/logger';
import { BlockUIModule } from 'primeng/blockui';
import {
  CardModule,
  Confirmation,
  ConfirmationService,
  DropdownModule,
  InplaceModule,
  MessageService,
  ProgressBarModule,
  SplitButtonModule,
  ToolbarModule,
  TooltipModule
} from 'primeng/primeng';
import { TableModule } from 'primeng/table';
import { ComicDetailsEditorComponent } from './comic-details-editor.component';
import { USER_PREFERENCE_SKIP_CACHE } from 'app/user/user.constants';
import { getScrapingVolumes } from 'app/comics/actions/scraping-volumes.actions';
import { getScrapingIssue } from 'app/comics/actions/scraping-issue.actions';
import { scrapeComic } from 'app/comics/actions/scrape-comic.actions';
import * as fromScrapingIssue from 'app/comics/reducers/scraping-issue.reducer';
import { SCRAPING_ISSUE_FEATURE_KEY } from 'app/comics/reducers/scraping-issue.reducer';
import * as fromScrapeComic from 'app/comics/reducers/scrape-comic.reducer';
import { SCRAPE_COMIC_FEATURE_KEY } from 'app/comics/reducers/scrape-comic.reducer';
import * as fromScrapeMultipleComics from 'app/comics/reducers/scrape-multiple-comic.reducer';
import { SCRAPE_MULTIPLE_COMICS_STATE } from 'app/comics/reducers/scrape-multiple-comic.reducer';
import * as fromScrapingVolumes from 'app/comics/reducers/scraping-volumes.reducer';
import { SCRAPING_VOLUMES_FEATURE_KEY } from 'app/comics/reducers/scraping-volumes.reducer';
import { ScrapingVolumesEffects } from 'app/comics/effects/scraping-volumes.effects';
import { ScrapingIssueEffects } from 'app/comics/effects/scraping-issue.effects';
import { ScrapeComicEffects } from 'app/comics/effects/scrape-comic.effects';

describe('ComicDetailsEditorComponent', () => {
  const API_KEY = 'ABCDEF0123456789';
  const COMIC = COMIC_1;
  const VOLUME = SCRAPING_VOLUME_1000;
  const ISSUE = SCRAPING_ISSUE_1000;
  const SERIES = 'Series name';
  const ISSUE_NUMBER = '717';
  const MAX_RECORDS = 100;

  let component: ComicDetailsEditorComponent;
  let fixture: ComponentFixture<ComicDetailsEditorComponent>;
  let store: Store<AppState>;
  let authenticationAdaptor: AuthenticationAdaptor;
  let translateService: TranslateService;
  let comicAdaptor: ComicAdaptor;
  let confirmationService: ConfirmationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UserModule,
        FormsModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        LoggerModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(COMIC_FEATURE_KEY, reducer),
        StoreModule.forFeature(
          SCRAPING_VOLUMES_FEATURE_KEY,
          fromScrapingVolumes.reducer
        ),
        StoreModule.forFeature(
          SCRAPING_ISSUE_FEATURE_KEY,
          fromScrapingIssue.reducer
        ),
        StoreModule.forFeature(
          SCRAPE_COMIC_FEATURE_KEY,
          fromScrapeComic.reducer
        ),
        StoreModule.forFeature(
          SCRAPE_MULTIPLE_COMICS_STATE,
          fromScrapeMultipleComics.reducer
        ),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([
          ComicEffects,
          ScrapingVolumesEffects,
          ScrapingIssueEffects,
          ScrapeComicEffects
        ]),
        BlockUIModule,
        ProgressBarModule,
        TooltipModule,
        InplaceModule,
        SplitButtonModule,
        TableModule,
        CardModule,
        ToolbarModule,
        DropdownModule
      ],
      declarations: [
        ComicDetailsEditorComponent,
        VolumeListComponent,
        ScrapingIssueTitlePipe,
        ScrapingIssueCoverUrlPipe
      ],
      providers: [ComicAdaptor, MessageService, ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicDetailsEditorComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
    authenticationAdaptor = TestBed.get(AuthenticationAdaptor);
    spyOn(authenticationAdaptor, 'setPreference');
    spyOn(authenticationAdaptor, 'getPreference');
    translateService = TestBed.get(TranslateService);
    comicAdaptor = TestBed.get(ComicAdaptor);
    confirmationService = TestBed.get(ConfirmationService);

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('the fetch options', () => {
    it('loads them by default', () => {
      component.maxRecords = MAX_RECORDS;
      expect(component.fetchOptions).not.toEqual([]);
    });
  });

  describe('when the language is changed', () => {
    beforeEach(() => {
      component.fetchOptions = [];
      component.comic = COMIC;
      component.comicDetailsForm.controls['apiKey'].setValue(API_KEY);
      translateService.use('fr');
    });

    it('loads the fetching options', () => {
      expect(component.fetchOptions).not.toEqual([]);
    });

    it('contains an option to fetch volumes without skipping the cache', () => {
      component.skipCache = false;
      component.fetchOptions
        .find(
          option =>
            option.label === 'comic-details-editor.option.fetch.with-cache'
        )
        .command();
      expect(store.dispatch).toHaveBeenCalledWith(
        getScrapingVolumes({
          apiKey: API_KEY,
          volume: COMIC.volume,
          series: COMIC.series,
          maxRecords: component.maxRecords,
          skipCache: false
        })
      );
    });

    it('contains an option to fetch volumes while skipping the cache', () => {
      component.skipCache = true;
      component.fetchOptions
        .find(
          option =>
            option.label === 'comic-details-editor.option.fetch.skip-cache'
        )
        .command();
      expect(store.dispatch).toHaveBeenCalledWith(
        getScrapingVolumes({
          apiKey: API_KEY,
          volume: COMIC.volume,
          series: COMIC.series,
          maxRecords: component.maxRecords,
          skipCache: true
        })
      );
    });
  });

  describe('setting the comic', () => {
    describe('while in single-comic mode', () => {
      beforeEach(() => {
        component.multiComicMode = false;
        component.comicDetailsForm.controls['seriesName'].setValue('');
        component.comicDetailsForm.controls['volumeName'].setValue('');
        component.comicDetailsForm.controls['issueNumber'].setValue('');
        component.comic = COMIC;
      });

      it('sets the comic', () => {
        expect(component.comic).toEqual(COMIC);
      });

      it('loads the series name', () => {
        expect(component.comicDetailsForm.controls['seriesName'].value).toEqual(
          COMIC.series
        );
      });

      it('loads the volume name', () => {
        expect(component.comicDetailsForm.controls['volumeName'].value).toEqual(
          COMIC.volume
        );
      });

      it('loads the issue number', () => {
        expect(
          component.comicDetailsForm.controls['issueNumber'].value
        ).toEqual(COMIC.issueNumber);
      });
    });

    describe('while in multi-comic mode', () => {
      beforeEach(() => {
        component.multiComicMode = true;
        component.comicDetailsForm.controls['seriesName'].setValue('');
        component.comicDetailsForm.controls['volumeName'].setValue('');
        component.comicDetailsForm.controls['issueNumber'].setValue('');
        component.comic = COMIC;
      });

      it('sets the comic', () => {
        expect(component.comic).toEqual(COMIC);
      });

      it('loads the series name', () => {
        expect(component.comicDetailsForm.controls['seriesName'].value).toEqual(
          COMIC.series
        );
      });

      it('loads the volume name', () => {
        expect(component.comicDetailsForm.controls['volumeName'].value).toEqual(
          COMIC.volume
        );
      });

      it('loads the issue number', () => {
        expect(
          component.comicDetailsForm.controls['issueNumber'].value
        ).toEqual(COMIC.issueNumber);
      });
    });
  });

  describe('saving the API key', () => {
    beforeEach(() => {
      component.comicDetailsForm.controls['apiKey'].setValue(API_KEY);
      component.saveApiKey();
    });

    it('sets the user preference', () => {
      expect(authenticationAdaptor.setPreference).toHaveBeenCalledWith(
        COMICVINE_API_KEY,
        API_KEY
      );
    });
  });

  describe('resetting the API key', () => {
    beforeEach(() => {
      component.editingApiKey = true;
      component.resetApiKey();
    });

    it('retrieves the stored API key', () => {
      expect(authenticationAdaptor.getPreference).toHaveBeenCalledWith(
        COMICVINE_API_KEY
      );
    });

    it('clears the editing api key flag', () => {
      expect(component.editingApiKey).toBeFalsy();
    });
  });

  describe('when the comic details have changed', () => {
    const NEW_SERIES = COMIC.series.substr(1);
    const NEW_VOLUME = COMIC.volume.substr(1);
    const NEW_ISSUE = COMIC.issueNumber.substr(1);

    beforeEach(() => {
      component.comic = COMIC;
      spyOn(comicAdaptor, 'saveComic');
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.accept()
      );
      component.comicDetailsForm.controls['seriesName'].setValue(NEW_SERIES);
      component.comicDetailsForm.controls['volumeName'].setValue(NEW_VOLUME);
      component.comicDetailsForm.controls['issueNumber'].setValue(NEW_ISSUE);
      component.comicDetailsForm.markAsDirty();
    });

    describe('saving the details', () => {
      beforeEach(() => {
        component.saveDetails();
      });

      it('calls the comic adaptor save method', () => {
        expect(comicAdaptor.saveComic).toHaveBeenCalledWith({
          ...COMIC,
          series: NEW_SERIES,
          volume: NEW_VOLUME,
          issueNumber: NEW_ISSUE
        });
      });

      it('marks the comic form as pristine', () => {
        expect(component.comicDetailsForm.pristine).toBeTruthy();
      });
    });

    describe('resetting the comic details', () => {
      beforeEach(() => {
        component.resetDetails();
      });

      it('loads the series name', () => {
        expect(component.comicDetailsForm.controls['seriesName'].value).toEqual(
          COMIC.series
        );
      });

      it('loads the volume name', () => {
        expect(component.comicDetailsForm.controls['volumeName'].value).toEqual(
          COMIC.volume
        );
      });

      it('loads the issue number', () => {
        expect(
          component.comicDetailsForm.controls['issueNumber'].value
        ).toEqual(COMIC.issueNumber);
      });
    });
  });

  describe('volume selection', () => {
    beforeEach(() => {
      component.comic = COMIC;
      component.comicDetailsForm.controls['apiKey'].setValue(API_KEY);
    });

    describe('while not skipping the cache', () => {
      beforeEach(() => {
        component.skipCache = false;
        component.volumeSelected(VOLUME);
      });

      it('clears the skipping cache flag', () => {
        expect(component.skipCache).toBeFalsy();
      });

      it('gets the issue for the volume', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          getScrapingIssue({
            apiKey: API_KEY,
            volumeId: VOLUME.id,
            issueNumber: COMIC.issueNumber,
            skipCache: false
          })
        );
      });
    });

    describe('while skipping the cache', () => {
      beforeEach(() => {
        component.skipCache = true;
        component.volumeSelected(VOLUME);
      });

      it('sets the skipping cache flag', () => {
        expect(component.skipCache).toBeTruthy();
      });

      it('gets the issue for the volume', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          getScrapingIssue({
            apiKey: API_KEY,
            volumeId: VOLUME.id,
            issueNumber: COMIC.issueNumber,
            skipCache: true
          })
        );
      });
    });

    describe('when it has been deselected', () => {
      beforeEach(() => {
        component.currentIssue = ISSUE;
        component.volumeSelected(null);
      });

      it('clears the selected issue', () => {
        expect(component.currentIssue).toBeNull();
      });
    });
  });

  describe('selecting an issue', () => {
    beforeEach(() => {
      component.comic = COMIC;
      component.currentVolume = VOLUME;
      component.comicDetailsForm.controls['apiKey'].setValue(API_KEY);
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.accept()
      );
    });

    describe('while not skipping the cache', () => {
      beforeEach(() => {
        component.skipCache = false;
        component.issueSelected(ISSUE);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          scrapeComic({
            apiKey: API_KEY,
            comicId: COMIC.id,
            issueNumber: `${ISSUE.id}`,
            skipCache: false
          })
        );
      });
    });

    describe('while skipping the cache', () => {
      beforeEach(() => {
        component.skipCache = true;
        component.issueSelected(ISSUE);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          scrapeComic({
            apiKey: API_KEY,
            comicId: COMIC.id,
            issueNumber: `${ISSUE.id}`,
            skipCache: true
          })
        );
      });
    });
  });

  describe('cancelling the selection', () => {
    beforeEach(() => {
      component.selectionCancelled();
    });

    it('resets the volumes list', () => {
      expect(component.volumes).toEqual([]);
    });
  });

  describe('skipping a comic', () => {
    beforeEach(() => {
      component.comic = COMIC;
      component.skipCurrentComic();
    });

    it('emits an event to skip the current comic', () => {
      component.skipComic.subscribe(response =>
        expect(response).toEqual(COMIC)
      );
    });
  });

  describe('fetching volumes', () => {
    beforeEach(() => {
      component.apiKey = API_KEY;
      component.comic = COMIC;
      component.maxRecords = MAX_RECORDS;
    });

    describe('skipping the cache', () => {
      beforeEach(() => {
        component.skipCache = true;
        component.doFetchVolumes();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          getScrapingVolumes({
            apiKey: API_KEY,
            series: COMIC.series,
            volume: COMIC.volume,
            maxRecords: MAX_RECORDS,
            skipCache: true
          })
        );
      });
    });

    describe('using the cache', () => {
      beforeEach(() => {
        component.skipCache = false;
        component.doFetchVolumes();
      });

      it('fireds an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          getScrapingVolumes({
            apiKey: API_KEY,
            series: COMIC.series,
            volume: COMIC.volume,
            maxRecords: MAX_RECORDS,
            skipCache: false
          })
        );
      });
    });
  });

  it('saves the skip cache preference if it is changed', () => {
    component.skipCache = false;
    component.getVolumes(!component.skipCache);
    expect(authenticationAdaptor.setPreference).toHaveBeenCalledWith(
      USER_PREFERENCE_SKIP_CACHE,
      `${!component.skipCache}`
    );
  });

  it('does not save the skip cache preference if it is not changed', () => {
    component.skipCache = false;
    component.getVolumes(component.skipCache);
    expect(authenticationAdaptor.setPreference).not.toHaveBeenCalled();
  });
});

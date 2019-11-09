/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
import { TestBed } from '@angular/core/testing';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { AppState } from 'app/comics';
import {
  ScrapingGetIssue,
  ScrapingGetIssueFailed,
  ScrapingGetVolumes,
  ScrapingGetVolumesFailed,
  ScrapingIssueReceived,
  ScrapingLoadMetadata,
  ScrapingLoadMetadataFailed,
  ScrapingMetadataLoaded,
  ScrapingStart,
  ScrapingVolumesReceived
} from 'app/comics/actions/scraping.actions';
import { ScrapingEffects } from 'app/comics/effects/scraping.effects';
import {
  COMIC_1,
  COMIC_2,
  COMIC_3,
  COMIC_4
} from 'app/comics/models/comic.fixtures';
import { SCRAPING_ISSUE_1000 } from 'app/comics/models/scraping-issue.fixtures';
import {
  SCRAPING_VOLUME_1001,
  SCRAPING_VOLUME_1002,
  SCRAPING_VOLUME_1003,
  SCRAPING_VOLUME_1004,
  SCRAPING_VOLUME_1005
} from 'app/comics/models/scraping-volume.fixtures';
import {
  reducer,
  SCRAPING_FEATURE_KEY
} from 'app/comics/reducers/scraping.reducer';
import { MessageService } from 'primeng/api';
import { ScrapingAdaptor } from './scraping.adaptor';

describe('ScrapingAdaptor', () => {
  const COMICS = [COMIC_1, COMIC_2, COMIC_3, COMIC_4];
  const COMIC = COMIC_1;
  const API_KEY = 'A0B1C2D3E4F56789';
  const SERIES = 'Awesome Comic Series';
  const VOLUME = '2019';
  const SKIP_CACHE = true;
  const VOLUMES = [
    SCRAPING_VOLUME_1001,
    SCRAPING_VOLUME_1002,
    SCRAPING_VOLUME_1003,
    SCRAPING_VOLUME_1004,
    SCRAPING_VOLUME_1005
  ];
  const SCRAPING_VOLUME = SCRAPING_VOLUME_1003;
  const ISSUES = [SCRAPING_ISSUE_1000];
  const ISSUE = SCRAPING_ISSUE_1000;

  let adaptor: ScrapingAdaptor;
  let store: Store<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(SCRAPING_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([ScrapingEffects])
      ],
      providers: [ScrapingAdaptor, MessageService]
    });

    adaptor = TestBed.get(ScrapingAdaptor);
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
  });

  it('should create an instance', () => {
    expect(adaptor).toBeTruthy();
  });

  describe('starting the scraping process', () => {
    beforeEach(() => {
      adaptor.startScraping(COMICS);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new ScrapingStart({ comics: COMICS })
      );
    });

    it('provides updates on the list of comics', () => {
      adaptor.comics$.subscribe(response => expect(response).toEqual(COMICS));
    });

    it('provides updates on the current comic', () => {
      adaptor.comic$.subscribe(response => expect(response).toEqual(COMICS[0]));
    });
  });

  describe('getting volumes for a series', () => {
    beforeEach(() => {
      adaptor.getVolumes(API_KEY, SERIES, VOLUME, SKIP_CACHE);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new ScrapingGetVolumes({
          apiKey: API_KEY,
          series: SERIES,
          volume: VOLUME,
          skipCache: SKIP_CACHE
        })
      );
    });

    it('provides updates on fetching volumes', () => {
      adaptor.fetchingVolumes$.subscribe(response =>
        expect(response).toBeTruthy()
      );
    });

    describe('when the volumes are received', () => {
      beforeEach(() => {
        store.dispatch(new ScrapingVolumesReceived({ volumes: VOLUMES }));
      });

      it('provides updates on fetching volumes', () => {
        adaptor.fetchingVolumes$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });

      it('updates the list of volumes', () => {
        adaptor.volumes$.subscribe(response =>
          expect(response).toEqual(VOLUMES)
        );
      });
    });

    describe('when the attempt failures', () => {
      beforeEach(() => {
        store.dispatch(new ScrapingGetVolumesFailed());
      });

      it('provides updates on fetching volumes', () => {
        adaptor.fetchingVolumes$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });
  });

  describe('getting a single issue', () => {
    beforeEach(() => {
      adaptor.getIssue(
        API_KEY,
        SCRAPING_VOLUME.id,
        ISSUE.issueNumber,
        SKIP_CACHE
      );
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new ScrapingGetIssue({
          apiKey: API_KEY,
          volumeId: SCRAPING_VOLUME.id,
          issueNumber: ISSUE.issueNumber,
          skipCache: SKIP_CACHE
        })
      );
    });

    it('provides updates on fetching an issue', () => {
      adaptor.fetchingIssue$.subscribe(response =>
        expect(response).toBeTruthy()
      );
    });

    describe('when the issue is received', () => {
      beforeEach(() => {
        store.dispatch(new ScrapingIssueReceived({ issue: ISSUE }));
      });

      it('provides updates on fetching an issue', () => {
        adaptor.fetchingIssue$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });

      it('updates the issue', () => {
        adaptor.issue$.subscribe(response => expect(response).toEqual(ISSUE));
      });
    });

    describe('when fetching the issue fails', () => {
      beforeEach(() => {
        store.dispatch(new ScrapingGetIssueFailed());
      });

      it('provides updates on fetching an issue', () => {
        adaptor.fetchingIssue$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });
  });

  describe('scraping a comic', () => {
    beforeEach(() => {
      adaptor.loadMetadata(API_KEY, COMIC.id, ISSUE.issueNumber, SKIP_CACHE);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new ScrapingLoadMetadata({
          apiKey: API_KEY,
          comicId: COMIC.id,
          issueNumber: ISSUE.issueNumber,
          skipCache: SKIP_CACHE
        })
      );
    });

    it('provides updates on scraping', () => {
      adaptor.scraping$.subscribe(response => expect(response).toBeTruthy());
    });

    describe('when the comic is scraped', () => {
      beforeEach(() => {
        store.dispatch(new ScrapingMetadataLoaded({ comic: COMIC }));
      });

      it('provides updates on scraping', () => {
        adaptor.scraping$.subscribe(response => expect(response).toBeFalsy());
      });
    });

    describe('when the scraping fails', () => {
      beforeEach(() => {
        store.dispatch(new ScrapingLoadMetadataFailed());
      });

      it('provides updates on loading metadata', () => {
        adaptor.scraping$.subscribe(response => expect(response).toBeFalsy());
      });
    });
  });
});

/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ComicScrapingComponent,
  EXACT_MATCH,
  MATCHABILITY,
  NEAR_MATCH,
  NO_MATCH
} from './comic-scraping.component';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  COMIC_4,
  SCRAPING_ISSUE_1,
  SCRAPING_VOLUME_3
} from '@app/comic-book/comic-book.fixtures';
import {
  initialState as initialScrapingState,
  SCRAPING_FEATURE_KEY
} from '@app/comic-book/reducers/scraping.reducer';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSortModule } from '@angular/material/sort';
import { ScrapingVolume } from '@app/comic-book/models/scraping-volume';
import {
  loadScrapingIssue,
  resetScraping,
  scrapeComic
} from '@app/comic-book/actions/scraping.actions';
import { Confirmation } from '@app/core/models/confirmation';
import { deselectComics } from '@app/library/actions/library.actions';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { SortableListItem } from '@app/core/models/ui/sortable-list-item';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ScrapingIssueDetailComponent } from '@app/comic-book/components/scraping-issue-detail/scraping-issue-detail.component';

describe('ComicScrapingComponent', () => {
  const SCRAPING_ISSUE = SCRAPING_ISSUE_1;
  const SCRAPING_VOLUME = { ...SCRAPING_VOLUME_3 };
  const VOLUMES = [
    { ...SCRAPING_VOLUME },
    { ...SCRAPING_VOLUME, startYear: '1900' },
    { ...SCRAPING_VOLUME, name: SCRAPING_VOLUME.name.substr(1) }
  ];
  const API_KEY = '1234567890ABCDEF';
  const SKIP_CACHE = Math.random() > 0.5;
  const ISSUE_NUMBER = '27';
  const COMIC = COMIC_4;
  const initialState = { [SCRAPING_FEATURE_KEY]: { ...initialScrapingState } };

  let component: ComicScrapingComponent;
  let fixture: ComponentFixture<ComicScrapingComponent>;
  let store: MockStore<any>;
  let confirmationService: ConfirmationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ComicScrapingComponent, ScrapingIssueDetailComponent],
      imports: [
        NoopAnimationsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatDialogModule,
        MatTableModule,
        MatSortModule,
        MatToolbarModule,
        MatIconModule,
        MatFormFieldModule,
        MatPaginatorModule,
        MatTooltipModule
      ],
      providers: [provideMockStore({ initialState }), ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicScrapingComponent);
    component = fixture.componentInstance;
    component.apiKey = API_KEY;
    component.comicSeriesName = SCRAPING_VOLUME.name;
    component.comicVolume = SCRAPING_VOLUME.startYear;
    component.comicIssueNumber = ISSUE_NUMBER;
    component.skipCache = SKIP_CACHE;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    confirmationService = TestBed.inject(ConfirmationService);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('receiving scraping volumes', () => {
    beforeEach(() => {
      component.comicSeriesName = SCRAPING_VOLUME.name;
      component.dataSource.data = [];
    });

    describe('when no exact match is received', () => {
      beforeEach(() => {
        component.comicVolume = SCRAPING_VOLUME.startYear + '1';
        component.volumes = VOLUMES;
      });

      it('loads the datasource', () => {
        expect(component.dataSource.data).not.toEqual([]);
      });

      it('does not preselect a volume', () => {
        expect(component.selectedVolume).toBeNull();
      });

      it('does not contain an exact match', () => {
        expect(
          component.dataSource.data.some(
            entry => entry.sortOrder === EXACT_MATCH
          )
        ).toBeFalse();
      });

      it('contains a near match', () => {
        expect(
          component.dataSource.data.some(
            entry => entry.sortOrder === NEAR_MATCH
          )
        ).toBeTrue();
      });

      it('contains non-matches', () => {
        expect(
          component.dataSource.data.some(entry => entry.sortOrder === NO_MATCH)
        ).toBeTrue();
      });
    });

    describe('when an exact match is received', () => {
      beforeEach(() => {
        component.comicVolume = SCRAPING_VOLUME.startYear;
        component.volumes = VOLUMES;
      });

      it('loads the datasource', () => {
        expect(component.dataSource.data).not.toEqual([]);
      });

      it('preselects a volume', () => {
        expect(component.selectedVolume).not.toBeNull();
      });

      it('contains an exact match', () => {
        expect(
          component.dataSource.data.some(
            entry => entry.sortOrder === EXACT_MATCH
          )
        ).toBeTrue();
      });

      it('contains a near match', () => {
        expect(
          component.dataSource.data.some(
            entry => entry.sortOrder === NEAR_MATCH
          )
        ).toBeTrue();
      });

      it('contains non-matches', () => {
        expect(
          component.dataSource.data.some(entry => entry.sortOrder === NO_MATCH)
        ).toBeTrue();
      });
    });
  });

  describe('sorting scraping volumes', () => {
    const SORT_ORDER = 2;
    const ELEMENT = {
      item: SCRAPING_VOLUME,
      sortOrder: SORT_ORDER
    } as SortableListItem<ScrapingVolume>;

    it('uses the sort value for an entry', () => {
      expect(
        component.dataSource.sortingDataAccessor(ELEMENT, MATCHABILITY)
      ).toEqual(SORT_ORDER);
    });

    it('uses the publisher', () => {
      expect(
        component.dataSource.sortingDataAccessor(ELEMENT, 'publisher')
      ).toEqual(SCRAPING_VOLUME.publisher);
    });

    it('uses the volume name', () => {
      expect(component.dataSource.sortingDataAccessor(ELEMENT, 'name')).toEqual(
        SCRAPING_VOLUME.name
      );
    });

    it('uses the start year', () => {
      expect(
        component.dataSource.sortingDataAccessor(ELEMENT, 'startYear')
      ).toEqual(SCRAPING_VOLUME.startYear);
    });

    it('uses the issue count', () => {
      expect(
        component.dataSource.sortingDataAccessor(ELEMENT, 'issueCount')
      ).toEqual(SCRAPING_VOLUME.issueCount);
    });
  });

  describe('when a volume is selected', () => {
    beforeEach(() => {
      component.onVolumeSelected(SCRAPING_VOLUME);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        loadScrapingIssue({
          apiKey: API_KEY,
          volumeId: SCRAPING_VOLUME.id,
          issueNumber: ISSUE_NUMBER,
          skipCache: SKIP_CACHE
        })
      );
    });
  });

  describe('when a scraping issue decision is made', () => {
    beforeEach(() => {
      component.issue = SCRAPING_ISSUE;
      component.comic = COMIC;
    });

    describe('when selected', () => {
      beforeEach(() => {
        spyOn(confirmationService, 'confirm').and.callFake(
          (confirm: Confirmation) => confirm.confirm()
        );
        component.onDecision(true);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          scrapeComic({
            apiKey: API_KEY,
            issueId: SCRAPING_ISSUE.id,
            comic: COMIC,
            skipCache: SKIP_CACHE
          })
        );
      });

      describe('when in multi-comic scraping mode', () => {
        beforeEach(() => {
          component.multimode = true;
          component.onDecision(true);
        });

        it('fires an action to deselect the comic', () => {
          expect(store.dispatch).toHaveBeenCalledWith(
            deselectComics({ comics: [COMIC] })
          );
        });
      });
    });

    describe('when rejected', () => {
      beforeEach(() => {
        component.onDecision(false);
      });

      it('clears the scraping issue', () => {
        expect(component.issue).toBeNull();
      });
    });
  });

  describe('canceling scraping', () => {
    beforeEach(() => {
      component.onCancelScraping();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(resetScraping());
    });
  });
});

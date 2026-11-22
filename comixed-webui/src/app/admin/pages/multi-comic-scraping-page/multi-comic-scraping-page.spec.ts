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
import { MultiComicScrapingPage } from './multi-comic-scraping-page';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TitleService } from '@app/layout/services/title-service';
import {
  initialMultiComicScrapingState,
  MULTI_COMIC_SCRAPING_FEATURE_KEY,
  multiComicScrapingAdapter
} from '@app/metadata/reducers/multi-comic-scraping.reducer';
import { provideRouter } from '@angular/router';
import { beforeEach, Mock } from 'vitest';
import { ScrapingIssueSelectedEvent } from '@app/library/models/ux/scraping-issue-selected-event';
import {
  initialUserState,
  USER_FEATURE_KEY
} from '@app/account/reducers/user.reducer';
import { USER_ADMIN } from '@app/account/account-fixtures';
import { Confirmation, ConfirmationService } from '@openng/optimus-ui/api';
import { By } from '@angular/platform-browser';
import { COMIC_1, COMIC_2 } from '@app/library/library-fixtures';
import {
  METADATA_SOURCE_1,
  SCRAPING_ISSUE_1
} from '@app/metadata/metadata-fixtures';
import {
  initialMetadataSourceListState,
  METADATA_SOURCE_LIST_FEATURE_KEY
} from '@app/metadata/reducers/metadata-source-list.reducer';
import {
  initialScrapeFilenameState,
  SCRAPE_FILENAME_FEATURE_KEY
} from '@app/metadata/reducers/scrape-filename.reducer';
import {
  initialSingleComicScrapingState,
  SINGLE_COMIC_SCRAPING_FEATURE_KEY
} from '@app/metadata/reducers/single-comic-scraping.reducer';
import { MultiComicScrapingActions } from '@app/metadata/actions/multi-comic-scraping.actions';

describe('MultiComicScrapingPage', () => {
  const TEST_COMIC = COMIC_1;
  const TEST_METADATA_SOURCE = METADATA_SOURCE_1;
  const TEST_SCRAPING_ISSUE = SCRAPING_ISSUE_1;
  const TEST_SKIP_CACHE = Math.random() > 0.5;
  const TEST_COMIC_LIST = [COMIC_1, COMIC_2];
  const initialState = {
    [METADATA_SOURCE_LIST_FEATURE_KEY]: initialMetadataSourceListState,
    [SCRAPE_FILENAME_FEATURE_KEY]: initialScrapeFilenameState,
    [SINGLE_COMIC_SCRAPING_FEATURE_KEY]: initialSingleComicScrapingState,
    [MULTI_COMIC_SCRAPING_FEATURE_KEY]: multiComicScrapingAdapter.setAll(
      TEST_COMIC_LIST,
      initialMultiComicScrapingState
    )
  };

  let component: MultiComicScrapingPage;
  let fixture: ComponentFixture<MultiComicScrapingPage>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiComicScrapingPage],
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
        TitleService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MultiComicScrapingPage);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
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

  describe('when no comic is selected', () => {
    it('should shows the comic table', () => {
      expect(
        fixture.nativeElement.querySelector('#comic-table')
      ).not.toBeNull();
    });

    describe('removing a comic', () => {
      let dispatchSpy: Mock;

      beforeEach(() => {
        dispatchSpy = vi.spyOn(store, 'dispatch');
        const button: HTMLButtonElement = fixture.nativeElement.querySelector(
          `#remove-comic-${TEST_COMIC_LIST[0].comicId} button`
        );
        expect(button).not.toBeNull();
        button.click();
        fixture.detectChanges();
      });

      it('should dispatch an action to remove the comic', () => {
        expect(dispatchSpy).toHaveBeenCalledWith(
          MultiComicScrapingActions.removeComic({ entry: TEST_COMIC })
        );
      });
    });

    describe('selecting the current comic', () => {
      let dispatchSpy: Mock;

      beforeEach(() => {
        dispatchSpy = vi.spyOn(store, 'dispatch');
        const button: HTMLButtonElement = fixture.nativeElement.querySelector(
          `#scrape-comic-${TEST_COMIC_LIST[0].comicId} button`
        );
        expect(button).not.toBeNull();
        button.click();
        fixture.detectChanges();
      });

      it('should dispatch an action to remove the comic', () => {
        expect(dispatchSpy).toHaveBeenCalledWith(
          MultiComicScrapingActions.setCurrentComic({ entry: TEST_COMIC })
        );
      });
    });
  });

  describe('when a scraping issue is selected', () => {
    let confirmSpy: Mock;
    let event: ScrapingIssueSelectedEvent;
    let dispatchSpy: Mock;

    beforeEach(() => {
      store.setState({
        ...initialState,
        [USER_FEATURE_KEY]: { ...initialUserState, user: USER_ADMIN },
        [MULTI_COMIC_SCRAPING_FEATURE_KEY]: multiComicScrapingAdapter.setAll(
          TEST_COMIC_LIST,
          {
            ...initialMultiComicScrapingState,
            current: TEST_COMIC
          }
        )
      });
      fixture.detectChanges();
      confirmSpy = vi
        .spyOn(component.confirmationService, 'confirm')
        .mockImplementation((confirm: Confirmation) => {
          confirm.accept?.();
          return component.confirmationService;
        });
      dispatchSpy = vi.spyOn(store, 'dispatch');
      const child = fixture.debugElement.query(
        By.css('#comic-metadata-detail')
      );
      expect(child).not.toBeNull();
      event = {
        metadataSource: TEST_METADATA_SOURCE,
        issue: TEST_SCRAPING_ISSUE,
        skipCache: TEST_SKIP_CACHE
      };
      child.triggerEventHandler('issueSelected', event);
      fixture.detectChanges();
    });

    it('should confirm with the user', () => {
      expect(confirmSpy).toHaveBeenCalled();
    });

    it('should dispatch an action to scrape the comic', () => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        MultiComicScrapingActions.scrapeComic({
          comic: TEST_COMIC,
          metadataSource: TEST_METADATA_SOURCE,
          issueId: TEST_SCRAPING_ISSUE.id,
          skipCache: TEST_SKIP_CACHE,
          index: 0,
          size: 10
        })
      );
    });
  });
});

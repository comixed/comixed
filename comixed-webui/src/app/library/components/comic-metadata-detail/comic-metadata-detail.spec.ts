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
import { ComicMetadataDetail } from '@app/library/components/comic-metadata-detail/comic-metadata-detail';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  initialSingleComicScrapingState,
  SINGLE_COMIC_SCRAPING_FEATURE_KEY,
  singleComicScrapingAdapter
} from '@app/metadata/reducers/single-comic-scraping.reducer';
import {
  METADATA_SOURCE_1,
  SCRAPING_VOLUME_1,
  SCRAPING_VOLUME_2
} from '@app/metadata/metadata-fixtures';
import { provideTranslateService } from '@ngx-translate/core';
import {
  initialMetadataSourceListState,
  METADATA_SOURCE_LIST_FEATURE_KEY
} from '@app/metadata/reducers/metadata-source-list.reducer';
import { ConfirmationService } from '@openng/optimus-ui/api';
import { beforeEach, Mock } from 'vitest';
import { COMIC_1 } from '@app/library/library-fixtures';
import { ScrapeFilenameActions } from '@app/metadata/actions/scrape-filename.actions';
import { SingleComicScrapingActions } from '@app/metadata/actions/single-comic-scraping.actions';
import {
  initialScrapeFilenameState,
  SCRAPE_FILENAME_FEATURE_KEY
} from '@app/metadata/reducers/scrape-filename.reducer';
import { By } from '@angular/platform-browser';
import { ScrapingVolumeTable } from '@app/library/components/scraping-volume-table/scraping-volume-table';

describe('ComicMetadataDetail', () => {
  const TEST_SCRAPING_VOLUME_LIST = [SCRAPING_VOLUME_1, SCRAPING_VOLUME_2];
  const TEST_METADATA_SOURCE = METADATA_SOURCE_1;
  const TEST_COMIC = COMIC_1;
  const initialState = {
    [SINGLE_COMIC_SCRAPING_FEATURE_KEY]: initialSingleComicScrapingState,
    [SCRAPE_FILENAME_FEATURE_KEY]: initialScrapeFilenameState,
    [METADATA_SOURCE_LIST_FEATURE_KEY]: {
      ...initialMetadataSourceListState,
      selected: TEST_METADATA_SOURCE
    }
  };

  let component: ComicMetadataDetail;
  let fixture: ComponentFixture<ComicMetadataDetail>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComicMetadataDetail, ScrapingVolumeTable],
      providers: [
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockStore({ initialState }),
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicMetadataDetail);
    component = fixture.componentInstance;
    component.comic = TEST_COMIC;
    store = TestBed.inject(MockStore);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the metadata scraping form', () => {
    expect(
      fixture.nativeElement.querySelector('#scraping-volume-form')
    ).not.toBeNull();
  });

  describe('when scraping volumes are loaded', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [SINGLE_COMIC_SCRAPING_FEATURE_KEY]: singleComicScrapingAdapter.setAll(
          TEST_SCRAPING_VOLUME_LIST,
          initialSingleComicScrapingState
        )
      });
      fixture.detectChanges();
    });

    it('should display the scraping volume table', () => {
      expect(
        fixture.nativeElement.querySelector('#scraping-volume-table')
      ).not.toBeNull();
    });
  });

  describe('when an issue was selected', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [SINGLE_COMIC_SCRAPING_FEATURE_KEY]: singleComicScrapingAdapter.setAll(
          TEST_SCRAPING_VOLUME_LIST,
          initialSingleComicScrapingState
        )
      });
    });

    it('notifies the parent component', () => {
      const issueNumber = 42;
      const emitSpy = vi.spyOn(component.issueSelected, 'emit');

      fixture.detectChanges();

      const child = fixture.debugElement.query(
        By.directive(ScrapingVolumeTable)
      );

      child.triggerEventHandler('issueSelected', issueNumber);

      expect(emitSpy).toHaveBeenCalledWith(issueNumber);
    });
  });

  describe('clicking the scrape filename button', () => {
    let dispatchSpy: Mock;

    beforeEach(() => {
      dispatchSpy = vi.spyOn(store, 'dispatch');
      const button: HTMLButtonElement = fixture.nativeElement.querySelector(
        '#scrape-filename-button button'
      );
      expect(button).not.toBeNull();
      button.click();
      fixture.detectChanges();
    });

    it('should dispatch an action to scrape the filename', () => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        ScrapeFilenameActions.scrapeComic({ comic: TEST_COMIC })
      );
    });
  });

  describe('clicking the reset button', () => {
    beforeEach(() => {
      component.scrapingForm.controls['publisher'].setValue('changed');
      component.scrapingForm.controls['series'].setValue('changed');
      component.scrapingForm.controls['volume'].setValue('changed');
      component.scrapingForm.controls['issueNumber'].setValue('changed');
      component.scrapingForm.markAsDirty();
      fixture.detectChanges();
      const resetButton: HTMLButtonElement =
        fixture.nativeElement.querySelector('#reset-form-button button');
      expect(resetButton).not.toBeNull();
      resetButton.click();
      fixture.detectChanges();
    });

    it('should restore the publisher', () => {
      expect(component.scrapingForm.controls['publisher'].value).toStrictEqual(
        TEST_COMIC.publisher
      );
    });

    it('should restore the series', () => {
      expect(component.scrapingForm.controls['series'].value).toStrictEqual(
        TEST_COMIC.series
      );
    });

    it('should restore the volume', () => {
      expect(component.scrapingForm.controls['volume'].value).toStrictEqual(
        TEST_COMIC.volume
      );
    });

    it('should restore the issue number', () => {
      expect(
        component.scrapingForm.controls['issueNumber'].value
      ).toStrictEqual(TEST_COMIC.issueNumber);
    });
  });

  describe('clicking the submit button', () => {
    let dispatchSpy: Mock;

    beforeEach(() => {
      dispatchSpy = vi.spyOn(store, 'dispatch');
      const button: HTMLButtonElement = fixture.nativeElement.querySelector(
        '#submit-form-button button'
      );
      expect(button).not.toBeNull();
      button.click();
      fixture.detectChanges();
    });

    it('should dispatch an action to load volumes', () => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        SingleComicScrapingActions.loadVolumes({
          metadataSource: TEST_METADATA_SOURCE,
          publisher: TEST_COMIC.publisher,
          series: TEST_COMIC.series,
          matchPublisher: false,
          maximumRecords: 0,
          skipCache: false
        })
      );
    });
  });
});

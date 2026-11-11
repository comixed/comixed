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
  SCRAPING_VOLUME_1,
  SCRAPING_VOLUME_2
} from '@app/metadata/metadata-fixtures';
import { provideTranslateService } from '@ngx-translate/core';
import {
  initialMetadataSourceListState,
  METADATA_SOURCE_LIST_FEATURE_KEY
} from '@app/metadata/reducers/metadata-source-list.reducer';
import { ConfirmationService } from '@openng/optimus-ui/api';
import { beforeEach } from 'vitest';
import { COMIC_1 } from '@app/library/library-fixtures';

describe('ComicMetadataDetail', () => {
  const TEST_SCRAPING_VOLUME_LIST = [SCRAPING_VOLUME_1, SCRAPING_VOLUME_2];
  const initialState = {
    [SINGLE_COMIC_SCRAPING_FEATURE_KEY]: initialSingleComicScrapingState,
    [METADATA_SOURCE_LIST_FEATURE_KEY]: initialMetadataSourceListState
  };
  const TEST_COMIC = COMIC_1;

  let component: ComicMetadataDetail;
  let fixture: ComponentFixture<ComicMetadataDetail>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComicMetadataDetail],
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
});

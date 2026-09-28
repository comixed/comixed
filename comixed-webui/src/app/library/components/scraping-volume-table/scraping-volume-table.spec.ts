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
import { ScrapingVolumeTable } from './scraping-volume-table';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  initialSingleComicScrapingState,
  SINGLE_COMIC_SCRAPING_FEATURE_KEY,
  singleComicScrapingAdapter
} from '@app/metadata/reducers/single-comic-scraping.reducer';
import {
  METADATA_SOURCE_1,
  SCRAPING_ISSUE_1,
  SCRAPING_VOLUME_1,
  SCRAPING_VOLUME_2
} from '@app/metadata/metadata-fixtures';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, Mock } from 'vitest';
import { SingleComicScrapingActions } from '@app/metadata/actions/single-comic-scraping.actions';

describe('ScrapingVolumeTable', () => {
  const TEST_SCRAPING_VOLUME_LIST = [SCRAPING_VOLUME_1, SCRAPING_VOLUME_2];
  const TEST_SCRAPING_ISSUE = SCRAPING_ISSUE_1;
  const TEST_METADATA_SOURCE = METADATA_SOURCE_1;
  const TEST_ISSUE_NUMBER = '320';
  const TEST_SKIP_CACHE = Math.random() > 0.5;
  const initialState = {
    [SINGLE_COMIC_SCRAPING_FEATURE_KEY]: singleComicScrapingAdapter.setAll(
      TEST_SCRAPING_VOLUME_LIST,
      initialSingleComicScrapingState
    )
  };

  let component: ScrapingVolumeTable;
  let fixture: ComponentFixture<ScrapingVolumeTable>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrapingVolumeTable],
      providers: [
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockStore({ initialState })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ScrapingVolumeTable);
    component = fixture.componentInstance;
    component.metadataSource = TEST_METADATA_SOURCE;
    component.issueNumber = TEST_ISSUE_NUMBER;
    component.skipCache = TEST_SKIP_CACHE;
    store = TestBed.inject(MockStore);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset the volume list', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const resetButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '#reset-volume-list button'
    );
    expect(resetButton).not.toBeNull();
    resetButton.click();
    fixture.detectChanges();
    expect(dispatchSpy).toHaveBeenCalledWith(
      SingleComicScrapingActions.resetVolumes()
    );
  });

  it('should ignore array selection', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    component.onRowSelect(TEST_SCRAPING_VOLUME_LIST);
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  describe('selecting a volume', () => {
    const TARGET_VOLUME = TEST_SCRAPING_VOLUME_LIST[1];
    let dispatchSpy: Mock;

    beforeEach(() => {
      dispatchSpy = vi.spyOn(store, 'dispatch');
      const row: HTMLTableRowElement = fixture.nativeElement.querySelector(
        `#scraping-volume-${TARGET_VOLUME.id}`
      );
      expect(row).not.toBeNull();
      row.click();
      fixture.detectChanges();
    });

    it('should set the dispatch an action to load the issue', () => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        SingleComicScrapingActions.loadIssue({
          metadataSource: TEST_METADATA_SOURCE,
          volumeId: TARGET_VOLUME.id,
          issueNumber: TEST_ISSUE_NUMBER,
          skipCache: TEST_SKIP_CACHE
        })
      );
    });
  });

  describe('when a scraping issue is selected', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [SINGLE_COMIC_SCRAPING_FEATURE_KEY]: singleComicScrapingAdapter.setAll(
          TEST_SCRAPING_VOLUME_LIST,
          {
            ...initialSingleComicScrapingState,
            issue: TEST_SCRAPING_ISSUE
          }
        )
      });
      fixture.detectChanges();
    });

    it('should not show the scraping issue card', () => {
      expect(
        fixture.nativeElement.querySelector('#scraping-issue-card')
      ).not.toBeNull();
    });

    describe('selecting the issue', () => {
      let emitSpy: Mock;

      beforeEach(() => {
        emitSpy = vi.spyOn(component.issueSelected, 'emit');
        const selectButton: HTMLButtonElement =
          fixture.nativeElement.querySelector('#select-issue-button button');
        expect(selectButton).not.toBeNull();
        selectButton.click();
        fixture.detectChanges();
      });

      it('should emit the issue', () => {
        expect(emitSpy).toHaveBeenCalledWith(TEST_SCRAPING_ISSUE);
      });
    });
  });
});

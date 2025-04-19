/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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
import { StoryScrapingComponent } from './story-scraping.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  initialState as initialMetadataSourceListState,
  METADATA_SOURCE_LIST_FEATURE_KEY
} from '@app/comic-metadata/reducers/metadata-source-list.reducer';
import {
  initialState as initialScrapeStoryState,
  SCRAPE_STORY_FEATURE_KEY
} from '@app/comic-metadata/reducers/scrape-story.reducer';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { METADATA_SOURCE_1 } from '@app/comic-metadata/comic-metadata.fixtures';
import { STORY_METADATA_1 } from '@app/comic-metadata/comic-metadata.constants';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmationService } from '@tragically-slick/confirmation';
import {
  loadStoryCandidates,
  scrapeStoryMetadata
} from '@app/comic-metadata/actions/scrape-story.actions';

describe('StoryScrapingComponent', () => {
  const METADATA_SOURCE = METADATA_SOURCE_1;
  const STORY_METADATA = STORY_METADATA_1;
  const MAX_RECORDS = 10;
  const SKIP_CACHE = Math.random() > 0.5;
  const initialState = {
    [METADATA_SOURCE_LIST_FEATURE_KEY]: initialMetadataSourceListState,
    [SCRAPE_STORY_FEATURE_KEY]: initialScrapeStoryState
  };

  let component: StoryScrapingComponent;
  let fixture: ComponentFixture<StoryScrapingComponent>;
  let store: MockStore;
  let confirmationService: ConfirmationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StoryScrapingComponent],
      imports: [
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forRoot([]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatToolbarModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatTableModule,
        MatPaginatorModule,
        MatSelectModule,
        MatButtonModule,
        MatTooltipModule
      ],
      providers: [provideMockStore({ initialState }), ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(StoryScrapingComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    confirmationService = TestBed.inject(ConfirmationService);

    component.storyName = STORY_METADATA.name;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('scraping by reference', () => {
    beforeEach(() => {
      component.storyScrapingForm.controls.metadataSource.setValue(
        METADATA_SOURCE.metadataSourceId
      );
      component.storyScrapingForm.controls.referenceId.setValue(
        STORY_METADATA.referenceId
      );
    });

    it('is disabled if no source is selected', () => {
      component.storyScrapingForm.controls.metadataSource.setValue(null);
      expect(component.readyToScrapeByReference).toBeFalse();
    });

    it('is disabled if no reference id is entered', () => {
      component.storyScrapingForm.controls.referenceId.setValue('');
      expect(component.readyToScrapeByReference).toBeFalse();
    });

    it('is enabled otherwise', () => {
      expect(component.readyToScrapeByReference).toBeTrue();
    });
  });

  describe('sorting story candidates', () => {
    it('can sort by publisher', () => {
      expect(
        component.dataSource.sortingDataAccessor(STORY_METADATA, 'publisher')
      ).toEqual(STORY_METADATA.publisher.toUpperCase());
    });

    it('can sort by name', () => {
      expect(
        component.dataSource.sortingDataAccessor(STORY_METADATA, 'name')
      ).toEqual(STORY_METADATA.name.toUpperCase());
    });
  });

  describe('loading story candidates', () => {
    beforeEach(() => {
      component.storyScrapingForm.controls.metadataSource.setValue(
        METADATA_SOURCE.metadataSourceId
      );
      component.storyScrapingForm.controls.storyName.setValue(
        STORY_METADATA.name
      );
      component.storyScrapingForm.controls.maxRecords.setValue(MAX_RECORDS);
      component.skipCache = SKIP_CACHE;
      component.onLoadStoryCandidates();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        loadStoryCandidates({
          sourceId: METADATA_SOURCE.metadataSourceId,
          name: STORY_METADATA.name,
          skipCache: SKIP_CACHE,
          maxRecords: MAX_RECORDS
        })
      );
    });
  });

  describe('showing a story popup', () => {
    beforeEach(() => {
      component.imageUrl = null;
      component.imageTitle = null;
      component.onShowPopup(STORY_METADATA);
    });

    it('sets the image url', () => {
      expect(component.imageUrl).toEqual(STORY_METADATA.imageUrl);
    });

    it('sets the image title', () => {
      expect(component.imageTitle).toEqual(STORY_METADATA.name);
    });

    describe('hiding the popup', () => {
      beforeEach(() => {
        component.onShowPopup(null);
      });

      it('clears the image url', () => {
        expect(component.imageUrl).toBeNull();
      });

      it('clears the image title', () => {
        expect(component.imageTitle).toBeNull();
      });
    });
  });

  describe('scraping a story', () => {
    beforeEach(() => {
      component.storyScrapingForm.controls.metadataSource.setValue(
        METADATA_SOURCE.metadataSourceId
      );
      component.storyScrapingForm.controls.referenceId.setValue(
        STORY_METADATA.referenceId
      );
      component.storyScrapingForm.controls.maxRecords.setValue(MAX_RECORDS);
      component.skipCache = SKIP_CACHE;
      spyOn(confirmationService, 'confirm').and.callFake(confirmation =>
        confirmation.confirm()
      );
    });

    describe('using the reference id', () => {
      beforeEach(() => {
        component.onScrapeByReferenceId();
      });

      it('confirms with the user', () => {
        expect(confirmationService.confirm).toHaveBeenCalled();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          scrapeStoryMetadata({
            sourceId: METADATA_SOURCE.metadataSourceId,
            referenceId: STORY_METADATA.referenceId,
            skipCache: SKIP_CACHE
          })
        );
      });
    });

    describe('using a story selection', () => {
      beforeEach(() => {
        component.onScrapeStory(STORY_METADATA);
      });

      it('confirms with the user', () => {
        expect(confirmationService.confirm).toHaveBeenCalled();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          scrapeStoryMetadata({
            sourceId: METADATA_SOURCE.metadataSourceId,
            referenceId: STORY_METADATA.referenceId,
            skipCache: SKIP_CACHE
          })
        );
      });
    });
  });
});

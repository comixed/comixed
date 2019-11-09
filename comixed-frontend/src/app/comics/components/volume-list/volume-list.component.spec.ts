/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { ScrapingEffects } from 'app/comics/effects/scraping.effects';
import { SCRAPING_ISSUE_1000 } from 'app/comics/models/scraping-issue.fixtures';
import { ScrapingVolume } from 'app/comics/models/scraping-volume';
import {
  SCRAPING_VOLUME_1002,
  SCRAPING_VOLUME_1003
} from 'app/comics/models/scraping-volume.fixtures';
import { ScrapingIssueCoverUrlPipe } from 'app/comics/pipes/scraping-issue-cover-url.pipe';
import { ScrapingIssueTitlePipe } from 'app/comics/pipes/scraping-issue-title.pipe';
import {
  reducer,
  SCRAPING_FEATURE_KEY
} from 'app/comics/reducers/scraping.reducer';
import { COMIC_3 } from 'app/library';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageService, TooltipModule } from 'primeng/primeng';
import { TableModule } from 'primeng/table';
import { VolumeListComponent } from './volume-list.component';

describe('VolumeListComponent', () => {
  const EXACT_MATCH = { ...SCRAPING_VOLUME_1002, id: 1 };
  const CLOSE_MATCH = {
    ...SCRAPING_VOLUME_1002,
    id: 2,
    name: 'Some other comic series',
    publisher: 'Not The Same Publisher',
    startYear: EXACT_MATCH.startYear
  };
  const NO_MATCH = {
    id: 999,
    name: 'Farkle',
    publisher: 'Somebody Nobody Knows',
    startYear: '1983',
    imageUrl: '',
    issueCount: 717
  } as ScrapingVolume;
  const COMIC = {
    ...COMIC_3,
    publisher: EXACT_MATCH.publisher,
    series: EXACT_MATCH.name,
    volume: EXACT_MATCH.startYear
  };
  const VOLUME = SCRAPING_VOLUME_1003;
  const ISSUE = SCRAPING_ISSUE_1000;

  let component: VolumeListComponent;
  let fixture: ComponentFixture<VolumeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(SCRAPING_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([ScrapingEffects]),
        TableModule,
        CardModule,
        ButtonModule,
        TooltipModule
      ],
      declarations: [
        VolumeListComponent,
        ScrapingIssueTitlePipe,
        ScrapingIssueCoverUrlPipe
      ],
      providers: [MessageService]
    }).compileComponents();

    fixture = TestBed.createComponent(VolumeListComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when setting volumes', () => {
    beforeEach(() => {
      component.comic = COMIC;
      component.volumes = [EXACT_MATCH, CLOSE_MATCH, NO_MATCH];
    });

    it('marks exact matches', () => {
      expect(
        component._volumes.forEach((entry: any) => {
          switch (entry.volume.id) {
            case EXACT_MATCH.id:
              expect(entry.matchability).toEqual('0');
              break;
          }
        })
      );
    });

    it('marks close matches', () => {
      expect(
        component._volumes.forEach((entry: any) => {
          switch (entry.volume.id) {
            case CLOSE_MATCH.id:
              expect(entry.matchability).toEqual('1');
              break;
          }
        })
      );
    });

    it('marks mismatches', () => {
      expect(
        component._volumes.forEach((entry: any) => {
          switch (entry.volume.id) {
            case NO_MATCH.id:
              expect(entry.matchability).toEqual('2');
              break;
          }
        })
      );
    });

    it('selects the best match if one is present', () => {
      component.volumeSelected.subscribe(response =>
        expect(response).toEqual(EXACT_MATCH)
      );
    });

    describe('when there was no exact match', () => {
      beforeEach(() => {
        component.volumes = [NO_MATCH];
      });

      it('has no pre-selected volume', () => {
        component.volumeSelected.subscribe(response =>
          expect(response).toBeNull()
        );
      });
    });
  });

  describe('when canceling the edit', () => {
    xit('resets the current list of volumes');
  });

  describe('when selecting the current volume', () => {
    beforeEach(() => {
      component.selectVolume(VOLUME);
    });

    it('provides notification', () => {
      component.volumeSelected.subscribe(response =>
        expect(response).toEqual(VOLUME)
      );
    });
  });

  describe('when canceling the scraping', () => {
    beforeEach(() => {
      component.currentIssue = ISSUE;
      component.selectCurrentIssue();
    });

    it('provides notification', () => {
      component.issueSelected.subscribe(response =>
        expect(response).toEqual(ISSUE)
      );
    });
  });
});

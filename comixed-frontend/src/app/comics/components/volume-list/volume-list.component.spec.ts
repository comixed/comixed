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
import { FormsModule } from '@angular/forms';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { COMIC_3 } from 'app/comics/comics.fixtures';
import { SCRAPING_ISSUE_1000 } from 'app/comics/models/scraping-issue.fixtures';
import { ScrapingVolume } from 'app/comics/models/scraping-volume';
import {
  SCRAPING_VOLUME_1002,
  SCRAPING_VOLUME_1003
} from 'app/comics/models/scraping-volume.fixtures';
import { ScrapingIssueCoverUrlPipe } from 'app/comics/pipes/scraping-issue-cover-url.pipe';
import { ScrapingIssueTitlePipe } from 'app/comics/pipes/scraping-issue-title.pipe';
import { LoggerModule } from '@angular-ru/logger';
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
        FormsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        LoggerModule.forRoot(),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([]),
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

  describe('when setting the volumes', () => {
    const VOLUMES = [EXACT_MATCH, CLOSE_MATCH, NO_MATCH];

    beforeEach(() => {
      component.comic = COMIC;
      component.volumes = VOLUMES;
    });

    it('sets the volumes for the component', () => {
      expect(component.volumes).toEqual(VOLUMES);
    });

    it('sets the volume options', () => {
      expect(component.volumeOptions.map(option => option.volume)).toEqual(
        VOLUMES
      );
    });

    it('marks exact matches', () => {
      expect(
        component.volumeOptions.forEach((entry: any) => {
          if (entry.volume.id === EXACT_MATCH.id) {
            expect(entry.matchability).toEqual('0');
          }
        })
      );
    });

    it('marks close matches', () => {
      expect(
        component.volumeOptions.forEach((entry: any) => {
          if (entry.volume.id === CLOSE_MATCH.id) {
            expect(entry.matchability).toEqual('1');
          }
        })
      );
    });

    it('marks mismatches', () => {
      expect(
        component.volumeOptions.forEach((entry: any) => {
          if (entry.volume.id === NO_MATCH.id) {
            expect(entry.matchability).toEqual('2');
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

  describe('canceling the scraping', () => {
    beforeEach(() => {
      component.currentIssue = ISSUE;
      component.cancelVolumeSelection();
    });

    it('sends an event', () => {
      component.cancelSelection.subscribe(response =>
        expect(response).toEqual(ISSUE)
      );
    });
  });

  describe('selecting an issue', () => {
    beforeEach(() => {
      component.currentIssue = ISSUE;
      component.selectCurrentIssue();
    });

    it('sends an event', () => {
      component.issueSelected.subscribe(response =>
        expect(response).toEqual(ISSUE)
      );
    });
  });
});

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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Store, StoreModule } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { libraryReducer } from 'app/reducers/library.reducer';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { VolumeListComponent } from './volume-list.component';
import { TooltipModule } from 'primeng/primeng';
import * as ScrapingActions from 'app/actions/single-comic-scraping.actions';
import {
  VOLUME_1000,
  VOLUME_1002,
  VOLUME_1003,
  VOLUME_1004
} from 'app/models/comics/volume.fixtures';
import { Volume } from 'app/models/comics/volume';
import {
  COMIC_1000,
  COMIC_1002,
  COMIC_1003,
  COMIC_1004
} from 'app/models/comics/comic.fixtures';

describe('VolumeListComponent', () => {
  const COMIC = COMIC_1002;
  const EXACT_MATCH = VOLUME_1002;
  const EXACT_MATCH_2 = VOLUME_1003;
  const CLOSE_MATCH = VOLUME_1000;
  const NO_MATCH = VOLUME_1004;

  let component: VolumeListComponent;
  let fixture: ComponentFixture<VolumeListComponent>;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        StoreModule.forRoot({ library: libraryReducer }),
        TableModule,
        CardModule,
        ButtonModule,
        TooltipModule
      ],
      declarations: [VolumeListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(VolumeListComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);
    spyOn(store, 'dispatch');

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when setting volumes', () => {
    beforeEach(() => {
      component.comic = COMIC;
      component.volumes = [EXACT_MATCH, EXACT_MATCH_2, CLOSE_MATCH, NO_MATCH];
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
      component.volumes = [EXACT_MATCH, CLOSE_MATCH, NO_MATCH];
      expect(component.current_volume).toEqual(EXACT_MATCH);
    });
  });

  describe('when selecting a volume', () => {
    it('sends an output notice', () => {
      component.selectVolume.subscribe((selected: Volume) => {
        expect(selected).toEqual(VOLUME_1000);
      });

      component.set_current_volume(VOLUME_1000);
    });
  });

  describe('when canceling the edit', () => {
    xit('resets the current list of volumes');
  });

  describe('when selecting the current volume', () => {
    xit('notifies of the selection');
  });

  describe('when canceling the scraping', () => {
    xit('notifies of the cancellation');
  });
});

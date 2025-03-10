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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ComicDetailCardComponent } from './comic-detail-card.component';
import { MatCardModule } from '@angular/material/card';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { COMIC_DETAIL_3 } from '@app/comic-books/comic-books.fixtures';
import { TranslateModule } from '@ngx-translate/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatChipsModule } from '@angular/material/chips';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material/tooltip';

describe('ComicDetailCardComponent', () => {
  const COMIC = COMIC_DETAIL_3;
  const initialState = {};

  let component: ComicDetailCardComponent;
  let fixture: ComponentFixture<ComicDetailCardComponent>;
  let store: MockStore<any>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ComicDetailCardComponent],
        imports: [
          NoopAnimationsModule,
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          MatCardModule,
          MatGridListModule,
          MatChipsModule,
          MatTooltipModule
        ],
        providers: [provideMockStore({ initialState })]
      }).compileComponents();

      fixture = TestBed.createComponent(ComicDetailCardComponent);
      component = fixture.componentInstance;
      component.comic = COMIC_DETAIL_3;
      store = TestBed.inject(MockStore);
      spyOn(store, 'dispatch');
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the image is clicked', () => {
    beforeEach(() => {
      spyOn(component.selectionChanged, 'emit');
    });

    describe('not displaying a comic', () => {
      beforeEach(() => {
        component.comic = null;
        component.onCoverClicked();
      });

      it('does nothing', () => {
        expect(component.selectionChanged.emit).not.toHaveBeenCalled();
      });
    });

    describe('displaying a comic', () => {
      beforeEach(() => {
        component.selected = Math.random() > 0.5;
        component.comic = COMIC;
        component.onCoverClicked();
      });

      it('emits an event', () => {
        expect(component.selectionChanged.emit).toHaveBeenCalledWith({
          comic: COMIC,
          selected: !component.selected
        });
      });
    });
  });

  describe('showing the context menu', () => {
    const XPOS = 1;
    const YPOS = 29;
    const event = new MouseEvent('testing');

    beforeEach(() => {
      component.comic = COMIC;
      spyOn(event, 'preventDefault');
      spyOn(component.showContextMenu, 'emit');
      component.onContextMenu({ ...event, clientX: XPOS, clientY: YPOS });
    });

    it('emits an event', () => {
      expect(component.showContextMenu.emit).toHaveBeenCalledWith({
        comic: COMIC,
        x: XPOS,
        y: YPOS
      });
    });
  });

  describe('pressing the update comic button', () => {
    beforeEach(() => {
      spyOn(component.updateComicInfo, 'emit');
      component.onUpdateComicInfo(COMIC);
    });

    it('fires an event', () => {
      expect(component.updateComicInfo.emit).toHaveBeenCalledWith({
        comic: COMIC
      });
    });
  });
});

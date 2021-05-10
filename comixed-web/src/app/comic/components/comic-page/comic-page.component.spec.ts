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
import { ComicPageComponent } from './comic-page.component';
import { LoggerModule } from '@angular-ru/logger';
import { MatCardModule } from '@angular/material/card';
import { provideMockStore } from '@ngrx/store/testing';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { USER_ADMIN } from '@app/user/user.fixtures';
import { PAGE_2 } from '@app/comic/comic.fixtures';

describe('ComicPageComponent', () => {
  const SOURCE = {} as any;
  const PAGE_SIZE = 400;
  const USER = USER_ADMIN;
  const PAGE = PAGE_2;
  const initialState = {
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER }
  };

  let component: ComicPageComponent;
  let fixture: ComponentFixture<ComicPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ComicPageComponent],
      imports: [LoggerModule.forRoot(), MatCardModule],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getting the image width', () => {
    describe('when not defined', () => {
      beforeEach(() => {
        component.pageSize = -1;
      });

      it('tells the browser to determine the width', () => {
        expect(component.imageWidth).toEqual('auto');
      });
    });

    describe('when defined', () => {
      beforeEach(() => {
        component.pageSize = PAGE_SIZE;
      });

      it('returns a definite size', () => {
        expect(component.imageWidth).toEqual(`${PAGE_SIZE}px`);
      });
    });
  });

  describe('showing the context menu', () => {
    const XPOS = 1;
    const YPOS = 29;
    const event = new MouseEvent('testing');

    beforeEach(() => {
      component.page = PAGE;
      spyOn(event, 'preventDefault');
      spyOn(component.showContextMenu, 'emit');
      component.onContextMenu({ ...event, clientX: XPOS, clientY: YPOS });
    });

    it('emits an event', () => {
      expect(component.showContextMenu.emit).toHaveBeenCalledWith({
        page: PAGE,
        x: `${XPOS}px`,
        y: `${YPOS}px`
      });
    });
  });
});

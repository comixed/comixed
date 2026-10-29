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
import { provideRouter } from '@angular/router';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { provideMockStore } from '@ngrx/store/testing';
import {
  COMIC_LIST_FEATURE_KEY,
  initialComicListState
} from '@app/library/reducers/comic-list.reducer';
import { MessageService } from '@openng/optimus-ui/api';
import { ComicListPage } from '@app/library/pages/comic-list-page/comic-list-page';
import { beforeEach, Mock } from 'vitest';
import { RouterTestingHarness } from '@angular/router/testing';

describe('ComicListPage', () => {
  const initialState = { [COMIC_LIST_FEATURE_KEY]: initialComicListState };

  let component: ComicListPage;
  let fixture: ComponentFixture<ComicListPage>;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComicListPage],
      providers: [
        provideRouter([
          {
            path: 'testing/read',
            component: ComicListPage,
            data: { readState: true }
          }
        ]),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockStore({ initialState }),
        MessageService
      ]
    }).compileComponents();

    harness = await RouterTestingHarness.create();
    fixture = TestBed.createComponent(ComicListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('changing the language', () => {
    let setTitleSpy: Mock;

    beforeEach(() => {
      setTitleSpy = vi.spyOn(component.titleService, 'setTitle');
      component.translateService.use('fr');
    });

    it('should update the page title', () => {
      expect(setTitleSpy).toHaveBeenCalled();
    });
  });

  describe('read comics', () => {
    beforeEach(async () => {
      component = await harness.navigateByUrl('/testing/read', ComicListPage);
    });

    it('should set the page type', () => {
      expect(component.getPageType()).toStrictEqual('READ');
    });

    it('should set the read state flag', () => {
      expect(component.readState()).toBeTruthy();
    });

    it('should display the read toggle button', () => {
      expect(
        harness.routeNativeElement?.querySelector('#unread-comic-toggle')
      ).not.toBeNull();
    });

    describe('clicking the read toggle button', () => {
      let toggleSpy: Mock;

      beforeEach(() => {
        toggleSpy = vi.spyOn(component, 'onToggleUnreadOnly');
        const button = harness.routeNativeElement?.querySelector(
          '#unread-comic-toggle'
        ) as HTMLButtonElement;
        button.click();
      });

      it('should toggle the read flag', () => {
        expect(toggleSpy).toHaveBeenCalled();
      });
    });
  });
});

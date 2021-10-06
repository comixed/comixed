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
import { PAGE_2 } from '@app/comic-pages/comic-pages.fixtures';

describe('ComicPageComponent', () => {
  const PAGE = PAGE_2;
  const SOURCE = {} as any;

  let component: ComicPageComponent;
  let fixture: ComponentFixture<ComicPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ComicPageComponent],
      imports: [LoggerModule.forRoot(), MatCardModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
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

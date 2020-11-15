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
import { CoverImageComponent } from './comic-page.component';
import { LoggerModule } from '@angular-ru/logger';

describe('CoverImageComponent', () => {
  const SOURCE = {} as any;

  let component: CoverImageComponent;
  let fixture: ComponentFixture<CoverImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot()],
      declarations: [CoverImageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoverImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('selecting a page', () => {
    beforeEach(() => {
      component.selected = false;
      component.source = SOURCE;
    });

    afterEach(() => {
      component.onClick();
    });

    it('sends the source of the event', () => {
      component.pageClicked.subscribe((response) =>
        expect(response.source).toEqual(SOURCE)
      );
    });

    it('sends a true selected value', () => {
      component.pageClicked.subscribe((response) =>
        expect(response.selected).toBeTruthy()
      );
    });
  });

  describe('deselecting a page', () => {
    beforeEach(() => {
      component.selected = true;
      component.source = SOURCE;
    });

    afterEach(() => {
      component.onClick();
    });

    it('sends the source of the event', () => {
      component.pageClicked.subscribe((response) =>
        expect(response.source).toEqual(SOURCE)
      );
    });

    it('sends a false selected value', () => {
      component.pageClicked.subscribe((response) =>
        expect(response.selected).toBeFalsy()
      );
    });
  });
});

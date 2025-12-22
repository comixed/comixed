/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
import { ComicGridItemComponent } from './comic-grid-item.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { DISPLAYABLE_COMIC_4 } from '@app/comic-books/comic-books.fixtures';

describe('ComicGridItemComponent', () => {
  const initialState = {};

  let component: ComicGridItemComponent;
  let fixture: ComponentFixture<ComicGridItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ComicGridItemComponent,
        LoggerModule.forRoot(),
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicGridItemComponent);
    component = fixture.componentInstance;
    component.comic = DISPLAYABLE_COMIC_4;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

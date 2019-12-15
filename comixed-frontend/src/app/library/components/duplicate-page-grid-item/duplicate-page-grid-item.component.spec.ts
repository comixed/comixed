/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

import { DuplicatePageGridItemComponent } from './duplicate-page-grid-item.component';
import { ComicPageUrlPipe } from 'app/comics/pipes/comic-page-url.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { ComicCoverComponent } from 'app/comics/components/comic-cover/comic-cover.component';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule, TooltipModule } from 'primeng/primeng';
import { LoggerTestingModule } from 'ngx-logger/testing';

describe('DuplicatePageGridItemComponent', () => {
  let component: DuplicatePageGridItemComponent;
  let fixture: ComponentFixture<DuplicatePageGridItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        LoggerTestingModule,
        CardModule,
        TooltipModule,
        ProgressSpinnerModule
      ],
      declarations: [
        DuplicatePageGridItemComponent,
        ComicCoverComponent,
        ComicPageUrlPipe
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicatePageGridItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

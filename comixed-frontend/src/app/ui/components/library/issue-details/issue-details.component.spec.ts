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
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { ComicCoverUrlPipe } from 'app/pipes/comic-cover-url.pipe';
import { COMIC_1 } from 'app/library';
import { IssueDetailsComponent } from './issue-details.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('IssueDetailsComponent', () => {
  let component: IssueDetailsComponent;
  let fixture: ComponentFixture<IssueDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
        TableModule,
        PanelModule
      ],
      declarations: [IssueDetailsComponent, ComicCoverUrlPipe]
    }).compileComponents();

    fixture = TestBed.createComponent(IssueDetailsComponent);
    component = fixture.componentInstance;
    component.comic = COMIC_1;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

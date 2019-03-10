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
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { SidebarModule } from 'primeng/sidebar';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { FileDetailsCoverComponent } from '../../file-details/file-details-cover/file-details-cover.component';
import { ComicFileCoverUrlPipe } from '../../../../pipes/comic-file-cover-url.pipe';
import { SelectedComicsComponent } from './selected-comics.component';

describe('SelectedComicsComponent', () => {
  let component: SelectedComicsComponent;
  let fixture: ComponentFixture<SelectedComicsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
        SidebarModule,
        TableModule,
        ButtonModule,
        DropdownModule,
        CardModule
      ],
      declarations: [
        SelectedComicsComponent,
        FileDetailsCoverComponent,
        ComicFileCoverUrlPipe
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectedComicsComponent);
    component = fixture.componentInstance;
    component.selected_files = [];
    component.show_selected_files = false;
    component.cover_width = '480';
    component.cover_height = '640';
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

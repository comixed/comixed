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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store, StoreModule } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { libraryReducer } from 'app/reducers/library.reducer';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';
import { MessageService } from 'primeng/components/common/messageservice';
import { UserService } from 'app/services/user.service';
import { UserServiceMock } from 'app/services/user.service.mock';
import { ComicService } from 'app/services/comic.service';
import { ComicServiceMock } from 'app/services/comic.service.mock';
import { ComicPageUrlPipe } from 'app/pipes/comic-page-url.pipe';
import { ComicPagesComponent } from './comic-pages.component';

describe('ComicPagesComponent', () => {
  let component: ComicPagesComponent;
  let fixture: ComponentFixture<ComicPagesComponent>;
  let user_service: UserService;
  let comic_service: ComicService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({ library: libraryReducer }),
        CardModule,
        DropdownModule,
        DataViewModule,
        ButtonModule,
        MessagesModule
      ],
      declarations: [ComicPagesComponent, ComicPageUrlPipe],
      providers: [
        TranslateService,
        MessageService,
        { provide: UserService, useClass: UserServiceMock },
        { provide: ComicService, useClass: ComicServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    user_service = TestBed.get(UserService);
    comic_service = TestBed.get(ComicService);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

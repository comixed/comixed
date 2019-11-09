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

import { ReadingListsPageComponent } from './reading-lists-page.component';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';
import { Router } from '@angular/router';
import { REDUCERS } from 'app/app.reducers';
import { ReadingListAdaptor } from 'app/library';
import { MessageService } from 'primeng/api';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { EffectsModule } from '@ngrx/effects';
import { EFFECTS } from 'app/app.effects';
import { ComicService } from 'app/services/comic.service';
import { UserService } from 'app/services/user.service';
import { UserModule } from 'app/user/user.module';

describe('ReadingListsPageComponent', () => {
  let component: ReadingListsPageComponent;
  let fixture: ComponentFixture<ReadingListsPageComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UserModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'lists/new', component: ReadingListsPageComponent }
        ]),
        StoreModule.forRoot(REDUCERS),
        EffectsModule.forRoot(EFFECTS),
        TranslateModule.forRoot(),
        ButtonModule,
        TableModule
      ],
      declarations: [ReadingListsPageComponent],
      providers: [
        ReadingListAdaptor,
        BreadcrumbAdaptor,
        MessageService,
        ComicService,
        UserService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReadingListsPageComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when destroyed', () => {
    beforeEach(() => {
      spyOn(component.readingListsSubscription, 'unsubscribe');
      component.ngOnDestroy();
    });

    it('unsubscribes from reading list updates', () => {
      expect(component.readingListsSubscription.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('when creating a new reading list', () => {
    beforeEach(() => {
      spyOn(router, 'navigateByUrl');
      component.create_new_reading_list();
    });

    it('navigates to the create reading list page', () => {
      expect(router.navigateByUrl).toHaveBeenCalledWith('/lists/new');
    });
  });
});

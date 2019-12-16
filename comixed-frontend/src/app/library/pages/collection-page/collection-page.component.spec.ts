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

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { LibraryDisplayAdaptor } from 'app/library';
import { CollectionAdaptor } from 'app/library/adaptors/collection.adaptor';
import { CollectionEffects } from 'app/library/effects/collection.effects';
import {
  COLLECTION_FEATURE_KEY,
  reducer
} from 'app/library/reducers/collection.reducer';
import { AuthenticationAdaptor } from 'app/user';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { BehaviorSubject } from 'rxjs';
import { CollectionPageComponent } from './collection-page.component';
import { LoggerTestingModule } from 'ngx-logger/testing';
import objectContaining = jasmine.objectContaining;

describe('CollectionPageComponent', () => {
  let component: CollectionPageComponent;
  let fixture: ComponentFixture<CollectionPageComponent>;
  let activatedRoute: ActivatedRoute;
  let router: Router;
  let messageService: MessageService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        LoggerTestingModule,
        StoreModule.forRoot({}),
        StoreModule.forFeature(COLLECTION_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([CollectionEffects]),
        TableModule
      ],
      declarations: [CollectionPageComponent],
      providers: [
        CollectionAdaptor,
        LibraryDisplayAdaptor,
        AuthenticationAdaptor,
        BreadcrumbAdaptor,
        MessageService,
        {
          provide: ActivatedRoute,
          useValue: {
            params: new BehaviorSubject<{}>({}),
            queryParams: new BehaviorSubject<{}>({})
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionPageComponent);
    component = fixture.componentInstance;
    activatedRoute = TestBed.get(ActivatedRoute);
    (activatedRoute.params as BehaviorSubject<{}>).next({
      collectionType: 'publishers'
    });
    router = TestBed.get(Router);
    spyOn(router, 'navigateByUrl');
    messageService = TestBed.get(MessageService);
    spyOn(messageService, 'add');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the collection type is invalid', () => {
    beforeEach(() => {
      (activatedRoute.params as BehaviorSubject<{}>).next({
        collectionType: 'farkle'
      });
    });

    it('redirects the user to the root page', () => {
      expect(router.navigateByUrl).toHaveBeenCalledWith('/home');
    });

    it('shows an error message', () => {
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });
});

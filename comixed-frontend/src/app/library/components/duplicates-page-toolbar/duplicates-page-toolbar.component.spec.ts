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
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { LibraryDisplayAdaptor } from 'app/library';
import { DuplicatePagesAdaptors } from 'app/library/adaptors/duplicate-pages.adaptor';
import { DUPLICATE_PAGE_1 } from 'app/library/library.fixtures';
import { DUPLICATE_PAGE_2 } from 'app/library/models/duplicate-page.fixtures';
import { UserModule } from 'app/user/user.module';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import {
  CheckboxModule,
  Confirmation,
  ConfirmationService,
  MessageService,
  SliderModule,
  SplitButtonModule,
  ToolbarModule,
  TooltipModule
} from 'primeng/primeng';

import { DuplicatesPageToolbarComponent } from './duplicates-page-toolbar.component';
import { LoggerModule } from '@angular-ru/logger';

describe('DuplicatesPageToolbarComponent', () => {
  const PAGES = [DUPLICATE_PAGE_1, DUPLICATE_PAGE_2];

  let component: DuplicatesPageToolbarComponent;
  let fixture: ComponentFixture<DuplicatesPageToolbarComponent>;
  let duplicatesPagesAdaptors: DuplicatePagesAdaptors;
  let confirmationService: ConfirmationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UserModule,
        FormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        LoggerModule.forRoot(),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        ButtonModule,
        DropdownModule,
        TooltipModule,
        CheckboxModule,
        SliderModule,
        ToolbarModule,
        SplitButtonModule
      ],
      declarations: [DuplicatesPageToolbarComponent],
      providers: [
        LibraryDisplayAdaptor,
        DuplicatePagesAdaptors,
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DuplicatesPageToolbarComponent);
    component = fixture.componentInstance;
    duplicatesPagesAdaptors = TestBed.get(DuplicatePagesAdaptors);
    confirmationService = TestBed.get(ConfirmationService);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('selecting all duplicates', () => {
    beforeEach(() => {
      spyOn(duplicatesPagesAdaptors, 'selectPages');
      component.pages = PAGES;
      component.selectAll();
    });

    it('invokes the adaptor', () => {
      expect(duplicatesPagesAdaptors.selectPages).toHaveBeenCalledWith(PAGES);
    });
  });

  describe('deselecting all', () => {
    beforeEach(() => {
      spyOn(duplicatesPagesAdaptors, 'deselectPages');
      component.selectedPages = PAGES;
      component.deselectAll();
    });

    it('invokes the adaptor', () => {
      expect(duplicatesPagesAdaptors.deselectPages).toHaveBeenCalledWith(PAGES);
    });
  });

  describe('turn on blocked for selected pages', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirm: Confirmation) => confirm.accept()
      );
      spyOn(duplicatesPagesAdaptors, 'setBlocking');
      component.selectedPages = PAGES;
      component.setBlocking(true);
    });

    it('invokes the adaptor', () => {
      expect(duplicatesPagesAdaptors.setBlocking).toHaveBeenCalledWith(
        PAGES,
        true
      );
    });
  });

  describe('turn off blocked for selected pages', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirm: Confirmation) => confirm.accept()
      );
      spyOn(duplicatesPagesAdaptors, 'setBlocking');
      component.selectedPages = PAGES;
      component.setBlocking(false);
    });

    it('invokes the adaptor', () => {
      expect(duplicatesPagesAdaptors.setBlocking).toHaveBeenCalledWith(
        PAGES,
        false
      );
    });
  });
});

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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Store, StoreModule } from '@ngrx/store';
import { AppState } from 'app/library';
import { InplaceModule } from 'primeng/inplace';
import { DropdownModule } from 'primeng/dropdown';
import { ComicOverviewComponent } from './comic-overview.component';
import { Confirmation, ConfirmationService, MessageService } from 'primeng/api';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EffectsModule } from '@ngrx/effects';
import { ComicAdaptor } from 'app/comics/adaptors/comic.adaptor';
import { COMIC_FEATURE_KEY, reducer } from 'app/comics/reducers/comic.reducer';
import { ComicEffects } from 'app/comics/effects/comic.effects';
import { TooltipModule } from 'primeng/primeng';
import {
  COMIC_1,
  COMIC_5,
  FORMAT_1,
  FORMAT_2,
  FORMAT_3,
  FORMAT_5,
  SCAN_TYPE_1,
  SCAN_TYPE_2,
  SCAN_TYPE_3,
  SCAN_TYPE_4,
  SCAN_TYPE_5
} from 'app/comics/comics.fixtures';
import { LoggerTestingModule } from 'ngx-logger/testing';

describe('ComicOverviewComponent', () => {
  const SCAN_TYPES = [SCAN_TYPE_1, SCAN_TYPE_2, SCAN_TYPE_3, SCAN_TYPE_4];
  const COMIC_FORMATS = [FORMAT_1, FORMAT_2, FORMAT_3];

  let component: ComicOverviewComponent;
  let fixture: ComponentFixture<ComicOverviewComponent>;
  let store: Store<AppState>;
  let confirmationService: ConfirmationService;
  let comicAdaptor: ComicAdaptor;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot({}),
        StoreModule.forFeature(COMIC_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([ComicEffects]),
        FormsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        LoggerTestingModule,
        InplaceModule,
        DropdownModule,
        TooltipModule
      ],
      declarations: [ComicOverviewComponent],
      providers: [ComicAdaptor, ConfirmationService, MessageService]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicOverviewComponent);
    component = fixture.componentInstance;
    component.is_admin = false;
    component.comic = COMIC_1;
    comicAdaptor = TestBed.get(ComicAdaptor);
    store = TestBed.get(Store);
    spyOn(store, 'dispatch');
    confirmationService = TestBed.get(ConfirmationService);

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('subscribes to the available scan types list', () => {
    component.scanTypes = [SCAN_TYPE_1];
    component.loadScanTypeOptions();
    expect(component.scanTypeOptions.length).toEqual(2);
    expect(component.scanTypeOptions[1].value).toEqual(SCAN_TYPE_1);
  });

  it('subscribes to the available format list', () => {
    component.formats = [FORMAT_3];
    component.loadFormatOptions();
    expect(component.formatOptions.length).toEqual(2);
    expect(component.formatOptions[1].value).toEqual(FORMAT_3);
  });

  it('can copy the comic format', () => {
    component.comic = COMIC_1;
    component.copyComicFormat();
    expect(component.format).toEqual(COMIC_1.format);
  });

  it('can set the comic format', () => {
    spyOn(comicAdaptor, 'saveComic');
    component.comic = COMIC_1;
    component.setComicFormat(FORMAT_5);
    expect(comicAdaptor.saveComic).toHaveBeenCalledWith({
      ...COMIC_1,
      format: FORMAT_5
    });
  });

  it('can copy the scan type', () => {
    component.comic = COMIC_1;
    component.copyScanType();
    expect(component.scanType).toEqual(COMIC_1.scanType);
  });

  it('can set the scan type', () => {
    spyOn(comicAdaptor, 'saveComic');
    component.comic = COMIC_1;
    component.setScanType(SCAN_TYPE_5);
    expect(comicAdaptor.saveComic).toHaveBeenCalledWith({
      ...COMIC_1,
      scanType: SCAN_TYPE_5
    });
  });

  it('can copy the sort name', () => {
    component.comic = COMIC_5;
    component.copySortName();
    expect(component.sortName).toEqual(COMIC_5.sortName);
  });

  it('can set the sort name', () => {
    const SORT_NAME = 'Updated Sort Name';
    spyOn(comicAdaptor, 'saveComic');
    component.comic = COMIC_1;
    component.sortName = SORT_NAME;
    component.saveSortName();
    expect(comicAdaptor.saveComic).toHaveBeenCalledWith({
      ...COMIC_1,
      sortName: SORT_NAME
    });
  });

  it('can clean the comic metadata', () => {
    spyOn(comicAdaptor, 'clearMetadata');
    spyOn(
      confirmationService,
      'confirm'
    ).and.callFake((confirm: Confirmation) => confirm.accept());
    component.comic = COMIC_1;
    component.clearMetadata();
    expect(comicAdaptor.clearMetadata).toHaveBeenCalledWith(COMIC_1);
  });

  it('can delete a comic', () => {
    spyOn(comicAdaptor, 'deleteComic');
    spyOn(
      confirmationService,
      'confirm'
    ).and.callFake((confirm: Confirmation) => confirm.accept());
    component.comic = COMIC_1;
    component.deleteComic();
    expect(comicAdaptor.deleteComic).toHaveBeenCalledWith(COMIC_1);
  });
});

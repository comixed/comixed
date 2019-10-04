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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UserDetailsEditorComponent } from 'app/user/components/user-details-editor/user-details-editor.component';
import { UsersPageComponent } from './users-page.component';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import {
  AUTHENTICATION_FEATURE_KEY,
  reducer
} from 'app/user/reducers/authentication.reducer';
import { EffectsModule } from '@ngrx/effects';
import { AuthenticationEffects } from 'app/user/effects/authentication.effects';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthenticationAdaptor, TokenService } from 'app/user';
import { RouterTestingModule } from '@angular/router/testing';
import { ToolbarModule } from 'primeng/primeng';

describe('UsersPageComponent', () => {
  let component: UsersPageComponent;
  let fixture: ComponentFixture<UsersPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        BrowserAnimationsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(AUTHENTICATION_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([AuthenticationEffects]),
        PanelModule,
        TableModule,
        ButtonModule,
        ConfirmDialogModule,
        TooltipModule,
        ToggleButtonModule,
        ToolbarModule
      ],
      declarations: [UsersPageComponent, UserDetailsEditorComponent],
      providers: [
        BreadcrumbAdaptor,
        AuthenticationAdaptor,
        ConfirmationService,
        MessageService,
        TokenService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UsersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

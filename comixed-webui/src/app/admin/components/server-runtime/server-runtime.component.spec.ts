/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ServerRuntimeComponent } from './server-runtime.component';
import {
  initialState as initialServerRuntimeState,
  SERVER_RUNTIME_FEATURE_KEY
} from '@app/admin/reducers/server-runtime.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { MatDialogModule } from '@angular/material/dialog';
import { Confirmation } from '@app/core/models/confirmation';
import {
  loadServerHealth,
  shutdownServer
} from '@app/admin/actions/server-runtime.actions';

describe('ServerRuntimeComponent', () => {
  const initialState = {
    [SERVER_RUNTIME_FEATURE_KEY]: initialServerRuntimeState
  };

  let component: ServerRuntimeComponent;
  let fixture: ComponentFixture<ServerRuntimeComponent>;
  let store: MockStore<any>;
  let confirmationService: ConfirmationService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ServerRuntimeComponent],
        imports: [
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          MatDialogModule
        ],
        providers: [provideMockStore({ initialState }), ConfirmationService]
      }).compileComponents();

      fixture = TestBed.createComponent(ServerRuntimeComponent);
      component = fixture.componentInstance;
      store = TestBed.inject(MockStore);
      spyOn(store, 'dispatch');
      confirmationService = TestBed.inject(ConfirmationService);
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('requesting a server shutdown', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onShutdown();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(shutdownServer());
    });
  });

  describe('reloading the server health', () => {
    beforeEach(() => {
      component.onRefresh();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(loadServerHealth());
    });
  });
});

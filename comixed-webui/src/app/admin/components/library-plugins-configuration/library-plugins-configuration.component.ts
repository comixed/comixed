/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import {
  selectLibraryPluginCurrent,
  selectLibraryPluginList,
  selectLibraryPluginState
} from '@app/library-plugins/selectors/library-plugin.selectors';
import { MatTableDataSource } from '@angular/material/table';
import { LibraryPlugin } from '@app/library-plugins/models/library-plugin';
import {
  loadLibraryPlugins,
  setCurrentLibraryPlugin
} from '@app/library-plugins/actions/library-plugin.actions';
import { setBusyState } from '@app/core/actions/busy.actions';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CreatePluginDialogComponent } from '@app/admin/components/create-plugin-dialog/create-plugin-dialog.component';
import { LibraryPluginSetupComponent } from '@app/admin/components/library-plugin-setup/library-plugin-setup.component';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'cx-library-plugins-configuration',
  templateUrl: './library-plugins-configuration.component.html',
  styleUrls: ['./library-plugins-configuration.component.scss']
})
export class LibraryPluginsConfigurationComponent implements OnInit, OnDestroy {
  readonly displayedColumns = ['name', 'language', 'property-count'];

  dataSource = new MatTableDataSource<LibraryPlugin>();
  libraryPluginStateSubscription: Subscription;
  libraryPluginListSubscription: Subscription;
  currentPluginSubscription: Subscription;
  dialogRef: MatDialogRef<LibraryPluginSetupComponent, any>;

  constructor(
    private logger: LoggerService,
    private store: Store,
    private dialog: MatDialog,
    private alertService: AlertService,
    private translateService: TranslateService,
    public queryParameterService: QueryParameterService
  ) {
    this.logger.trace('Subscription to library plugin list state updates');
    this.libraryPluginStateSubscription = this.store
      .select(selectLibraryPluginState)
      .subscribe(state =>
        this.store.dispatch(setBusyState({ enabled: state.busy }))
      );
    this.logger.trace('Subscription to library plugin list updates');
    this.libraryPluginListSubscription = this.store
      .select(selectLibraryPluginList)
      .subscribe(pluginList => (this.dataSource.data = pluginList));
    this.logger.trace('Subscribing to the current library plugin updates');
    this.currentPluginSubscription = this.store
      .select(selectLibraryPluginCurrent)
      .subscribe(libraryPlugin => {
        if (!!libraryPlugin) {
          if (libraryPlugin.properties.length > 0) {
            this.dialogRef = this.dialog.open(LibraryPluginSetupComponent, {
              data: libraryPlugin
            });
          } else {
            this.store.dispatch(setCurrentLibraryPlugin({ plugin: null }));
            this.alertService.info(
              this.translateService.instant(
                'library-plugin-setup.text.plugin-has-no-properties',
                {
                  name: libraryPlugin.name,
                  version: libraryPlugin.version
                }
              )
            );
          }
        } else {
          if (!!this.dialogRef) {
            this.dialogRef.close();
            this.dialogRef = null;
            this.store.dispatch(setCurrentLibraryPlugin({ plugin: null }));
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from library plugin list state updates');
    this.libraryPluginStateSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from library plugin list updates');
    this.libraryPluginListSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from current library plugin updates');
    this.currentPluginSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.logger.trace('Loading the plugin list');
    this.store.dispatch(loadLibraryPlugins());
  }

  onShowCreatePluginForm(): void {
    this.logger.trace('Opening the creating plugin dialog');
    this.dialog.open(CreatePluginDialogComponent);
  }

  onSelectPlugin(libraryPlugin: LibraryPlugin): void {
    this.logger.trace('Selecting library plugin:', libraryPlugin);
    this.store.dispatch(setCurrentLibraryPlugin({ plugin: libraryPlugin }));
  }
}

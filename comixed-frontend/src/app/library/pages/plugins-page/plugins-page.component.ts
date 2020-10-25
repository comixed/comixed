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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PluginDescriptor } from 'app/library/models/plugin-descriptor';
import { LoggerService } from '@angular-ru/logger';
import { PluginAdaptor } from 'app/library/adaptors/plugin.adaptor';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { LibraryModuleState } from 'app/library';
import { setBreadcrumbs } from 'app/actions/breadcrumb.actions';

@Component({
  selector: 'app-plugins-page',
  templateUrl: './plugins-page.component.html',
  styleUrls: ['./plugins-page.component.scss']
})
export class PluginsPageComponent implements OnInit, OnDestroy {
  pluginsSubscription: Subscription;
  plugins: PluginDescriptor[] = [];
  loadingSubscription: Subscription;
  loading = false;

  languageSubscription: Subscription;

  constructor(
    private logger: LoggerService,
    private store: Store<LibraryModuleState>,
    private translateService: TranslateService,
    private titleService: Title,
    private pluginAdaptor: PluginAdaptor
  ) {
    this.pluginsSubscription = this.pluginAdaptor.plugins$.subscribe(
      plugins => (this.plugins = plugins)
    );
    this.loadingSubscription = this.pluginAdaptor.loading$.subscribe(
      loading => (this.loading = loading)
    );
    this.languageSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.loadTranslations();
  }

  ngOnInit(): void {
    this.pluginAdaptor.getAllPlugins();
  }

  ngOnDestroy(): void {
    this.pluginsSubscription.unsubscribe();
    this.loadingSubscription.unsubscribe();
    this.languageSubscription.unsubscribe();
  }

  private loadTranslations() {
    this.loadBreadcrumbTrail();
    this.titleService.setTitle(
      this.translateService.instant('plugins-page.title')
    );
  }

  private loadBreadcrumbTrail() {
    this.store.dispatch(
      setBreadcrumbs({
        entries: [
          {
            label: this.translateService.instant(
              'breadcrumb.entry.admin.plugins-page'
            )
          }
        ]
      })
    );
  }

  reloadPlugins() {
    this.logger.debug('Reloading plugins');
    this.pluginAdaptor.reloadPlugins();
  }
}

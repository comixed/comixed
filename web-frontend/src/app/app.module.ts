import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HttpModule} from '@angular/http';

import {ComicModule} from './comic/comic.module';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpModule,
    ComicModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HttpClientModule} from '@angular/common/http';

import {ComicModule} from './comic/comic.module';
import {MainPageComponent} from './main-page/main-page.component';
import {NavigationComponent} from './navigation/navigation.component';


@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    NavigationComponent,
  ],
  imports: [
    BrowserModule,
    NgbModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    ComicModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

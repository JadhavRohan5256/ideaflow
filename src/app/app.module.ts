import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { EditorComponent } from './editor/editor.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FloatingNavComponent } from './floating-nav/floating-nav.component';

@NgModule({
  declarations: [
    AppComponent,
    EditorComponent,
    FloatingNavComponent
  ],
  imports: [
    BrowserModule,
    FontAwesomeModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop'

import { AppComponent } from './app.component';
import { EditorComponent } from './editor/editor.component';
import { FloatingNavComponent } from './floating-nav/floating-nav.component';

@NgModule({
  declarations: [
    AppComponent,
    EditorComponent,
    FloatingNavComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    DragDropModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

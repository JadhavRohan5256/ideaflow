import { Component } from '@angular/core';
import {
  faArrowLeft, 
  faHome, 
  faMagnifyingGlass,
  faPenToSquare,
  faMicrophone
} from '@fortawesome/free-solid-svg-icons'
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ideaflow-app';

  // Font Awesome Icons
  faArrowLeft = faArrowLeft;
  faHome = faHome;
  faMagnifyingGlass = faMagnifyingGlass;
  faPenToSquare = faPenToSquare;
  faMicrophone = faMicrophone;

  constructor(private appService: AppService) {}

  onClickAdd(): void {
    this.appService.addNewIdea(true)
  }
}

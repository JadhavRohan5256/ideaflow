import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import {
  faArrowLeft, 
  faMoon, 
  faSun,
  faMagnifyingGlass,
  faPenToSquare,
  faMicrophone,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons'
import { AppService } from './app.service';
import { Icon } from '@fortawesome/fontawesome-svg-core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'ideaflow-app';

  // Font Awesome Icons
  faArrowLeft = faArrowLeft;
  faMagnifyingGlass = faMagnifyingGlass;
  faPenToSquare = faPenToSquare;
  faMicrophone = faMicrophone;
  isDark: boolean = true;
  faSun = faSun;
  faMoon = faMoon;

  constructor(private appService: AppService, private renderer: Renderer2, private eleRef: ElementRef) {}

  ngOnInit(): void {
    let themeMode = localStorage.getItem('themeMode');
    if(themeMode && themeMode=='light') {
      this.isDark = false;
      this.lightMode();
    }
    else {
      this.isDark = true;
      this.darkMode();
    }
  }

  onClickAdd(): void {
    this.appService.addNewIdea(true)
  }

  changeMode(): void {
    this.isDark = !this.isDark;
    if(this.isDark) {
      this.darkMode()
      localStorage.setItem('themeMode', 'dark')
    }
    else {
      this.lightMode();
      localStorage.setItem('themeMode', 'light')
    }
  }

  private darkMode(): void {
    document.documentElement.style.setProperty('--bg-color', '#121212');
    document.documentElement.style.setProperty('--text-color', '#ECEFF1');
    document.documentElement.style.setProperty('--bg-surface-color', '#212121');
    document.documentElement.style.setProperty('--shadow-color', 'rgb(0, 0, 0, 0.3)');
    document.documentElement.style.setProperty('--hover-color', 'rgba(255, 255, 255, 0.3)');
  }

  private lightMode(): void {
    document.documentElement.style.setProperty('--bg-color', '#ffffff');
    document.documentElement.style.setProperty('--text-color', '#212121');
    document.documentElement.style.setProperty('--bg-surface-color', '#ffffff');
    document.documentElement.style.setProperty('--shadow-color', 'rgb(0 0 0 / 0.2)');
    document.documentElement.style.setProperty('--hover-color', 'rgb(0, 0, 0, 0.3)');
  }
}

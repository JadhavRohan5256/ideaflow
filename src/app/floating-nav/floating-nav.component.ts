import { Component, HostListener } from "@angular/core";

@Component({
    selector:'app-floating-nav',
    templateUrl: './floating-nav.component.html',
    styleUrls: ['./floating-nav.component.css']
})
export class FloatingNavComponent {
    constructor() {}
    isOpen: boolean = false;
    moreOpen: boolean = false;

    toggle(): void {
        this.isOpen = !this.isOpen;
        if(this.isOpen && this.moreOpen) this.moreOpen = false;
    }

    toggleMore(): void {
        this.moreOpen = !this.moreOpen;
        if(this.moreOpen && this.isOpen) this.isOpen = false;
    }
}
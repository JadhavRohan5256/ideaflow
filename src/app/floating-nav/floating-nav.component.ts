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
    position: {left: string, top: string} = {
        left: window.innerWidth < 1000 ? 'calc(10% / 2 + 0.5rem)': 'calc(((100vw - 1000px) / 2 ) + 0.5rem)',
        top: '20px'
    }

    toggle(): void {
        this.isOpen = !this.isOpen;
        if(this.isOpen && this.moreOpen) this.moreOpen = false;
    }

    toggleMore(): void {
        this.moreOpen = !this.moreOpen;
        if(this.moreOpen && this.isOpen) this.isOpen = false;
    }

    dragOver(event: any): void {
        if(event.x > 50 && event.y > 50 && event.x < (window.innerWidth - 50) && event.y < (window.innerHeight - 50)) {
            this.position = {
                left: `${event.pageX - 109}px`,
                top: `${event.pageY - 35}px`
            }
        }
    }
}
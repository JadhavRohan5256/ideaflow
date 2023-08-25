import { Component, ElementRef, OnInit, Renderer2 } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { AppService } from "../app.service";
import { faArrowRightLong } from '@fortawesome/free-solid-svg-icons'

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
    faArrowRightLong = faArrowRightLong;
    boxPosition: { 'left': string, 'top': string } = {
        left: '0px',
        top: '0px'
    }
    CurrentIdeas = new FormGroup({})
    ideaMenuOpen: { 'flag': boolean, 'control': string } = {
        'flag': false,
        'control': ''
    }
    allIdeas = [['idea2', 'idea1', 'idea0'], ['idea5', 'idea4', 'idea3', 'idea2']]

    constructor(
        private appService: AppService,
        private formBuilder: FormBuilder
    ) {}

    ngOnInit(): void {
        this.CurrentIdeas = this.formBuilder.group({});

        this.appService.newIdea.subscribe((value) => {
            if (value) {
                console.log(value)
                const ideaName = `idea_${Object.keys(this.CurrentIdeas.controls).length}`;
                this.CurrentIdeas.addControl(ideaName, new FormControl(''))
                console.log(this.CurrentIdeas.value)
            }
        })
    }

    changeDetection(event: any, controlName: string) {
        let controlValue = this.CurrentIdeas.get(controlName)?.value;
        if (controlValue.endsWith('<>')) {
            this.ideaMenuOpen = {
                flag: true,
                control: controlName
            }
        }
        else {
            this.ideaMenuOpen = {
                flag: false,
                control: ''
            }
        }
        this.boxPosition = this.getCursorPos(event, controlName);

    }


    addAnotherIdeaAsRef(controlName: string, index: number) {
        let controlValue = this.CurrentIdeas.get(controlName)?.value;
        let modifiedValue = '';
        if (controlValue.endsWith('<>')) {
            modifiedValue = controlValue.slice(0, -2);
            modifiedValue += `<span class="hightlight"><> ${this.convertAllIdeas(this.allIdeas[index])}</span>`
            console.log(modifiedValue)
        }

        console.log(modifiedValue)
        this.CurrentIdeas.patchValue({
            controlName: modifiedValue
        })
        console.log(this.CurrentIdeas.value)
    }

    private convertAllIdeas(value: string[]): string {
        let str = `<span class="highlight"><></span>`
        value.forEach((val, i) => {
            str += `
            <span class="highlight">${val}</span>
            `
            if (i < value.length) {
                str += `<fa-icon class="arrow-right" [icon]="faArrowRightLong"></fa-icon>`
            }
        })

        return str;
    }

    private getCursorPos(event: any, controlName: string): { 'left': string, 'top': string } {
        const eventRef = event.target as HTMLTextAreaElement;
        let selectionStart = eventRef.selectionStart;
        const textBeforeCaret = eventRef.value.substring(0, selectionStart);
        const span = document.createElement('span');
        span.style.visibility = 'hidden';
        span.style.position = 'absolute';
        span.style.whiteSpace = 'pre-wrap';
        span.style.font = window.getComputedStyle(eventRef).font;
        span.textContent = textBeforeCaret;
        document.body.appendChild(span);
        const caretPositionX = span.offsetWidth;
        const caretPositionY = span.offsetHeight;
        console.log('offsetx ', span.offsetTop)
        document.body.removeChild(span);
        console.log(`Caret Position X: ${caretPositionX}px / ${caretPositionY}px.`);

        return {
            'left': `${caretPositionX}px`,
            'top': `${caretPositionY + 50}px`
        }
    }
}
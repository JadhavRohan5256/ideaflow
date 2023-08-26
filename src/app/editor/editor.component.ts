import { Component, ElementRef, OnDestroy, OnInit, Renderer2 } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { AppService } from "../app.service";
import { faArrowRightLong } from '@fortawesome/free-solid-svg-icons'

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit, OnDestroy {
    faArrowRightLong = faArrowRightLong;
    boxPosition: { 'left': string, 'top': string } = {
        left: '0px',
        top: '0px'
    }
    CurrentIdeas!: FormGroup;
    ideaMenuOpen: { 'flag': boolean, 'control'?: number, 'length': number } = {
        'flag': false,
        'length': 0
    }

    allIdeas: string[] = []

    constructor(
        private appService: AppService,
        private formBuilder: FormBuilder
    ) {

    }

    ngOnInit(): void {
        this.allIdeas = this.appService.getIdeas();
        let modifed = this.allIdeas.map((idea) => {
            let htmlCode = '';
            let splittedArr = idea.split('<>')
            if (splittedArr.length > 0) {
                splittedArr.forEach((item, i) => {
                    if (item !== '' && i > 0) htmlCode += `<span style="color: #018786; font-weight: 500;"><>${item}</span>`
                })
            }

            return splittedArr[0] + htmlCode;
        })

        this.CurrentIdeas = this.formBuilder.group({
            'items': this.formBuilder.array(this.allIdeas)
        });

        setTimeout(() => {
            modifed = modifed.reverse();
            if (modifed.length > 0) {
                modifed.forEach((item, i) => {
                    let eleRef = document.getElementById(`editable_${i}`) as HTMLDivElement;
                    if (eleRef) {
                        eleRef.innerHTML = item;
                    }
                })
            }
        }, 200);

        this.appService.newIdea.subscribe((value) => {
            if (value) {
                this.items.push(new FormControl(''))
            }
        })
    }

    get items() {
        return this.CurrentIdeas.get('items') as FormArray
    }

    getAllIdeas() {
        const modif = this.allIdeas.filter((val) => val !== '');
        return modif
    }

    changeDetection(event: any, idx: number) {
        let contentValue = (event.target as HTMLDivElement).textContent;
        contentValue = this.replacedValue(contentValue);
        if (contentValue === '') return;
        this.updateDivValue(contentValue, idx);
        if (contentValue.endsWith('<>')) {
            this.ideaMenuOpen = {
                flag: true,
                control: idx,
                length: this.allIdeas.length
            }
        }
        else {
            this.ideaMenuOpen = {
                flag: false,
                length: this.allIdeas.length
            }
        }
        this.boxPosition = this.getCursorPos(event, idx);

    }

    updateDivValue(newValue: string, index: number) {
        this.items.controls[index].setValue(newValue)
    }

    addAnotherIdeaAsRef(idx: number, index: number) {
        let controlValue = this.items.at(idx).value;
        if (controlValue && controlValue !== this.allIdeas[index]) {
            let modifiedValue = `<span style="color: #018786; font-weight: 500;">${this.allIdeas[index]}`;
            let contentEditableDiv = document.getElementById(`editable_${idx}`) as HTMLDivElement;
            contentEditableDiv.innerHTML += modifiedValue;
            let innerText = this.replacedValue(contentEditableDiv.textContent);
            if (innerText && !this.allIdeas.includes(innerText)) {
                if (this.allIdeas.includes(controlValue)) {
                    this.allIdeas[this.allIdeas.indexOf(controlValue)] = innerText;
                }
                else {
                    this.allIdeas.push(innerText)
                }
            }
        }
        this.ideaMenuOpen = {
            flag: false,
            control: idx,
            length: this.allIdeas.length
        }
        this.ngOnDestroy()
    }

    private replacedValue(rawValue: string | null): string {
        if (!rawValue) return '';
        let replacedValue = rawValue.replaceAll(' ', '')
        replacedValue = replacedValue.replaceAll(/\n/g, '');
        return replacedValue;
    }

    private getCursorPos(event: Event, idx: number): { 'left': string, 'top': string } {
        const eventRef = event.target as HTMLInputElement;
        let selectionStart = eventRef.selectionStart;
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            selectionStart = range.startOffset;
        }
        if (!selectionStart) return { left: '0px', top: '50px' };
        const textBeforeCaret = this.items.controls[idx].value.substring(0, selectionStart);
        const span = document.createElement('span');
        span.style.visibility = 'hidden';
        span.style.position = 'absolute';
        span.style.whiteSpace = 'pre-wrap';
        span.style.font = window.getComputedStyle(eventRef).font;
        span.textContent = textBeforeCaret;
        document.body.appendChild(span);
        const caretPositionX = span.offsetWidth;
        const caretPositionY = span.offsetHeight;
        document.body.removeChild(span);

        return {
            'left': `${caretPositionX}px`,
            'top': `${caretPositionY + 50}px`
        }
    }

    addIdea(idx: number) {
        let idea = this.items.at(idx).value
        if (!this.allIdeas.includes(idea)) {
            this.allIdeas.push(idea)
        }
        this.ngOnDestroy()
    }

    deleteIdeas(event: KeyboardEvent, idx: number) {
        if (event.key === 'Delete') {
            let contentEditableDiv = document.getElementById(`editable_${idx}`) as HTMLDivElement;
            let controlValue = this.items.controls[idx].value;
            console.log('control value ', controlValue)
            console.log('span value', contentEditableDiv.querySelector('span:last-of-type')?.textContent)
            contentEditableDiv.querySelector('span:last-of-type')?.remove()
        }
        this.ngOnDestroy()
    }

    clickedOutside(): void {
        this.ideaMenuOpen = {
            flag: false,
            length: this.allIdeas.length
        }
    }

    ngOnDestroy(): void {
        this.allIdeas = this.getAllIdeas()
        this.appService.saveIdeas(this.allIdeas)
    }
}

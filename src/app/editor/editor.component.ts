import { Component, OnDestroy, OnInit, ElementRef } from "@angular/core";
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
    all_reference: {'idea_name': string, 'all_ref': string[], 'idea_HTML': string}[]= [];
    boxPosition: { 'left': string, 'top': string } = {
        left: '0px',
        top: '0px'
    }

    isOpenRef: boolean[] = [];

    CurrentIdeas!: FormGroup;
    ideaMenuOpen: { 'flag': boolean, 'control'?: number} = {
        'flag': false,
    }
    allIdeas: string[] = []

    constructor(
        private appService: AppService
    ) {

    }

    ngOnInit(): void {

        this.all_reference = this.appService.getIdeas();

        setTimeout(() => {
            this.all_reference.forEach((obj, i) => {
                let contentEditableDiv = this.textareaRef(i);
                contentEditableDiv.innerHTML = obj.idea_HTML;
                this.isOpenRef.push(false)
            })
        }, 5);

        this.appService.newIdea.subscribe((value) => {
            if (value) {
                this.all_reference.push({'idea_name': '', 'all_ref': [], 'idea_HTML': ''});
                this.isOpenRef.push(false)
            }
        })
    }

    get items() {
        return this.CurrentIdeas.get('items') as FormArray
    }

    getAllIdeas(idx: number): string[] {
        let key = this.searchRef(idx);
        
        let values: string[] = [];
        this.all_reference.forEach((obj, i) => {
            if(obj.idea_name !== '' && idx !== i) {
                values.push(this.replacedAllValue(obj.idea_name));
            }
        })

        return values.filter((st) =>  {
            if(key !== '') {
                return st.toLocaleLowerCase().startsWith(key.toLocaleLowerCase());
            }

            return st;
        })
        
    }

    moveCursorToEnd(idx: number) {
        let element = this.textareaRef(idx);
        if (element) {
            const range = document.createRange();
            const selection = window.getSelection();

            range.selectNodeContents(element);
            range.collapse(false);

            if (selection === null) return;
            selection.removeAllRanges();
            selection.addRange(range);

            element.focus();
        }
    }

    changeDetection(event: any, idx: number) {
        let contentValue = (event.target as HTMLDivElement).textContent;
        if (contentValue && contentValue.length === 1) {
            (event.target as HTMLDivElement).textContent = contentValue[0].toUpperCase() + contentValue.slice(1);
            this.moveCursorToEnd(idx);
        }
        contentValue = this.replacedAllValue(contentValue);
        let regex = /<> *[^ ]*( | ){0,2}$/;
        if(regex.test(contentValue)) {
            this.ideaMenuOpen = {
                flag: true,
                control: idx
            }

        }

        let htmlContent = this.textareaRef(idx).innerHTML;
        this.updateControlValue(contentValue, htmlContent, idx, event)
        this.saveData();

    }

    updateControlValue(contentValue: string, htmlContent: string,idx: number, event?: any): void {
        this.all_reference[idx].idea_name = contentValue;
        this.all_reference[idx].idea_HTML = htmlContent;
        if(event) {
            this.boxPosition = this.getCursorPos(event, idx);
        }
    }

    addAnotherIdeaAsRef(idx: number, selectedIdea: string) {
        let controlValue = this.all_reference[idx].idea_name;
        if (controlValue && controlValue !== selectedIdea && controlValue !== '<>') {
            let p1 = document.createElement('p');
            p1.style.cssText = `display: inline;`;
            p1.innerHTML = '&nbsp;';
            let p2 = document.createElement('p');
            p2.style.cssText = `display: inline;`;
            p2.innerHTML = '&nbsp;';

            let contentEditableDiv = this.textareaRef(idx);
            if (contentEditableDiv.lastChild?.nodeName === 'SPAN') {
                contentEditableDiv.removeChild(contentEditableDiv.lastChild);
            }
            let span = document.createElement('span');
            span.style.cssText = `color: #018786; font-weight: 500; font-style: italic; font-family: 'Poppins', sans-serif; background-color: #0187862b; border-radius: 5px;`;
            span.innerText = ` ${selectedIdea} `;
            span.setAttribute('data', 'ref')
            contentEditableDiv.appendChild(p1);
            contentEditableDiv.appendChild(span)
            contentEditableDiv.appendChild(p2);
            
            let contentEditableDiv_current = this.textareaRef(idx);
            controlValue = this.replacedAllValue(contentEditableDiv_current.textContent);
            this.updateControlValue(controlValue, contentEditableDiv.innerHTML,idx);
            let splittedControl = controlValue.split('<>');
            let splitted = selectedIdea.split('<>')
            splitted = splitted.map((idea) => idea.trim())
            splitted.forEach((ide) => {
                this.all_reference.forEach((obj) => {
                    if(obj.idea_name.startsWith(ide)) {
                        obj.all_ref.forEach((inside, j) => {
                            obj.all_ref = obj.all_ref.filter((fi) => !fi.startsWith(splittedControl[0].trim()))
                        })

                        obj.all_ref.push(controlValue)
                    }
                })
            })
            this.moveCursorToEnd(idx)
        }
        this.ideaMenuOpen = {
            flag: false,
            control: idx
        }

        this.saveData();
    }

    private replacedAllValue(rawValue: string | null): string {
        if (!rawValue) return '';
        let replacedAllValue = rawValue.replaceAll(/\n/g, '');
        return replacedAllValue;
    }

    private getCursorPos(event: Event, idx: number): { 'left': string, 'top': string } {
        const eventRef = event.target as HTMLInputElement;
        const selection = window.getSelection();
        let selectionStart = 0;
        if (selection) {
            selectionStart = selection.focusOffset

        }
        const textBeforeCaret = this.all_reference[idx].idea_name;
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
            'top': `${caretPositionY + 10}px`
        }
    }


    clickedOutside(): void {
        this.ideaMenuOpen = {
            flag: false
        }
    }

    private duplicateControl(idx: number, key: string): void {
        const duplicatedControl = new FormControl('');
        if (key === 'ArrowDown') {
            this.all_reference.splice(idx, 0, {'idea_name': '', 'all_ref': [], 'idea_HTML': ''})
            setTimeout(() => {
                this.moveCursorToEnd(idx)
            }, 10);
        }
        else if (key === 'ArrowUp') {
            this.all_reference.splice(idx + 1, 0, {'idea_name': '', 'all_ref': [], 'idea_HTML': ''});
            setTimeout(() => {
                this.moveCursorToEnd(idx + 1)
            }, 10);
        }

        this.ideaMenuOpen = {
            'flag': false
        }
        this.saveData()
    }



    showPlaceholder(idx: number): boolean {
        let eleRef = this.textareaRef(idx)
        if (!eleRef.textContent && eleRef.textContent === '') {
            return true;
        }
        return false;
    }

    private textareaRef(idx: number): HTMLDivElement {
        return document.getElementById(`editable_${idx}`) as HTMLDivElement;
    }


    onAnyKeyPress(idx: number, event: KeyboardEvent) {
        if (event.key === 'Delete' || event.key === 'Backspace') {
            this.deleteIdeas(event, idx)
             this.ideaMenuOpen = {
                'flag': false
            }
        }
        else {
            let contentValue = (event.target as HTMLDivElement).textContent;
            if(contentValue === null) return;
            let regex = /<> *[^ ]*( | ){0,2}$/;
            if (regex.test(contentValue)) {
                let contentEditableDiv = this.textareaRef(idx);
                if (contentEditableDiv.lastChild?.nodeName !== 'SPAN') {
                    let span = document.createElement('span');
                    span.style.cssText = `color: #018786; font-weight: 500; font-style: italic; font-family: 'Poppins', sans-serif; background-color: #0187862b; border-radius: 5px;`;
                    span.innerHTML = `&nbsp;`;
                    contentEditableDiv.appendChild(span);
                    this.moveCursorToEnd(idx);
                }
                this.ideaMenuOpen = {
                    flag: true,
                    control: idx,
                }
            }
        }

        if (event.altKey && event.key) {
            this.duplicateControl(idx, event.key);
        }

        if (event.ctrlKey && (event.key === 'Enter' || event.key === ' ')) {
            this.boxPosition = this.getCursorPos(event, idx);
            let contentValue = (event.target as HTMLDivElement).textContent;
            contentValue = this.replacedAllValue(contentValue);
            if (!contentValue.endsWith('<>')) return;
            this.ideaMenuOpen = {
                flag: true,
                control: idx
            }
        }


    }

    private deleteIdeas(event: KeyboardEvent, idx: number) {
        let contentEditableDiv = this.textareaRef(idx);
        if (contentEditableDiv.lastChild?.nodeName === 'SPAN') {
            let lastSpan = contentEditableDiv.querySelector('span:last-of-type')
            if (lastSpan && lastSpan.getAttribute('data') !== 'ref') return;
            event.preventDefault();
            this.selectContent(idx);
            this.updateControlValue(this.replacedAllValue(contentEditableDiv.textContent), contentEditableDiv.innerHTML, idx);
        }
        else if (contentEditableDiv.innerHTML === "") {
            this.all_reference = this.all_reference.slice(idx, -1);
            if (idx === 0) {
                setTimeout(() => {
                    this.moveCursorToEnd(idx)
                }, 10);
            }
            else {
                setTimeout(() => {
                    this.moveCursorToEnd(idx - 1)
                }, 10);

            }
        }

        this.saveData()
    }

    onClickIcons(idx: number): void {
        this.all_reference = this.all_reference.filter((obj, i)=> i !== idx);
        if (idx === 0) {
            setTimeout(() => {
                this.moveCursorToEnd(idx)
            }, 10);
        }
        else {
            setTimeout(() => {
                this.moveCursorToEnd(idx - 1)
            }, 10);
        }

        this.saveData()
    }

    selectContent(idx: number) {
        let selection = window.getSelection();
        const contentEditableDiv = this.textareaRef(idx);
        if (selection === null) return;

        if (selection.anchorOffset !== selection.focusOffset) {
            //deleting editor all span element 
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.collapse(false);
        } else {
            //selecting editor all span element 
            const range = document.createRange();
            const spanElements = contentEditableDiv.querySelector('span:last-of-type');
            if (spanElements) {
                range.setEndAfter(spanElements);
                range.setStartBefore(spanElements);
                selection = window.getSelection();
                if (!selection) return;
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    }

    private saveData(): void {
        this.appService.saveIdeas(this.all_reference)
    }

    searchRef(idx: number): string {
        let key = this.all_reference[idx].idea_name.trim().split('<>');
        return key[key.length - 1].trim();
    }

    openDetails(idx: number) :void {
        this.isOpenRef[idx] = !this.isOpenRef[idx];
    }

    ngOnDestroy(): void {
        this.saveData();
    }
}

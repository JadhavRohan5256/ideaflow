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

    isSelected: boolean = false;
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
        private formBuilder: FormBuilder,
        private elementRef: ElementRef
    ) {

    }

    ngOnInit(): void {
        let allIdeas!: string[];
        allIdeas = this.appService.getIdeas().filter((idea) => idea !== "");
        if (allIdeas.length === 0) {
            allIdeas.push('')
        }

        this.CurrentIdeas = new FormGroup({
            'items': this.formBuilder.array(allIdeas)
        });

        setTimeout(() => {
            if (allIdeas.length > 0) {
                allIdeas.forEach((idea, i) => {
                    let eleRef = this.textareaRef(i)
                    let splittedArr = idea.split('<>')
                    splittedArr.forEach((item, j) => {
                        if(j === 0) {
                            eleRef.textContent = item;
                        } else if(eleRef && item !== '') {
                            let span = document.createElement('span');
                            span.style.cssText = `color: #018786; font-weight: 500; font-style: italic; font-family: 'Poppins', sans-serif;`;
                            span.innerText = `<>${item}`;
                            eleRef.appendChild(span);
                        }
                    })
                })
            }
        }, 5);

        this.appService.newIdea.subscribe((value) => {
            if (value) {
                this.items.push(new FormControl(''))
            }
        })
    }

    get items() {
        return this.CurrentIdeas.get('items') as FormArray
    }

    getAllIdeas(idx?: number): string[] {
        return [...new Set([...this.items.value].filter((idea, i) => idea !== '' && idea !== '<>' && idx !== i))]
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
        let contentValueHtml = (event.target as HTMLDivElement).innerHTML;
        if (contentValueHtml.length === 1) {
            (event.target as HTMLDivElement).innerHTML = contentValueHtml[0].toUpperCase() + contentValueHtml.slice(1);
            this.moveCursorToEnd(idx);
        }

        let contentValue = (event.target as HTMLDivElement).textContent;
        contentValue = this.replacedAllValue(contentValue);
        this.updateControlValue(contentValue, idx, event)
        if (contentValue.endsWith('<>')) {
            this.ideaMenuOpen = {
                flag: true,
                control: idx,
                length: this.getAllIdeas().length
            }
        }
        else {
            this.ideaMenuOpen = {
                flag: false,
                length: this.getAllIdeas().length
            }
        }

    }

    updateControlValue(contentValue: string, idx: number, event?: any): void {
        if (event) {
            this.boxPosition = this.getCursorPos(event, idx);
        }

        if (contentValue.endsWith('<>') && contentValue !== '<>') {
            contentValue = contentValue.slice(0, -2);
        }

        contentValue = [...new Set(contentValue.split('<>'))].join('<>')
        this.items.controls[idx].setValue(contentValue)
        this.saveData();
    }

    addAnotherIdeaAsRef(idx: number, selectedIdea: string) {
        let controlValue = this.items.at(idx).value;
        if (controlValue && controlValue !== selectedIdea && controlValue !== '<>') {
            let convertSelectedIdea = [...selectedIdea.split('<>')]
            let convertControlValue = [...controlValue.split('<>')]
            convertSelectedIdea = convertSelectedIdea.filter((idea) => !convertControlValue.includes(idea));
            let contentEditableDiv = this.textareaRef(idx);
            contentEditableDiv.innerHTML = this.removeLastMatchingSubstring(contentEditableDiv.innerHTML, '&lt;&gt;')
            convertSelectedIdea.forEach((idea) => {
                let span = document.createElement('span');
                span.style.cssText = `color: #018786; font-weight: 500; font-style: italic; font-family: 'Poppins', sans-serif;`;
                span.innerText = `<>${idea}`;
                contentEditableDiv.appendChild(span)
            })
    
            selectedIdea = convertSelectedIdea.join("<>");
            this.updateControlValue(controlValue + '<>' + selectedIdea, idx);
            this.moveCursorToEnd(idx)
        }
        this.ideaMenuOpen = {
            flag: false,
            control: idx,
            length: this.getAllIdeas().length
        }
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
        const textBeforeCaret = this.items.value[idx];
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
            flag: false,
            length: this.getAllIdeas().length
        }
    }

    private duplicateControl(idx: number, key: string): void {
        const duplicatedControl = new FormControl('');
        if (key === 'ArrowDown') {
            this.items.insert(idx, duplicatedControl);
            setTimeout(() => {
                this.moveCursorToEnd(idx)
            }, 10);
        }
        else if (key === 'ArrowUp') {
            this.items.insert(idx + 1, duplicatedControl);
            setTimeout(() => {
                this.moveCursorToEnd(idx + 1)
            }, 10);
        }

        this.ideaMenuOpen = {
            'flag': false,
            'length': this.allIdeas.length
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
            event.preventDefault();
            this.deleteIdeas(idx)
            this.ideaMenuOpen = {
                'flag': false,
                'length': this.allIdeas.length
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
                control: idx,
                length: this.getAllIdeas().length
            }
        }


    }

    private deleteIdeas(idx: number) {
        let contentEditableDiv = this.textareaRef(idx);
        let lastSpan = contentEditableDiv.querySelector('span:last-of-type')

        if (lastSpan) {
            this.selectContent(idx);
        }
        else {
            if (contentEditableDiv.textContent !== '' && contentEditableDiv.textContent !== null) {
                contentEditableDiv.textContent = contentEditableDiv.textContent?.slice(0, -1);
                this.moveCursorToEnd(idx)
            }
            else {
                this.items.removeAt(idx);
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
        }

        this.updateControlValue(this.replacedAllValue(contentEditableDiv.textContent), idx);
        this.saveData()
    }

    onClickIcons(idx: number): void {
        this.items.removeAt(idx);
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
        if(selection === null) return;

        if (selection.anchorOffset !== selection.focusOffset) {
            //deleting editor all span element 
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.collapse(false);
            this.isSelected = false;
        } else {
            //selecting editor all span element 
            const range = document.createRange();
            const spanElements = contentEditableDiv.querySelectorAll('span');
            if (spanElements.length > 0) {
                range.setEndAfter(spanElements[spanElements.length - 1]);
                range.setStartBefore(spanElements[0]);
                selection = window.getSelection();
                if (!selection) return;
                selection.removeAllRanges();
                selection.addRange(range);
                this.isSelected = true;
            }
        }
    }
    
    private removeLastMatchingSubstring(str: string, ch: string): string {
        const lastIndex = str.lastIndexOf(ch);
    
        if (lastIndex !== -1) {
            str = str.substring(0, lastIndex) + str.substring(lastIndex + ch.length);
        }
        return str;
    }

    private saveData(): void {
        this.appService.saveIdeas([...this.items.value])
    }
  
    ngOnDestroy(): void {
        this.saveData();
    }
}

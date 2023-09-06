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
        let allIdeas!:string[];
        allIdeas = this.appService.getIdeas().filter((idea)=>idea !== "");
        let allIdeasHTML = allIdeas.map((idea) => {
            let htmlCode = '';
            let splittedArr = idea.split('<>')
            splittedArr.forEach((item, i) => {
                if (item !== '' && i > 0) {
                    htmlCode += `<span style="color: #018786; font-weight: 500; font-style: italic; font-family: 'Poppins', sans-serif;"><>${item}</span>`
                }
            })

            return splittedArr[0] + htmlCode;
        })

        if(allIdeas.length === 0) {
            allIdeas.push('')
        }

        this.CurrentIdeas = new FormGroup({
            'items': this.formBuilder.array(allIdeas)
        });
        
        setTimeout(() => {
            if (allIdeasHTML.length > 0) {
                allIdeasHTML.forEach((item, i) => {
                    let eleRef = this.textareaRef(i)
                    if (eleRef) {
                        eleRef.innerHTML = item;
                    }
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

    getAllIdeas(): string[] {
        return  [...new Set([...this.items.value].filter((idea) => idea !== '' && idea !== '<>'))]
    }

    moveCursorToEnd(idx: number) {
        const element = document.getElementById(`editable_${idx}`);
        if (element) {
          const range = document.createRange();
          const selection = window.getSelection();
    
          range.selectNodeContents(element);
          range.collapse(false);
    
          if(selection === null) return;
          selection.removeAllRanges();
          selection.addRange(range);
    
          element.focus();
        }
    }

    changeDetection(event: any, idx: number) {
        let contentValueHtml = (event.target as HTMLDivElement).innerHTML;
        if(contentValueHtml.length === 1) {
            (event.target as HTMLDivElement).innerHTML = contentValueHtml[0].toUpperCase() + contentValueHtml.slice(1);
            this.moveCursorToEnd(idx);
        }
        
        let contentValue = (event.target as HTMLDivElement).textContent;
        if(contentValueHtml.endsWith('</span>')) {
            (event.target as HTMLDivElement).innerHTML = contentValueHtml.substring(0, contentValueHtml.length - 8) + '</span>';
            this.moveCursorToEnd(idx)
        }
        contentValue = this.replacedValue(contentValue);
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
            let modifiedValue = ``;
            let convertSelectedIdea = [...selectedIdea.split('<>')]
            let convertControlValue = [...controlValue.split('<>')]
            convertSelectedIdea = convertSelectedIdea.filter((idea) => !convertControlValue.includes(idea));
            convertSelectedIdea.forEach((idea) => {
                modifiedValue += `<span style="color: #018786; font-weight: 500; font-style: italic; font-family: 'Poppins', sans-serif;"><>${idea}</span>`
            })
            let contentEditableDiv = this.textareaRef(idx);
            modifiedValue = modifiedValue.replace('<>', '')
            contentEditableDiv.innerHTML += modifiedValue;
            selectedIdea = convertSelectedIdea.join("<>");
            this.updateControlValue(controlValue +'<>'+ selectedIdea, idx);
            this.moveCursorToEnd(idx)
        }
        this.ideaMenuOpen = {
            flag: false,
            control: idx,
            length: this.getAllIdeas().length
        }
    }

    private replacedValue(rawValue: string | null): string {
        if (!rawValue) return '';
        let replacedValue = rawValue.replaceAll(/\n/g, '');
        return replacedValue;
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
  
    onAnyKeyPress(idx: number, event: KeyboardEvent) {
        if (event.key === 'Delete' || event.key === 'Backspace') {
            event.preventDefault();
            this.deleteIdeas(idx)
            this.ideaMenuOpen = {
                'flag': false,
                'length': this.allIdeas.length
            }
        }
        
        if(event.altKey && event.key) {
            this.duplicateControl(idx, event.key);
        }

        if(event.ctrlKey && (event.key === 'Enter' || event.key === ' ')) {
            this.boxPosition = this.getCursorPos(event, idx);
            let contentValue = (event.target as HTMLDivElement).textContent;
            contentValue =  this.replacedValue(contentValue);
            if(!contentValue.endsWith('<>')) return;
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

        if(lastSpan) {
            lastSpan?.remove()
            this.updateControlValue(this.replacedValue(contentEditableDiv.textContent), idx);
            this.moveCursorToEnd(idx)
        }
        else{
            if(contentEditableDiv.textContent !== '' && contentEditableDiv.textContent !== null) {
                contentEditableDiv.textContent = contentEditableDiv.textContent?.slice(0, -1);
                this.moveCursorToEnd(idx)
            }
            else {
                this.items.removeAt(idx);
                if(idx === 0) {
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

        
        this.saveData()
    }

    onClickIcons(idx: number): void {
        let contentEditableDiv = this.textareaRef(idx);
        let lastSpan = contentEditableDiv.querySelector('span:last-of-type')
        if(!lastSpan && contentEditableDiv.textContent !== '') {
            contentEditableDiv.textContent = ''
            this.updateControlValue(this.replacedValue(contentEditableDiv.textContent), idx);
            this.moveCursorToEnd(idx)
            this.saveData()
            return;
        }

        if(!lastSpan || contentEditableDiv.textContent === '') {
            this.items.removeAt(idx);
            if(idx === 0) {
                setTimeout(() => {
                    this.moveCursorToEnd(idx)
                }, 10);
            }
            else {
                setTimeout(() => {
                    this.moveCursorToEnd(idx - 1)
                }, 10);
            }
        } else {
            this.deleteIdeas(idx)
        }

        this.saveData()
    }

    clickedOutside(): void {
        this.ideaMenuOpen = {
            flag: false,
            length: this.getAllIdeas().length
        }
    }

    private duplicateControl(idx: number, key: string): void {
        const duplicatedControl = new FormControl('');
        if(key === 'ArrowDown') {
            this.items.insert(idx, duplicatedControl);
            setTimeout(() => {
                this.moveCursorToEnd(idx)
            }, 10);
        }
        else if(key === 'ArrowUp') {
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

    ngOnDestroy(): void {
        this.saveData();
    }
    
    private saveData(): void {
        this.appService.saveIdeas([...this.items.value])
    }

    showPlaceholder(idx: number): boolean {
        let eleRef = this.textareaRef(idx)
        if(!eleRef.textContent && eleRef.textContent === '') {
            return true;
        }
        return false;
    }

    private textareaRef(idx: number): HTMLDivElement {
        return document.getElementById(`editable_${idx}`) as HTMLDivElement;
    }
}

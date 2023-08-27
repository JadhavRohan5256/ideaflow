import { Component, OnDestroy, OnInit } from "@angular/core";
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

        let allIdeas!:string[];
        allIdeas = this.appService.getIdeas().filter((idea)=>idea !== "");
        let allIdeasHTML = allIdeas.map((idea) => {
            let htmlCode = '';
            let splittedArr = idea.split('<>')
            splittedArr.forEach((item, i) => {
                if (item !== '' && i > 0) {
                    htmlCode += `<span style="color: #018786; font-weight: 500;"><>${item}</span>`
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
                    let eleRef = document.getElementById(`editable_${i}`) as HTMLDivElement;
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
        return [...this.items.value].filter((idea) => idea !== '')
    }


    changeDetection(event: any, idx: number) {
        let contentValue = (event.target as HTMLDivElement).textContent;
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
        
        if (contentValue.endsWith('<>')) {
            this.items.controls[idx].setValue(contentValue.slice(0, -2))
        }
        else {
            this.items.controls[idx].setValue(contentValue)
        }

        this.saveData();
    }

    addAnotherIdeaAsRef(idx: number, selectedIdea: string) {
        let controlValue = this.items.at(idx).value;
        if (controlValue && controlValue !== selectedIdea) {
            let modifiedValue = `<span style="color: #018786; font-weight: 500;"><>${selectedIdea}`;
            let contentEditableDiv = document.getElementById(`editable_${idx}`) as HTMLDivElement;
            if(contentEditableDiv.textContent?.endsWith('<>')) {
                contentEditableDiv.textContent = contentEditableDiv.textContent.slice(0, -2)
            }
            contentEditableDiv.innerHTML += modifiedValue;
            this.updateControlValue(controlValue + '<>' + selectedIdea, idx);
        }
        this.ideaMenuOpen = {
            flag: false,
            control: idx,
            length: this.getAllIdeas().length
        }
    }

    private replacedValue(rawValue: string | null): string {
        if (!rawValue) return '';
        let replacedValue = rawValue.replaceAll(' ', '')
        replacedValue = replacedValue.replaceAll(/\n/g, '');
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
            'top': `${caretPositionY + 50}px`
        }
    }
  
    onAnyKeyPress(idx: number, event: KeyboardEvent) {
        if (event.key === 'Delete') {
            this.onClickDeleteIdea(idx, true)
        }

        if(event.altKey && event.key) {
            this.duplicateControl(idx, event.key);
        }

        if(event.ctrlKey && (event.key === 'Enter' || event.key === ' ')) {
            this.boxPosition = this.getCursorPos(event, idx);
            this.ideaMenuOpen = {
                flag: true,
                control: idx,
                length: this.getAllIdeas().length
            }
        }
    }

    onClickDeleteIdea(idx: number, isDelete: boolean) {
        if (isDelete) {
            let contentEditableDiv = document.getElementById(`editable_${idx}`) as HTMLDivElement;
            let lastSpan = contentEditableDiv.querySelector('span:last-of-type')
            if(lastSpan) {
                lastSpan?.remove()
                this.updateControlValue(this.replacedValue(contentEditableDiv.textContent), idx);
            }
            else{
                this.items.removeAt(idx);
            }

            this.saveData()
        }
    }

    clickedOutside(): void {
        this.ideaMenuOpen = {
            flag: false,
            length: this.getAllIdeas().length
        }
    }

    duplicateControl(idx: number, key: string): void {
        const controlToDuplicate =  this.items.at(idx);
        const duplicatedControl = new FormControl('');
        if(key === 'ArrowDown') {
            console.log('added down')
            this.items.insert(idx - 1, duplicatedControl);
        }
        this.saveData()
    }

    ngOnDestroy(): void {
        this.saveData();
    }
    
    private saveData(): void {
        this.appService.saveIdeas([...this.items.value])
    }
}

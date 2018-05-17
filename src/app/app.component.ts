import { Component } from '@angular/core';


const range = fn => num => new Array(num).fill(0).map(fn);
const createCell = rowIdx => (_, idx) => ({ height: 100, text: `Cell ${rowIdx}_${idx}` });
const createCells = rowIdx => range(createCell(rowIdx));

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  data = range((_, idx) => ({
    // height: (idx + 1) * 50,
    height: 100,
    elements: createCells(idx)(500)
  }))(500);
}

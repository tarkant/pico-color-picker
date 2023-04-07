import { pColorPicker } from './pColorPicker';
import { pColorPalette } from './pColorPalette';
import './InitColorPicker';

class App {
  bindTextElement() {
    const colorPicker = document.getElementById('colorPicker') as pColorPicker;

    const colorSliderVertical = document.getElementById('sliderPicker') as pColorPalette;

    colorPicker.addEventListener('colorChanged', (ev: CustomEvent) => {
      console.log(`aaa`, ev);
    });

    colorSliderVertical.addEventListener('colorChanged', (ev: CustomEvent) => {
      // colorPicker.dataset['baseColor'] = ev.detail;
      colorPicker.baseColor = ev.detail;
    });
  }
}

const app = new App();
app.bindTextElement();
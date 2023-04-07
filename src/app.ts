import { ColorPicker } from './ColorPicker';
import { ColorSliderVertical } from './ColorSliderVertical';
import './InitColorPicker';

class App {
  bindTextElement() {
    const colorPicker = document.getElementById('colorPicker') as ColorPicker;

    const colorSliderVertical = document.getElementById('sliderPicker') as ColorSliderVertical;

    colorPicker.addEventListener('colorChanged', (ev) => console.log(`aaa`, ev));

    colorSliderVertical.addEventListener('colorChanged', (ev: CustomEvent) => {
      colorPicker.dataset.color = ev.detail;
    });
  }
}

const app = new App();
app.bindTextElement();
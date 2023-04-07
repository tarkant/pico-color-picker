import './ColorPicker';

class App {
  bindTextElement() {
    const input = document.getElementById('colorValue') as HTMLInputElement;
    const colorPicker = document.getElementById('colorPicker') as ColorPicker;
    input.addEventListener('input', (event) => {
      colorPicker.dataset.color = input.value;
    });
    colorPicker.addEventListener('colorChanged', (ev) => console.log(`aaa`, ev))
  }
}

const app = new App();
app.bindTextElement();